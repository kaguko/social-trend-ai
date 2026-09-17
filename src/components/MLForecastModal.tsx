import React, { useState } from 'react';
import { 
  X, TrendingUp, AlertCircle, Calendar, LineChart, Target, Zap, 
  ShieldCheck, BarChart2, CheckCircle, HelpCircle, Activity 
} from 'lucide-react';
import { SocialTrend } from '../types';
import { forecastTrendTrajectory } from '../lib/mlForecaster';

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
  const [activeTab, setActiveTab] = useState<'trajectory' | 'metrics'>('trajectory');

  if (!isOpen || !trend) return null;

  // Compute forecast dynamically with accuracy metrics
  const forecast = forecastTrendTrajectory(trend);
  const points = forecast.historicalDataPoints;
  const slope = forecast.momentumSlope;
  const viralProb = Math.round(forecast.predictedViralProbability * 100);
  const peakDays = forecast.predictedPeakDays;
  const metrics = forecast.accuracyMetrics;

  return (
    <div id="ml-forecast-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <LineChart className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white font-heading">
                  Machine Learning Trajectory & Metrics
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  R² = {metrics.rSquared}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Predictive regression, decay modeling & empirical accuracy for <strong className="text-slate-200">"{trend.title}"</strong>
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

        {/* Tab Selection */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800 bg-slate-950/30 text-xs">
          <button
            onClick={() => setActiveTab('trajectory')}
            className={`pb-2.5 px-3 font-semibold transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'trajectory'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <LineChart className="w-3.5 h-3.5" />
            <span>Time-Series Visualizer</span>
          </button>

          <button
            onClick={() => setActiveTab('metrics')}
            className={`pb-2.5 px-3 font-semibold transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'metrics'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Đánh Giá Độ Chính Xác (RMSE, MAE, Precision/Recall)</span>
            <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-[10px] text-emerald-300">Quantitative</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {activeTab === 'trajectory' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Key Forecast Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                    <span>Viral Probability</span>
                    <Target className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-bold text-emerald-400 font-heading">
                    {viralProb}%
                  </div>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">Logistic Sigmoid Model</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                    <span>Momentum Slope</span>
                    <TrendingUp className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="text-2xl font-bold text-indigo-400 font-heading">
                    {slope > 0 ? `+${slope}` : slope} <span className="text-xs font-normal text-slate-400">dV/dt</span>
                  </div>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">Velocity Gradient (R²={metrics.rSquared})</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                    <span>Estimated Peak Window</span>
                    <Calendar className="w-4 h-4 text-violet-400" />
                  </div>
                  <div className="text-2xl font-bold text-violet-400 font-heading">
                    {peakDays} Days
                  </div>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">Before saturation half-life decay</span>
                </div>
              </div>

              {/* Time Series Trend Projection Visualizer */}
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-white">7-Day Observed History & 3-Day ML Forward Projection</h3>
                    <p className="text-xs text-slate-400">Rolling regression curve with 95% Confidence Bounds (±1.96σ)</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" /> Historical
                    </span>
                    <span className="flex items-center gap-1.5 text-violet-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-violet-400 inline-block" /> Forward Pred
                    </span>
                  </div>
                </div>

                {/* SVG Time-Series Chart */}
                <div className="relative w-full h-52 bg-slate-900/90 rounded-xl p-3 border border-slate-800/80 flex items-end justify-between gap-2 overflow-hidden">
                  {points.map((pt, idx) => {
                    const heightPercent = Math.min(95, Math.max(15, pt.score));
                    const isPrediction = pt.timestamp.includes('(Pred)');
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                        {/* Upper bound dot */}
                        <div 
                          className="absolute w-1.5 h-1.5 rounded-full bg-slate-600/50" 
                          style={{ bottom: `${Math.min(98, pt.upperBound)}%` }}
                          title={`Upper 95% Bound: ${pt.upperBound}`}
                        />
                        
                        {/* Bar */}
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className={`w-full rounded-t-lg transition-all duration-300 group-hover:brightness-125 ${
                            isPrediction
                              ? 'bg-gradient-to-t from-violet-700/50 via-violet-500/80 to-violet-400 border-t border-violet-300'
                              : 'bg-gradient-to-t from-indigo-900/60 via-indigo-600/80 to-indigo-500'
                          }`}
                        />

                        {/* Tooltip on Hover */}
                        <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
                          <div className="px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-[10px] text-white whitespace-nowrap shadow-xl">
                            <span className="font-semibold block">{pt.timestamp}</span>
                            <span>Score: <strong>{pt.score}</strong></span>
                            <span className="block text-slate-400">95% CI: [{pt.lowerBound} - {pt.upperBound}]</span>
                          </div>
                          <div className="w-1.5 h-1.5 bg-slate-950 rotate-45 border-r border-b border-slate-700 -mt-1" />
                        </div>

                        {/* X-axis label */}
                        <span className={`text-[10px] mt-2 whitespace-nowrap ${
                          isPrediction ? 'text-violet-300 font-semibold' : 'text-slate-500'
                        }`}>
                          {pt.timestamp.replace(' (Pred)', '')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Quantitative Accuracy Metrics (Hội đồng phản biện) */}
          {activeTab === 'metrics' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 text-xs text-slate-300">
                <div className="flex items-center gap-2 text-indigo-300 font-bold mb-1">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  <span>Báo Cáo Đo Lường Độ Chính Xác Của Mô Hình Dự Báo (ML Evaluation Report)</span>
                </div>
                Được đánh giá thông qua phương pháp kiểm định lùi (Walk-Forward Cross-Validation) so sánh giữa giá trị mô hình dự phóng và dữ liệu quan sát thực tế (Ground Truth stream).
              </div>

              {/* Continuous Regression Metrics Grid */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  1. Chỉ Số Đánh Giá Hồi Quy Chuỗi Thời Gian (Continuous Regression Metrics)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[11px] text-slate-400 block">RMSE (Root Mean Squared)</span>
                    <span className="text-xl font-bold text-white font-mono">{metrics.rmse}</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Sai số chuẩn độ lệch</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[11px] text-slate-400 block">MAE (Mean Absolute)</span>
                    <span className="text-xl font-bold text-white font-mono">{metrics.mae}</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Sai số tuyệt đối TB</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[11px] text-slate-400 block">MAPE (%)</span>
                    <span className="text-xl font-bold text-emerald-400 font-mono">{metrics.mape}%</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Phần trăm sai lệch TB</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[11px] text-slate-400 block">Hệ Số R² (Goodness of Fit)</span>
                    <span className="text-xl font-bold text-indigo-400 font-mono">{metrics.rSquared}</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Độ tương thích dữ liệu</span>
                  </div>
                </div>
              </div>

              {/* Classification Metrics (Virality Prediction) */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  2. Chỉ Số Phân Loại Ngưỡng Bùng Nổ Virality (Classification Metrics)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[11px] text-slate-400 block">Accuracy</span>
                    <span className="text-xl font-bold text-white font-mono">{Math.round(metrics.classificationAccuracy * 100)}%</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Độ chuẩn xác phân loại</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[11px] text-slate-400 block">Precision (Độ chuẩn)</span>
                    <span className="text-xl font-bold text-emerald-400 font-mono">{metrics.precision}</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">TP / (TP + FP)</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[11px] text-slate-400 block">Recall (Độ nhạy)</span>
                    <span className="text-xl font-bold text-violet-400 font-mono">{metrics.recall}</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">TP / (TP + FN)</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[11px] text-slate-400 block">F1-Score</span>
                    <span className="text-xl font-bold text-indigo-400 font-mono">{metrics.f1Score}</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Trung bình điều hòa</span>
                  </div>
                </div>
              </div>

              {/* Scientific Methodology Description */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs text-slate-300">
                <h5 className="font-bold text-white flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-indigo-400" />
                  <span>Cách thức trả lời câu hỏi phản biện của hội đồng:</span>
                </h5>
                <p className="leading-relaxed text-slate-300">
                  <em>"Mô hình sử dụng hồi quy đa thức bậc 1 và 2 để ước lượng đạo hàm vận tốc tăng trưởng $dV/dt$. Độ chính xác dự báo chuỗi thời gian đạt <strong>R² = {metrics.rSquared}</strong> với sai số tuyệt đối trung bình <strong>MAE = {metrics.mae} điểm</strong>. Đối với bài toán phân loại nhị phân dự báo xu hướng có trở thành viral hay không (ngưỡng score &ge; 75), mô hình Logistic Sigmoid đạt <strong>F1-score = {metrics.f1Score}</strong> với độ nhạy (Recall) là <strong>{metrics.recall}</strong>, đảm bảo không bỏ sót các tín hiệu bùng nổ sớm."</em>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
