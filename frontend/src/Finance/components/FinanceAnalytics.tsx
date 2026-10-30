import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  PieChart as PieIcon, 
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  Percent,
  Calendar
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid 
} from 'recharts';
import type { FinanceAnalyticsResponse } from '../types';
import { formatCurrency } from '../hooks/useFinance';

interface FinanceAnalyticsProps {
  analyticsData?: FinanceAnalyticsResponse;
  isLoading: boolean;
  currency: string;
}

export const FinanceAnalytics: React.FC<FinanceAnalyticsProps> = ({
  analyticsData,
  isLoading,
  currency
}) => {
  const mom = analyticsData?.monthOverMonth;
  const categories = analyticsData?.categoryBreakdown ?? [];
  const cashflow = analyticsData?.cashflowHistory ?? [];
  const topCategory = analyticsData?.topSpendingCategory;

  return (
    <div className="space-y-6">
      {/* ── Month-over-Month Pulse Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Income MoM */}
        <div className="apple-glass-card p-5 rounded-2xl border border-zinc-800">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-semibold text-white flex items-center space-x-1.5">
              <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
              <span>Income Velocity</span>
            </span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
              (mom?.incomeMoMPercent ?? 0) >= 0 
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' 
                : 'bg-rose-500/10 text-rose-300 border-rose-500/20'
            }`}>
              {(mom?.incomeMoMPercent ?? 0) >= 0 ? '+' : ''}{mom?.incomeMoMPercent ?? 0}% MoM
            </span>
          </div>

          <div className="mt-3 text-2xl font-bold text-white tracking-tight">
            {formatCurrency(mom?.currentIncome ?? 0, currency)}
          </div>
          <div className="text-xs text-zinc-500 mt-1">
            Prior month: {formatCurrency(mom?.previousIncome ?? 0, currency)}
          </div>
        </div>

        {/* Expense MoM */}
        <div className="apple-glass-card p-5 rounded-2xl border border-zinc-800">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-semibold text-white flex items-center space-x-1.5">
              <ArrowUpRight className="w-4 h-4 text-rose-400" />
              <span>Burn Velocity</span>
            </span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
              (mom?.expenseMoMPercent ?? 0) <= 0 
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' 
                : 'bg-rose-500/10 text-rose-300 border-rose-500/20'
            }`}>
              {(mom?.expenseMoMPercent ?? 0) >= 0 ? '+' : ''}{mom?.expenseMoMPercent ?? 0}% MoM
            </span>
          </div>

          <div className="mt-3 text-2xl font-bold text-white tracking-tight">
            {formatCurrency(mom?.currentExpense ?? 0, currency)}
          </div>
          <div className="text-xs text-zinc-500 mt-1">
            Prior month: {formatCurrency(mom?.previousExpense ?? 0, currency)}
          </div>
        </div>

        {/* Net Savings Rate */}
        <div className="apple-glass-card p-5 rounded-2xl border border-zinc-800">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-semibold text-white flex items-center space-x-1.5">
              <Percent className="w-4 h-4 text-violet-400" />
              <span>Savings Efficiency</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20">
              Target 30%+
            </span>
          </div>

          <div className="mt-3 text-2xl font-bold text-violet-400 tracking-tight">
            {mom?.netSavingsRate ?? 0}%
          </div>
          <div className="text-xs text-zinc-500 mt-1">
            Net retained: {formatCurrency(mom?.currentNet ?? 0, currency)}
          </div>
        </div>
      </div>

      {/* ── 6-Month Cashflow History Chart ── */}
      <div className="apple-glass rounded-2xl p-6 border border-zinc-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-violet-400" />
              <span>6-Month Cashflow Trajectory</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Comparative analysis of monthly inflow versus operational burn rate.
            </p>
          </div>

          <div className="flex items-center space-x-4 text-xs font-mono">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-sm bg-emerald-500" />
              <span className="text-zinc-300">Inflow</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-sm bg-rose-500" />
              <span className="text-zinc-300">Outflow</span>
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
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis 
                  dataKey="label" 
                  stroke="#71717a" 
                  fontSize={11} 
                  tickLine={false}
                  axisLine={{ stroke: '#27272a' }}
                />
                <YAxis 
                  stroke="#71717a" 
                  fontSize={11} 
                  tickLine={false}
                  axisLine={{ stroke: '#27272a' }}
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

      {/* ── Category Breakdown ── */}
      <div className="apple-glass rounded-2xl p-6 border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <PieIcon className="w-4 h-4 text-violet-400" />
              <span>Current Month Expense Allocation</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Category proportions and month-over-month divergence.
            </p>
          </div>

          {topCategory && (
            <div className="hidden sm:flex items-center space-x-2 text-xs bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-xl text-rose-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Highest Outflow: <strong>{topCategory.category}</strong> ({topCategory.percentageOfTotal}%)</span>
            </div>
          )}
        </div>

        {categories.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-500">
            No expenses logged in the current calendar month.
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            {categories.map((cat) => (
              <div key={cat.category} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-white">{cat.category}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${
                      cat.changePercent <= 0 
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                    }`}>
                      {cat.changePercent >= 0 ? '+' : ''}{cat.changePercent}% vs last mo
                    </span>
                  </div>

                  <div className="font-mono text-zinc-300 font-semibold">
                    {formatCurrency(cat.currentAmount, currency)} ({cat.percentageOfTotal}%)
                  </div>
                </div>

                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-violet-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, cat.percentageOfTotal)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
