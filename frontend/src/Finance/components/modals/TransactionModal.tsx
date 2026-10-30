import React, { useState } from 'react';
import { X, ArrowDownLeft, ArrowUpRight, DollarSign, Calendar, Tag, FileText, Landmark } from 'lucide-react';
import { useCreateTransaction } from '../../hooks/useFinance';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: 'income' | 'expense';
  defaultIsSpecial?: number;
}

const DEFAULT_CATEGORIES = [
  'Salary / Wages',
  'Client Work / Freelance',
  'Investments / Dividends',
  'Groceries / Supermarket',
  'Dining & Restaurants',
  'Housing & Rent',
  'Tech & Software (SaaS)',
  'Transport & Fuel',
  'Health & Medical',
  'Gym & Fitness',
  'Shopping & Hardware',
  'Travel & Flight',
  'Entertainment',
  'Gifts & Donations',
  'Miscellaneous'
];

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'expense',
  defaultIsSpecial = 0
}) => {
  const [type, setType] = useState<'income' | 'expense'>(defaultType);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(DEFAULT_CATEGORIES[3]);
  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [isSpecial, setIsSpecial] = useState<number>(defaultIsSpecial);

  const createMutation = useCreateTransaction();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter a valid amount greater than zero');
      return;
    }

    const finalCategory = isCustomCategory ? (customCategory.trim() || 'General') : category;

    await createMutation.mutateAsync({
      type,
      amount: numAmount,
      category: finalCategory,
      description: description.trim(),
      date,
      isSpecial
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

        <h3 className="text-xl font-bold text-white tracking-tight">
          Log Financial Transaction
        </h3>
        <p className="text-xs text-zinc-400 mt-1">
          Record cash movement into the Cloudflare D1 ledger.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Flow Type Selector */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-900 rounded-2xl border border-zinc-800">
            <button
              type="button"
              onClick={() => setType('income')}
              className={`min-h-[44px] rounded-xl font-semibold text-xs flex items-center justify-center space-x-2 transition-all ${
                type === 'income' 
                  ? 'bg-emerald-600 text-white shadow-md' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>Income</span>
            </button>

            <button
              type="button"
              onClick={() => setType('expense')}
              className={`min-h-[44px] rounded-xl font-semibold text-xs flex items-center justify-center space-x-2 transition-all ${
                type === 'expense' 
                  ? 'bg-rose-600 text-white shadow-md' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Expense</span>
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-mono text-zinc-300 uppercase mb-1.5">
              Amount
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                min="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-4 pr-4 py-2.5 text-lg font-bold font-mono rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 min-h-[44px]"
              />
            </div>
          </div>

          {/* Category Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-mono text-zinc-300 uppercase">
                Category
              </label>
              <button
                type="button"
                onClick={() => setIsCustomCategory(!isCustomCategory)}
                className="text-[11px] text-violet-400 hover:text-violet-300"
              >
                {isCustomCategory ? 'Choose from list' : '+ Custom Category'}
              </button>
            </div>

            {isCustomCategory ? (
              <input
                type="text"
                placeholder="Enter custom category name..."
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 min-h-[44px]"
              />
            ) : (
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-violet-500 min-h-[44px]"
              >
                {DEFAULT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-mono text-zinc-300 uppercase mb-1.5">
              Description / Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Weekly supermarket run, Domain renewal, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 min-h-[44px]"
            />
          </div>

          {/* Date & Ledger Type Split */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-zinc-300 uppercase mb-1.5">
                Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-violet-500 min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-300 uppercase mb-1.5">
                Ledger Vault
              </label>
              <select
                value={isSpecial}
                onChange={(e) => setIsSpecial(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-violet-500 min-h-[44px]"
              >
                <option value={0}>Everyday Cash (Regular)</option>
                <option value={1}>Capital Vault (Special)</option>
              </select>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full min-h-[44px] rounded-xl bg-violet-600 hover:bg-violet-500 active:scale-[0.98] text-white font-medium text-sm flex items-center justify-center space-x-2 transition-all shadow-lg disabled:opacity-50"
            >
              <span>{createMutation.isPending ? 'Committing to D1...' : 'Record Transaction'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
