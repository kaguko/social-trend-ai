import React from 'react';
import { X, TrendingUp, AlertCircle, Calendar, LineChart, Target, Zap, ShieldCheck } from 'lucide-react';
import { SocialTrend } from '../types';

interface MLForecastModalProps {
  trend: SocialTrend | null;
  isOpen: boolean;
  onClose: () => void;
}

export const MLForecastModal: React.FC<MLForecastModalProps> = ({
  trend,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !trend) return null;

  const points = trend.historicalDataPoints || [];
  const maxScore = 100;
  const slope = trend.mlMomentumSlope ?? 1.45;
  const viralProb = Math.round((trend.predictedViralProbability ?? 0.85) * 100);
  const peakDays = trend.predictedPeakDays ?? 3;

  return (
    <div id="ml-forecast-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <LineChart className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white font-heading">
                  Machine Learning Trend Trajectory
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  ML Forecasting
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Predictive regression, decay modeling & viral probability for <strong className="text-slate-200">"{trend.title}"</strong>
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

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Key Forecast Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Viral Probability</span>
                <Target className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-emerald-400 font-heading">
                {viralProb}%
              </div>
              <span className="text-[11px] text-slate-500 mt-0.5 block">Logistic Sigmoid Model</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Momentum Slope</span>
                <TrendingUp className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-bold text-indigo-400 font-heading">
                {slope > 0 ? `+${slope}` : slope} <span className="text-xs font-normal text-slate-400">dV/dt</span>
              </div>
              <span className="text-[11px] text-slate-500 mt-0.5 block">Linear Velocity Gradient</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Estimated Peak Window</span>
                <Calendar className="w-4 h-4 text-violet-400" />
              </div>
              <div className="text-2xl font-bold text-violet-400 font-heading">
                {peakDays} Days
              </div>
              <span className="text-[11px] text-slate-500 mt-0.5 block">Before attention half-life decay</span>
            </div>
          </div>

          {/* Time Series Trend Projection Visualizer */}
          <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-white">7-Day History & 3-Day ML Forward Projection</h3>
                <p className="text-xs text-slate-400">Rolling mean with 95% Confidence Bounds (±1.96σ)</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-indigo-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Actual / Proj
                </span>
                <span className="flex items-center gap-1 text-slate-500">
                  <span className="w-2.5 h-1 bg-slate-700" /> Bounds
                </span>
              </div>
            </div>

            {/* Sparkline / Bar visualization */}
            <div className="h-44 flex items-end justify-between gap-2 pt-6 pb-2 border-b border-slate-800">
              {points.map((pt, idx) => {
                const isPred = pt.timestamp.includes('(Pred)');
                const heightPercent = Math.max(15, (pt.score / maxScore) * 100);
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                    {/* Tooltip on hover */}
                    <div className="absolute -top-12 hidden group-hover:flex flex-col items-center z-10 pointer-events-none">
                      <div className="bg-slate-900 border border-slate-700 text-[10px] text-white px-2 py-1 rounded shadow-lg whitespace-nowrap">
                        <strong>{pt.score}/100</strong> • Z-Score: {pt.zScore}
                        <br />Range: [{pt.lowerBound} - {pt.upperBound}]
                      </div>
                      <div className="w-1.5 h-1.5 bg-slate-700 rotate-45 -mt-1" />
                    </div>

                    {/* Bar and confidence whisker */}
                    <div className="w-full flex justify-center items-end h-32 relative">
                      {/* Confidence whisker */}
                      <div
                        className="absolute w-1.5 bg-slate-800/80 rounded-full"
                        style={{
                          bottom: `${Math.max(0, (pt.lowerBound / maxScore) * 100)}%`,
                          height: `${Math.max(5, ((pt.upperBound - pt.lowerBound) / maxScore) * 100)}%`
                        }}
                      />
                      {/* Value Bar */}
                      <div
                        className={`w-full max-w-[28px] rounded-t-md transition-all duration-300 relative z-10 ${
                          isPred 
                            ? 'bg-gradient-to-t from-violet-600/60 to-violet-400 border border-violet-400/40' 
                            : 'bg-gradient-to-t from-indigo-600 to-indigo-400'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>

                    <span className={`text-[10px] truncate max-w-[50px] text-center ${isPred ? 'text-violet-300 font-bold' : 'text-slate-400'}`}>
                      {pt.timestamp.replace(' (Pred)', '*')}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 mt-2">
              <span>Past 7 Days Observations</span>
              <span>* Projected by ML</span>
            </div>
          </div>

          {/* ML Methodology and Insights */}
          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-2">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Machine Learning Architecture Details
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Our forecasting pipeline synthesizes <strong>time-series polynomial regression</strong>, rolling <strong>exponential moving average (EMA)</strong> volatility boundaries, and a <strong>logistic virality classifier</strong>. Instead of static Z-score heuristics, it models platform-specific audience saturation curves and peak velocity decay rates.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between text-xs text-slate-400">
          <span>Model: Momentum-Regression-v2.1 • PostgreSQL Synced</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-white transition"
          >
            Close Forecast
          </button>
        </div>
      </div>
    </div>
  );
};
