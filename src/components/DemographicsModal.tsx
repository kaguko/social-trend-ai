import React from 'react';
import { X, Users, PieChart, HeartHandshake, Eye, Sparkles, Compass } from 'lucide-react';
import { SocialTrend } from '../types';

interface DemographicsModalProps {
  trend: SocialTrend | null;
  onClose: () => void;
}

export const DemographicsModal: React.FC<DemographicsModalProps> = ({
  trend,
  onClose,
}) => {
  if (!trend) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div
        id="demographics-modal"
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl my-8 text-slate-100"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Users className="w-5 h-5" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                Audience Intelligence & Sentiment
              </span>
            </div>
            <h2 className="text-xl font-bold font-heading text-white">
              {trend.title}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Demographic distribution, community sentiment, and participation depth.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-6 space-y-6">
          {/* Top Metric Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800/80">
              <span className="text-[11px] text-slate-500 block mb-1">Core Age Group</span>
              <span className="text-base font-bold text-white font-heading">
                {trend.demographics.primaryAge}
              </span>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800/80">
              <span className="text-[11px] text-slate-500 block mb-1">Gender Skew</span>
              <span className="text-base font-bold text-indigo-300 font-heading">
                {trend.demographics.genderSkew}
              </span>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800/80">
              <span className="text-[11px] text-slate-500 block mb-1">Engagement Index</span>
              <span className="text-base font-bold text-emerald-400 font-heading">
                {trend.audienceEngagement}%
              </span>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800/80">
              <span className="text-[11px] text-slate-500 block mb-1">Sentiment Rating</span>
              <span className="text-base font-bold text-violet-300 font-heading">
                {trend.sentimentScore}/100
              </span>
            </div>
          </div>

          {/* Primary Audience Interests */}
          <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-indigo-400" />
              Primary Audience Affinity & Topics
            </h4>
            <p className="text-sm font-medium text-slate-200 mb-3">
              {trend.demographics.topInterest}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {trend.keyTopics.map((topic, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 text-indigo-300 border border-slate-700/60"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>

          {/* Sentiment Breakdown Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400 font-medium">Community Sentiment Analysis</span>
              <span className="font-semibold text-emerald-400 capitalize">
                {trend.sentiment} ({trend.sentimentScore}% Favorable)
              </span>
            </div>

            {/* Visual multi-segmented bar */}
            <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${trend.sentimentScore}%` }}
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
                title={`Positive: ${trend.sentimentScore}%`}
              />
              <div
                style={{ width: `${Math.max(5, (100 - trend.sentimentScore) * 0.7)}%` }}
                className="h-full bg-slate-600"
                title="Neutral"
              />
              <div
                style={{ width: `${Math.max(5, (100 - trend.sentimentScore) * 0.3)}%` }}
                className="h-full bg-rose-500"
                title="Negative / Debated"
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> Positive ({trend.sentimentScore}%)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-500 inline-block" /> Neutral ({Math.round((100 - trend.sentimentScore) * 0.7)}%)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-400 inline-block" /> Critical ({Math.round((100 - trend.sentimentScore) * 0.3)}%)
              </span>
            </div>
          </div>

          {/* Suggested Hooks Quick View */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Pre-Optimized Hooks for this Audience
            </h4>
            <div className="space-y-2">
              {trend.suggestedHooks.map((hook, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-200 flex items-start gap-2.5"
                >
                  <span className="text-indigo-400 font-bold shrink-0">0{idx + 1}</span>
                  <span className="italic">"{hook}"</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
