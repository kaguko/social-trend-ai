import express from 'express';
import cors from 'cors';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { INITIAL_TRENDS } from './src/data/mockTrends';
import { ContentIdea, SocialTrend } from './src/types';
import { getDbTrends, saveDbTrend, seedInitialTrendsIfEmpty, saveSentimentBenchmark, saveIdeaToDb, getSavedIdeasFromDb } from './src/db/trends';
import { getOrCreateUser } from './src/db/users';
import { optionalAuth, requireAuth, AuthRequest } from './src/middleware/auth';
import { compareAllSentimentModels } from './src/lib/sentimentBenchmark';
import { generateMLTimeSeriesData } from './src/lib/mlForecaster';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// In-memory cache fallback
let inMemoryTrends: SocialTrend[] = [...INITIAL_TRENDS];

// Check platform credentials
function getApiStatus() {
  const hasGemini = Boolean(process.env.GEMINI_API_KEY);
  const hasReddit = Boolean(process.env.REDDIT_CLIENT_ID && process.env.REDDIT_CLIENT_SECRET);
  const hasYoutube = Boolean(process.env.YOUTUBE_API_KEY);
  const hasOpenAi = Boolean(process.env.OPENAI_API_KEY);
  const hasDatabase = Boolean(process.env.SQL_HOST && process.env.SQL_DB_NAME);

  return {
    hasGemini,
    hasReddit,
    hasYoutube,
    hasOpenAi,
    hasDatabase,
    databaseEngine: 'PostgreSQL (Cloud SQL)',
    mode: (hasGemini || hasReddit || hasYoutube) ? 'live-augmented' as const : 'simulated' as const,
  };
}

function withTimeout<T>(promise: Promise<T>, ms = 4500): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('API request timed out')), ms))
  ]);
}

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

// ----------------------------------------------------
// REST API Endpoints
// ----------------------------------------------------

// GET /api/status: Health and capability matrix
app.get('/api/status', (req, res) => {
  res.json(getApiStatus());
});

// POST /api/auth/sync: Sync authenticated user into PostgreSQL
app.post('/api/auth/sync', requireAuth, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User token not verified' });
    }
    const { email, uid, name, picture } = req.user;
    const dbUser = await getOrCreateUser(uid, email || `${uid}@guest.ai`, name, picture);
    res.json({ success: true, user: dbUser });
  } catch (error: any) {
    console.error('Error syncing user:', error);
    res.status(500).json({ error: error.message || 'Failed to sync user' });
  }
});

// GET /api/trends: Retrieve trends from PostgreSQL (with fallback)
app.get('/api/trends', async (req, res) => {
  try {
    const { platform, category, search } = req.query;
    try {
      const dbResults = await getDbTrends({
        platform: typeof platform === 'string' ? platform : undefined,
        category: typeof category === 'string' ? category : undefined,
        search: typeof search === 'string' ? search : undefined,
      });

      if (dbResults && dbResults.length > 0) {
        return res.json({
          trends: dbResults,
          total: dbResults.length,
          source: 'PostgreSQL (Cloud SQL)',
          status: getApiStatus()
        });
      }
    } catch (dbErr) {
      console.warn('PostgreSQL query fallback to memory cache:', dbErr);
    }

    // Fallback to memory
    let results = [...inMemoryTrends];
    if (platform && platform !== 'all') {
      results = results.filter(t => t.platform === platform);
    }
    if (category && category !== 'All') {
      results = results.filter(t => t.category === category);
    }
    if (search && typeof search === 'string' && search.trim()) {
      const q = search.toLowerCase();
      results = results.filter(t => 
        t.title.toLowerCase().includes(q) || 
        t.summary.toLowerCase().includes(q) ||
        t.keyTopics.some(k => k.toLowerCase().includes(q))
      );
    }

    res.json({
      trends: results,
      total: results.length,
      source: 'In-Memory Cache',
      status: getApiStatus()
    });
  } catch (error: any) {
    console.error('Error fetching trends:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch trends' });
  }
});

// POST /api/analyze-topic: Multi-step AI analysis + ML forecast + PostgreSQL storage
app.post('/api/analyze-topic', optionalAuth, async (req: AuthRequest, res) => {
  const { topic, platform = 'reddit', category = 'Tech & AI' } = req.body;
  if (!topic || typeof topic !== 'string') {
    return res.status(400).json({ error: 'A valid topic is required' });
  }

  const gemini = getGeminiClient();
  let calculatedTrend: SocialTrend | null = null;

  if (gemini) {
    try {
      const prompt = `You are a world-class social media trend forecaster and audience intelligence analyst.
Analyze the following trend/topic for social media creators:
Topic: "${topic}"
Target Platform: ${platform}
Category: ${category}

Respond strictly with valid JSON with the following schema:
{
  "title": "${topic}",
  "score": <number between 70 and 99 indicating momentum score>,
  "growthRate": "<e.g. +310% this week>",
  "volume": "<e.g. 1.2M views or 48.5K upvotes>",
  "sentiment": "<'positive' | 'neutral' | 'mixed' | 'negative'>",
  "sentimentScore": <number between 50 and 95>,
  "summary": "<2-3 sentence incisive analysis of why this is trending and creator opportunity>",
  "keyTopics": ["<keyword1>", "<keyword2>", "<keyword3>", "<keyword4>"],
  "demographics": {
    "primaryAge": "<e.g. 20-34>",
    "topInterest": "<primary niche interest>",
    "genderSkew": "<e.g. 60% Male / 40% Female>",
    "peakPlatform": "<main platform>"
  },
  "audienceEngagement": <number between 75 and 98>,
  "suggestedHooks": [
    "<irresistible viral hook 1>",
    "<intriguing contrarian hook 2>",
    "<actionable hook 3>"
  ]
}
Do NOT include markdown backticks around the JSON.`;

      const response = await withTimeout(
        gemini.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
        }),
        4500
      );

      const responseText = response.text || '';
      const cleanJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      const score = parsed.score || 88;
      const ml = generateMLTimeSeriesData(score, (category as any) || 'Tech & AI');

      calculatedTrend = {
        id: `tr-${Date.now()}`,
        title: parsed.title || topic,
        platform: (platform as any) || 'reddit',
        category: (category as any) || 'Tech & AI',
        score: score,
        growthRate: parsed.growthRate || '+240% this week',
        volume: parsed.volume || '1.8M impressions',
        sentiment: parsed.sentiment || 'positive',
        sentimentScore: parsed.sentimentScore || 85,
        summary: parsed.summary || `Trending discussions surrounding ${topic}.`,
        keyTopics: parsed.keyTopics || [topic, 'Social Trends', 'Viral Discussions'],
        demographics: parsed.demographics || {
          primaryAge: '20 - 35',
          topInterest: 'Industry Trends & Digital Culture',
          genderSkew: '54% Male / 46% Female',
          peakPlatform: platform
        },
        audienceEngagement: parsed.audienceEngagement || 89,
        suggestedHooks: parsed.suggestedHooks || [
          `The truth about ${topic} that creators aren't telling you.`,
          `Why ${topic} is blowing up everywhere right now.`
        ],
        createdAt: 'Just now',
        isRealTime: true,
        predictedPeakDays: ml.predictedPeakDays,
        predictedViralProbability: ml.predictedViralProbability,
        mlMomentumSlope: ml.mlMomentumSlope,
        historicalDataPoints: ml.historicalDataPoints,
      };
    } catch (err: any) {
      console.warn('Gemini API call failed, falling back to heuristic ML trend synthesis:', err.message);
    }
  }

  // Fallback heuristic if Gemini was absent or timed out
  if (!calculatedTrend) {
    const score = Math.floor(Math.random() * 20) + 78;
    const growthNum = Math.floor(Math.random() * 350) + 120;
    const volumeNum = (Math.random() * 4 + 0.8).toFixed(1);
    const ml = generateMLTimeSeriesData(score, (category as any) || 'Tech & AI');

    calculatedTrend = {
      id: `tr-${Date.now()}`,
      title: topic.trim(),
      platform: (platform as any) || 'reddit',
      category: (category as any) || 'Tech & AI',
      score: score,
      growthRate: `+${growthNum}% this week`,
      volume: platform === 'youtube' || platform === 'tiktok' ? `${volumeNum}M views` : `${(Math.random() * 50 + 15).toFixed(1)}K upvotes`,
      sentiment: 'positive',
      sentimentScore: Math.floor(Math.random() * 15) + 78,
      summary: `Rapidly accelerating user interest and engagement around "${topic}". Community members are actively debating best practices, novel use cases, and creative adaptations across ${platform}.`,
      keyTopics: [topic, 'Creator Insights', 'Audience Growth', 'Algorithm Spike'],
      demographics: {
        primaryAge: '21 - 36',
        topInterest: `${category} & Digital Trends`,
        genderSkew: '58% Male / 42% Female',
        peakPlatform: platform.toUpperCase()
      },
      audienceEngagement: Math.floor(Math.random() * 15) + 82,
      suggestedHooks: [
        `Nobody is talking about the biggest shift happening in ${topic}...`,
        `I tested ${topic} for 7 days, and the results completely changed my strategy.`,
        `Here is the step-by-step breakdown of why ${topic} is taking over right now.`
      ],
      createdAt: 'Just now',
      isRealTime: false,
      predictedPeakDays: ml.predictedPeakDays,
      predictedViralProbability: ml.predictedViralProbability,
      mlMomentumSlope: ml.mlMomentumSlope,
      historicalDataPoints: ml.historicalDataPoints,
    };
  }

  // Save to PostgreSQL database
  try {
    const saved = await saveDbTrend(calculatedTrend, req.user?.uid);
    inMemoryTrends = [saved, ...inMemoryTrends];
    return res.json({ trend: saved, persistedToDb: true });
  } catch (dbSaveErr) {
    console.warn('Could not save to PostgreSQL, kept in memory:', dbSaveErr);
    inMemoryTrends = [calculatedTrend, ...inMemoryTrends];
    return res.json({ trend: calculatedTrend, persistedToDb: false });
  }
});

// POST /api/evaluate-sentiment: Multi-model Sentiment Benchmark comparison
// Compares VADER vs RoBERTa vs DistilBERT vs Gemini LLM
app.post('/api/evaluate-sentiment', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const { text, trendTitle, trendId, existingScore } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required for sentiment benchmark' });
    }

    const benchmark = compareAllSentimentModels(text, trendTitle, existingScore);

    // Save benchmark run to database
    await saveSentimentBenchmark(trendId, benchmark);

    res.json({
      benchmark,
      persistedToPostgreSQL: true,
      evaluatedAt: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error evaluating sentiment models:', error);
    res.status(500).json({ error: error.message || 'Sentiment evaluation failed' });
  }
});

// POST /api/predict-ml: Deep Machine Learning Trend Forecast
app.post('/api/predict-ml', (req, res) => {
  try {
    const { score = 80, category = 'Tech & AI' } = req.body;
    const ml = generateMLTimeSeriesData(Number(score), String(category));
    res.json({
      forecast: ml,
      methodology: {
        model: 'Polynomial Momentum Regression + EMA Volatility + Sigmoid Virality Classifier',
        features: ['Velocity slope (dV/dt)', 'Rolling variance', 'Category attention half-life', 'Peak day decay'],
        confidenceInterval: '95% (1.96 standard deviations)'
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'ML Prediction failed' });
  }
});

// POST /api/generate-ideas: Generate viral content ideas
app.post('/api/generate-ideas', async (req, res) => {
  const { trendTitle, category = 'General', platform = 'All', creatorNiche = 'Content Creator', trendId } = req.body;
  if (!trendTitle) {
    return res.status(400).json({ error: 'Trend title is required' });
  }

  const gemini = getGeminiClient();

  if (gemini) {
    try {
      const prompt = `You are a premier viral content strategist who has generated over 500M social views across YouTube, TikTok, X/Twitter, and Instagram.
Generate 3 distinct, high-performing content ideas based on this trend:
Trend: "${trendTitle}"
Niche/Category: "${category}"
Target Audience / Creator Profile: "${creatorNiche}"
Platform Focus: "${platform}"

Generate a JSON array of exactly 3 ideas adhering strictly to this JSON format:
[
  {
    "id": "idea-1",
    "trendTitle": "${trendTitle}",
    "contentType": "Short/Reel",
    "title": "<Catchy working title>",
    "hook": "<High-retention 0-3 second spoken hook with pattern interrupt>",
    "outline": [
      "<0-10s: Setup the paradox or controversy>",
      "<10-30s: Give the unexpected insight or proof>",
      "<30-50s: Step-by-step actionable lesson>",
      "<50-60s: Natural retention loop and conclusion>"
    ],
    "callToAction": "<Organic comment question or bookmark CTA>",
    "targetPlatform": "YouTube",
    "hashtags": ["#Tag1", "#Tag2", "#Tag3", "#Tag4"],
    "estimatedViralityScore": 94,
    "bestTimeToPost": "11:30 AM or 6:00 PM EST",
    "angleReasoning": "<Why this specific angle triggers the algorithm and audience psychology>"
  }
]
Types must be one of: "Short/Reel", "Long Video", "Viral Thread", "Post/Carousel".
Platforms must be one of: "YouTube", "TikTok", "Instagram", "X/Twitter".
Output ONLY pure JSON. Do not include markdown code block tags.`;

      const response = await withTimeout(
        gemini.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
        }),
        4500
      );

      const responseText = response.text || '';
      const cleanJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed: ContentIdea[] = JSON.parse(cleanJson);

      // Attach trendId
      parsed.forEach(i => i.trendId = trendId);

      return res.json({ ideas: parsed, aiGenerated: true });
    } catch (err: any) {
      console.warn('Gemini ideas generation failed, using fallback:', err.message);
    }
  }

  // High quality fallback ideas
  const fallbackIdeas: ContentIdea[] = [
    {
      id: `idea-${Date.now()}-1`,
      trendId,
      trendTitle,
      contentType: 'Short/Reel',
      title: `The 60-Second Breakdown of ${trendTitle}`,
      hook: `Most people are completely misunderstanding ${trendTitle}—here is what’s actually happening.`,
      outline: [
        '0:00 - State the common misconception with a bold visual trigger.',
        '0:12 - Reveal the underlying data or shift driving this trend.',
        '0:32 - Demonstrate the 2 concrete steps to take advantage of it today.',
        '0:50 - Deliver the concluding punchline.'
      ],
      callToAction: 'Drop your take in the comments: overhyped or game-changer?',
      targetPlatform: 'TikTok',
      hashtags: ['#TrendAlert', '#CreatorTips', '#ViralTrends', '#SocialMediaGrowth'],
      estimatedViralityScore: 92,
      bestTimeToPost: '12:00 PM - 2:00 PM EST',
      angleReasoning: 'Leverages the "contrarian truth" psychological trigger to drive immediate comment debate.'
    },
    {
      id: `idea-${Date.now()}-2`,
      trendId,
      trendTitle,
      contentType: 'Viral Thread',
      title: `The Comprehensive Playbook on ${trendTitle}`,
      hook: `I spent 48 hours analyzing ${trendTitle} so you don't have to. Here are the 5 lessons every creator needs: 🧵`,
      outline: [
        '1/ Why this topic went viral in the last 7 days.',
        '2/ The exact numbers and momentum behind it.',
        '3/ The biggest mistake creators are making when covering it.',
        '4/ 3 creative ways to adapt this to your own specific niche.',
        '5/ The TL;DR summary and next steps.'
      ],
      callToAction: 'Bookmark this thread before you plan your content schedule this week.',
      targetPlatform: 'X/Twitter',
      hashtags: ['#Thread', '#BuildInPublic', '#GrowthHacking', '#ContentStrategy'],
      estimatedViralityScore: 89,
      bestTimeToPost: '9:00 AM EST (Peak weekday morning)',
      angleReasoning: 'High save/bookmark value which signals massive algorithmic distribution.'
    },
    {
      id: `idea-${Date.now()}-3`,
      trendId,
      trendTitle,
      contentType: 'Long Video',
      title: `How ${trendTitle} Is Changing Everything (Deep Dive)`,
      hook: `If you’ve been on social media this week, you’ve probably noticed ${trendTitle}. But almost nobody is seeing the bigger picture.`,
      outline: [
        'Intro: The explosive rise and cultural context.',
        'Chapter 1: The turning point that sparked the fire.',
        'Chapter 2: Real-world examples & data breakdown.',
        'Chapter 3: How you can capitalize before the wave peaks.',
        'Outro: What this means for the next 6 months.'
      ],
      callToAction: 'Subscribe for weekly deep dives into emerging social patterns before they go mainstream.',
      targetPlatform: 'YouTube',
      hashtags: ['#DeepDive', '#VideoEssay', '#TechTrends', '#CreatorEconomy'],
      estimatedViralityScore: 95,
      bestTimeToPost: '3:30 PM EST Thursday/Friday',
      angleReasoning: 'In-depth storytelling format maximizes average watch time and YouTube recommendation velocity.'
    }
  ];

  res.json({ ideas: fallbackIdeas, aiGenerated: false });
});

// POST /api/saved-ideas: Save idea to PostgreSQL
app.post('/api/saved-ideas', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const idea: ContentIdea = req.body;
    await saveIdeaToDb(idea, req.user?.uid);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to save idea' });
  }
});

// GET /api/saved-ideas: Get saved ideas from PostgreSQL
app.get('/api/saved-ideas', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const ideas = await getSavedIdeasFromDb(req.user?.uid);
    res.json({ ideas });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch saved ideas' });
  }
});

// Setup Vite middleware in dev or static serve in prod
async function startServer() {
  // Seed PostgreSQL database asynchronously on start
  seedInitialTrendsIfEmpty().catch(e => console.warn('Database seed skipped:', e));

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Social Trend AI] Backend API + Vite listening at http://0.0.0.0:${PORT}`);
  });
}

startServer();
