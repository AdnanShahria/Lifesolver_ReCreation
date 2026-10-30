import React, { useState } from 'react';
import { X, ArrowDownLeft, ArrowUpRight, CheckSquare, Square, Info } from 'lucide-react';
import type { SavingsPot } from '../../types';
import { useDepositSavings, useWithdrawSavings, formatCurrency } from '../../hooks/useFinance';

interface SavingsActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  pot: SavingsPot | null;
  action: 'deposit' | 'withdraw';
  currency: string;
}

export const SavingsActionModal: React.FC<SavingsActionModalProps> = ({
  isOpen,
  onClose,
  pot,
  action,
  currency
}) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [logToLedger, setLogToLedger] = useState(true);

  const depositMutation = useDepositSavings();
  const withdrawMutation = useWithdrawSavings();

  if (!isOpen || !pot) return null;

  const isDeposit = action === 'deposit';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (!isDeposit && numAmount > pot.currentAmount) {
      alert('Withdrawal amount cannot exceed available pot balance');
      return;
    }

    if (isDeposit) {
      await depositMutation.mutateAsync({
        id: pot.id,
        amount: numAmount,
        description: description.trim(),
        logToLedger
      });
    } else {
      await withdrawMutation.mutateAsync({
        id: pot.id,
        amount: numAmount,
        description: description.trim(),
        logToLedger
      });
    }

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

        <div className="flex items-center space-x-2">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
            isDeposit 
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
          }`}>
            {isDeposit ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              {isDeposit ? 'Deposit into Pot' : 'Withdraw from Pot'}
            </h3>
            <p className="text-xs text-zinc-400">
              Pot: <strong className="text-violet-400">{pot.name}</strong>
            </p>
          </div>
        </div>

        {/* Current status */}
        <div className="mt-4 p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs">
          <span className="text-zinc-400">Current Vault Balance:</span>
          <span className="font-mono font-bold text-white text-sm">
            {formatCurrency(pot.currentAmount, currency)}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-mono text-zinc-300 uppercase mb-1.5">
              {isDeposit ? 'Deposit Amount' : 'Withdrawal Amount'}
            </label>
            <input
              type="number"
              step="any"
              min="0.01"
              max={!isDeposit ? pot.currentAmount : undefined}
              required
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-2.5 text-base font-bold font-mono rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 min-h-[44px]"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-zinc-300 uppercase mb-1.5">
              Reason / Note (Optional)
            </label>
            <input
              type="text"
              placeholder={isDeposit ? 'e.g. Monthly salary savings allocation' : 'e.g. Unforeseen repair'}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 min-h-[44px]"
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
                {isDeposit ? 'Record as Expense in Cash Ledger' : 'Record as Income in Cash Ledger'}
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">
                {isDeposit
                  ? 'Deducts this amount from your operational cash balance to fund this pot.'
                  : 'Injects this amount back into your liquid everyday wallet.'}
              </p>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={depositMutation.isPending || withdrawMutation.isPending}
              className={`w-full min-h-[44px] rounded-xl font-medium text-sm flex items-center justify-center space-x-2 transition-all shadow-lg text-white disabled:opacity-50 ${
                isDeposit 
                  ? 'bg-emerald-600 hover:bg-emerald-500' 
                  : 'bg-rose-600 hover:bg-rose-500'
              }`}
            >
              <span>
                {depositMutation.isPending || withdrawMutation.isPending
                  ? 'Processing Transfer...'
                  : isDeposit ? 'Confirm Deposit' : 'Confirm Withdrawal'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
