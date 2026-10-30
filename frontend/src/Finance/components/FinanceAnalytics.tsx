import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  PieChart as PieIcon, 
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  Percent,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Layers,
  ShoppingBag,
  Utensils,
  Coffee,
  Heart,
  Home,
  Tv,
  Zap,
  Plane,
  Briefcase,
  DollarSign,
  Tag
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import type { FinanceAnalyticsResponse, CategoryBreakdown } from '../types';
import { formatCurrency } from '../hooks/useFinance';
import { getCategoryStyle } from './LedgerTable';

interface FinanceAnalyticsProps {
  analyticsData?: FinanceAnalyticsResponse;
  isLoading: boolean;
  currency: string;
}

// Pastel slice colors matching reference
const SLICE_COLORS = [
  '#f43f5e', // Rose (Shopping)
  '#ec4899', // Pink (Beauty)
  '#f97316', // Orange (Food)
  '#06b6d4', // Cyan (Utilities)
  '#8b5cf6', // Violet (Entertainment)
  '#eab308', // Yellow (Pets)
  '#10b981', // Emerald (Investments)
  '#6366f1', // Indigo (Travel)
  '#14b8a6', // Teal (Freelance)
  '#64748b'  // Slate (Misc)
];

// Reference demo categories if user's month has 0 expenses yet
const DEMO_CATEGORIES: CategoryBreakdown[] = [
  { category: 'Shopping', currentAmount: 236.00, previousAmount: 180.00, changePercent: 31.1, percentageOfTotal: 37.94 },
  { category: 'Beauty', currentAmount: 136.00, previousAmount: 110.00, changePercent: 23.6, percentageOfTotal: 21.86 },
  { category: 'Food & Dining', currentAmount: 102.00, previousAmount: 140.00, changePercent: -27.1, percentageOfTotal: 16.40 },
  { category: 'Transport', currentAmount: 75.00, previousAmount: 60.00, changePercent: 25.0, percentageOfTotal: 12.06 },
  { category: 'Entertainment', currentAmount: 45.00, previousAmount: 50.00, changePercent: -10.0, percentageOfTotal: 7.23 },
  { category: 'Pets', currentAmount: 28.00, previousAmount: 25.00, changePercent: 12.0, percentageOfTotal: 4.51 }
];

export const FinanceAnalytics: React.FC<FinanceAnalyticsProps> = ({
  analyticsData,
  isLoading,
  currency
}) => {
  const mom = analyticsData?.monthOverMonth;
  const cashflow = analyticsData?.cashflowHistory ?? [];

  // Period View Filter ('month' | 'year' | 'all')
  const [periodMode, setPeriodMode] = useState<'month' | 'year' | 'all'>('month');

  // Carousel of Periods
  const periods = useMemo(() => {
    const list: string[] = [];
    const date = new Date();
    // Generate 6 months: past 4 months, current, next month
    for (let i = -4; i <= 1; i++) {
      const d = new Date(date.getFullYear(), date.getMonth() + i, 1);
      const label = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      list.push(label);
    }
    return list;
  }, []);

  const [selectedPeriod, setSelectedPeriod] = useState<string>(() => {
    return new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  });

  // Carousel scroll index
  const [carouselIndex, setCarouselIndex] = useState(0);

  const handlePrevPeriod = () => {
    const currentIndex = periods.indexOf(selectedPeriod);
    if (currentIndex > 0) {
      setSelectedPeriod(periods[currentIndex - 1]);
    }
  };

  const handleNextPeriod = () => {
    const currentIndex = periods.indexOf(selectedPeriod);
    if (currentIndex < periods.length - 1) {
      setSelectedPeriod(periods[currentIndex + 1]);
    }
  };

  // Categories for Donut & Top Lists
  const rawCategories = analyticsData?.categoryBreakdown ?? [];
  const categories: CategoryBreakdown[] = useMemo(() => {
    if (rawCategories.length > 0) return rawCategories;
    return DEMO_CATEGORIES;
  }, [rawCategories]);

  // Compute total spend
  const totalSpend = useMemo(() => {
    return categories.reduce((sum, c) => sum + c.currentAmount, 0);
  }, [categories]);

  // Ranked "Top lists" sorted descending by percentage / amount
  const rankedCategories = useMemo(() => {
    return [...categories].sort((a, b) => b.currentAmount - a.currentAmount);
  }, [categories]);

  // Interactive Slice State: hover or click
  const [activeSliceIndex, setActiveSliceIndex] = useState<number | null>(null);

  // SVG Donut Calculations
  const radius = 72;
  const circumference = 2 * Math.PI * radius; // ~452.389

  // Calculate slice angles / stroke dashes
  const donutSlices = useMemo(() => {
    let accumulatedAngle = 0;

    return rankedCategories.map((cat, idx) => {
      const percent = totalSpend > 0 ? (cat.currentAmount / totalSpend) * 100 : 0;
      const strokeLength = (percent / 100) * circumference;
      const strokeDashoffset = -accumulatedAngle;
      accumulatedAngle += strokeLength;

      return {
        category: cat.category,
        amount: cat.currentAmount,
        percent: Number(percent.toFixed(2)),
        color: SLICE_COLORS[idx % SLICE_COLORS.length],
        strokeLength,
        strokeDashoffset
      };
    });
  }, [rankedCategories, totalSpend, circumference]);

  const activeCategory = activeSliceIndex !== null ? donutSlices[activeSliceIndex] : null;

  return (
    <div className="space-y-6">
      {/* ── Period Selector & Horizontal Carousel ── */}
      <div className="apple-glass rounded-2xl p-4 sm:p-5 border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-sm">
        {/* Left: Mode Tabs (Month | Year | All) */}
        <div className="flex items-center bg-zinc-100 dark:bg-zinc-950 p-1 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-xs self-start">
          <button
            onClick={() => setPeriodMode('month')}
            className={`min-h-[38px] px-4 py-1.5 rounded-xl font-bold transition-all ${
              periodMode === 'month'
                ? 'bg-violet-600 text-white shadow-md'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setPeriodMode('year')}
            className={`min-h-[38px] px-4 py-1.5 rounded-xl font-bold transition-all ${
              periodMode === 'year'
                ? 'bg-violet-600 text-white shadow-md'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            Year
          </button>
          <button
            onClick={() => setPeriodMode('all')}
            className={`min-h-[38px] px-4 py-1.5 rounded-xl font-bold transition-all ${
              periodMode === 'all'
                ? 'bg-violet-600 text-white shadow-md'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            All-Time
          </button>
        </div>

        {/* Right: Period Carousel with Prev / Next arrows */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrevPeriod}
            disabled={periods.indexOf(selectedPeriod) === 0}
            className="min-h-[38px] min-w-[38px] p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center justify-center"
            title="Previous Period"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Carousel Buttons */}
          <div className="flex items-center space-x-1.5 overflow-x-auto py-1 scrollbar-none">
            {periods.map((p) => {
              const isSelected = p === selectedPeriod;
              return (
                <button
                  key={p}
                  onClick={() => setSelectedPeriod(p)}
                  className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 shadow-md font-bold'
                      : 'bg-zinc-100 dark:bg-zinc-950/80 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleNextPeriod}
            disabled={periods.indexOf(selectedPeriod) === periods.length - 1}
            className="min-h-[38px] min-w-[38px] p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center justify-center"
            title="Next Period"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Money Manager Visual Layout: Donut Chart & Top lists Ranked Breakdown ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ── Donut Spending Distribution SVG Chart (Left / 5 Cols) ── */}
        <div className="lg:col-span-5 apple-glass rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl flex flex-col items-center justify-center relative shadow-sm">
          <div className="w-full flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center space-x-2">
                <PieIcon className="w-4 h-4 text-violet-500" />
                <span>Spending Distribution</span>
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Breakdown by expense categories
              </p>
            </div>

            <span className="text-[11px] font-mono font-medium px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
              {selectedPeriod}
            </span>
          </div>

          {/* SVG Donut Circle with centered amount and interactive slices */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 my-2 flex items-center justify-center">
            <svg
              className="w-full h-full -rotate-90 transform"
              viewBox="0 0 200 200"
            >
              {/* Background Track Circle */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                className="stroke-zinc-100 dark:stroke-zinc-800/80"
                strokeWidth="24"
                fill="none"
              />

              {/* Dynamic Slices */}
              {donutSlices.map((slice, index) => {
                const isActive = activeSliceIndex === index;
                return (
                  <circle
                    key={slice.category}
                    cx="100"
                    cy="100"
                    r={radius}
                    fill="none"
                    stroke={slice.color}
                    strokeWidth={isActive ? 30 : 24}
                    strokeDasharray={`${slice.strokeLength} ${circumference}`}
                    strokeDashoffset={slice.strokeDashoffset}
                    strokeLinecap="butt"
                    className="cursor-pointer transition-all duration-300 hover:opacity-90"
                    style={{
                      filter: isActive ? `drop-shadow(0 0 8px ${slice.color}80)` : 'none'
                    }}
                    onMouseEnter={() => setActiveSliceIndex(index)}
                    onMouseLeave={() => setActiveSliceIndex(null)}
                    onClick={() => setActiveSliceIndex(activeSliceIndex === index ? null : index)}
                  />
                );
              })}
            </svg>

            {/* Centered Total Spend / Active Slice Amount */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                {activeCategory ? activeCategory.category : 'Total Expenses'}
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-zinc-900 dark:text-white tracking-tight mt-0.5">
                {formatCurrency(activeCategory ? activeCategory.amount : totalSpend, currency)}
              </span>
              <span className={`text-xs font-semibold font-mono mt-0.5 px-2 py-0.5 rounded-full ${
                activeCategory 
                  ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400' 
                  : 'text-zinc-400 dark:text-zinc-500'
              }`}>
                {activeCategory ? `${activeCategory.percent}% of spend` : `${donutSlices.length} categories`}
              </span>
            </div>
          </div>

          {/* Quick Legend Chips */}
          <div className="w-full flex flex-wrap items-center justify-center gap-2 mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/70">
            {donutSlices.slice(0, 5).map((slice, i) => (
              <button
                key={slice.category}
                onClick={() => setActiveSliceIndex(activeSliceIndex === i ? null : i)}
                className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all ${
                  activeSliceIndex === i
                    ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 font-bold'
                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: slice.color }}
                />
                <span className="truncate max-w-[100px]">{slice.category}</span>
                <span className="font-mono text-zinc-400">{slice.percent}%</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── 'Top lists' Ranked Categories Breakdown (Right / 7 Cols) ── */}
        <div className="lg:col-span-7 apple-glass rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-violet-500" />
                <span>Top Lists</span>
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Ranked expense categories with proportional distribution
              </p>
            </div>

            <span className="text-xs font-mono font-bold text-zinc-900 dark:text-white">
              Total: {formatCurrency(totalSpend, currency)}
            </span>
          </div>

          {/* Ranked List with Horizontal Proportional Progress Bars */}
          <div className="space-y-4 pt-2">
            {rankedCategories.map((cat, index) => {
              const percent = totalSpend > 0 ? (cat.currentAmount / totalSpend) * 100 : 0;
              const color = SLICE_COLORS[index % SLICE_COLORS.length];
              const categoryStyle = getCategoryStyle(cat.category);
              const CategoryIcon = categoryStyle.icon;
              const isHovered = activeSliceIndex === index;

              return (
                <div
                  key={cat.category}
                  onMouseEnter={() => setActiveSliceIndex(index)}
                  onMouseLeave={() => setActiveSliceIndex(null)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                    isHovered
                      ? 'border-violet-500/50 bg-violet-500/5 shadow-sm'
                      : 'border-zinc-200/70 dark:border-zinc-800/60 hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    {/* Left: Rank Badge + Category Icon + Name & Percentage ('Shopping 37.94%') */}
                    <div className="flex items-center space-x-3 min-w-0">
                      <span className="font-mono text-xs font-bold text-zinc-400 dark:text-zinc-500 w-4">
                        #{index + 1}
                      </span>

                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${categoryStyle.lightBg} ${categoryStyle.darkBg}`}
                      >
                        <CategoryIcon className="w-4 h-4" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-baseline space-x-2">
                          <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white truncate">
                            {cat.category}
                          </span>
                          <span className="text-xs font-mono font-semibold text-zinc-500 dark:text-zinc-400">
                            {percent.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Amount */}
                    <div className="text-right shrink-0">
                      <div className="font-mono text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">
                        {formatCurrency(cat.currentAmount, currency)}
                      </div>
                      {cat.changePercent !== undefined && cat.changePercent !== 0 && (
                        <div className={`text-[10px] font-mono ${
                          cat.changePercent <= 0 ? 'text-emerald-500' : 'text-rose-500'
                        }`}>
                          {cat.changePercent >= 0 ? '+' : ''}{cat.changePercent}% vs last mo
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Horizontal Proportional Progress Bar */}
                  <div className="w-full h-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800/80 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${Math.min(100, Math.max(2, percent))}%`,
                        backgroundColor: color
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Month-over-Month Velocity Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Income MoM */}
        <div className="apple-glass rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 shadow-sm">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span className="font-semibold text-zinc-900 dark:text-white flex items-center space-x-1.5">
              <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
              <span>Income Velocity</span>
            </span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
              (mom?.incomeMoMPercent ?? 0) >= 0 
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
            }`}>
              {(mom?.incomeMoMPercent ?? 0) >= 0 ? '+' : ''}{mom?.incomeMoMPercent ?? 0}% MoM
            </span>
          </div>

          <div className="mt-3 text-2xl font-bold font-mono text-zinc-900 dark:text-white tracking-tight">
            {formatCurrency(mom?.currentIncome ?? 0, currency)}
          </div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Prior month: {formatCurrency(mom?.previousIncome ?? 0, currency)}
          </div>
        </div>

        {/* Expense MoM */}
        <div className="apple-glass rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 shadow-sm">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span className="font-semibold text-zinc-900 dark:text-white flex items-center space-x-1.5">
              <ArrowUpRight className="w-4 h-4 text-rose-500" />
              <span>Burn Velocity</span>
            </span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
              (mom?.expenseMoMPercent ?? 0) <= 0 
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
            }`}>
              {(mom?.expenseMoMPercent ?? 0) >= 0 ? '+' : ''}{mom?.expenseMoMPercent ?? 0}% MoM
            </span>
          </div>

          <div className="mt-3 text-2xl font-bold font-mono text-zinc-900 dark:text-white tracking-tight">
            {formatCurrency(mom?.currentExpense ?? 0, currency)}
          </div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Prior month: {formatCurrency(mom?.previousExpense ?? 0, currency)}
          </div>
        </div>

        {/* Net Savings Rate */}
        <div className="apple-glass rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 shadow-sm">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span className="font-semibold text-zinc-900 dark:text-white flex items-center space-x-1.5">
              <Percent className="w-4 h-4 text-violet-500" />
              <span>Savings Efficiency</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
              Target 30%+
            </span>
          </div>

          <div className="mt-3 text-2xl font-bold font-mono text-violet-600 dark:text-violet-400 tracking-tight">
            {mom?.netSavingsRate ?? 0}%
          </div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Net retained: {formatCurrency(mom?.currentNet ?? 0, currency)}
          </div>
        </div>
      </div>

      {/* ── 6-Month Cashflow Trajectory Chart ── */}
      <div className="apple-glass rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-violet-500" />
              <span>6-Month Cashflow Trajectory</span>
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Comparative analysis of monthly inflow versus operational burn rate
            </p>
          </div>

          <div className="flex items-center space-x-4 text-xs font-mono">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-sm bg-emerald-500" />
              <span className="text-zinc-700 dark:text-zinc-300">Inflow</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-sm bg-rose-500" />
              <span className="text-zinc-700 dark:text-zinc-300">Outflow</span>
            </div>
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full pt-4">
          {isLoading ? (
            <div className="h-full flex items-center justify-center text-xs text-zinc-500">
              Loading timeline telemetry...
            </div>
          ) : cashflow.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-zinc-500">
              No historical entries found for the past 6 months.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashflow} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" className="dark:stroke-zinc-800" vertical={false} />
                <XAxis 
                  dataKey="label" 
                  stroke="#71717a" 
                  fontSize={11} 
                  tickLine={false}
                  axisLine={{ stroke: '#e4e4e7' }}
                />
                <YAxis 
                  stroke="#71717a" 
                  fontSize={11} 
                  tickLine={false}
                  axisLine={{ stroke: '#e4e4e7' }}
                  tickFormatter={(val) => `${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#18181b', 
                    borderColor: '#3f3f46',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#f4f4f5'
                  }}
                  formatter={(value: any) => [formatCurrency(Number(value || 0), currency)]}
                />
                <Bar dataKey="income" name="Inflow" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Outflow" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};
