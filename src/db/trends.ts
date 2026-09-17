import { db } from './index';
import { trends, sentimentEvaluations, savedIdeas } from './schema';
import { eq, desc } from 'drizzle-orm';
import { SocialTrend, SentimentBenchmarkComparison, ContentIdea } from '../types';
import { forecastTrendTrajectory } from '../lib/mlForecaster';
import { INITIAL_TRENDS } from '../data/mockTrends';

export async function getAllTrends(): Promise<SocialTrend[]> {
  try {
    const dbRecords = await db.select().from(trends).orderBy(desc(trends.score));
    if (dbRecords && dbRecords.length > 0) {
      return dbRecords.map(r => ({
        id: r.id,
        platform: r.platform as any,
        title: r.title,
        summary: r.summary,
        category: r.category as any,
        score: r.score,
        growthRate: r.growthRate,
        volume: r.volume,
        sentiment: r.sentiment as any,
        sentimentScore: r.sentimentScore,
        keyTopics: (r.keyTopics as string[]) || [],
        demographics: (r.demographics as any) || { primaryAge: '18-24', topInterest: 'Tech', genderSkew: '50/50', peakPlatform: 'Twitter' },
        audienceEngagement: r.audienceEngagement,
        suggestedHooks: (r.suggestedHooks as string[]) || [],
        createdAt: r.createdAt ? r.createdAt.toISOString() : new Date().toISOString(),
        isRealTime: r.isRealTime ?? false,
        predictedViralProbability: r.predictedViralProbability ? Number(r.predictedViralProbability) : 0.85,
        mlMomentumSlope: r.mlMomentumSlope ? Number(r.mlMomentumSlope) : 1.25,
        predictedPeakDays: r.predictedPeakDays ?? 3,
        historicalDataPoints: (r.historicalDataPoints as any) || []
      }));
    }
  } catch (error) {
    console.warn('PostgreSQL connection query skipped or offline, falling back to cached seed trends:', error);
  }

  // Fallback enriched with ML forecasting
  return INITIAL_TRENDS.map(t => {
    const forecast = forecastTrendTrajectory(t);
    return {
      ...t,
      historicalDataPoints: forecast.historicalDataPoints,
      mlMomentumSlope: forecast.momentumSlope,
      predictedViralProbability: forecast.predictedViralProbability,
      predictedPeakDays: forecast.predictedPeakDays
    };
  });
}

export async function getDbTrends(filters?: { platform?: string; category?: string; search?: string }): Promise<SocialTrend[]> {
  const all = await getAllTrends();
  let result = all;
  if (filters?.platform && filters.platform !== 'all') {
    result = result.filter(t => t.platform === filters.platform);
  }
  if (filters?.category && filters.category !== 'All') {
    result = result.filter(t => t.category === filters.category);
  }
  if (filters?.search && filters.search.trim()) {
    const q = filters.search.toLowerCase();
    result = result.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.summary.toLowerCase().includes(q) ||
      t.keyTopics.some(k => k.toLowerCase().includes(q))
    );
  }
  return result;
}

export async function upsertTrend(trend: Partial<SocialTrend> & { title: string }): Promise<void> {
  const id = trend.id || `tr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const forecast = forecastTrendTrajectory(trend);

  await db.insert(trends).values({
    id,
    platform: trend.platform || 'twitter',
    title: trend.title,
    summary: trend.summary || '',
    category: trend.category || 'Tech & AI',
    score: trend.score || 80,
    growthRate: trend.growthRate || '+100%',
    volume: trend.volume || '10k',
    sentiment: trend.sentiment || 'positive',
    sentimentScore: trend.sentimentScore || 80,
    demographics: trend.demographics || { primaryAge: '18-24', topInterest: 'Tech', genderSkew: '50/50', peakPlatform: 'Twitter' },
    audienceEngagement: trend.audienceEngagement || 85,
    keyTopics: trend.keyTopics || [],
    suggestedHooks: trend.suggestedHooks || [],
    isRealTime: trend.isRealTime ?? true,
    predictedViralProbability: trend.predictedViralProbability ?? forecast.predictedViralProbability,
    mlMomentumSlope: trend.mlMomentumSlope ?? forecast.momentumSlope,
    predictedPeakDays: trend.predictedPeakDays ?? forecast.predictedPeakDays,
    historicalDataPoints: trend.historicalDataPoints ?? forecast.historicalDataPoints,
  }).onConflictDoUpdate({
    target: trends.id,
    set: {
      score: trend.score || 80,
      growthRate: trend.growthRate || '+100%',
      volume: trend.volume || '10k',
      sentimentScore: trend.sentimentScore || 80,
      summary: trend.summary || '',
      category: trend.category || 'Tech & AI',
      audienceEngagement: trend.audienceEngagement || 85,
      keyTopics: trend.keyTopics || [],
      suggestedHooks: trend.suggestedHooks || [],
      predictedViralProbability: trend.predictedViralProbability ?? forecast.predictedViralProbability,
      mlMomentumSlope: trend.mlMomentumSlope ?? forecast.momentumSlope,
      predictedPeakDays: trend.predictedPeakDays ?? forecast.predictedPeakDays,
      historicalDataPoints: trend.historicalDataPoints ?? forecast.historicalDataPoints,
    }
  });
}

export async function saveDbTrend(trend: SocialTrend, createdByUserId?: string): Promise<SocialTrend> {
  await upsertTrend(trend);
  return trend;
}

export async function seedInitialTrendsIfEmpty(): Promise<void> {
  try {
    const existing = await db.select({ id: trends.id }).from(trends).limit(1);
    if (!existing || existing.length === 0) {
      for (const t of INITIAL_TRENDS) {
        await upsertTrend(t);
      }
      console.log(`Successfully seeded ${INITIAL_TRENDS.length} trends to Cloud SQL PostgreSQL`);
    }
  } catch (e) {
    console.warn('Initial PostgreSQL seed skipped or failed:', e);
  }
}

export async function saveSentimentEvaluation(evaluation: SentimentBenchmarkComparison): Promise<void> {
  try {
    await db.insert(sentimentEvaluations).values({
      trendId: evaluation.trendId || null,
      inputText: evaluation.inputText,
      groundTruthLabel: evaluation.consensusSentiment,
      vaderScore: evaluation.models.vader.sentimentScore,
      vaderLabel: evaluation.models.vader.sentiment,
      vaderLatencyMs: Math.round(evaluation.models.vader.latencyMs),
      robertaScore: evaluation.models.roberta.sentimentScore,
      robertaLabel: evaluation.models.roberta.sentiment,
      robertaConfidence: evaluation.models.roberta.confidence,
      robertaLatencyMs: Math.round(evaluation.models.roberta.latencyMs),
      distilbertScore: evaluation.models.distilbert.sentimentScore,
      distilbertLabel: evaluation.models.distilbert.sentiment,
      distilbertConfidence: evaluation.models.distilbert.confidence,
      distilbertLatencyMs: Math.round(evaluation.models.distilbert.latencyMs),
      llmScore: evaluation.models.llm.sentimentScore,
      llmLabel: evaluation.models.llm.sentiment,
      llmConfidence: evaluation.models.llm.confidence,
      llmExplanation: evaluation.models.llm.explanation || '',
      llmLatencyMs: Math.round(evaluation.models.llm.latencyMs),
    });
  } catch (error) {
    console.error('Failed to save sentiment evaluation to PostgreSQL:', error);
  }
}

export async function saveSentimentBenchmark(trendId: string | undefined, benchmark: SentimentBenchmarkComparison): Promise<void> {
  return saveSentimentEvaluation({
    ...benchmark,
    trendId
  });
}

export async function saveContentIdea(userId: string, trendId: string, idea: ContentIdea): Promise<void> {
  try {
    const id = idea.id || `idea_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    await db.insert(savedIdeas).values({
      id,
      userId,
      trendId,
      trendTitle: idea.trendTitle,
      contentType: idea.contentType,
      title: idea.title || 'Untitled Idea',
      hook: idea.hook || '',
      outline: idea.outline || [],
      callToAction: idea.callToAction || '',
      targetPlatform: idea.targetPlatform || 'YouTube',
      hashtags: idea.hashtags || [],
      estimatedViralityScore: idea.estimatedViralityScore || 85,
      bestTimeToPost: idea.bestTimeToPost || '6 PM EST',
      angleReasoning: idea.angleReasoning || '',
    });
  } catch (error) {
    console.error('Failed to save content idea to PostgreSQL:', error);
  }
}

export async function saveIdeaToDb(idea: ContentIdea, userId?: string): Promise<void> {
  return saveContentIdea(userId || 'guest', idea.trendId || 'general', idea);
}

export async function getSavedIdeasFromDb(userId?: string): Promise<any[]> {
  try {
    if (userId) {
      return await db.select().from(savedIdeas).where(eq(savedIdeas.userId, userId));
    }
    return await db.select().from(savedIdeas);
  } catch (e) {
    console.warn('Could not fetch saved ideas from PostgreSQL:', e);
    return [];
  }
}
