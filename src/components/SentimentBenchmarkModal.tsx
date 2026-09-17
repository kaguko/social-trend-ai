import React from 'react';
import { X, Cpu, Gauge, Zap, CheckCircle2, AlertTriangle, ArrowRight, Activity } from 'lucide-react';
import { SentimentBenchmarkComparison } from '../types';

interface SentimentBenchmarkModalProps {
  benchmark: SentimentBenchmarkComparison | null;
  isOpen: boolean;
  onClose: () => void;
  isLoading?: boolean;
}

export const SentimentBenchmarkModal: React.FC<SentimentBenchmarkModalProps> = ({
  benchmark,
  isOpen,
  onClose,
  isLoading,
}) => {
  if (!isOpen) return null;

  return (
    <div id="sentiment-benchmark-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white font-heading">
                  Multi-Model Sentiment Benchmark
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  PostgreSQL Tracked
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Cross-evaluating {benchmark?.trendTitle ? `"${benchmark.trendTitle}"` : 'Text corpus'} across 4 NLP architectures
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {isLoading ? (
            <div className="py-16 text-center">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-300">Running inference pipelines across VADER, RoBERTa, DistilBERT & Gemini Flash...</p>
              <p className="text-xs text-slate-500 mt-1">Measuring latency, F1 confidence, and contextual valence</p>
            </div>
          ) : !benchmark ? (
            <div className="py-12 text-center text-slate-400 text-sm">No benchmark results available.</div>
          ) : (
            <>
              {/* Evaluated Corpus Box */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Analyzed Corpus</span>
                  <span className="text-xs text-slate-500">Evaluation Timestamp: {new Date(benchmark.evaluatedAt).toLocaleTimeString()}</span>
                </div>
                <p className="text-sm text-slate-200 italic leading-relaxed">
                  "{benchmark.inputText}"
                </p>
              </div>

              {/* Consensus Summary Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/40 via-violet-950/30 to-slate-900 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-300">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Consensus Verdict</h3>
                    <p className="text-xs text-slate-300 mt-0.5">{benchmark.analysisSummary}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 self-end sm:self-center">
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">Model Agreement</span>
                    <span className="text-base font-bold text-indigo-400 font-heading">{benchmark.consensusAgreementPercent}%</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                    benchmark.consensusSentiment === 'positive' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                    benchmark.consensusSentiment === 'negative' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
                    'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }`}>
                    {benchmark.consensusSentiment}
                  </span>
                </div>
              </div>

              {/* Model Comparison Grid (4 Models) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.values(benchmark.models).map((m, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between"
                  >
                    <div>
                      {/* Model title and badge */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div>
                          <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider block">
                            {m.modelType}
                          </span>
                          <h4 className="text-sm font-bold text-white font-heading line-clamp-1">
                            {m.modelName}
                          </h4>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase border ${
                          m.sentiment === 'positive' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          m.sentiment === 'negative' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                          'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {m.sentiment}
                        </span>
                      </div>

                      {/* Performance Bar (Score & Confidence) */}
                      <div className="space-y-2 mb-4">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-400">Valence Score (-1.0 to +1.0)</span>
                            <span className="font-semibold text-slate-200">{m.sentimentScore > 0 ? `+${m.sentimentScore}` : m.sentimentScore}</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${m.sentimentScore >= 0 ? 'bg-emerald-400' : 'bg-rose-500'}`}
                              style={{ width: `${Math.min(100, Math.max(10, ((m.sentimentScore + 1) / 2) * 100))}%` }}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                          <div className="p-2 rounded bg-slate-900 border border-slate-800/60">
                            <span className="text-[10px] text-slate-500 block">Inference Latency</span>
                            <span className="font-semibold text-emerald-400 flex items-center gap-1">
                              <Zap className="w-3 h-3" />
                              {m.latencyMs} ms
                            </span>
                          </div>
                          <div className="p-2 rounded bg-slate-900 border border-slate-800/60">
                            <span className="text-[10px] text-slate-500 block">Confidence Metric</span>
                            <span className="font-semibold text-indigo-400 flex items-center gap-1">
                              <Gauge className="w-3 h-3" />
                              {Math.round(m.confidence * 100)}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Explanation */}
                      <p className="text-xs text-slate-400 leading-relaxed mb-4">
                        {m.explanation}
                      </p>
                    </div>

                    {/* Architecture Pros/Cons */}
                    <div className="pt-3 border-t border-slate-800/60 space-y-1.5 text-[11px]">
                      <div className="flex items-start gap-1.5 text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span className="text-slate-300"><strong>Pros:</strong> {m.strengths.slice(0, 2).join(' • ')}</span>
                      </div>
                      <div className="flex items-start gap-1.5 text-amber-400">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span className="text-slate-400"><strong>Tradeoff:</strong> {m.weaknesses[0]}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between text-xs text-slate-400">
          <span>Persisted to Cloud SQL <code className="text-indigo-300 font-mono">sentiment_evaluations</code></span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-white transition"
          >
            Close Benchmark
          </button>
        </div>
      </div>
    </div>
  );
};
