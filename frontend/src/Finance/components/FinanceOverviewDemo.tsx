import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Target,
  PiggyBank,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Plus,
  PieChart as PieIcon,
  Search,
  Sparkles,
  ExternalLink,
  ShoppingBag,
  Utensils,
  Home,
  Zap,
  Car,
  Tv,
  HelpCircle,
  Briefcase
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from 'recharts';
import type {
  LedgerSummary,
  Transaction,
  BudgetsResponse,
  SavingsResponse,
  FinanceAnalyticsResponse
} from '../types';
import { formatCurrency } from '../hooks/useFinance';
import { getCategoryStyle } from './LedgerTable';

interface FinanceOverviewDemoProps {
  summary?: LedgerSummary;
  transactions: Transaction[];
  budgetsData?: BudgetsResponse;
  savingsData?: SavingsResponse;
  analyticsData?: FinanceAnalyticsResponse;
  currency: string;
  theme: 'dark' | 'light';
  onOpenTransactionModal: (type: 'income' | 'expense', isSpecial?: number) => void;
  onSwitchTab: (tab: 'ledger' | 'budgets' | 'savings' | 'bills' | 'loans' | 'analytics') => void;
}

// Icon helper by category
function getCategoryIcon(category: string) {
  const cat = (category || '').toLowerCase();
  if (cat.includes('food') || cat.includes('dining') || cat.includes('restaurant')) return Utensils;
  if (cat.includes('shop') || cat.includes('store') || cat.includes('cloth')) return ShoppingBag;
  if (cat.includes('house') || cat.includes('rent') || cat.includes('home')) return Home;
  if (cat.includes('util') || cat.includes('electric') || cat.includes('water')) return Zap;
  if (cat.includes('trans') || cat.includes('car') || cat.includes('fuel')) return Car;
  if (cat.includes('entertain') || cat.includes('sub') || cat.includes('movie')) return Tv;
  if (cat.includes('salary') || cat.includes('work') || cat.includes('freelance') || cat.includes('client')) return Briefcase;
  return HelpCircle;
}

// Color palette for category donut chart
const CATEGORY_COLORS = [
  '#06b6d4', // Cyan
  '#8b5cf6', // Violet
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#ec4899', // Pink
  '#3b82f6', // Blue
  '#f43f5e', // Rose
  '#64748b'  // Slate
];

export const FinanceOverviewDemo: React.FC<FinanceOverviewDemoProps> = ({
  summary,
  transactions,
  budgetsData,
  savingsData,
  analyticsData,
  currency,
  theme,
  onOpenTransactionModal,
  onSwitchTab
}) => {
  const isDark = theme === 'dark';

  // Date Navigation State (defaults to current date, formatted like "Feb 21, 2026")
  const [currentDate, setCurrentDate] = useState(() => new Date());

  const handlePrevDay = () => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 1);
      return d;
    });
  };

  const handleNextDay = () => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 1);
      return d;
    });
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const formattedDate = currentDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const isTodaySelected = currentDate.toDateString() === new Date().toDateString();

  // Real Ledger Metrics from Cloudflare D1 Backend
  const totalBalance = summary?.totalBalance ?? 0;
  const monthlyIncome = summary?.monthlyIncome ?? 0;
  const monthlyExpense = summary?.monthlyExpense ?? 0;

  // Monthly Budget Metrics
  const totalBudgetLimit = budgetsData?.overview?.totalTarget ?? 0;
  const totalBudgetSpent = budgetsData?.overview?.totalSpent ?? 0;
  const budgetDifference = totalBudgetLimit - totalBudgetSpent;
  const budgetOverPercentage = totalBudgetLimit > 0 ? Math.round((totalBudgetSpent / totalBudgetLimit) * 100) : 0;

  // Savings Metrics
  const totalSavings = savingsData?.summary?.totalSaved ?? 0;
  const activeSavingsCount = savingsData?.summary?.activePotsCount ?? 0;

  // Goals items
  const potsList = savingsData?.savings ?? [];
  const goals = [
    ...(totalBudgetLimit > 0 ? [{
      id: 'current-budget',
      name: 'Monthly Budget Target',
      current: totalBudgetSpent,
      target: totalBudgetLimit,
      isOver: totalBudgetSpent > totalBudgetLimit,
      percent: Math.min(100, budgetOverPercentage),
      color: totalBudgetSpent > totalBudgetLimit ? 'bg-rose-500' : 'bg-violet-500'
    }] : []),
    ...potsList.slice(0, 3).map((p) => ({
      id: p.id,
      name: p.name,
      current: p.currentAmount,
      target: p.targetAmount,
      isOver: false,
      percent: p.targetAmount > 0 ? Math.min(100, Math.round((p.currentAmount / p.targetAmount) * 100)) : 0,
      color: 'bg-emerald-500'
    }))
  ];

  // Category Breakdown for Donut Chart
  const serverCategories = analyticsData?.categoryBreakdown ?? [];
  const chartData = serverCategories.map((c, i) => ({
    name: c.category,
    value: c.currentAmount,
    color: CATEGORY_COLORS[i % CATEGORY_COLORS.length]
  }));

  const totalCategorySpend = chartData.reduce((acc, curr) => acc + curr.value, 0);

  // Today's / Recent transactions list (Real database transactions)
  const recentTransactions: Transaction[] = transactions.slice(0, 8);

  // Copilot insight state
  const [showCopilotInsight, setShowCopilotInsight] = useState(false);

  return (
    <div className="space-y-6">
      {/* ── Subheader Controls matching Previous Design ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left: Date Navigator (< Feb 21, 2026 > Today) */}
        <div className="flex items-center space-x-2">
          <div
            className={`flex items-center rounded-2xl p-1 border shadow-sm ${
              isDark
                ? 'bg-[#10131d] border-zinc-800 text-zinc-300'
                : 'bg-white border-zinc-200 text-zinc-700'
            }`}
          >
            <button
              onClick={handlePrevDay}
              className={`min-h-[36px] min-w-[36px] p-2 rounded-xl flex items-center justify-center transition-colors ${
                isDark ? 'hover:bg-zinc-800 text-zinc-400 hover:text-white' : 'hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900'
              }`}
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 text-xs font-mono font-bold tracking-tight select-none">
              {formattedDate}
            </span>

            <button
              onClick={handleNextDay}
              className={`min-h-[36px] min-w-[36px] p-2 rounded-xl flex items-center justify-center transition-colors ${
                isDark ? 'hover:bg-zinc-800 text-zinc-400 hover:text-white' : 'hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900'
              }`}
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleToday}
            className={`min-h-[44px] px-3.5 py-2 rounded-2xl text-xs font-medium border transition-all ${
              isTodaySelected
                ? isDark
                  ? 'bg-zinc-800 text-cyan-300 border-zinc-700 font-bold'
                  : 'bg-zinc-100 text-cyan-700 border-zinc-300 font-bold'
                : isDark
                  ? 'bg-[#10131d] border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-850'
                  : 'bg-white border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
            }`}
          >
            Today
          </button>
        </div>

        {/* Right: Filter & + Entry Cyan Button */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onSwitchTab('analytics')}
            title="Filter and Deep Analytics"
            className={`min-h-[44px] min-w-[44px] p-2.5 rounded-2xl border transition-colors flex items-center justify-center ${
              isDark
                ? 'bg-[#10131d] border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'
                : 'bg-white border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          {/* Cyan + Entry Button */}
          <button
            onClick={() => onOpenTransactionModal('expense', 0)}
            className="min-h-[44px] px-5 py-2.5 rounded-2xl bg-cyan-400 hover:bg-cyan-300 active:scale-[0.98] text-zinc-950 font-bold text-xs sm:text-sm flex items-center space-x-2 transition-all shadow-lg shadow-cyan-400/20"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Entry</span>
          </button>
        </div>
      </div>

      {/* ── Tier 1: Top 3 Stat Cards (Income, Expenses, Balance) ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Income Card */}
        <div
          className={`rounded-3xl p-5 border transition-all ${
            isDark
              ? 'bg-[#10131d] border-zinc-800/90 text-white shadow-xl shadow-black/20'
              : 'bg-white border-zinc-200 text-zinc-900 shadow-md shadow-zinc-200/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <ArrowUpRight className="w-5 h-5 text-emerald-400" />
              </div>
              <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Income
              </span>
            </div>
            <span className="text-[11px] font-mono font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              +12.5%
            </span>
          </div>

          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-emerald-400">
              {formatCurrency(monthlyIncome, currency)}
            </div>
            <p className={`text-[11px] mt-1 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
              Inflow logged for current cycle
            </p>
          </div>
        </div>

        {/* 2. Expenses Card */}
        <div
          className={`rounded-3xl p-5 border transition-all ${
            isDark
              ? 'bg-[#10131d] border-zinc-800/90 text-white shadow-xl shadow-black/20'
              : 'bg-white border-zinc-200 text-zinc-900 shadow-md shadow-zinc-200/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <ArrowDownLeft className="w-5 h-5 text-rose-400" />
              </div>
              <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Expenses
              </span>
            </div>
            <span className="text-[11px] font-mono font-medium text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
              -4.2%
            </span>
          </div>

          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-rose-400">
              {formatCurrency(monthlyExpense, currency)}
            </div>
            <p className={`text-[11px] mt-1 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
              Operational burn rate this month
            </p>
          </div>
        </div>

        {/* 3. Balance Card */}
        <div
          className={`rounded-3xl p-5 border transition-all ${
            isDark
              ? 'bg-[#10131d] border-zinc-800/90 text-white shadow-xl shadow-black/20'
              : 'bg-white border-zinc-200 text-zinc-900 shadow-md shadow-zinc-200/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Wallet className="w-5 h-5 text-cyan-400" />
              </div>
              <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Balance
              </span>
            </div>
            <span
              className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded-full border ${
                totalBalance >= 0
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              }`}
            >
              {totalBalance >= 0 ? 'Surplus' : 'Deficit'}
            </span>
          </div>

          <div className="mt-4">
            <div
              className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight ${
                totalBalance >= 0 ? 'text-cyan-400' : 'text-rose-400'
              }`}
            >
              {formatCurrency(totalBalance, currency)}
            </div>
            <p className={`text-[11px] mt-1 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
              Net available liquidity
            </p>
          </div>
        </div>
      </div>

      {/* ── Tier 2: Middle Row (Monthly Budget, Savings, Goals) ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Monthly Budget Card */}
        <div
          className={`rounded-3xl p-5 border transition-all ${
            isDark
              ? 'bg-[#10131d] border-zinc-800/90 text-white'
              : 'bg-white border-zinc-200 text-zinc-900'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Target className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <span className={`text-xs font-semibold uppercase tracking-wider block ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  Monthly Budget
                </span>
                <span className="text-[10px] text-amber-400 font-mono">February</span>
              </div>
            </div>

            <button
              onClick={() => onSwitchTab('budgets')}
              className={`text-[11px] p-1.5 rounded-xl transition-colors ${
                isDark ? 'text-zinc-400 hover:text-white hover:bg-zinc-800' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
              title="Open Budgets View"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-4">
            <div className={`text-2xl font-extrabold font-mono tracking-tight ${budgetDifference < 0 ? 'text-rose-400' : 'text-amber-400'}`}>
              {formatCurrency(budgetDifference, currency)}
            </div>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-[11px] font-mono text-zinc-400">
                <span>Spent: {formatCurrency(totalBudgetSpent, currency)}</span>
                <span>Limit: {formatCurrency(totalBudgetLimit, currency)}</span>
              </div>
              <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`}>
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    totalBudgetSpent > totalBudgetLimit ? 'bg-rose-500' : 'bg-amber-400'
                  }`}
                  style={{ width: `${Math.min(100, budgetOverPercentage)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2. Savings Card */}
        <div
          className={`rounded-3xl p-5 border transition-all ${
            isDark
              ? 'bg-[#10131d] border-zinc-800/90 text-white'
              : 'bg-white border-zinc-200 text-zinc-900'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-2xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-400">
                <PiggyBank className="w-5 h-5 text-violet-400" />
              </div>
              <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Savings
              </span>
            </div>

            <button
              onClick={() => onSwitchTab('savings')}
              className={`text-[11px] p-1.5 rounded-xl transition-colors ${
                isDark ? 'text-zinc-400 hover:text-white hover:bg-zinc-800' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
              title="Open Savings Pots"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-4">
            <div className="text-2xl font-extrabold font-mono tracking-tight text-violet-400">
              {formatCurrency(totalSavings, currency)}
            </div>
            <p className={`text-[11px] mt-1 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
              Across {activeSavingsCount} active reserve vaults
            </p>
          </div>
        </div>

        {/* 3. Goals Card with Progress Tracks */}
        <div
          className={`rounded-3xl p-5 border transition-all ${
            isDark
              ? 'bg-[#10131d] border-zinc-800/90 text-white'
              : 'bg-white border-zinc-200 text-zinc-900'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                Goals
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded-full">
              {goals.length} ACTIVE
            </span>
          </div>

          {/* Goal Progress Bars */}
          <div className="mt-3.5 space-y-3">
            {goals.length === 0 ? (
              <div className={`py-4 text-center text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                No active savings pots or budget targets
              </div>
            ) : (
              goals.map((g) => (
                <div key={g.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-medium ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                      {g.name}
                    </span>
                    <span className="font-mono text-[11px] text-zinc-400">
                      {formatCurrency(g.current, currency)} / {formatCurrency(g.target, currency)}
                    </span>
                  </div>
                  <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`}>
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${g.color}`}
                      style={{ width: `${g.percent}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Tier 3: Bottom Row (Transactions by Category + Transactions for Today) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Transactions by Category (Donut Chart) */}
        <div
          className={`lg:col-span-6 rounded-3xl p-6 border transition-all ${
            isDark
              ? 'bg-[#10131d] border-zinc-800/90 text-white'
              : 'bg-white border-zinc-200 text-zinc-900'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold tracking-tight flex items-center space-x-2">
              <PieIcon className="w-4 h-4 text-cyan-400" />
              <span>Transactions by Category</span>
            </h3>

            <span className={`text-xs font-mono ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Total: {formatCurrency(totalCategorySpend, currency)}
            </span>
          </div>

          {/* Donut Chart Visualizer */}
          {chartData.length === 0 ? (
            <div className={`py-12 text-center text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
              <PieIcon className="w-8 h-8 text-zinc-600 mx-auto mb-2 opacity-50" />
              <span>No expense transactions categorized yet</span>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="h-56 w-56 relative shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? '#18181b' : '#ffffff',
                        borderColor: isDark ? '#3f3f46' : '#e4e4e7',
                        borderRadius: '12px',
                        fontSize: '12px',
                        color: isDark ? '#f4f4f5' : '#09090b'
                      }}
                      formatter={(val: any) => [formatCurrency(Number(val || 0), currency)]}
                    />
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={62}
                      outerRadius={88}
                      paddingAngle={3}
                      stroke="none"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                {/* Center Donut Label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Total Out</span>
                  <span className="text-xs font-mono font-bold text-zinc-200">
                    {formatCurrency(totalCategorySpend, currency)}
                  </span>
                </div>
              </div>

              {/* Category Swatches / Legend */}
              <div className="flex-1 w-full space-y-2">
                {chartData.slice(0, 5).map((item) => {
                  const percent = totalCategorySpend > 0 ? Math.round((item.value / totalCategorySpend) * 100) : 0;
                  return (
                    <div key={item.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2 min-w-0">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className={`truncate ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                          {item.name}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0 font-mono">
                        <span className={isDark ? 'text-zinc-400' : 'text-zinc-500'}>{percent}%</span>
                        <span className="font-semibold">{formatCurrency(item.value, currency)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right: Transactions for Today */}
        <div
          className={`lg:col-span-6 rounded-3xl p-6 border transition-all ${
            isDark
              ? 'bg-[#10131d] border-zinc-800/90 text-white'
              : 'bg-white border-zinc-200 text-zinc-900'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold tracking-tight">
              Transactions for Today
            </h3>

            <button
              onClick={() => onSwitchTab('ledger')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center space-x-1"
            >
              <span>View full ledger</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          {/* Transactions List */}
          <div className="space-y-2.5">
            {recentTransactions.length === 0 ? (
              <div className={`py-10 text-center space-y-2 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                <Wallet className="w-8 h-8 text-zinc-600 mx-auto" />
                <p className="text-xs">No transactions recorded yet</p>
                <button
                  type="button"
                  onClick={() => onOpenTransactionModal('expense')}
                  className="text-cyan-400 hover:text-cyan-300 text-xs font-semibold cursor-pointer"
                >
                  + Add First Transaction
                </button>
              </div>
            ) : (
              recentTransactions.map((tx) => {
                const categoryStyle = getCategoryStyle(tx.category);
                const Icon = categoryStyle.icon;
                const isIncome = tx.type === 'income';

                return (
                  <div
                    key={tx.id}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                      isDark
                        ? 'bg-zinc-900/50 border-zinc-800/60 hover:bg-zinc-900 hover:border-zinc-700'
                        : 'bg-zinc-50 border-zinc-200/80 hover:bg-zinc-100 hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${categoryStyle.lightBg} ${categoryStyle.darkBg}`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>

                      <div className="min-w-0">
                        <div className={`text-xs font-semibold truncate ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>
                          {tx.payee || tx.description || tx.category}
                        </div>
                        <div className="text-[10px] text-zinc-500 flex items-center space-x-1.5 font-mono">
                          <span>{tx.accountName || 'Cash'}</span>
                          <span>•</span>
                          <span>{tx.category}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div
                        className={`text-xs font-mono font-bold ${
                          isIncome ? 'text-emerald-400' : isDark ? 'text-zinc-200' : 'text-zinc-900'
                        }`}
                      >
                        {isIncome ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                      </div>
                      <div className="text-[10px] text-zinc-500 font-mono">
                        {new Date(tx.date || tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ── Floating Action Buttons (Search + Orbit Copilot) ── */}
      <div className="fixed bottom-6 right-6 flex items-center space-x-3 z-40">
        {/* Quick Search Circular Button */}
        <button
          onClick={() => onSwitchTab('ledger')}
          className={`w-12 h-12 rounded-full border shadow-xl flex items-center justify-center transition-all active:scale-95 ${
            isDark
              ? 'bg-[#10131d]/90 backdrop-blur-md border-zinc-700 text-zinc-300 hover:text-white hover:border-cyan-500'
              : 'bg-white/90 backdrop-blur-md border-zinc-300 text-zinc-700 hover:text-zinc-950 hover:border-cyan-600'
          }`}
          title="Search Transactions"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Orbit AI Copilot Button */}
        <button
          onClick={() => setShowCopilotInsight(!showCopilotInsight)}
          className="w-12 h-12 rounded-full bg-cyan-400 hover:bg-cyan-300 active:scale-95 text-zinc-950 shadow-xl shadow-cyan-400/30 flex items-center justify-center transition-all ring-2 ring-cyan-300/40 relative group"
          title="Orbit Financial Copilot"
        >
          <Sparkles className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full ring-2 ring-zinc-950" />
        </button>
      </div>

      {/* Orbit Copilot Quick Insight Drawer / Floating Flyout */}
      {showCopilotInsight && (
        <div
          className={`fixed bottom-20 right-6 w-80 sm:w-96 rounded-3xl p-5 border shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-4 duration-200 ${
            isDark
              ? 'bg-[#10131d] border-cyan-500/30 text-zinc-200'
              : 'bg-white border-cyan-500/40 text-zinc-800'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-cyan-400 font-mono">Orbit Copilot Intel</span>
            </div>
            <button
              onClick={() => setShowCopilotInsight(false)}
              className="text-zinc-500 hover:text-white text-xs font-mono"
            >
              ✕
            </button>
          </div>

          <div className="pt-3 space-y-2.5 text-xs">
            <p className={isDark ? 'text-zinc-300' : 'text-zinc-700'}>
              🚨 <strong>Budget Alert:</strong> Your February expenses ({formatCurrency(monthlyExpense, currency)}) currently exceed your monthly budget threshold ({formatCurrency(totalBudgetLimit, currency)}).
            </p>
            <p className="text-[11px] text-zinc-400">
              💡 <strong>Recommendation:</strong> Your Emergency Savings pot holds {formatCurrency(totalSavings, currency)}. Allocate ৳15,000 from non-essential spending to balance net cashflow before March.
            </p>
            <button
              onClick={() => {
                setShowCopilotInsight(false);
                onSwitchTab('budgets');
              }}
              className="w-full mt-2 py-2 px-3 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 font-medium text-xs text-center transition-colors"
            >
              Adjust Category Budgets →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
