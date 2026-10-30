import React, { useState } from 'react';
import { X, CreditCard, Calendar, Zap } from 'lucide-react';
import { useCreateBill } from '../../hooks/useFinance';

interface BillModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BillModal: React.FC<BillModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Subscriptions & Software');
  const [recurrencePeriod, setRecurrencePeriod] = useState<'monthly' | 'yearly' | 'weekly'>('monthly');
  const [dueDate, setDueDate] = useState('');
  const [autoPay, setAutoPay] = useState(false);

  const createMutation = useCreateBill();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter a valid bill amount');
      return;
    }
    if (!dueDate) {
      alert('Please select a due date');
      return;
    }

    await createMutation.mutateAsync({
      name: name.trim(),
      amount: numAmount,
      category: category.trim(),
      recurrencePeriod,
      dueDate,
      autoPay
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
          <CreditCard className="w-5 h-5 text-violet-400" />
          <span>Add Recurring Bill or Subscription</span>
        </h3>
        <p className="text-xs text-zinc-400 mt-1">
          Automated renewal monitoring and expense auto-logging on payment.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-mono text-zinc-300 uppercase mb-1.5">
              Service / Bill Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Netflix, Spotify, Gym Membership"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 min-h-[44px]"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-zinc-300 uppercase mb-1.5">
              Billing Amount
            </label>
            <input
              type="number"
              step="any"
              min="0.01"
              required
              placeholder="14.99"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3.5 py-2.5 text-base font-bold font-mono rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 min-h-[44px]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-zinc-300 uppercase mb-1.5">
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-violet-500 min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-300 uppercase mb-1.5">
                Cycle
              </label>
              <select
                value={recurrencePeriod}
                onChange={(e) => setRecurrencePeriod(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-violet-500 min-h-[44px]"
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-zinc-300 uppercase mb-1.5">
              Next Due Date
            </label>
            <input
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-violet-500 min-h-[44px]"
            />
          </div>

          {/* Auto-pay checkbox */}
          <div className="flex items-center space-x-2 pt-1">
            <input
              type="checkbox"
              id="autopay-check"
              checked={autoPay}
              onChange={(e) => setAutoPay(e.target.checked)}
              className="w-4 h-4 rounded text-violet-600 bg-zinc-900 border-zinc-700 focus:ring-violet-500"
            />
            <label htmlFor="autopay-check" className="text-xs text-zinc-300 cursor-pointer select-none">
              Card is configured for Automatic Renewal (Auto-Pay)
            </label>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full min-h-[44px] rounded-xl bg-violet-600 hover:bg-violet-500 active:scale-[0.98] text-white font-medium text-sm flex items-center justify-center space-x-2 transition-all shadow-lg disabled:opacity-50"
            >
              <span>{createMutation.isPending ? 'Registering...' : 'Save Subscription'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
