import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  TrendingUp, 
  TrendingDown, 
  ChevronRight, 
  ShieldCheck,
  Sparkles,
  Percent
} from 'lucide-react';
import { useLedger, formatCurrency } from '../Finance/hooks/useFinance';
import { TransactionModal } from '../Finance/components/modals/TransactionModal';

interface ExecutiveFinanceWidgetProps {
  theme?: 'dark' | 'light';
}

export const ExecutiveFinanceWidget: React.FC<ExecutiveFinanceWidgetProps> = ({ theme = 'dark' }) => {
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const { data: ledgerData, isLoading } = useLedger();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'income' | 'expense'>('expense');

  const summary = ledgerData?.summary;
  const totalBalance = summary?.totalBalance ?? 0;
  const monthlyIncome = summary?.monthlyIncome ?? 0;
  const monthlyExpense = summary?.monthlyExpense ?? 0;
  const netSavingsRate = summary?.netSavingsRate ?? 0;

  const handleOpenModal = (type: 'income' | 'expense') => {
    setModalType(type);
    setModalOpen(true);
  };

  return (
    <>
      <div className={`rounded-2xl p-6 border relative overflow-hidden transition-all ${
        isDark
          ? 'apple-glass border-emerald-500/25 bg-gradient-to-br from-zinc-900/90 via-zinc-950 to-[#0c0d12] shadow-xl text-zinc-100'
          : 'bg-white border-emerald-500/20 shadow-md shadow-emerald-500/5 text-zinc-900'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Wallet className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>Vertical 3: Financial Capital</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Live D1 Edge
                </span>
              </div>
              <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-600'} mt-0.5`}>
                Dynamic balance computed from verified ledger transactions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenModal('income')}
              className={`min-h-[44px] min-w-[44px] px-3.5 py-2 rounded-xl text-xs font-medium flex items-center space-x-1.5 transition-all cursor-pointer ${
                isDark
                  ? 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-sm'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>+ Income</span>
            </button>

            <button
              onClick={() => handleOpenModal('expense')}
              className={`min-h-[44px] min-w-[44px] px-3.5 py-2 rounded-xl text-xs font-medium flex items-center space-x-1.5 transition-all cursor-pointer ${
                isDark
                  ? 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30'
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 shadow-sm'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>- Expense</span>
            </button>

            <button
              onClick={() => navigate('/finance')}
              className="min-h-[44px] min-w-[44px] px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 active:scale-[0.98] text-white text-xs font-medium flex items-center space-x-1.5 transition-all shadow-md cursor-pointer"
            >
              <span>Finance OS</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Balance & Metrics Grid ── */}
        <div className={`mt-6 pt-5 border-t ${isDark ? 'border-zinc-800/80' : 'border-zinc-200'} grid grid-cols-2 sm:grid-cols-4 gap-4`}>
          <div>
            <div className={`text-[11px] font-mono ${isDark ? 'text-zinc-400' : 'text-zinc-500'} uppercase`}>Liquid Net Balance</div>
            <div className={`text-xl sm:text-2xl font-extrabold ${isDark ? 'text-white' : 'text-zinc-900'} mt-0.5`}>
              {isLoading ? '...' : formatCurrency(totalBalance)}
            </div>
          </div>

          <div>
            <div className={`text-[11px] font-mono ${isDark ? 'text-zinc-400' : 'text-zinc-500'} uppercase`}>Monthly Inflow</div>
            <div className="text-base sm:text-lg font-bold text-emerald-500 mt-0.5">
              {isLoading ? '...' : `+${formatCurrency(monthlyIncome)}`}
            </div>
          </div>

          <div>
            <div className={`text-[11px] font-mono ${isDark ? 'text-zinc-400' : 'text-zinc-500'} uppercase`}>Monthly Outflow</div>
            <div className="text-base sm:text-lg font-bold text-rose-500 mt-0.5">
              {isLoading ? '...' : `-${formatCurrency(monthlyExpense)}`}
            </div>
          </div>

          <div>
            <div className={`text-[11px] font-mono ${isDark ? 'text-zinc-400' : 'text-zinc-500'} uppercase`}>Net Savings Rate</div>
            <div className="text-base sm:text-lg font-bold text-violet-500 mt-0.5 flex items-center space-x-1">
              <Percent className="w-3.5 h-3.5" />
              <span>{isLoading ? '...' : `${netSavingsRate}%`}</span>
            </div>
          </div>
        </div>
      </div>

      <TransactionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultType={modalType}
      />
    </>
  );
};
