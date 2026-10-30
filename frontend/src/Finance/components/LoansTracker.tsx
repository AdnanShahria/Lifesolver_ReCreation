import React from 'react';
import { 
  HandCoins, 
  Plus, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Trash2, 
  Calendar, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Phone,
  ShieldCheck
} from 'lucide-react';
import type { Loan, LoansResponse } from '../types';
import { formatCurrency, useDeleteLoan } from '../hooks/useFinance';

interface LoansTrackerProps {
  loansData?: LoansResponse;
  isLoading: boolean;
  currency: string;
  onOpenCreateLoanModal: () => void;
  onOpenRepayModal: (loan: Loan) => void;
}

export const LoansTracker: React.FC<LoansTrackerProps> = ({
  loansData,
  isLoading,
  currency,
  onOpenCreateLoanModal,
  onOpenRepayModal
}) => {
  const deleteLoanMutation = useDeleteLoan();

  const loans = loansData?.loans ?? [];
  const summary = loansData?.summary;

  const givenLoans = loans.filter((l) => l.type === 'given');
  const takenLoans = loans.filter((l) => l.type === 'taken');

  const handleDelete = async (id: string, person: string) => {
    if (window.confirm(`Delete loan record for "${person}"?`)) {
      await deleteLoanMutation.mutateAsync(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Summary Banner ── */}
      <div className="apple-glass rounded-2xl p-6 border border-zinc-800 bg-gradient-to-r from-zinc-900 via-zinc-900/80 to-zinc-950 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-violet-400">
            <HandCoins className="w-4 h-4 text-violet-400" />
            <span>Isolated Debt & Credit Ledger</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
            Loans & Debt Portfolio
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl">
            Tracks borrowed and lent capital without distorting your operational wallet balances.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="bg-zinc-900/80 px-4 py-2.5 rounded-xl border border-zinc-800">
            <div className="text-[10px] font-mono text-zinc-400 uppercase">Receivables (Lent)</div>
            <div className="text-sm sm:text-base font-bold text-emerald-400 mt-0.5">
              +{formatCurrency(summary?.totalReceivable ?? 0, currency)}
            </div>
          </div>

          <div className="bg-zinc-900/80 px-4 py-2.5 rounded-xl border border-zinc-800">
            <div className="text-[10px] font-mono text-zinc-400 uppercase">Payables (Borrowed)</div>
            <div className="text-sm sm:text-base font-bold text-rose-400 mt-0.5">
              -{formatCurrency(summary?.totalPayable ?? 0, currency)}
            </div>
          </div>

          <div className="bg-zinc-900/80 px-4 py-2.5 rounded-xl border border-zinc-800">
            <div className="text-[10px] font-mono text-zinc-400 uppercase">Net Debt Exposure</div>
            <div className={`text-sm sm:text-base font-bold mt-0.5 ${
              (summary?.netDebt ?? 0) <= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {formatCurrency(summary?.netDebt ?? 0, currency)}
            </div>
          </div>

          <button
            onClick={onOpenCreateLoanModal}
            className="min-h-[44px] px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 active:scale-[0.98] text-white text-xs sm:text-sm font-medium flex items-center space-x-2 transition-all shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>New Loan Record</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="apple-glass rounded-2xl p-12 text-center text-zinc-500 text-xs">
          Loading debt records...
        </div>
      ) : loans.length === 0 ? (
        <div className="apple-glass rounded-2xl p-12 text-center border border-zinc-800/80 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
            <HandCoins className="w-6 h-6 text-violet-400" />
          </div>
          <div className="text-sm font-semibold text-white">No loan records tracked</div>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Keep clear records of money you lent to friends or loans you took without skewing your monthly cash flow.
          </p>
          <button
            onClick={onOpenCreateLoanModal}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 text-xs font-medium inline-flex items-center space-x-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Loan</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ── Given Loans Column (Receivables) ── */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs px-1">
              <span className="font-semibold text-emerald-400 flex items-center space-x-2">
                <ArrowDownLeft className="w-4 h-4" />
                <span>Given Loans (Money You Lent Out)</span>
              </span>
              <span className="font-mono text-zinc-400">{givenLoans.length} active</span>
            </div>

            {givenLoans.length === 0 ? (
              <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 text-center text-xs text-zinc-500">
                No money lent out currently.
              </div>
            ) : (
              <div className="space-y-3">
                {givenLoans.map((loan) => (
                  <LoanCard
                    key={loan.id}
                    loan={loan}
                    currency={currency}
                    onRepay={() => onOpenRepayModal(loan)}
                    onDelete={() => handleDelete(loan.id, loan.personName)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── Taken Loans Column (Payables) ── */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs px-1">
              <span className="font-semibold text-rose-400 flex items-center space-x-2">
                <ArrowUpRight className="w-4 h-4" />
                <span>Taken Loans (Money You Borrowed)</span>
              </span>
              <span className="font-mono text-zinc-400">{takenLoans.length} active</span>
            </div>

            {takenLoans.length === 0 ? (
              <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 text-center text-xs text-zinc-500">
                Zero borrowed debt. You are completely debt-free!
              </div>
            ) : (
              <div className="space-y-3">
                {takenLoans.map((loan) => (
                  <LoanCard
                    key={loan.id}
                    loan={loan}
                    currency={currency}
                    onRepay={() => onOpenRepayModal(loan)}
                    onDelete={() => handleDelete(loan.id, loan.personName)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Sub-component: LoanCard ───────────────────────────────────────

interface LoanCardProps {
  loan: Loan;
  currency: string;
  onRepay: () => void;
  onDelete: () => void;
}

const LoanCard: React.FC<LoanCardProps> = ({ loan, currency, onRepay, onDelete }) => {
  const isSettled = loan.status === 'settled';
  const isGiven = loan.type === 'given';

  return (
    <div className={`apple-glass-card p-5 rounded-2xl border transition-all space-y-3 ${
      isSettled 
        ? 'border-zinc-800/60 bg-zinc-900/30 opacity-75' 
        : isGiven 
          ? 'border-emerald-500/20 hover:border-emerald-500/40' 
          : 'border-rose-500/20 hover:border-rose-500/40'
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-base font-bold text-white flex items-center space-x-2">
            <span>{loan.personName}</span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
              isSettled 
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' 
                : 'bg-zinc-800 text-zinc-300 border-zinc-700'
            }`}>
              {isSettled ? 'Settled' : 'Active'}
            </span>
          </div>

          <div className="text-xs text-zinc-400 mt-1 flex flex-wrap items-center gap-3">
            {loan.contactInfo && (
              <span className="flex items-center space-x-1 text-zinc-400">
                <Phone className="w-3 h-3 text-zinc-500" />
                <span>{loan.contactInfo}</span>
              </span>
            )}
            {loan.dueDate && (
              <span className="flex items-center space-x-1 text-zinc-500">
                <Calendar className="w-3 h-3" />
                <span>Due: {loan.dueDate}</span>
              </span>
            )}
          </div>
        </div>

        <button
          onClick={onDelete}
          className="min-h-[36px] min-w-[36px] p-2 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {loan.notes && (
        <p className="text-xs text-zinc-300 bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800/80 italic">
          "{loan.notes}"
        </p>
      )}

      {/* Progress & Balances */}
      <div className="pt-2 border-t border-zinc-800/70 space-y-2">
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-[11px] font-mono text-zinc-400 uppercase">Remaining Principal</div>
            <div className={`text-xl font-extrabold ${isGiven ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatCurrency(loan.remainingAmount, currency)}
            </div>
          </div>

          <div className="text-right text-xs">
            <div className="text-zinc-400 font-mono">
              Total: {formatCurrency(loan.principalAmount, currency)}
            </div>
            <div className="text-zinc-500 font-mono mt-0.5">
              Repaid: {formatCurrency(loan.paidAmount, currency)} ({loan.progressPercent}%)
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isSettled ? 'bg-emerald-400' : isGiven ? 'bg-emerald-500' : 'bg-rose-500'
            }`}
            style={{ width: `${Math.min(100, loan.progressPercent)}%` }}
          />
        </div>
      </div>

      {/* Repay Action (Touch target >= 44px) */}
      {!isSettled && (
        <div className="pt-2">
          <button
            onClick={onRepay}
            className="w-full min-h-[44px] px-4 py-2 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 text-xs font-semibold flex items-center justify-center space-x-2 transition-all shadow-sm"
          >
            <HandCoins className="w-4 h-4" />
            <span>Record Repayment</span>
          </button>
        </div>
      )}
    </div>
  );
};
