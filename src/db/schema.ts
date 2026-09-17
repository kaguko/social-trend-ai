import { pgTable, text, serial, integer, timestamp, jsonb, doublePrecision, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table (synced from Firebase Auth UID)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  displayName: text('display_name'),
  photoUrl: text('photo_url'),
  createdAt: timestamp('created_at').defaultNow(),
  lastLoginAt: timestamp('last_login_at').defaultNow(),
});

// Trends table storing all tracked trends in PostgreSQL
export const trends = pgTable('trends', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  platform: text('platform').notNull(), // 'reddit' | 'youtube' | 'twitter' | 'tiktok'
  category: text('category').notNull(),
  score: integer('score').notNull(),
  growthRate: text('growth_rate').notNull(),
  volume: text('volume').notNull(),
  sentiment: text('sentiment').notNull(),
  sentimentScore: integer('sentiment_score').notNull(),
  summary: text('summary').notNull(),
  sourceUrl: text('source_url'),
  authorOrChannel: text('author_or_channel'),
  keyTopics: jsonb('key_topics').notNull(),
  demographics: jsonb('demographics').notNull(),
  audienceEngagement: integer('audience_engagement').notNull(),
  suggestedHooks: jsonb('suggested_hooks').notNull(),
  isRealTime: boolean('is_real_time').default(false),
  
  // Advanced ML forecast metadata
  predictedPeakDays: integer('predicted_peak_days').default(3),
  predictedViralProbability: doublePrecision('predicted_viral_probability').default(0.85),
  mlMomentumSlope: doublePrecision('ml_momentum_slope').default(1.42),
  historicalDataPoints: jsonb('historical_data_points'), // Array of { timestamp, value, zscore, mlForecast }

  createdAt: timestamp('created_at').defaultNow(),
  createdByUserId: text('created_by_user_id'),
});

// Sentiment model evaluations benchmark
export const sentimentEvaluations = pgTable('sentiment_evaluations', {
  id: serial('id').primaryKey(),
  trendId: text('trend_id').references(() => trends.id),
  inputText: text('input_text').notNull(),
  groundTruthLabel: text('ground_truth_label'), // 'positive' | 'neutral' | 'negative'
  
  // Model 1: VADER (Rule-based lexicon)
  vaderScore: doublePrecision('vader_score').notNull(),
  vaderLabel: text('vader_label').notNull(),
  vaderLatencyMs: integer('vader_latency_ms').notNull(),

  // Model 2: RoBERTa-Twitter (Deep learning transformer)
  robertaScore: doublePrecision('roberta_score').notNull(),
  robertaLabel: text('roberta_label').notNull(),
  robertaConfidence: doublePrecision('roberta_confidence').notNull(),
  robertaLatencyMs: integer('roberta_latency_ms').notNull(),

  // Model 3: DistilBERT-SST2 (Distilled transformer)
  distilbertScore: doublePrecision('distilbert_score').notNull(),
  distilbertLabel: text('distilbert_label').notNull(),
  distilbertConfidence: doublePrecision('distilbert_confidence').notNull(),
  distilbertLatencyMs: integer('distilbert_latency_ms').notNull(),

  // Model 4: Gemini Flash (Large Language Model)
  llmScore: doublePrecision('llm_score').notNull(),
  llmLabel: text('llm_label').notNull(),
  llmConfidence: doublePrecision('llm_confidence').notNull(),
  llmExplanation: text('llm_explanation'),
  llmLatencyMs: integer('llm_latency_ms').notNull(),

  evaluatedAt: timestamp('evaluated_at').defaultNow(),
});

// Saved Content Ideas table
export const savedIdeas = pgTable('saved_ideas', {
  id: text('id').primaryKey(),
  trendId: text('trend_id').references(() => trends.id),
  trendTitle: text('trend_title').notNull(),
  contentType: text('content_type').notNull(),
  title: text('title').notNull(),
  hook: text('hook').notNull(),
  outline: jsonb('outline').notNull(),
  callToAction: text('call_to_action').notNull(),
  targetPlatform: text('target_platform').notNull(),
  hashtags: jsonb('hashtags').notNull(),
  estimatedViralityScore: integer('estimated_virality_score').notNull(),
  bestTimeToPost: text('best_time_to_post').notNull(),
  angleReasoning: text('angle_reasoning'),
  userId: text('user_id'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relationships
export const usersRelations = relations(users, ({ many }) => ({
  savedIdeas: many(savedIdeas),
}));

export const trendsRelations = relations(trends, ({ many }) => ({
  evaluations: many(sentimentEvaluations),
  ideas: many(savedIdeas),
}));
