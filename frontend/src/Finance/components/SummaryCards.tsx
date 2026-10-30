import React from 'react';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ShieldCheck, 
  Landmark, 
  Receipt, 
  Coins,
  Percent
} from 'lucide-react';
import type { LedgerSummary, LoansResponse } from '../types';
import { formatCurrency } from '../hooks/useFinance';

interface SummaryCardsProps {
  summary?: LedgerSummary;
  loansData?: LoansResponse;
  currency: string;
  onOpenTransactionModal: (type: 'income' | 'expense', isSpecial?: number) => void;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  summary,
  loansData,
  currency,
  onOpenTransactionModal
}) => {
  const totalBalance = summary?.totalBalance ?? 0;
  const regularBalance = summary?.regularBalance ?? 0;
  const specialBalance = summary?.specialBalance ?? 0;
  const monthlyIncome = summary?.monthlyIncome ?? 0;
  const monthlyExpense = summary?.monthlyExpense ?? 0;
  const netSavingsRate = summary?.netSavingsRate ?? 0;

  const totalReceivable = loansData?.summary?.totalReceivable ?? 0;
  const totalPayable = loansData?.summary?.totalPayable ?? 0;

  return (
    <div className="space-y-4">
      {/* ── Top Executive Hero Card ── */}
      <div className="apple-glass rounded-3xl p-6 sm:p-8 border border-violet-500/25 bg-gradient-to-br from-violet-950/40 via-zinc-900/80 to-zinc-950 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-violet-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Real-Time Edge Cashflow Truth</span>
            </div>
            
            <div className="mt-2 text-3xl sm:text-5xl font-extrabold tracking-tight text-white flex items-baseline gap-3">
              <span>{formatCurrency(totalBalance, currency)}</span>
              <span className={`text-xs sm:text-sm font-mono px-2.5 py-1 rounded-full border ${
                totalBalance >= 0 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              }`}>
                {totalBalance >= 0 ? 'Solvent' : 'Deficit'}
              </span>
            </div>
            
            <p className="mt-1 text-xs sm:text-sm text-zinc-400 max-w-xl">
              Server-computed aggregated liquid balance across everyday cash and capital investment vaults.
            </p>
          </div>

          {/* Quick Actions (Apple touch target >= 44px) */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onOpenTransactionModal('income', 0)}
              className="min-h-[44px] min-w-[44px] px-4 py-2.5 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 active:scale-[0.98] text-emerald-300 border border-emerald-500/30 font-medium text-xs sm:text-sm flex items-center space-x-2 transition-all shadow-lg"
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>Log Income</span>
            </button>

            <button
              onClick={() => onOpenTransactionModal('expense', 0)}
              className="min-h-[44px] min-w-[44px] px-4 py-2.5 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 active:scale-[0.98] text-rose-300 border border-rose-500/30 font-medium text-xs sm:text-sm flex items-center space-x-2 transition-all shadow-lg"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Log Expense</span>
            </button>
          </div>
        </div>

        {/* ── Sub-metrics Row ── */}
        <div className="mt-6 pt-6 border-t border-zinc-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wide">Monthly Inflow</div>
            <div className="text-base sm:text-lg font-bold text-emerald-400 mt-0.5">
              +{formatCurrency(monthlyIncome, currency)}
            </div>
          </div>

          <div>
            <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wide">Monthly Outflow</div>
            <div className="text-base sm:text-lg font-bold text-rose-400 mt-0.5">
              -{formatCurrency(monthlyExpense, currency)}
            </div>
          </div>

          <div>
            <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wide">Net Savings Rate</div>
            <div className="text-base sm:text-lg font-bold text-violet-400 mt-0.5 flex items-center space-x-1">
              <Percent className="w-3.5 h-3.5" />
              <span>{netSavingsRate}%</span>
            </div>
          </div>

          <div>
            <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wide">Net Monthly Flow</div>
            <div className={`text-base sm:text-lg font-bold mt-0.5 ${
              monthlyIncome - monthlyExpense >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {monthlyIncome - monthlyExpense >= 0 ? '+' : ''}{formatCurrency(monthlyIncome - monthlyExpense, currency)}
            </div>
          </div>
        </div>
      </div>

      {/* ── Dual Ledgers & Isolated Debt Quad ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Regular Everyday Ledger */}
        <div className="apple-glass-card p-5 rounded-2xl border border-zinc-800 hover:border-violet-500/30 transition-all">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-semibold text-white flex items-center space-x-1.5">
              <Wallet className="w-4 h-4 text-violet-400" />
              <span>Everyday Wallet</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20">
              Regular
            </span>
          </div>
          <div className="mt-3 text-2xl font-bold text-white tracking-tight">
            {formatCurrency(regularBalance, currency)}
          </div>
          <div className="mt-2 text-xs text-zinc-500 flex items-center justify-between">
            <span>Operating balance</span>
            <button
              onClick={() => onOpenTransactionModal('expense', 0)}
              className="text-violet-400 hover:text-violet-300 font-medium"
            >
              + Quick &rarr;
            </button>
          </div>
        </div>

        {/* Special Capital Vault */}
        <div className="apple-glass-card p-5 rounded-2xl border border-zinc-800 hover:border-indigo-500/30 transition-all">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-semibold text-white flex items-center space-x-1.5">
              <Landmark className="w-4 h-4 text-indigo-400" />
              <span>Capital Vault</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              Special
            </span>
          </div>
          <div className="mt-3 text-2xl font-bold text-white tracking-tight">
            {formatCurrency(specialBalance, currency)}
          </div>
          <div className="mt-2 text-xs text-zinc-500 flex items-center justify-between">
            <span>High-ticket capital</span>
            <button
              onClick={() => onOpenTransactionModal('expense', 1)}
              className="text-indigo-400 hover:text-indigo-300 font-medium"
            >
              + Capital &rarr;
            </button>
          </div>
        </div>

        {/* Receivables (Given loans) */}
        <div className="apple-glass-card p-5 rounded-2xl border border-zinc-800 hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-semibold text-white flex items-center space-x-1.5">
              <Receipt className="w-4 h-4 text-emerald-400" />
              <span>Receivables</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              Lent Out
            </span>
          </div>
          <div className="mt-3 text-2xl font-bold text-emerald-400 tracking-tight">
            +{formatCurrency(totalReceivable, currency)}
          </div>
          <div className="mt-2 text-xs text-zinc-500 flex items-center justify-between">
            <span>{loansData?.summary?.totalLoansCount ?? 0} active records</span>
            <span className="text-zinc-400">Money owed to you</span>
          </div>
        </div>

        {/* Payables (Taken loans) */}
        <div className="apple-glass-card p-5 rounded-2xl border border-zinc-800 hover:border-rose-500/30 transition-all">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-semibold text-white flex items-center space-x-1.5">
              <Coins className="w-4 h-4 text-rose-400" />
              <span>Payables / Debt</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20">
              Borrowed
            </span>
          </div>
          <div className="mt-3 text-2xl font-bold text-rose-400 tracking-tight">
            -{formatCurrency(totalPayable, currency)}
          </div>
          <div className="mt-2 text-xs text-zinc-500 flex items-center justify-between">
            <span>Net debt: {formatCurrency(loansData?.summary?.netDebt ?? 0, currency)}</span>
            <span className="text-zinc-400">Isolated debt</span>
          </div>
        </div>
      </div>
    </div>
  );
};
