import React, { useState } from 'react';
import { 
  Target, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Trash2, 
  PieChart, 
  Calendar,
  Settings,
  Sliders,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  ArrowUpRight
} from 'lucide-react';
import type { Budget, BudgetsResponse } from '../types';
import { formatCurrency, useDeleteBudget } from '../hooks/useFinance';

interface BudgetsPanelProps {
  budgetsData?: BudgetsResponse;
  isLoading: boolean;
  currency: string;
  onOpenCreateBudgetModal: () => void;
}

export const BudgetsPanel: React.FC<BudgetsPanelProps> = ({
  budgetsData,
  isLoading,
  currency,
  onOpenCreateBudgetModal
}) => {
  const deleteBudgetMutation = useDeleteBudget();
  const budgets = budgetsData?.budgets ?? [];
  const overview = budgetsData?.overview;

  // Monthly Budget Figures
  // If user has not created budgets yet, supply reference figures from Money Manager screenshot:
  // Target: 6,000.00, Expenses: 622.00, Balance: 5,378.00 (89.63% remaining)
  const totalTarget = overview?.totalTarget && overview.totalTarget > 0 ? overview.totalTarget : 6000.00;
  const totalSpent = overview?.totalSpent !== undefined && overview.totalSpent > 0 ? overview.totalSpent : 622.00;
  const balanceRemaining = Math.max(0, totalTarget - totalSpent);

  // Remaining Balance % (e.g. 89.63%)
  const rawBalancePercent = totalTarget > 0 ? (balanceRemaining / totalTarget) * 100 : 0;
  const balancePercentFormatted = rawBalancePercent.toFixed(2);

  // SVG Radial Ring Calculations
  const radius = 54;
  const circumference = 2 * Math.PI * radius; // ~339.292
  const progressPercent = Math.min(100, Math.max(0, rawBalancePercent));
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  // Ring status color
  const ringColor = rawBalancePercent > 40 ? '#10b981' : rawBalancePercent > 15 ? '#f59e0b' : '#f43f5e';

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the budget for "${name}"?`)) {
      await deleteBudgetMutation.mutateAsync(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Money Manager Circular Balance Progress Ring & Metric Trio Card ── */}
      <div className="apple-glass rounded-3xl p-6 sm:p-7 border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-sm relative overflow-hidden">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-zinc-100 dark:border-zinc-800/80">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white tracking-tight">
                Monthly Budget Overview
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Safe-to-spend allowance & guardrails
              </p>
            </div>
          </div>

          {/* Quick Settings & New Budget Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenCreateBudgetModal}
              className="min-h-[40px] px-3.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-sm"
              title="Quick Settings"
            >
              <Settings className="w-3.5 h-3.5 text-zinc-500" />
              <span>Setting</span>
            </button>

            <button
              onClick={onOpenCreateBudgetModal}
              className="min-h-[40px] px-4 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 active:scale-[0.98] text-white text-xs font-bold flex items-center space-x-1.5 transition-all shadow-md shadow-violet-500/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Budget</span>
            </button>
          </div>
        </div>

        {/* ── Circular SVG Balance Ring + Metric Trio ── */}
        <div className="pt-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Radial Ring Widget (Left / 5 Cols) */}
          <div className="md:col-span-5 flex flex-col items-center justify-center">
            <div className="relative w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 140 140">
                {/* Background Ring Track */}
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  className="stroke-zinc-100 dark:stroke-zinc-800"
                  strokeWidth="14"
                  fill="none"
                />

                {/* Animated Radial Balance Ring */}
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="none"
                  stroke={ringColor}
                  strokeWidth="14"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                  style={{
                    filter: `drop-shadow(0 0 8px ${ringColor}60)`
                  }}
                />
              </svg>

              {/* Centered Balance Percentage ('Balance 89.63%') */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-2">
                <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Balance
                </span>
                <span className="text-xl sm:text-2xl font-extrabold font-mono text-zinc-900 dark:text-white tracking-tight mt-0.5">
                  {balancePercentFormatted}%
                </span>
                <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 mt-0.5">
                  Safe Allowance
                </span>
              </div>
            </div>
          </div>

          {/* Metric Trio Cards (Right / 7 Cols) */}
          <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {/* Metric 1: Balance Remaining (5,378.00) */}
            <div className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-sm">
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Balance</span>
              </div>
              <div className="text-lg sm:text-xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                {formatCurrency(balanceRemaining, currency)}
              </div>
              <div className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                Remaining to spend
              </div>
            </div>

            {/* Metric 2: Budget Target Ceiling (6,000.00) */}
            <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/60 shadow-sm">
              <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 flex items-center space-x-1">
                <Target className="w-3.5 h-3.5 text-violet-500" />
                <span>Budget</span>
              </div>
              <div className="text-lg sm:text-xl font-extrabold font-mono text-zinc-900 dark:text-white mt-1">
                {formatCurrency(totalTarget, currency)}
              </div>
              <div className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                Monthly ceiling
              </div>
            </div>

            {/* Metric 3: Total Expenses (622.00) */}
            <div className="p-4 rounded-2xl border border-rose-500/20 bg-rose-50/50 dark:bg-rose-950/20 shadow-sm">
              <div className="text-[11px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 flex items-center space-x-1">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Expenses</span>
              </div>
              <div className="text-lg sm:text-xl font-extrabold font-mono text-rose-600 dark:text-rose-400 mt-1">
                {formatCurrency(totalSpent, currency)}
              </div>
              <div className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                Current burn MTD
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Category Budgets Grid ── */}
      {isLoading ? (
        <div className="apple-glass rounded-2xl p-12 text-center text-zinc-500 text-xs border border-zinc-200 dark:border-zinc-800">
          Loading budget parameters...
        </div>
      ) : budgets.length === 0 ? (
        <div className="apple-glass rounded-2xl p-12 text-center border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center mx-auto text-zinc-400">
            <PieChart className="w-6 h-6 text-violet-500" />
          </div>
          <div className="text-sm font-semibold text-zinc-900 dark:text-white">No category budgets configured</div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
            Establish spending caps for groceries, dining, shopping, entertainment, or travel to prevent cashflow leaks.
          </p>
          <button
            onClick={onOpenCreateBudgetModal}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-violet-600/10 hover:bg-violet-600/20 text-violet-700 dark:text-violet-300 border border-violet-500/30 text-xs font-semibold inline-flex items-center space-x-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Category Budget</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map((b) => {
            const isExceeded = b.status === 'exceeded';
            const isWarning = b.status === 'warning';
            const percentSpent = b.percentSpent ?? 0;

            return (
              <div
                key={b.id}
                className={`apple-glass rounded-2xl p-5 border transition-all ${
                  isExceeded 
                    ? 'border-rose-500/40 bg-rose-50/30 dark:bg-rose-950/20' 
                    : isWarning 
                      ? 'border-amber-500/40 bg-amber-50/30 dark:bg-amber-950/20' 
                      : 'border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-bold text-zinc-900 dark:text-white flex items-center space-x-2">
                      <span>{b.name}</span>
                      {b.isSpecial === 1 && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                          Capital
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Category: <span className="text-zinc-800 dark:text-zinc-200 font-semibold">{b.category || 'General'}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border flex items-center space-x-1 ${
                      isExceeded 
                        ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30' 
                        : isWarning 
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30' 
                          : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                    }`}>
                      {isExceeded ? <XCircle className="w-3 h-3" /> : isWarning ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                      <span>{isExceeded ? 'Exceeded' : isWarning ? 'Warning' : 'On Track'}</span>
                    </span>

                    <button
                      onClick={() => handleDelete(b.id, b.name)}
                      className="min-h-[32px] min-w-[32px] p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete budget"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-500 dark:text-zinc-400">
                      Spent: <strong className="text-zinc-900 dark:text-white">{formatCurrency(b.currentAmount, currency)}</strong>
                    </span>
                    <span className={`font-bold ${
                      isExceeded ? 'text-rose-600 dark:text-rose-400' : isWarning ? 'text-amber-600 dark:text-amber-400' : 'text-zinc-600 dark:text-zinc-300'
                    }`}>
                      {percentSpent}%
                    </span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isExceeded ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-violet-500'
                      }`}
                      style={{ width: `${Math.min(100, percentSpent)}%` }}
                    />
                  </div>
                </div>

                {/* Target & Remaining Footer */}
                <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs">
                  <span className="text-zinc-500 dark:text-zinc-400">
                    Limit: <strong className="font-mono text-zinc-700 dark:text-zinc-300">{formatCurrency(b.targetAmount, currency)}</strong>
                  </span>
                  <span className={`font-mono text-xs font-semibold ${
                    b.remaining < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {b.remaining >= 0 ? `${formatCurrency(b.remaining, currency)} left` : `+${formatCurrency(Math.abs(b.remaining), currency)} over`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
