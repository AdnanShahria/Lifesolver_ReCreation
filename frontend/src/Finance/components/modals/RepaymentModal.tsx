import React, { useState } from 'react';
import { X, HandCoins, CheckSquare, Square, Info } from 'lucide-react';
import type { Loan } from '../../types';
import { useRepayLoan, formatCurrency } from '../../hooks/useFinance';

interface RepaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: Loan | null;
  currency: string;
}

export const RepaymentModal: React.FC<RepaymentModalProps> = ({
  isOpen,
  onClose,
  loan,
  currency
}) => {
  const [repaymentAmount, setRepaymentAmount] = useState('');
  const [logToLedger, setLogToLedger] = useState(true);

  const repayMutation = useRepayLoan();

  if (!isOpen || !loan) return null;

  const isGiven = loan.type === 'given';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(repaymentAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter a valid repayment amount');
      return;
    }

    if (numAmount > loan.remainingAmount) {
      alert(`Repayment exceeds remaining principal balance of ${formatCurrency(loan.remainingAmount, currency)}`);
      return;
    }

    await repayMutation.mutateAsync({
      id: loan.id,
      repaymentAmount: numAmount,
      logToLedger
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="apple-glass rounded-3xl border border-zinc-700/80 bg-zinc-950 w-full max-w-md p-6 sm:p-7 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 min-h-[44px] min-w-[44px] flex items-center justify-center text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
          <HandCoins className="w-5 h-5 text-violet-400" />
          <span>Record Loan Repayment</span>
        </h3>
        <p className="text-xs text-zinc-400 mt-1">
          Counterparty: <strong className="text-white">{loan.personName}</strong> ({isGiven ? 'Given / Lent' : 'Taken / Borrowed'})
        </p>

        {/* Current status */}
        <div className="mt-4 p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Total Principal:</span>
            <span className="font-mono text-white">{formatCurrency(loan.principalAmount, currency)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Already Repaid:</span>
            <span className="font-mono text-zinc-300">{formatCurrency(loan.paidAmount, currency)}</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-zinc-800 font-bold">
            <span className="text-zinc-300">Remaining Balance:</span>
            <span className={`font-mono text-sm ${isGiven ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatCurrency(loan.remainingAmount, currency)}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-mono text-zinc-300 uppercase">
                Repayment Amount
              </label>
              <button
                type="button"
                onClick={() => setRepaymentAmount(String(loan.remainingAmount))}
                className="text-[11px] text-violet-400 hover:text-violet-300 font-mono"
              >
                Pay Full ({formatCurrency(loan.remainingAmount, currency)})
              </button>
            </div>

            <input
              type="number"
              step="any"
              min="0.01"
              max={loan.remainingAmount}
              required
              placeholder="0.00"
              value={repaymentAmount}
              onChange={(e) => setRepaymentAmount(e.target.value)}
              className="w-full px-4 py-2.5 text-base font-bold font-mono rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 min-h-[44px]"
            />
          </div>

          {/* Sync with general cash ledger option */}
          <div
            onClick={() => setLogToLedger(!logToLedger)}
            className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 cursor-pointer flex items-start space-x-3 transition-colors min-h-[44px]"
          >
            <div className="mt-0.5 text-violet-400">
              {logToLedger ? <CheckSquare className="w-4 h-4 text-violet-400" /> : <Square className="w-4 h-4 text-zinc-600" />}
            </div>
            <div className="text-xs">
              <div className="font-semibold text-white">
                {isGiven ? 'Record as Income in Cash Ledger' : 'Record as Expense in Cash Ledger'}
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">
                {isGiven
                  ? 'Adds this repayment money into your active cash balance as income.'
                  : 'Deducts this repayment money from your active cash balance as an expense.'}
              </p>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={repayMutation.isPending}
              className="w-full min-h-[44px] rounded-xl bg-violet-600 hover:bg-violet-500 active:scale-[0.98] text-white font-medium text-sm flex items-center justify-center space-x-2 transition-all shadow-lg disabled:opacity-50"
            >
              <span>{repayMutation.isPending ? 'Logging Settlement...' : 'Confirm Repayment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
