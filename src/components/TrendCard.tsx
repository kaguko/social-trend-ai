import React, { useState } from 'react';
import { Sparkles, Users, TrendingUp, Copy, Check, LineChart, Cpu, Zap, ArrowUpRight } from 'lucide-react';
import { SocialTrend } from '../types';

interface TrendCardProps {
  trend: SocialTrend;
  onGenerateIdeas: (trend: SocialTrend) => void;
  onViewDemographics: (trend: SocialTrend) => void;
  onViewMLForecast?: (trend: SocialTrend) => void;
  onRunSentimentBenchmark?: (trend: SocialTrend) => void;
}

export const TrendCard: React.FC<TrendCardProps> = ({
  trend,
  onGenerateIdeas,
  onViewDemographics,
  onViewMLForecast,
  onRunSentimentBenchmark,
}) => {
  const [copiedHook, setCopiedHook] = useState(false);

  const getPlatformStyle = (platform: string) => {
    switch (platform) {
      case 'reddit':
        return {
          bg: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
          dot: 'bg-orange-500',
          name: 'Reddit'
        };
      case 'youtube':
        return {
          bg: 'bg-red-500/10 text-red-400 border-red-500/20',
          dot: 'bg-red-500',
          name: 'YouTube'
        };
      case 'tiktok':
        return {
          bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
          dot: 'bg-cyan-500',
          name: 'TikTok'
        };
      case 'twitter':
        return {
          bg: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
          dot: 'bg-sky-500',
          name: 'X (Twitter)'
        };
      default:
        return {
          bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
          dot: 'bg-indigo-500',
          name: platform
        };
    }
  };

  const platformStyle = getPlatformStyle(trend.platform);

  const handleCopyTopHook = () => {
    if (trend.suggestedHooks && trend.suggestedHooks.length > 0) {
      navigator.clipboard.writeText(trend.suggestedHooks[0]);
      setCopiedHook(true);
      setTimeout(() => setCopiedHook(false), 2000);
    }
  };

  const viralProbPercent = trend.predictedViralProbability 
    ? Math.round(trend.predictedViralProbability * 100) 
    : 85;

  return (
    <div
      id={`trend-card-${trend.id}`}
      className="group relative flex flex-col justify-between bg-slate-900/80 hover:bg-slate-900 border border-slate-800/90 hover:border-slate-700/90 rounded-2xl p-5 transition-all duration-200 shadow-sm hover:shadow-xl hover:shadow-indigo-950/20"
    >
      <div>
        {/* Card Header: Platform, Category, Virality Score */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${platformStyle.bg}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${platformStyle.dot}`} />
              {platformStyle.name}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {trend.category}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-baseline gap-1 text-right">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Virality</span>
              <span className="text-sm font-bold text-indigo-400 font-heading">
                {trend.score}/100
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-bold text-xs text-indigo-300">
              {trend.score}
            </div>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-semibold text-white group-hover:text-indigo-200 transition line-clamp-2 mb-2 font-heading leading-snug">
          {trend.title}
        </h3>

        {/* Summary */}
        <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 mb-4">
          {trend.summary}
        </p>

        {/* Metrics Row: Momentum Rate, Community Volume & ML Forecast Indicator */}
        <div className="grid grid-cols-2 gap-2 mb-3 p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/60 text-xs">
          <div>
            <span className="text-[11px] text-slate-500 block mb-0.5">Momentum Rate</span>
            <span className="font-semibold text-emerald-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              {trend.growthRate}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 block mb-0.5">ML Viral Prob</span>
            <span className="font-semibold text-violet-400 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" />
              {viralProbPercent}%
            </span>
          </div>
        </div>

        {/* Action Pills for ML Models & Benchmarking */}
        <div className="flex items-center gap-2 mb-4">
          {onViewMLForecast && (
            <button
              onClick={() => onViewMLForecast(trend)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg text-xs font-medium bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/50 hover:border-slate-600 transition"
              title="View Time-series trajectory and ML momentum slope"
            >
              <LineChart className="w-3.5 h-3.5 text-indigo-400" />
              <span>ML Forecast</span>
            </button>
          )}

          {onRunSentimentBenchmark && (
            <button
              onClick={() => onRunSentimentBenchmark(trend)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg text-xs font-medium bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/50 hover:border-slate-600 transition"
              title="Evaluate text across 4 NLP Sentiment Architectures"
            >
              <Cpu className="w-3.5 h-3.5 text-violet-400" />
              <span>Eval Models</span>
            </button>
          )}
        </div>

        {/* Key Topic Chips */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {trend.keyTopics.slice(0, 4).map((topic, i) => (
            <span
              key={i}
              className="text-[11px] font-medium text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md"
            >
              #{topic}
            </span>
          ))}
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <button
          onClick={() => onViewDemographics(trend)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 transition py-1.5 px-2 rounded-lg hover:bg-slate-800"
          title="Audience Demographics & Sentiment"
        >
          <Users className="w-3.5 h-3.5" />
          <span>Demographics</span>
        </button>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopyTopHook}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            title="Copy suggested viral hook"
          >
            {copiedHook ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            onClick={() => onGenerateIdeas(trend)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition active:scale-[0.98]"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
            <span>Viral Ideas</span>
          </button>
        </div>
      </div>
    </div>
  );
};
