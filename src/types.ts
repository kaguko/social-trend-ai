export type SocialPlatform = 'reddit' | 'youtube' | 'twitter' | 'tiktok';

export type TrendCategory = 
  | 'All'
  | 'Tech & AI' 
  | 'Gaming' 
  | 'Creator Economy' 
  | 'Finance & Crypto' 
  | 'Lifestyle & Culture' 
  | 'Entertainment';

export interface DemographicData {
  primaryAge: string;
  topInterest: string;
  genderSkew: string;
  peakPlatform: string;
}

export interface SocialTrend {
  id: string;
  title: string;
  platform: SocialPlatform;
  category: TrendCategory;
  score: number; // 0-100 Virality / Momentum index
  growthRate: string;
  volume: string;
  sentiment: 'positive' | 'neutral' | 'mixed' | 'negative';
  sentimentScore: number; // 0-100
  summary: string;
  sourceUrl?: string;
  authorOrChannel?: string;
  keyTopics: string[];
  demographics: DemographicData;
  audienceEngagement: number; // Percentage 0-100
  suggestedHooks: string[];
  createdAt: string;
  isRealTime?: boolean;
}

export interface ContentIdea {
  id: string;
  trendTitle: string;
  contentType: 'Short/Reel' | 'Long Video' | 'Viral Thread' | 'Post/Carousel';
  title: string;
  hook: string;
  outline: string[];
  callToAction: string;
  targetPlatform: 'YouTube' | 'TikTok' | 'Instagram' | 'X/Twitter';
  hashtags: string[];
  estimatedViralityScore: number;
  bestTimeToPost: string;
  angleReasoning: string;
}

export interface FilterState {
  platform: 'all' | SocialPlatform;
  category: TrendCategory;
  search: string;
  sortBy: 'momentum' | 'growth' | 'volume' | 'sentiment';
  timeframe: '24h' | '7d' | '30d';
}

export interface ApiStatus {
  hasGemini: boolean;
  hasReddit: boolean;
  hasYoutube: boolean;
  hasOpenAi: boolean;
  mode: 'live-augmented' | 'simulated';
}
