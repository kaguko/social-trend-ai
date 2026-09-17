import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { TrendFilters } from './components/TrendFilters';
import { TrendCard } from './components/TrendCard';
import { ViralIdeaModal } from './components/ViralIdeaModal';
import { DemographicsModal } from './components/DemographicsModal';
import { AnalyzeTopicModal } from './components/AnalyzeTopicModal';
import { SettingsModal } from './components/SettingsModal';
import { SentimentBenchmarkModal } from './components/SentimentBenchmarkModal';
import { MLForecastModal } from './components/MLForecastModal';
import { INITIAL_TRENDS } from './data/mockTrends';
import { SocialTrend, FilterState, ApiStatus, SentimentBenchmarkComparison, UserProfile } from './types';
import { TrendingUp, Flame, Zap, BarChart2, Sparkles, RefreshCw, Cpu, Database, ShieldCheck } from 'lucide-react';
import { auth, googleAuthProvider } from './lib/firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

export default function App() {
  const [trends, setTrends] = useState<SocialTrend[]>(INITIAL_TRENDS);
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState<ApiStatus | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);

  // Filter & Search State
  const [filters, setFilters] = useState<FilterState>({
    platform: 'all',
    category: 'All',
    search: '',
    sortBy: 'momentum',
    timeframe: '7d'
  });

  // Modal State
  const [ideaModalTrend, setIdeaModalTrend] = useState<SocialTrend | null>(null);
  const [demographicsTrend, setDemographicsTrend] = useState<SocialTrend | null>(null);
  const [forecastTrend, setForecastTrend] = useState<SocialTrend | null>(null);
  const [benchmarkResult, setBenchmarkResult] = useState<SentimentBenchmarkComparison | null>(null);
  const [isBenchmarkOpen, setIsBenchmarkOpen] = useState(false);
  const [isBenchmarkLoading, setIsBenchmarkLoading] = useState(false);
  const [isAnalyzeOpen, setIsAnalyzeOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const token = await currentUser.getIdToken();
        const profile: UserProfile = {
          uid: currentUser.uid,
          email: currentUser.email || '',
          displayName: currentUser.displayName || undefined,
          photoURL: currentUser.photoURL || undefined,
        };
        setUser(profile);

        // Sync to PostgreSQL
        try {
          await fetch('/api/auth/sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ uid: currentUser.uid })
          });
        } catch (e) {
          console.warn('Could not sync user to db:', e);
        }
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleAuthProvider);
    } catch (err) {
      console.error('Sign-in error:', err);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Sign-out error:', err);
    }
  };

  // Fetch status and dynamic trends from server
  const fetchTrends = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/trends');
      const data = await res.json();
      if (data.trends && data.trends.length > 0) {
        setTrends(data.trends);
      }
      if (data.status) {
        setApiStatus(data.status);
      }
    } catch (err) {
      console.error('Failed to fetch trends from backend:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrends();
  }, []);

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleTrendCreated = (newTrend: SocialTrend) => {
    setTrends(prev => [newTrend, ...prev]);
    setIdeaModalTrend(newTrend);
  };

  // Run 4-model Sentiment Benchmark for a trend
  const handleRunSentimentBenchmark = async (trend: SocialTrend) => {
    setIsBenchmarkOpen(true);
    setIsBenchmarkLoading(true);
    setBenchmarkResult(null);

    try {
      const res = await fetch('/api/evaluate-sentiment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `${trend.title}. ${trend.summary}`,
          trendTitle: trend.title,
          trendId: trend.id,
          existingScore: trend.sentimentScore
        })
      });

      const data = await res.json();
      if (data.benchmark) {
        setBenchmarkResult(data.benchmark);
      }
    } catch (err) {
      console.error('Sentiment benchmark error:', err);
    } finally {
      setIsBenchmarkLoading(false);
    }
  };

  // Filtered & Sorted Trends
  const processedTrends = useMemo(() => {
    let result = [...trends];

    if (filters.platform !== 'all') {
      result = result.filter(t => t.platform === filters.platform);
    }

    if (filters.category !== 'All') {
      result = result.filter(t => t.category === filters.category);
    }

    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      result = result.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.summary.toLowerCase().includes(q) ||
        t.keyTopics.some(k => k.toLowerCase().includes(q))
      );
    }

    result.sort((a, b) => {
      if (filters.sortBy === 'momentum') {
        return b.score - a.score;
      }
      if (filters.sortBy === 'growth') {
        return parseInt(b.growthRate.replace(/\D/g, '') || '0') - parseInt(a.growthRate.replace(/\D/g, '') || '0');
      }
      if (filters.sortBy === 'sentiment') {
        return b.sentimentScore - a.sentimentScore;
      }
      if (filters.sortBy === 'mlProbability') {
        return (b.predictedViralProbability || 0) - (a.predictedViralProbability || 0);
      }
      return 0;
    });

    return result;
  }, [trends, filters]);

  // High-level analytics stats
  const stats = useMemo(() => {
    const avgScore = trends.length > 0 
      ? Math.round(trends.reduce((acc, t) => acc + t.score, 0) / trends.length) 
      : 0;
    const topTrend = [...trends].sort((a, b) => b.score - a.score)[0];
    return {
      total: trends.length,
      avgScore,
      topTrendTitle: topTrend ? topTrend.title : 'N/A',
      realTimeCount: trends.filter(t => t.isRealTime).length,
      highProbCount: trends.filter(t => (t.predictedViralProbability || 0) >= 0.85).length
    };
  }, [trends]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <Header
        apiStatus={apiStatus}
        onOpenAnalyze={() => setIsAnalyzeOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        trendCount={trends.length}
        user={user}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
      />

      {/* Hero / Quick Intelligence Banner */}
      <div className="border-b border-slate-900 bg-gradient-to-b from-slate-900/50 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1 font-medium">
                <Flame className="w-4 h-4 text-indigo-400" />
                <span>Monitored Signals</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-white font-heading">
                {stats.total} Active
              </div>
              <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                <Database className="w-3 h-3" /> PostgreSQL Synced
              </span>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1 font-medium">
                <Zap className="w-4 h-4 text-violet-400" />
                <span>ML High Probability</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-violet-300 font-heading">
                {stats.highProbCount} Topics
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                &gt;85% viral probability model
              </span>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-sm col-span-2 lg:col-span-2">
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                  <TrendingUp className="w-4 h-4 text-pink-400" />
                  <span>#1 Trending Peak Trajectory</span>
                </div>
                <button
                  onClick={fetchTrends}
                  className="p-1 rounded text-slate-500 hover:text-slate-300 transition"
                  title="Refresh signals"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
              <div className="text-sm sm:text-base font-semibold text-slate-100 truncate font-heading">
                {stats.topTrendTitle}
              </div>
              <span className="text-[11px] text-indigo-400 font-medium">
                Multi-model benchmark & ML decay forecast active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Controls: Search, Platforms, Categories */}
        <TrendFilters
          filters={filters}
          onFilterChange={handleFilterChange}
        />

        {/* Trends Grid */}
        {processedTrends.length === 0 ? (
          <div className="py-16 text-center bg-slate-900/40 rounded-3xl border border-slate-800/80 p-8">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 mx-auto flex items-center justify-center text-slate-400 mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">No matching trends found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
              Try adjusting your search keywords, platform filters, or use "Analyze Any Topic" to generate a fresh forecast.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setFilters({ platform: 'all', category: 'All', search: '', sortBy: 'momentum', timeframe: '7d' })}
                className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-800 text-slate-300 hover:text-white transition"
              >
                Reset Filters
              </button>
              <button
                onClick={() => setIsAnalyzeOpen(true)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition"
              >
                Analyze Any Topic
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {processedTrends.map(trend => (
              <TrendCard
                key={trend.id}
                trend={trend}
                onGenerateIdeas={(t) => setIdeaModalTrend(t)}
                onViewDemographics={(t) => setDemographicsTrend(t)}
                onViewMLForecast={(t) => setForecastTrend(t)}
                onRunSentimentBenchmark={(t) => handleRunSentimentBenchmark(t)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 mt-12 text-center text-xs text-slate-500">
        <p>Social Trend AI • Cloud SQL PostgreSQL • Multi-Model NLP Sentiment Benchmark • ML Momentum Forecasting</p>
      </footer>

      {/* Modals */}
      <ViralIdeaModal
        trend={ideaModalTrend}
        onClose={() => setIdeaModalTrend(null)}
      />

      <DemographicsModal
        trend={demographicsTrend}
        onClose={() => setDemographicsTrend(null)}
      />

      <MLForecastModal
        trend={forecastTrend}
        isOpen={Boolean(forecastTrend)}
        onClose={() => setForecastTrend(null)}
      />

      <SentimentBenchmarkModal
        benchmark={benchmarkResult}
        isOpen={isBenchmarkOpen}
        isLoading={isBenchmarkLoading}
        onClose={() => setIsBenchmarkOpen(false)}
      />

      <AnalyzeTopicModal
        isOpen={isAnalyzeOpen}
        onClose={() => setIsAnalyzeOpen(false)}
        onTrendCreated={handleTrendCreated}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiStatus={apiStatus}
      />
    </div>
  );
}
