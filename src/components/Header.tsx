import React from 'react';
import { Flame, Sparkles, SlidersHorizontal, Radio, Database, Cpu, LogIn, User } from 'lucide-react';
import { ApiStatus, UserProfile } from '../types';

interface HeaderProps {
  apiStatus: ApiStatus | null;
  onOpenAnalyze: () => void;
  onOpenSettings: () => void;
  trendCount: number;
  user?: UserProfile | null;
  onSignIn?: () => void;
  onSignOut?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  apiStatus,
  onOpenAnalyze,
  onOpenSettings,
  trendCount,
  user,
  onSignIn,
  onSignOut,
}) => {
  return (
    <header id="main-header" className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-pink-500 p-0.5 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Flame className="h-5 w-5 text-indigo-400 fill-indigo-500/20" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white font-heading">
                Social Trend <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">AI</span>
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                <Radio className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
                Live Tracker
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" title="Connected to Cloud SQL PostgreSQL">
                <Database className="w-2.5 h-2.5" />
                PostgreSQL
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Cross-platform signals • ML Trajectory • 4-Model NLP Benchmark • {trendCount} active topics
            </p>
          </div>
        </div>

        {/* Right: Actions & Integrations */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            id="analyze-topic-btn"
            onClick={onOpenAnalyze}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/25 transition active:scale-[0.98]"
          >
            <Sparkles className="w-4 h-4 text-indigo-200" />
            <span>Analyze Topic</span>
          </button>

          <button
            id="settings-btn"
            onClick={onOpenSettings}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60 transition"
            title="API & Architecture Matrix"
          >
            <SlidersHorizontal className="w-4 h-4 text-slate-400" />
            <span className="hidden sm:inline">Stack & APIs</span>
            {apiStatus?.hasDatabase && (
              <span className="w-2 h-2 rounded-full bg-emerald-400" title="PostgreSQL Connected" />
            )}
          </button>

          {user ? (
            <div className="flex items-center gap-2 pl-1 border-l border-slate-800">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || 'User'} className="w-8 h-8 rounded-full border border-indigo-500/40" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-indigo-600/20 text-indigo-300 flex items-center justify-center font-bold text-xs">
                  <User className="w-4 h-4" />
                </div>
              )}
              <button
                onClick={onSignOut}
                className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded bg-slate-800/40 hover:bg-slate-800 transition"
                title="Sign Out"
              >
                Sign out
              </button>
            </div>
          ) : onSignIn ? (
            <button
              onClick={onSignIn}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-200 border border-indigo-500/30 transition"
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:inline">Google Sign-In</span>
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
};
