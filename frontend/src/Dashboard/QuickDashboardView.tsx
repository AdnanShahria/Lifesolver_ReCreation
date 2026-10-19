import React from 'react';
import { useAuth } from '../_core/AuthContext';
import { 
  Compass, 
  LogOut, 
  Sparkles, 
  Calendar, 
  Wallet, 
  Brain, 
  Activity, 
  Clock, 
  ShieldCheck, 
  Users, 
  Terminal,
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';

interface QuickDashboardViewProps {
  onBackToLanding: () => void;
}

export const QuickDashboardView: React.FC<QuickDashboardViewProps> = ({ onBackToLanding }) => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Navigation Bar */}
        <div className="apple-glass rounded-2xl px-6 py-4 flex flex-wrap items-center justify-between gap-4 border border-violet-500/20 shadow-xl">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBackToLanding}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors flex items-center space-x-1.5 text-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Landing Page</span>
            </button>
            <div className="h-5 w-px bg-zinc-800" />
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center font-bold text-xs text-white">
                LS
              </div>
              <div>
                <div className="text-xs font-bold text-white leading-none">LifeSolver Command Cockpit</div>
                <div className="text-[10px] text-emerald-400 font-mono mt-0.5">Session: {user?.email}</div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-2 text-xs font-mono text-zinc-400 bg-zinc-900/80 px-3 py-1.5 rounded-xl border border-zinc-800">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Cloudflare D1 Edge Synchronized</span>
            </div>
            <button
              onClick={logout}
              className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/25 text-xs font-medium flex items-center space-x-1.5 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>End Session</span>
            </button>
          </div>
        </div>

        {/* Welcome Banner */}
        <div className="rounded-2xl apple-glass border border-violet-500/30 p-6 sm:p-8 bg-gradient-to-r from-violet-950/30 via-zinc-900/60 to-zinc-950 relative overflow-hidden">
          <div className="max-w-2xl space-y-3 relative z-10">
            <div className="inline-flex items-center space-x-2 text-xs font-mono text-violet-400 bg-violet-500/10 px-2.5 py-1 rounded-md border border-violet-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Commander Access Confirmed</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              Welcome back, {user?.name || 'Commander'}.
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              All 8 verticals are synchronized with zero entropy. Your daily equilibrium is currently at <strong className="text-emerald-400 font-mono">94.8%</strong>.
            </p>
          </div>
        </div>

        {/* 8 Verticals Status Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="apple-glass-card p-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="font-semibold text-white flex items-center space-x-1.5">
                <Calendar className="w-4 h-4 text-violet-400" />
                <span>Planner</span>
              </span>
              <span className="text-emerald-400 font-mono">On Track</span>
            </div>
            <div className="text-xl font-bold text-white">3 Blocks Active</div>
            <div className="text-[11px] text-zinc-500">Next: Deep Focus Session 14:00</div>
          </div>

          <div className="apple-glass-card p-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="font-semibold text-white flex items-center space-x-1.5">
                <Brain className="w-4 h-4 text-indigo-400" />
                <span>Mind</span>
              </span>
              <span className="text-violet-400 font-mono">92% Retained</span>
            </div>
            <div className="text-xl font-bold text-white">14 Flashcards Due</div>
            <div className="text-[11px] text-zinc-500">SM-2 Spaced Interval Ready</div>
          </div>

          <div className="apple-glass-card p-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="font-semibold text-white flex items-center space-x-1.5">
                <Wallet className="w-4 h-4 text-emerald-400" />
                <span>Finance</span>
              </span>
              <span className="text-emerald-400 font-mono">+14.2 mo</span>
            </div>
            <div className="text-xl font-bold text-white">$28,450.00</div>
            <div className="text-[11px] text-zinc-500">Burn Rate: -$2,300/mo</div>
          </div>

          <div className="apple-glass-card p-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="font-semibold text-white flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Focus</span>
              </span>
              <span className="text-amber-400 font-mono">Dopamine Shield</span>
            </div>
            <div className="text-xl font-bold text-white">3h 45m Logged</div>
            <div className="text-[11px] text-zinc-500">Chrome Extension Active</div>
          </div>
        </div>

        {/* Action Tray */}
        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Vault Decrypted with Local Key · Offline-First Sync Listening</span>
          </div>
          <button
            onClick={onBackToLanding}
            className="text-violet-400 hover:text-violet-300 font-medium"
          >
            Review Landing Page & Missions &rarr;
          </button>
        </div>

      </div>
    </div>
  );
};
