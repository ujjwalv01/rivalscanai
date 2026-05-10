export interface CompanyOverview {
  oneliner: string;
  positioning: string;
  founded: string;
  hq: string;
  employees: string;
  stage: string;
  tags: string[];
  revenue?: string;
  businessModel?: string;
  techStack?: string[];
  targetAudience?: string;
}

export interface SwotAnalysis {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface Competitor {
  name: string;
  positioning: string;
  strengths: string;
  pricing: string;
  target: string;
}

export interface CompanyScores {
  product: number;
  pricing: number;
  market_presence: number;
  brand: number;
  tech: number;
  community: number;
}

export type NewsSentiment = 'positive' | 'neutral' | 'negative';

export interface NewsItem {
  headline: string;
  source: string;
  date: string;
  summary: string;
  sentiment: NewsSentiment;
}

export interface ResearchReport {
  isValid: boolean;
  overview: CompanyOverview;
  swot: SwotAnalysis;
  competitors: Competitor[];
  scores: CompanyScores;
  news: NewsItem[];
}

export type ResearchStatus =
  | 'idle'
  | 'scraping'
  | 'reading'
  | 'generating'
  | 'done'
  | 'error';

export interface StreamMessage {
  status: ResearchStatus;
  message: string;
  data?: ResearchReport;
  error?: string;
}
