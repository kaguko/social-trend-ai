import React, { useState } from 'react';
import { X, Sparkles, Wand2, Globe, Tag, Radio } from 'lucide-react';
import { SocialPlatform, TrendCategory, SocialTrend } from '../types';

interface AnalyzeTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTrendCreated: (newTrend: SocialTrend) => void;
}

export const AnalyzeTopicModal: React.FC<AnalyzeTopicModalProps> = ({
  isOpen,
  onClose,
  onTrendCreated,
}) => {
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState<SocialPlatform>('reddit');
  const [category, setCategory] = useState<TrendCategory>('Tech & AI');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/analyze-topic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          platform,
          category,
        }),
      });

      const data = await res.json();
      if (res.ok && data.trend) {
        onTrendCreated(data.trend);
        setTopic('');
        onClose();
      } else {
        setError(data.error || 'Failed to analyze topic');
      }
    } catch (err: any) {
      setError(err.message || 'Error communicating with server');
    } finally {
      setIsSubmitting(false);
    }
  };

  const sampleTopics = [
    'DeepSeek R1 Models',
    'OpenAI Operator & Canvas',
    'Cold Plunge & Dopamine',
    'Micro-Gym Home Workouts',
    'Retro Tech & Y2K Camcorders'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div
        id="analyze-topic-modal"
        className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl my-8 text-slate-100"
      >
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Sparkles className="w-5 h-5" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                AI Trend Intelligence
              </span>
            </div>
            <h2 className="text-xl font-bold font-heading text-white">
              Analyze Any Custom Topic
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Input any emerging keyword, niche interest, or product to calculate virality metrics.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="py-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* Topic Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Trend Topic, Keyword, or Hashtag
            </label>
            <input
              id="topic-input"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Local Autonomous Agents, Carnivore Diet, Solopreneur Apps"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Quick Suggestions */}
          <div>
            <span className="text-[11px] text-slate-500 block mb-1.5 font-medium">Quick suggestions:</span>
            <div className="flex flex-wrap gap-1.5">
              {sampleTopics.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setTopic(s)}
                  className="text-xs px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 transition border border-slate-700/50"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Platform & Category Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Target Platform
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as SocialPlatform)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="reddit">Reddit (r/Communities)</option>
                <option value="youtube">YouTube (Videos & Shorts)</option>
                <option value="tiktok">TikTok (Viral Trends)</option>
                <option value="twitter">X / Twitter (Discussions)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Niche / Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TrendCategory)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="Tech & AI">Tech & AI</option>
                <option value="Gaming">Gaming</option>
                <option value="Creator Economy">Creator Economy</option>
                <option value="Finance & Crypto">Finance & Crypto</option>
                <option value="Lifestyle & Culture">Lifestyle & Culture</option>
                <option value="Entertainment">Entertainment</option>
              </select>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              Cancel
            </button>

            <button
              id="submit-analyze-btn"
              type="submit"
              disabled={isSubmitting || !topic.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/25 transition disabled:opacity-50"
            >
              <Wand2 className={`w-4 h-4 ${isSubmitting ? 'animate-spin' : ''}`} />
              <span>{isSubmitting ? 'Analyzing Signals...' : 'Run Trend Analysis'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
