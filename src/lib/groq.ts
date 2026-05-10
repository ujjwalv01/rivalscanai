import OpenAI from 'openai';

// Groq uses the OpenAI-compatible SDK format.
export const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY || '',
  baseURL: 'https://api.groq.com/openai/v1'
});

export const SYSTEM_PROMPT = `You are a senior competitive intelligence analyst. Always return your analysis in valid JSON format. Be specific, data-driven, and avoid vague platitudes. If scraping data is limited, use your expert market knowledge to provide a high-quality inference.`;

export function buildUserPrompt(company: string, chunks: string): string {
  return `${SYSTEM_PROMPT}

Analyze this company: ${company}

Scraped content:
${chunks}

Return a JSON object with exactly this schema:
{
  "isValid": "boolean",
  "overview": {
    "oneliner": "string",
    "positioning": "string",
    "founded": "string",
    "hq": "string",
    "employees": "string",
    "stage": "string",
    "revenue": "string",
    "businessModel": "string",
    "techStack": ["array"],
    "targetAudience": "string",
    "tags": ["array"]
  },
  "swot": {
    "strengths": ["array"],
    "weaknesses": ["array"],
    "opportunities": ["array"],
    "threats": ["array"]
  },
  "competitors": [
    {
      "name": "string",
      "positioning": "string",
      "strengths": "string",
      "pricing": "string",
      "target": "string"
    }
  ],
  "scores": {
    "product": 7,
    "pricing": 6,
    "market_presence": 8,
    "brand": 7,
    "tech": 7,
    "community": 6
  },
  "news": [
    {
      "headline": "string",
      "source": "string",
      "date": "string",
      "summary": "string",
      "sentiment": "positive | neutral | negative"
    }
  ]
}

Ensure you provide 3-4 competitors and 4-5 news items.`;
}

export function chunkText(text: string, maxTokens = 1500): string[] {
  const chunkSize = maxTokens * 4;
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
}
