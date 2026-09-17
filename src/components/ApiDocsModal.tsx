import React, { useState } from 'react';
import { X, Code, ExternalLink, Check, Copy, BookOpen, Layers, ShieldCheck } from 'lucide-react';

interface ApiDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiDocsModal: React.FC<ApiDocsModalProps> = ({ isOpen, onClose }) => {
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string>('all');

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(id);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const endpoints = [
    {
      id: 'get-trends',
      method: 'GET',
      path: '/api/trends',
      tag: 'Trends',
      summary: 'Retrieve social media trend signals from PostgreSQL',
      description: 'Fetches cached or real-time analyzed trends filtered by platform, category, or search keywords. Includes ML time-series predictions.',
      queryParams: [
        { name: 'platform', type: 'string', desc: 'Filter platform: "reddit" | "youtube" | "twitter" | "tiktok" | "all"' },
        { name: 'category', type: 'string', desc: 'Category filter: e.g., "Tech & AI", "Gaming", "Creator Economy"' },
        { name: 'search', type: 'string', desc: 'Keyword search across titles, summaries, and key topics' }
      ],
      responseSample: `{
  "trends": [
    {
      "id": "tr-1",
      "title": "Autonomous AI Agents & MCP Boom",
      "platform": "reddit",
      "category": "Tech & AI",
      "score": 98,
      "growthRate": "+420% this week",
      "predictedViralProbability": 0.94,
      "mlMomentumSlope": 2.4,
      "predictedPeakDays": 2,
      "historicalDataPoints": [...]
    }
  ],
  "total": 1,
  "source": "PostgreSQL (Cloud SQL)"
}`
    },
    {
      id: 'post-analyze-topic',
      method: 'POST',
      path: '/api/analyze-topic',
      tag: 'Trends',
      summary: 'Trigger deep AI topic analysis and ML trajectory generation',
      description: 'Accepts an emerging topic, queries Gemini 3.8 Flash, computes polynomial regression momentum, and saves results to Cloud SQL.',
      requestBody: `{
  "topic": "Model Context Protocol",
  "platform": "reddit",
  "category": "Tech & AI"
}`,
      responseSample: `{
  "trend": {
    "id": "tr-1726563000",
    "title": "Model Context Protocol",
    "score": 92,
    "growthRate": "+310% this week",
    "predictedViralProbability": 0.91,
    "historicalDataPoints": [...]
  },
  "persistedToDb": true
}`
    },
    {
      id: 'post-evaluate-sentiment',
      method: 'POST',
      path: '/api/evaluate-sentiment',
      tag: 'NLP Benchmark',
      summary: 'Benchmark 4 NLP models against Gold Standard Ground Truth',
      description: 'Simultaneously evaluates text across VADER, CardiffNLP RoBERTa, DistilBERT-SST2, and Gemini 3.8 Flash. Compares predictions against human ground truth with qualitative error diagnostics.',
      requestBody: `{
  "text": "Autonomous agents using MCP protocol are completely revolutionizing local developer workflows!",
  "trendTitle": "Autonomous AI Agents",
  "trendId": "tr-1"
}`,
      responseSample: `{
  "benchmark": {
    "groundTruthSentiment": "positive",
    "groundTruthConfidence": 0.98,
    "consensusSentiment": "positive",
    "consensusAgreementPercent": 100,
    "bestPerformingModel": "CardiffNLP RoBERTa (14.8ms)",
    "models": {
      "vader": { "sentiment": "positive", "latencyMs": 1.2 },
      "roberta": { "sentiment": "positive", "latencyMs": 14.8 },
      "distilbert": { "sentiment": "positive", "latencyMs": 6.4 },
      "llm": { "sentiment": "positive", "latencyMs": 185.0 }
    },
    "errorAnalyses": [...]
  },
  "persistedToPostgreSQL": true
}`
    },
    {
      id: 'post-predict-ml',
      method: 'POST',
      path: '/api/predict-ml',
      tag: 'Machine Learning',
      summary: 'Calculate ML time-series trajectory with RMSE, MAE, and R²',
      description: 'Performs polynomial momentum regression ($dV/dt$), exponential moving average confidence bounds (±1.96σ), and calculates backtesting accuracy metrics.',
      requestBody: `{
  "score": 88,
  "category": "Tech & AI"
}`,
      responseSample: `{
  "forecast": {
    "momentumSlope": 2.1,
    "predictedViralProbability": 0.92,
    "predictedPeakDays": 3,
    "accuracyMetrics": {
      "rmse": 3.42,
      "mae": 2.85,
      "mape": 4.12,
      "rSquared": 0.941,
      "precision": 0.917,
      "recall": 0.945,
      "f1Score": 0.931
    }
  }
}`
    },
    {
      id: 'post-generate-ideas',
      method: 'POST',
      path: '/api/generate-ideas',
      tag: 'Generative AI',
      summary: 'Generate viral hooks, outlines, and multi-format content ideas',
      description: 'Generates 3 multi-platform viral formats (Short/Reel, Viral Thread, Long Video) with psychological hooks and optimal posting windows.',
      requestBody: `{
  "trendTitle": "Autonomous AI Agents",
  "category": "Tech & AI",
  "platform": "YouTube",
  "creatorNiche": "Tech Creator"
}`,
      responseSample: `{
  "ideas": [
    {
      "id": "idea-1",
      "contentType": "Short/Reel",
      "title": "The 60-Second Breakdown",
      "hook": "Stop using ChatGPT manually...",
      "estimatedViralityScore": 92
    }
  ]
}`
    },
    {
      id: 'get-openapi-spec',
      method: 'GET',
      path: '/api/openapi.json',
      tag: 'OpenAPI',
      summary: 'Retrieve complete OpenAPI 3.1 Specification',
      description: 'Returns the machine-readable OpenAPI specification JSON compatible with Swagger UI, Postman, and Redoc.',
      responseSample: `{
  "openapi": "3.1.0",
  "info": {
    "title": "Social Trend AI REST API",
    "version": "1.0.0"
  },
  "paths": {...}
}`
    }
  ];

  const filteredEndpoints = activeTag === 'all' 
    ? endpoints 
    : endpoints.filter(e => e.tag.toLowerCase().includes(activeTag.toLowerCase()));

  return (
    <div id="api-docs-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white font-heading">
                  REST API Documentation & OpenAPI Spec
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  OpenAPI 3.1
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Swagger-compatible endpoint specifications, request payloads, and response contracts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter tags & raw JSON trigger */}
        <div className="flex items-center justify-between px-6 py-2.5 border-b border-slate-800 bg-slate-950/30 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {['all', 'Trends', 'NLP Benchmark', 'Machine Learning', 'Generative AI'].map(tag => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`px-3 py-1 rounded-lg font-medium transition ${
                  activeTag === tag
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                {tag.charAt(0).toUpperCase() + tag.slice(1)}
              </button>
            ))}
          </div>

          <a
            href="/api/openapi.json"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-semibold transition"
          >
            <span>Raw OpenAPI JSON</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Endpoints List */}
        <div className="p-6 overflow-y-auto space-y-5">
          {filteredEndpoints.map(ep => (
            <div key={ep.id} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono tracking-wider ${
                    ep.method === 'GET'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                  }`}>
                    {ep.method}
                  </span>
                  <span className="font-mono text-sm font-semibold text-slate-200">{ep.path}</span>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 self-start sm:self-center">
                  {ep.tag}
                </span>
              </div>

              <p className="text-xs text-slate-300">{ep.description}</p>

              {ep.requestBody && (
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Request Body (JSON)
                  </span>
                  <pre className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] text-indigo-200 overflow-x-auto">
                    {ep.requestBody}
                  </pre>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Response Sample (200 OK)
                  </span>
                  <button
                    onClick={() => handleCopy(ep.responseSample, ep.id)}
                    className="text-[11px] text-slate-400 hover:text-slate-200 inline-flex items-center gap-1"
                  >
                    {copiedEndpoint === ep.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] text-emerald-300 overflow-x-auto max-h-40">
                  {ep.responseSample}
                </pre>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
