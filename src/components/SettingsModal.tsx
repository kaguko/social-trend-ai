import React from 'react';
import { X, Key, CheckCircle2, AlertCircle, ShieldCheck, Cpu, ExternalLink } from 'lucide-react';
import { ApiStatus } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiStatus: ApiStatus | null;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  apiStatus,
}) => {
  if (!isOpen) return null;

  const apis = [
    {
      name: 'Google Gemini API',
      key: 'GEMINI_API_KEY',
      connected: apiStatus?.hasGemini,
      description: 'Powers real-time trend intelligence, viral hook generation, and demographic synthesis via gemini-3.8-flash.',
      requiredFor: 'AI Ideation & Live Signals',
    },
    {
      name: 'Reddit API',
      key: 'REDDIT_CLIENT_ID & SECRET',
      connected: apiStatus?.hasReddit,
      description: 'Ingests trending community discussions, upvotes, and comments across top subreddits.',
      requiredFor: 'Direct Reddit Ingestion',
    },
    {
      name: 'YouTube Data API v3',
      key: 'YOUTUBE_API_KEY',
      connected: apiStatus?.hasYoutube,
      description: 'Streams video velocity, view counts, and creator topics across YouTube categories.',
      requiredFor: 'Direct YouTube Metrics',
    },
    {
      name: 'OpenAI API',
      key: 'OPENAI_API_KEY',
      connected: apiStatus?.hasOpenAi,
      description: 'Secondary LLM model fallback for content strategy.',
      requiredFor: 'Optional LLM Fallback',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div
        id="settings-modal"
        className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl my-8 text-slate-100"
      >
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Key className="w-5 h-5" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                Platform Integrations & Data Sources
              </span>
            </div>
            <h2 className="text-xl font-bold font-heading text-white">
              API Connection Status
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Current environment credentials and automated fallback engine status.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-6 space-y-4">
          <div className="p-3.5 bg-indigo-950/30 border border-indigo-500/20 rounded-2xl text-xs text-indigo-200 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white block mb-0.5">Hybrid Architecture Active:</span>
              When external API keys are detected in the environment, live endpoints are queried. In their absence, our high-fidelity trend forecasting heuristics maintain seamless, continuous creator intelligence.
            </div>
          </div>

          <div className="space-y-3">
            {apis.map((api, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-white">{api.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 font-mono text-slate-400">
                      {api.key}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                    {api.description}
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {api.connected ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Connected
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
                      <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
                      Heuristic Mode
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
