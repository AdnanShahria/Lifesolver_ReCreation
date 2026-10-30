import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../_core/AuthContext';
import { useTheme } from '../_core/ThemeContext';
import { Sidebar } from '../_core/Sidebar';
import { ExecutiveFinanceWidget } from './ExecutiveFinanceWidget';
import { ExecutivePlannerWidget } from './ExecutivePlannerWidget';
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
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

interface QuickDashboardViewProps {
  onBackToLanding: () => void;
}

export const QuickDashboardView: React.FC<QuickDashboardViewProps> = ({ onBackToLanding }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const { theme, isDark, toggleTheme } = useTheme();

  return (
    <div className={`min-h-screen flex transition-colors duration-200 ${isDark ? 'bg-[#08080a] text-zinc-100' : 'bg-[#f4f7fb] text-zinc-900'}`}>
      {/* ── Global Unified Sidebar ── */}
      <Sidebar
        currentVertical="dashboard"
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* ── Main Dashboard Content Viewport ── */}
      <main className="flex-1 min-w-0 p-4 sm:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Navigation Bar */}
        <div className={`rounded-2xl px-6 py-4 flex flex-wrap items-center justify-between gap-4 border transition-all ${
          isDark
            ? 'apple-glass border-violet-500/20 shadow-xl'
            : 'bg-white/90 backdrop-blur-xl border-zinc-200 shadow-sm'
        }`}>
          <div className="flex items-center space-x-3">
            <button
              onClick={onBackToLanding}
              className={`p-2 rounded-xl transition-colors flex items-center space-x-1.5 text-xs ${
                isDark
                  ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white'
                  : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Landing Page</span>
            </button>
            <div className={`h-5 w-px ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`} />
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center font-bold text-xs text-white">
                LS
              </div>
              <div>
                <div className={`text-xs font-bold leading-none ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                  LifeSolver Command Cockpit
                </div>
                <div className="text-[10px] text-emerald-500 font-mono mt-0.5">Session: {user?.email}</div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className={`hidden sm:flex items-center space-x-2 text-xs font-mono px-3 py-1.5 rounded-xl border ${
              isDark
                ? 'text-zinc-400 bg-zinc-900/80 border-zinc-800'
                : 'text-zinc-600 bg-zinc-100/90 border-zinc-200'
            }`}>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Cloudflare D1 Edge Synchronized</span>
            </div>
            <button
              onClick={logout}
              className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/25 text-xs font-medium flex items-center space-x-1.5 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>End Session</span>
            </button>
          </div>
        </div>

        {/* Welcome Banner */}
        <div className={`rounded-2xl border p-6 sm:p-8 relative overflow-hidden transition-all ${
          isDark
            ? 'apple-glass border-violet-500/30 bg-gradient-to-r from-violet-950/30 via-zinc-900/60 to-zinc-950 text-white'
            : 'bg-gradient-to-r from-violet-50/90 via-white to-indigo-50/90 border-violet-200 shadow-sm text-zinc-900'
        }`}>
          <div className="max-w-2xl space-y-3 relative z-10">
            <div className="inline-flex items-center space-x-2 text-xs font-mono text-violet-500 bg-violet-500/10 px-2.5 py-1 rounded-md border border-violet-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Commander Access Confirmed</span>
            </div>
            <h1 className={`text-2xl sm:text-4xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              Welcome back, {user?.name || 'Commander'}.
            </h1>
            <p className={`text-xs sm:text-sm ${isDark ? 'text-zinc-300' : 'text-zinc-600'} leading-relaxed`}>
              All 8 verticals are synchronized with zero entropy. Your daily equilibrium is currently at <strong className="text-emerald-500 font-mono">94.8%</strong>.
            </p>
          </div>
        </div>

        {/* ── Executive Planner OS Widget ── */}
        <ExecutivePlannerWidget theme={theme} />

        {/* ── Executive Financial Capital Widget ── */}
        <ExecutiveFinanceWidget theme={theme} />

        {/* 8 Verticals Status Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div 
            onClick={() => navigate('/planner')}
            className={`p-4 space-y-2 cursor-pointer border rounded-2xl transition-all group ${
              isDark
                ? 'apple-glass-card border-violet-500/20 hover:border-violet-500/50 hover:bg-zinc-800/40'
                : 'bg-white border-zinc-200/90 hover:border-violet-400 hover:shadow-md shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className={`font-semibold flex items-center space-x-1.5 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                <Calendar className="w-4 h-4 text-violet-500" />
                <span>Planner</span>
              </span>
              <span className="text-violet-500 font-mono flex items-center space-x-0.5 group-hover:translate-x-0.5 transition-transform">
                <span>Open OS</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>TickTick Studio</div>
            <div className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Lists · Kanban · Eisenhower Matrix</div>
          </div>

          <div className={`p-4 space-y-2 rounded-2xl border transition-all ${
            isDark
              ? 'apple-glass-card border-violet-500/10'
              : 'bg-white border-zinc-200/90 shadow-xs'
          }`}>
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className={`font-semibold flex items-center space-x-1.5 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                <Brain className="w-4 h-4 text-indigo-500" />
                <span>Mind</span>
              </span>
              <span className="text-violet-500 font-mono">92% Retained</span>
            </div>
            <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>14 Flashcards Due</div>
            <div className={`text-[11px] ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>SM-2 Spaced Interval Ready</div>
          </div>

          {/* Interactive Finance Card */}
          <div 
            onClick={() => navigate('/finance')}
            className={`p-4 space-y-2 cursor-pointer border rounded-2xl transition-all group ${
              isDark
                ? 'apple-glass-card border-emerald-500/20 hover:border-emerald-500/50 hover:bg-zinc-800/40'
                : 'bg-white border-zinc-200/90 hover:border-emerald-400 hover:shadow-md shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className={`font-semibold flex items-center space-x-1.5 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                <Wallet className="w-4 h-4 text-emerald-500" />
                <span>Finance</span>
              </span>
              <span className="text-emerald-500 font-mono flex items-center space-x-0.5 group-hover:translate-x-0.5 transition-transform">
                <span>Manage</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>Full OS Available</div>
            <div className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Dual Ledgers · Budgets · Bills · Debt</div>
          </div>

          <div className={`p-4 space-y-2 rounded-2xl border transition-all ${
            isDark
              ? 'apple-glass-card border-amber-500/10'
              : 'bg-white border-zinc-200/90 shadow-xs'
          }`}>
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className={`font-semibold flex items-center space-x-1.5 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                <Clock className="w-4 h-4 text-amber-500" />
                <span>Focus</span>
              </span>
              <span className="text-amber-500 font-mono">Dopamine Shield</span>
            </div>
            <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>3h 45m Logged</div>
            <div className={`text-[11px] ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>Chrome Extension Active</div>
          </div>
        </div>

        {/* Action Tray */}
        <div className={`p-4 rounded-2xl border flex items-center justify-between text-xs transition-all ${
          isDark
            ? 'bg-zinc-900/60 border-zinc-800 text-zinc-400'
            : 'bg-white border-zinc-200 text-zinc-600 shadow-xs'
        }`}>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Vault Decrypted with Local Key · Offline-First Sync Listening</span>
          </div>
          <button
            onClick={onBackToLanding}
            className="text-violet-500 hover:text-violet-600 font-medium"
          >
            Review Landing Page & Missions &rarr;
          </button>
        </div>

        </div>
      </main>
    </div>
  );
};
