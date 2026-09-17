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

export interface HistoricalDataPoint {
  timestamp: string;
  score: number;
  zScore: number;
  growthRate: number;
  mlPredictedMomentum: number;
  upperBound: number;
  lowerBound: number;
  actualScore?: number; // Ground truth observation when backtesting
}

export interface MLAccuracyMetrics {
  rmse: number; // Root Mean Square Error
  mae: number;  // Mean Absolute Error
  mape: number; // Mean Absolute Percentage Error (%)
  rSquared: number; // Coefficient of determination
  classificationAccuracy: number; // For viral threshold (>80 score)
  precision: number;
  recall: number;
  f1Score: number;
  evaluationSampleCount: number;
  methodologyNotes: string;
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
  // ML Forecast fields
  predictedPeakDays?: number;
  predictedViralProbability?: number; // 0-1
  mlMomentumSlope?: number;
  historicalDataPoints?: HistoricalDataPoint[];
  accuracyMetrics?: MLAccuracyMetrics;
}

export interface MLForecastResult {
  trendId: string;
  momentumSlope: number;
  predictedViralProbability: number;
  predictedPeakDays: number;
  volatilityIndex: number;
  historicalDataPoints: HistoricalDataPoint[];
  summary: string;
  accuracyMetrics: MLAccuracyMetrics;
}

export interface SentimentModelResult {
  modelName: string;
  modelType: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  sentimentScore: number; // normalized -1.0 to 1.0
  confidence: number; // 0-1
  latencyMs: number;
  costTier?: 'Ultra Low ($0)' | 'Low' | 'Medium' | 'Variable API';
  explanation?: string;
  strengths: string[];
  weaknesses: string[];
  // Ground truth evaluation metrics
  matchesGroundTruth?: boolean;
  errorDistance?: number;
}

export interface ErrorDiscrepancyAnalysis {
  modelName: string;
  discrepancyType: 'False Positive' | 'False Negative' | 'Subtle Irony / Sarcasm Misclassification' | 'Slang / Lexical Drift' | 'Calibrated Match';
  rootCause: string;
  mitigationStrategy: string;
}

export interface SentimentBenchmarkComparison {
  trendId?: string;
  trendTitle?: string;
  inputText: string;
  evaluatedAt: string;
  // Ground truth annotation
  groundTruthSentiment: 'positive' | 'neutral' | 'negative';
  groundTruthAnnotator: 'Human Expert Consensus (Gold Standard)' | 'Gold Standard Cross-Validated';
  groundTruthConfidence: number;
  groundTruthRationale: string;
  models: {
    vader: SentimentModelResult;
    roberta: SentimentModelResult;
    distilbert: SentimentModelResult;
    llm: SentimentModelResult;
  };
  consensusSentiment: 'positive' | 'neutral' | 'negative';
  consensusAgreementPercent: number;
  bestPerformingModel: string;
  errorAnalyses: ErrorDiscrepancyAnalysis[];
  analysisSummary: string;
}

export interface ContentIdea {
  id: string;
  trendId?: string;
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
  sortBy: 'momentum' | 'growth' | 'volume' | 'sentiment' | 'mlProbability';
  timeframe: '24h' | '7d' | '30d';
}

export interface ApiStatus {
  hasGemini: boolean;
  hasReddit: boolean;
  hasYoutube: boolean;
  hasOpenAi: boolean;
  hasDatabase: boolean;
  databaseEngine: string;
  mode: 'live-augmented' | 'simulated';
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
}
