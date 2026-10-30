import React, { useState } from 'react';
import { 
  PiggyBank, 
  Plus, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Trash2, 
  Calendar, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  ShieldCheck,
  Target
} from 'lucide-react';
import type { SavingsPot, SavingsResponse } from '../types';
import { formatCurrency, useDeleteSavingsPot } from '../hooks/useFinance';

interface SavingsPotsProps {
  savingsData?: SavingsResponse;
  isLoading: boolean;
  currency: string;
  onOpenCreateSavingsModal: () => void;
  onOpenActionModal: (pot: SavingsPot, action: 'deposit' | 'withdraw') => void;
}

export const SavingsPots: React.FC<SavingsPotsProps> = ({
  savingsData,
  isLoading,
  currency,
  onOpenCreateSavingsModal,
  onOpenActionModal
}) => {
  const [expandedPotId, setExpandedPotId] = useState<string | null>(null);
  const deletePotMutation = useDeleteSavingsPot();

  const pots = savingsData?.savings ?? [];
  const summary = savingsData?.summary;

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}" and all its transaction logs?`)) {
      await deletePotMutation.mutateAsync(id);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedPotId(expandedPotId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* ── Summary Banner ── */}
      <div className="apple-glass rounded-2xl p-6 border border-zinc-800 bg-gradient-to-r from-zinc-900 via-zinc-900/80 to-zinc-950 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-violet-400">
            <PiggyBank className="w-4 h-4 text-violet-400" />
            <span>Targeted Wealth Accumulation</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
            Savings & Reserve Pots
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Isolate dedicated capital for emergencies, major milestones, and capital ventures.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="bg-zinc-900/80 px-4 py-2.5 rounded-xl border border-zinc-800">
            <div className="text-[10px] font-mono text-zinc-400 uppercase">Total Accumulated</div>
            <div className="text-sm sm:text-base font-bold text-emerald-400 mt-0.5">
              {formatCurrency(summary?.totalSaved ?? 0, currency)}
            </div>
          </div>

          <div className="bg-zinc-900/80 px-4 py-2.5 rounded-xl border border-zinc-800">
            <div className="text-[10px] font-mono text-zinc-400 uppercase">Target Horizon</div>
            <div className="text-sm sm:text-base font-bold text-white mt-0.5">
              {formatCurrency(summary?.totalTarget ?? 0, currency)} ({summary?.overallProgress ?? 0}%)
            </div>
          </div>

          <button
            onClick={onOpenCreateSavingsModal}
            className="min-h-[44px] px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 active:scale-[0.98] text-white text-xs sm:text-sm font-medium flex items-center space-x-2 transition-all shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>New Savings Pot</span>
          </button>
        </div>
      </div>

      {/* ── Savings Pots Grid ── */}
      {isLoading ? (
        <div className="apple-glass rounded-2xl p-12 text-center text-zinc-500 text-xs">
          Loading savings vaults...
        </div>
      ) : pots.length === 0 ? (
        <div className="apple-glass rounded-2xl p-12 text-center border border-zinc-800/80 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
            <PiggyBank className="w-6 h-6 text-violet-400" />
          </div>
          <div className="text-sm font-semibold text-white">No savings pots created</div>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Set up goal-oriented pots like an 6-month emergency reserve or high-value equipment fund.
          </p>
          <button
            onClick={onOpenCreateSavingsModal}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 text-xs font-medium inline-flex items-center space-x-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Pot</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pots.map((pot) => {
            const isExpanded = expandedPotId === pot.id;
            const isFunded = pot.progressPercentage >= 100;

            return (
              <div
                key={pot.id}
                className="apple-glass-card p-5 sm:p-6 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition-all space-y-4"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-base font-bold text-white flex items-center space-x-2">
                      <span>{pot.name}</span>
                      {isFunded && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center space-x-1">
                          <Sparkles className="w-3 h-3 text-emerald-400" />
                          <span>Goal Reached</span>
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-zinc-400 mt-1 flex items-center space-x-3">
                      <span>Category: <strong className="text-zinc-200">{pot.category || 'Savings'}</strong></span>
                      {pot.deadlineDate && (
                        <span className="flex items-center space-x-1 text-zinc-500">
                          <Calendar className="w-3 h-3" />
                          <span>Due: {pot.deadlineDate}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(pot.id, pot.name)}
                    className="min-h-[36px] min-w-[36px] p-2 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Amount & Progress */}
                <div className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <div className="text-2xl font-extrabold text-white">
                      {formatCurrency(pot.currentAmount, currency)}
                    </div>
                    <div className="text-xs font-mono text-zinc-400">
                      Target: {formatCurrency(pot.targetAmount, currency)}
                    </div>
                  </div>

                  <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isFunded ? 'bg-emerald-400' : 'bg-gradient-to-r from-violet-600 to-indigo-500'
                      }`}
                      style={{ width: `${Math.min(100, pot.progressPercentage)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span>{pot.progressPercentage}% funded</span>
                    <span>{formatCurrency(pot.remainingTarget, currency)} left to target</span>
                  </div>
                </div>

                {/* Actions (Touch targets >= 44px) */}
                <div className="pt-2 flex items-center justify-between gap-2 border-t border-zinc-800/80">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenActionModal(pot, 'deposit')}
                      className="min-h-[44px] px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 active:scale-[0.98] text-emerald-300 border border-emerald-500/30 text-xs font-medium flex items-center space-x-1.5 transition-all"
                    >
                      <ArrowDownLeft className="w-3.5 h-3.5" />
                      <span>Deposit</span>
                    </button>

                    <button
                      onClick={() => onOpenActionModal(pot, 'withdraw')}
                      disabled={pot.currentAmount <= 0}
                      className="min-h-[44px] px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed text-rose-300 border border-rose-500/30 text-xs font-medium flex items-center space-x-1.5 transition-all"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>Withdraw</span>
                    </button>
                  </div>

                  {pot.transactions && pot.transactions.length > 0 && (
                    <button
                      onClick={() => toggleExpand(pot.id)}
                      className="min-h-[44px] px-3 py-2 text-xs text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800/40 transition-colors flex items-center space-x-1 font-mono"
                    >
                      <span>{pot.transactions.length} Logs</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>

                {/* History Drawer */}
                {isExpanded && pot.transactions && (
                  <div className="pt-3 border-t border-zinc-800 space-y-2">
                    <div className="text-[11px] font-mono text-zinc-500 uppercase">Pot Activity History</div>
                    <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                      {pot.transactions.map((tx) => (
                        <div
                          key={tx.id}
                          className="p-2 rounded-lg bg-zinc-900/80 border border-zinc-800 text-xs flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-2 min-w-0">
                            <span className={`w-2 h-2 rounded-full ${
                              tx.type === 'deposit' ? 'bg-emerald-400' : 'bg-rose-400'
                            }`} />
                            <span className="text-zinc-200 truncate">
                              {tx.description || (tx.type === 'deposit' ? 'Deposit' : 'Withdrawal')}
                            </span>
                            <span className="text-zinc-500 font-mono text-[10px] shrink-0">{tx.date}</span>
                          </div>
                          <div className={`font-mono font-semibold shrink-0 ${
                            tx.type === 'deposit' ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                            {tx.type === 'deposit' ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
