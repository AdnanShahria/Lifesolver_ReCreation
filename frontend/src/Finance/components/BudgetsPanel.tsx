import React from 'react';
import { 
  Target, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Trash2, 
  PieChart, 
  Calendar 
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

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the budget for "${name}"?`)) {
      await deleteBudgetMutation.mutateAsync(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Overview Header Card ── */}
      <div className="apple-glass rounded-2xl p-6 border border-zinc-800 bg-gradient-to-r from-zinc-900 via-zinc-900/80 to-zinc-950 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-violet-400">
            <Target className="w-4 h-4 text-violet-400" />
            <span>Monthly Category Guardrails</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
            Budget Control Matrix
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Automated alerts fire at 80% threshold warning and 100% capacity breach.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="bg-zinc-900/80 px-4 py-2.5 rounded-xl border border-zinc-800">
            <div className="text-[10px] font-mono text-zinc-400 uppercase">Total Monthly Target</div>
            <div className="text-sm sm:text-base font-bold text-white mt-0.5">
              {formatCurrency(overview?.totalTarget ?? 0, currency)}
            </div>
          </div>

          <div className="bg-zinc-900/80 px-4 py-2.5 rounded-xl border border-zinc-800">
            <div className="text-[10px] font-mono text-zinc-400 uppercase">Actual MTD Spend</div>
            <div className={`text-sm sm:text-base font-bold mt-0.5 ${
              (overview?.overallPercent ?? 0) >= 100 
                ? 'text-rose-400' 
                : (overview?.overallPercent ?? 0) >= 80 
                  ? 'text-amber-400' 
                  : 'text-emerald-400'
            }`}>
              {formatCurrency(overview?.totalSpent ?? 0, currency)} ({overview?.overallPercent ?? 0}%)
            </div>
          </div>

          <button
            onClick={onOpenCreateBudgetModal}
            className="min-h-[44px] px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 active:scale-[0.98] text-white text-xs sm:text-sm font-medium flex items-center space-x-2 transition-all shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>New Budget</span>
          </button>
        </div>
      </div>

      {/* ── Budgets Grid ── */}
      {isLoading ? (
        <div className="apple-glass rounded-2xl p-12 text-center text-zinc-500 text-xs">
          Loading budget parameters...
        </div>
      ) : budgets.length === 0 ? (
        <div className="apple-glass rounded-2xl p-12 text-center border border-zinc-800/80 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
            <PieChart className="w-6 h-6 text-violet-400" />
          </div>
          <div className="text-sm font-semibold text-white">No budgets configured</div>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Establish spending caps for groceries, dining, entertainment, or travel to prevent cashflow leaks.
          </p>
          <button
            onClick={onOpenCreateBudgetModal}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 text-xs font-medium inline-flex items-center space-x-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Budget</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map((b) => {
            const isExceeded = b.status === 'exceeded';
            const isWarning = b.status === 'warning';

            return (
              <div
                key={b.id}
                className={`apple-glass-card p-5 rounded-2xl border transition-all ${
                  isExceeded 
                    ? 'border-rose-500/40 bg-rose-950/10' 
                    : isWarning 
                      ? 'border-amber-500/40 bg-amber-950/10' 
                      : 'border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-bold text-white flex items-center space-x-2">
                      <span>{b.name}</span>
                      {b.isSpecial === 1 && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                          Capital
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">
                      Category: <span className="text-zinc-200 font-medium">{b.category || 'General'}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border flex items-center space-x-1 ${
                      isExceeded 
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' 
                        : isWarning 
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' 
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    }`}>
                      {isExceeded ? <XCircle className="w-3 h-3" /> : isWarning ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                      <span>{isExceeded ? 'Exceeded' : isWarning ? 'Warning' : 'On Track'}</span>
                    </span>

                    <button
                      onClick={() => handleDelete(b.id, b.name)}
                      className="min-h-[36px] min-w-[36px] p-2 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400 font-mono">
                      Spent: <strong className="text-white">{formatCurrency(b.currentAmount, currency)}</strong>
                    </span>
                    <span className="text-zinc-400 font-mono">
                      Cap: <strong className="text-white">{formatCurrency(b.targetAmount, currency)}</strong>
                    </span>
                  </div>

                  <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isExceeded 
                          ? 'bg-rose-500' 
                          : isWarning 
                            ? 'bg-amber-400' 
                            : 'bg-emerald-400'
                      }`}
                      style={{ width: `${Math.min(100, b.percentSpent)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1">
                    <span>{b.percentSpent}% utilized</span>
                    <span>
                      {isExceeded
                        ? `Over budget by ${formatCurrency(b.currentAmount - b.targetAmount, currency)}`
                        : `${formatCurrency(b.remaining, currency)} remaining`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
