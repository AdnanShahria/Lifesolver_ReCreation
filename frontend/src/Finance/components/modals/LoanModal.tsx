import React, { useState } from 'react';
import { X, HandCoins, ArrowDownLeft, ArrowUpRight, User, Phone, Calendar } from 'lucide-react';
import { useCreateLoan } from '../../hooks/useFinance';

interface LoanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoanModal: React.FC<LoanModalProps> = ({ isOpen, onClose }) => {
  const [type, setType] = useState<'given' | 'taken'>('given');
  const [personName, setPersonName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [principalAmount, setPrincipalAmount] = useState('');
  const [interestRate, setInterestRate] = useState('0');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

  const createMutation = useCreateLoan();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(principalAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter a valid loan principal amount');
      return;
    }

    await createMutation.mutateAsync({
      type,
      personName: personName.trim(),
      contactInfo: contactInfo.trim() || null,
      principalAmount: numAmount,
      interestRate: parseFloat(interestRate) || 0,
      dueDate: dueDate || null,
      notes: notes.trim() || null
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
          <span>Record Loan / Debt Contract</span>
        </h3>
        <p className="text-xs text-zinc-400 mt-1">
          Isolated ledger tracking. Does not alter your primary operational cash balance.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Given vs Taken Switch */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-900 rounded-2xl border border-zinc-800">
            <button
              type="button"
              onClick={() => setType('given')}
              className={`min-h-[44px] rounded-xl font-semibold text-xs flex items-center justify-center space-x-2 transition-all ${
                type === 'given' 
                  ? 'bg-emerald-600 text-white shadow-md' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>Given (I Lent Out)</span>
            </button>

            <button
              type="button"
              onClick={() => setType('taken')}
              className={`min-h-[44px] rounded-xl font-semibold text-xs flex items-center justify-center space-x-2 transition-all ${
                type === 'taken' 
                  ? 'bg-rose-600 text-white shadow-md' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Taken (I Borrowed)</span>
            </button>
          </div>

          <div>
            <label className="block text-xs font-mono text-zinc-300 uppercase mb-1.5">
              {type === 'given' ? 'Borrower Person Name' : 'Lender Person Name'}
            </label>
            <input
              type="text"
              required
              placeholder="e.g. David Miller, Sarah Lin"
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 min-h-[44px]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-zinc-300 uppercase mb-1.5">
                Principal Amount
              </label>
              <input
                type="number"
                step="any"
                min="1"
                required
                placeholder="1000.00"
                value={principalAmount}
                onChange={(e) => setPrincipalAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 text-base font-bold font-mono rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-300 uppercase mb-1.5">
                Contact Phone / Email
              </label>
              <input
                type="text"
                placeholder="+1 555-0192"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 min-h-[44px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-zinc-300 uppercase mb-1.5">
              Settlement Due Date (Optional)
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-violet-500 min-h-[44px]"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-zinc-300 uppercase mb-1.5">
              Agreement Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Friendly zero-interest loan for laptop emergency"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 min-h-[44px]"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full min-h-[44px] rounded-xl bg-violet-600 hover:bg-violet-500 active:scale-[0.98] text-white font-medium text-sm flex items-center justify-center space-x-2 transition-all shadow-lg disabled:opacity-50"
            >
              <span>{createMutation.isPending ? 'Logging Contract...' : 'Create Loan Record'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
