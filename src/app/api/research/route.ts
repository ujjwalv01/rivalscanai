import { NextRequest, NextResponse } from 'next/server';
import { ResearchReport, ResearchStatus } from '@/lib/types';
import { groq, buildUserPrompt } from '@/lib/groq';

// 1. Define strict types for Firecrawl to satisfy production ESLint rules
interface FirecrawlSearchResponse {
  success: boolean;
  data: Array<{ url: string }>;
}

interface FirecrawlScrapeResponse {
  success: boolean;
  markdown?: string;
}

interface FirecrawlApp {
  search(query: string, options?: { limit?: number }): Promise<FirecrawlSearchResponse>;
  scrapeUrl(url: string, options?: { formats?: string[] }): Promise<FirecrawlScrapeResponse>;
}

// 2. State management for reports (in-memory cache)
const reportCache = new Map<string, { data: ResearchReport; timestamp: number }>();

async function getCached<T>(key: string): Promise<T | null> {
  const cached = reportCache.get(key);
  if (cached && Date.now() - cached.timestamp < 1000 * 60 * 60 * 24) {
    return cached.data as unknown as T;
  }
  return null;
}

async function setCache(key: string, data: ResearchReport) {
  reportCache.set(key, { data, timestamp: Date.now() });
}

async function scrapeCompany(company: string): Promise<{ text: string; error?: string }> {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) {
    return { text: '', error: 'Firecrawl API key not configured' };
  }

  try {
    const { Firecrawl } = await import('@mendable/firecrawl-js');
    // Cast to our defined interface to avoid 'any' or 'Function' errors
    const app = new Firecrawl({ apiKey }) as unknown as FirecrawlApp;

    // 1. URL Discovery Phase
    let baseUrl = company.trim();
    if (!baseUrl.startsWith('http')) {
      if (baseUrl.includes('.') && !baseUrl.includes(' ')) {
        baseUrl = `https://${baseUrl}`;
      } else {
        try {
          // Use search to find the actual website for the company
          const searchResult = await app.search(company, { limit: 1 });
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

    return { text: results.join('\n\n') };
  } catch (error) {
    return { text: '', error: (error as Error).message };
  }
}

function sendEvent(controller: ReadableStreamDefaultController, event: { status: ResearchStatus; message: string; data?: ResearchReport; error?: string }) {
  controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(event)}\n\n`));
}

export async function POST(req: NextRequest) {
  const { company } = await req.json();

  if (!company) {
    return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
  }

  const cacheKey = `report_${company.toLowerCase().replace(/\s+/g, '_')}`;

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
        
        // 3. AI Analysis
        sendEvent(controller, { status: 'generating', message: 'Generating report...' });
        
        const completion = await groq.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'user', content: buildUserPrompt(company, scrapedText) },
          ],
          response_format: { type: 'json_object' },
        });

        const reportJson = completion.choices[0].message.content || '';
        const reportData = JSON.parse(reportJson) as ResearchReport;

        // Save to cache
        await setCache(cacheKey, reportData);

        sendEvent(controller, {
          status: 'done',
          message: 'Report generated successfully',
          data: reportData,
        });

        controller.close();
      } catch (error) {
        console.error('Research error:', error);
        sendEvent(controller, {
          status: 'error',
          message: (error as Error).message || 'Analysis failed',
        });
        controller.close();
      }
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
