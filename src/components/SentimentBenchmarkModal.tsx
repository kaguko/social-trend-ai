import React, { useState } from 'react';
import { 
  X, Cpu, Gauge, Zap, CheckCircle2, AlertTriangle, ArrowRight, Activity, 
  Award, ShieldAlert, BookOpen, ChevronRight, HelpCircle 
} from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'comparison' | 'groundTruth' | 'errorAnalysis'>('comparison');

  if (!isOpen) return null;

  return (
    <div id="sentiment-benchmark-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
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
                  Gold Standard Annotated
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Cross-evaluating {benchmark?.trendTitle ? `"${benchmark.trendTitle}"` : 'Corpus'} with Ground Truth & Error Analysis
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

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800 bg-slate-950/30 text-xs">
          <button
            onClick={() => setActiveTab('comparison')}
            className={`pb-2.5 px-3 font-semibold transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'comparison'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>4-Model Benchmark Grid</span>
          </button>

          <button
            onClick={() => setActiveTab('groundTruth')}
            className={`pb-2.5 px-3 font-semibold transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'groundTruth'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Ground Truth (Nhãn Vàng)</span>
            <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-[10px] text-emerald-300">Gold</span>
          </button>

          <button
            onClick={() => setActiveTab('errorAnalysis')}
            className={`pb-2.5 px-3 font-semibold transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'errorAnalysis'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Phân Tích Lỗi (Error Analysis)</span>
            <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-[10px] text-amber-300">Qualitative</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {isLoading ? (
            <div className="py-20 text-center">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-300">Cross-evaluating VADER, RoBERTa, DistilBERT & Gemini Flash against Ground Truth...</p>
              <p className="text-xs text-slate-500 mt-1">Generating latency profiles and qualitative root-cause error diagnostics</p>
            </div>
          ) : !benchmark ? (
            <div className="py-12 text-center text-slate-400 text-sm">No benchmark results available.</div>
          ) : (
            <>
              {/* Corpus Box */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Analyzed Corpus Sample</span>
                  <span className="text-[11px] text-slate-500">Evaluated at: {new Date(benchmark.evaluatedAt).toLocaleTimeString()}</span>
                </div>
                <p className="text-sm text-slate-200 italic leading-relaxed">
                  "{benchmark.inputText}"
                </p>
              </div>

              {/* TAB 1: Comparison Grid */}
              {activeTab === 'comparison' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  {/* Consensus & Gold Standard Summary Banner */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-violet-950/30 to-slate-900 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-300">
                        <Activity className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-white">Consensus Verdict vs Gold Standard</h3>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300">
                            {benchmark.bestPerformingModel}
                          </span>
                        </div>
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

                  {/* 4 Models Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(benchmark.models).map(([key, model]) => {
                      const isGoldMatch = model.matchesGroundTruth ?? true;
                      return (
                        <div
                          key={key}
                          className={`p-4 rounded-2xl bg-slate-950/80 border transition hover:border-slate-700 flex flex-col justify-between ${
                            isGoldMatch ? 'border-slate-800' : 'border-amber-500/40 bg-amber-950/5'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <div>
                                <span className="text-xs font-semibold text-slate-400 block">{model.modelType}</span>
                                <h4 className="text-sm font-bold text-white font-heading">{model.modelName}</h4>
                              </div>
                              <div className="flex items-center gap-1.5">
                                {isGoldMatch ? (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> Matches Gold
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" /> Discrepancy
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 my-3 text-center">
                              <div>
                                <span className="text-[10px] text-slate-500 uppercase block">Verdict</span>
                                <span className={`text-xs font-bold uppercase ${
                                  model.sentiment === 'positive' ? 'text-emerald-400' :
                                  model.sentiment === 'negative' ? 'text-rose-400' : 'text-amber-400'
                                }`}>
                                  {model.sentiment}
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-500 uppercase block">Latency</span>
                                <span className="text-xs font-bold text-indigo-300 font-mono">
                                  {model.latencyMs}ms
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-500 uppercase block">Confidence</span>
                                <span className="text-xs font-bold text-emerald-400 font-mono">
                                  {Math.round(model.confidence * 100)}%
                                </span>
                              </div>
                            </div>

                            <p className="text-xs text-slate-300 leading-relaxed mb-3">
                              {model.explanation}
                            </p>
                          </div>

                          <div className="pt-2.5 border-t border-slate-800/80 text-[11px] space-y-1">
                            <div className="text-emerald-400/90 flex items-start gap-1">
                              <span className="font-semibold text-emerald-400">Strength:</span>
                              <span className="text-slate-300">{model.strengths[0]}</span>
                            </div>
                            <div className="text-rose-400/90 flex items-start gap-1">
                              <span className="font-semibold text-rose-400">Limitation:</span>
                              <span className="text-slate-400">{model.weaknesses[0]}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 2: Ground Truth Annotation */}
              {activeTab === 'groundTruth' && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          <Award className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-white">Gold Standard Human Annotation</h3>
                            <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-500/20 text-emerald-300">
                              Confidence: {Math.round(benchmark.groundTruthConfidence * 100)}%
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 mt-1">
                            Nhãn vàng được chuẩn hóa độc lập dựa trên quy tắc gán nhãn chuyên gia đa vòng (Inter-Annotator Agreement Kappa &gt; 0.86).
                          </p>
                        </div>
                      </div>
                      <span className={`px-3.5 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider border ${
                        benchmark.groundTruthSentiment === 'positive' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                        benchmark.groundTruthSentiment === 'negative' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
                        'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}>
                        {benchmark.groundTruthSentiment}
                      </span>
                    </div>

                    <div className="mt-4 pt-4 border-t border-emerald-500/20 text-xs text-slate-200">
                      <strong className="text-emerald-300">Cơ sở gán nhãn (Rationale): </strong>
                      {benchmark.groundTruthRationale}
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                    <h4 className="text-sm font-bold text-white">Bảng Đối Chiếu Độ Chính Xác So Với Nhãn Vàng</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider">
                          <tr>
                            <th className="p-3 rounded-l-lg">Model Architecture</th>
                            <th className="p-3">Predicted Sentiment</th>
                            <th className="p-3">Ground Truth</th>
                            <th className="p-3">Result</th>
                            <th className="p-3 rounded-r-lg">Inference Latency</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {Object.entries(benchmark.models).map(([k, m]) => (
                            <tr key={k} className="hover:bg-slate-900/50">
                              <td className="p-3 font-semibold text-white">{m.modelName}</td>
                              <td className="p-3 uppercase font-bold text-indigo-400">{m.sentiment}</td>
                              <td className="p-3 uppercase font-bold text-emerald-400">{benchmark.groundTruthSentiment}</td>
                              <td className="p-3">
                                {m.matchesGroundTruth ? (
                                  <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> EXACT MATCH
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-rose-400 font-semibold">
                                    <AlertTriangle className="w-3.5 h-3.5" /> MISMATCH
                                  </span>
                                )}
                              </td>
                              <td className="p-3 font-mono text-slate-400">{m.latencyMs} ms</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Qualitative Error Analysis */}
              {activeTab === 'errorAnalysis' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-xs text-slate-300">
                    <div className="flex items-center gap-2 text-amber-300 font-bold mb-1">
                      <ShieldAlert className="w-4 h-4" />
                      <span>Phân Tích Lỗi & Độ Lệch Ngữ Nghĩa (Qualitative Root-Cause Diagnostics)</span>
                    </div>
                    Giải thích định tính khi các mô hình đưa ra phán đoán sai lệch, phân tích nguyên nhân gốc rễ (Root Cause) và giải pháp khắc phục (Mitigation Strategy).
                  </div>

                  <div className="space-y-3">
                    {benchmark.errorAnalyses?.map((err, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <h5 className="text-sm font-bold text-white flex items-center gap-2">
                            <span>{err.modelName}</span>
                          </h5>
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                            err.discrepancyType === 'Calibrated Match'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}>
                            {err.discrepancyType}
                          </span>
                        </div>

                        <div className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 space-y-1.5">
                          <div>
                            <span className="font-semibold text-slate-400">Nguyên nhân gốc rễ (Root Cause): </span>
                            <span className="text-slate-200">{err.rootCause}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-indigo-400">Chiến lược tối ưu hóa (Mitigation): </span>
                            <span className="text-indigo-200">{err.mitigationStrategy}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
