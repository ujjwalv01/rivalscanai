import { NextRequest } from 'next/server';
import { getCached, setCache } from '@/lib/redis';
import { ResearchReport, StreamMessage } from '@/lib/types';
import { buildUserPrompt, chunkText } from '@/lib/groq';

async function scrapeCompany(company: string): Promise<{ text: string; error?: string }> {
  const apiKey = process.env.FIRECRAWL_API_KEY;

  if (!apiKey || apiKey === 'your_firecrawl_api_key_here') {
    return { text: '', error: 'Firecrawl API key not configured' };
  }

  try {
    const { Firecrawl } = await import('@mendable/firecrawl-js');
    const app = new Firecrawl({ apiKey });

    // 1. URL Discovery Phase
    let baseUrl = company.trim();
    if (!baseUrl.startsWith('http')) {
      if (baseUrl.includes('.') && !baseUrl.includes(' ')) {
        baseUrl = `https://${baseUrl}`;
      } else {
        try {
          // Use search to find the actual website for the company
          const searchResult = await app.search(company, { limit: 1 }) as any;
          if (searchResult && searchResult.data && searchResult.data.length > 0) {
            baseUrl = searchResult.data[0].url;
          } else {
            // Fallback to guess
            const slug = baseUrl.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '');
            baseUrl = `https://${slug}.com`;
          }
        } catch {
          const slug = baseUrl.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '');
          baseUrl = `https://${slug}.com`;
        }
      }
    }

    const paths = [''];
    
    // Create a timeout promise
    const timeoutPromise = new Promise<null>((_, reject) => 
      setTimeout(() => reject(new Error('Scraping timeout')), 7000)
    );

    // 2. Scraping Phase
    const scrapeResults = await Promise.race([
      Promise.all(
        paths.map(async (path) => {
          try {
            // Ensure path starts with / if not empty
            const url = path ? (baseUrl.endsWith('/') ? baseUrl + path.slice(1) : baseUrl + path) : baseUrl;
            const result = await app.scrapeUrl(url, { formats: ['markdown'] });
            if (result && result.success && result.markdown) {
              return `\n\n--- Page: ${url} ---\n${result.markdown}`;
            }
          } catch {
            // Ignore individual failures
          }
          return null;
        })
      ),
      timeoutPromise
    ]).catch((err) => {
      console.warn('Scraping warning:', err.message);
      return [];
    });

    const results = (scrapeResults || []).filter((r): r is string => r !== null);

    if (results.length === 0) {
      return { text: '', error: `Could not scrape any pages for ${company}` };
    }

    return { text: results.join('\n'), error: undefined };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown scraping error';
    return { text: '', error: message };
  }
}

function sendEvent(controller: ReadableStreamDefaultController, message: StreamMessage) {
  const encoder = new TextEncoder();
  controller.enqueue(encoder.encode(`data: ${JSON.stringify(message)}\n\n`));
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { company } = body;

  if (!company || typeof company !== 'string') {
    return new Response(JSON.stringify({ error: 'Company name is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const cacheKey = `rivalscan:${company.toLowerCase().trim()}`;

  const stream = new ReadableStream({
    async start(controller) {
      sendEvent(controller, { status: 'scraping', message: 'Connecting to intelligence grid...' });
      try {
        // 1. Check cache
        const cached = await getCached<ResearchReport>(cacheKey);
        if (cached) {
          sendEvent(controller, {
            status: 'done',
            message: 'Loaded from cache',
            data: cached,
          });
          controller.close();
          return;
        }

        // 2. Scrape
        sendEvent(controller, { status: 'scraping', message: 'Discovering company footprint...' });
        const { text: scrapedText, error: scrapeError } = await scrapeCompany(company);

        sendEvent(controller, { status: 'reading', message: 'Reading content...' });

        // 3. Prepare content for Claude
        let contentForClaude: string;
        if (scrapeError || !scrapedText) {
          contentForClaude = `Company name: ${company}\n[Note: Web scraping was unavailable. Please rely on your training knowledge and any web search capabilities to analyze this company thoroughly.]`;
        } else {
          const chunks = chunkText(scrapedText, 1500);
          contentForClaude = chunks.slice(0, 8).join('\n\n---CHUNK---\n\n');
        }

        // 4. Generate with Groq
        sendEvent(controller, { status: 'generating', message: 'Generating report...' });

        const { groq: groqClient } = await import('@/lib/groq');
        const completion = await groqClient.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'user', content: buildUserPrompt(company, contentForClaude) },
          ],
          response_format: { type: 'json_object' },
        });

        let reportJson = completion.choices[0].message.content || '';

        // Strip markdown fences if present
        reportJson = reportJson
          .replace(/^```(?:json)?\n?/m, '')
          .replace(/\n?```$/m, '')
          .trim();

        const report: ResearchReport = JSON.parse(reportJson);

        // 6. Cache result
        await setCache(cacheKey, report, 86400);

        // 7. Send done
        sendEvent(controller, {
          status: 'done',
          message: 'Report generated successfully',
          data: report,
          ...(scrapeError
            ? { error: `Note: Scraping was unavailable (${scrapeError}). Analysis used web knowledge as fallback.` }
            : {}),
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        const isGroqError = errorMessage.toLowerCase().includes('groq') || 
                           errorMessage.toLowerCase().includes('401') ||
                           errorMessage.toLowerCase().includes('unauthorized');
        
        sendEvent(controller, {
          status: 'error',
          message: isGroqError ? 'API Configuration Error' : 'Analysis Failed',
          error: isGroqError 
            ? `API Key Error: ${errorMessage}. Please check your GROQ_API_KEY in Vercel environment variables.` 
            : errorMessage,
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
