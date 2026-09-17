import React, { useState, useEffect } from 'react';
import { X, Sparkles, Copy, Check, Clock, TrendingUp, Share2, Layers, Video, MessageSquare, RefreshCw } from 'lucide-react';
import { ContentIdea, SocialTrend } from '../types';

interface ViralIdeaModalProps {
  trend: SocialTrend | null;
  onClose: () => void;
}

export const ViralIdeaModal: React.FC<ViralIdeaModalProps> = ({
  trend,
  onClose,
}) => {
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [creatorNiche, setCreatorNiche] = useState('Tech & Growth Creator');

  const fetchIdeas = async () => {
    if (!trend) return;
    setLoading(true);
    try {
      const res = await fetch('/api/generate-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trendTitle: trend.title,
          category: trend.category,
          platform: trend.platform,
          creatorNiche: creatorNiche
        })
      });
      const data = await res.json();
      if (data.ideas) {
        setIdeas(data.ideas);
      }
    } catch (err) {
      console.error('Failed to load viral ideas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (trend) {
      fetchIdeas();
    }
  }, [trend]);

  if (!trend) return null;

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Short/Reel':
        return <Video className="w-4 h-4 text-pink-400" />;
      case 'Viral Thread':
        return <MessageSquare className="w-4 h-4 text-sky-400" />;
      default:
        return <Layers className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div 
        id="viral-ideas-modal"
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl my-8 text-slate-100 max-h-[90vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Sparkles className="w-5 h-5" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                AI Content Ideation Engine
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-heading text-white">
              Viral Concepts for: <span className="text-indigo-200">"{trend.title}"</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Tailored scripts, hooks, and retention blueprints optimized for maximum reach.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Creator Niche Selector & Regeneration Bar */}
        <div className="py-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-800/80 shrink-0">
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400 font-medium whitespace-nowrap">Your Niche / Tone:</label>
            <input
              type="text"
              value={creatorNiche}
              onChange={(e) => setCreatorNiche(e.target.value)}
              placeholder="e.g. Solo Dev, Comedy, Fitness Coach"
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 w-full sm:w-64"
            />
          </div>

          <button
            onClick={fetchIdeas}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Synthesizing...' : 'Regenerate Angles'}</span>
          </button>
        </div>

        {/* Modal Body: Generated Ideas List */}
        <div className="flex-1 overflow-y-auto py-5 space-y-6 pr-1">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-slate-300 font-medium">
                Formulating viral hooks & storytelling frameworks...
              </p>
              <p className="text-xs text-slate-500">
                Evaluating audience retention spikes & algorithmic cues
              </p>
            </div>
          ) : ideas.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              No ideas generated yet. Click "Regenerate Angles" to formulate concepts.
            </div>
          ) : (
            ideas.map((idea, index) => (
              <div
                key={idea.id || index}
                className="bg-slate-950/60 border border-slate-800/90 rounded-2xl p-5 sm:p-6 space-y-4 hover:border-slate-700/80 transition"
              >
                {/* Idea Card Header */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-200 border border-slate-700">
                      {getTypeIcon(idea.contentType)}
                      {idea.contentType}
                    </span>
                    <span className="text-xs text-indigo-400 font-medium bg-indigo-500/10 px-2.5 py-0.5 rounded-md border border-indigo-500/20">
                      Target: {idea.targetPlatform}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {idea.bestTimeToPost}
                    </span>
                    <span className="font-semibold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                      <TrendingUp className="w-3.5 h-3.5" />
                      {idea.estimatedViralityScore}% Virality Potential
                    </span>
                  </div>
                </div>

                {/* Concept Title */}
                <h3 className="text-lg font-bold text-white font-heading">
                  {idea.title}
                </h3>

                {/* Viral Hook Highlight Box */}
                <div className="relative p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                      The Retention Hook (First 3 Seconds)
                    </span>
                    <button
                      onClick={() => handleCopyText(`hook-${index}`, idea.hook)}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-300 hover:text-white transition"
                    >
                      {copiedId === `hook-${index}` ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Copied Hook!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Hook</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-sm font-medium text-indigo-100 italic">
                    "{idea.hook}"
                  </p>
                </div>

                {/* Outline / Script Pacing */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Beat-by-Beat Structure
                  </h4>
                  <ul className="space-y-1.5">
                    {idea.outline.map((step, sIdx) => (
                      <li key={sIdx} className="text-xs text-slate-300 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-600 mt-1.5 shrink-0" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA & Hashtags Row */}
                <div className="grid sm:grid-cols-2 gap-3 pt-3 border-t border-slate-800/80 text-xs">
                  <div>
                    <span className="text-slate-500 block mb-1 font-medium">Algorithmic CTA:</span>
                    <p className="text-slate-200">{idea.callToAction}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1 font-medium">Recommended Tags:</span>
                    <div className="flex flex-wrap gap-1">
                      {idea.hashtags.map((tag, tIdx) => (
                        <span key={tIdx} className="text-[11px] text-indigo-400 bg-slate-900 px-1.5 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Angle Reasoning */}
                {idea.angleReasoning && (
                  <p className="text-[11px] text-slate-400 italic bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/50">
                    💡 <span className="font-semibold text-slate-300">Strategy Note:</span> {idea.angleReasoning}
                  </p>
                )}
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-slate-800 flex justify-end shrink-0">
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
