import React, { useState } from 'react';
import { X, PiggyBank } from 'lucide-react';
import { useCreateSavingsPot } from '../../hooks/useFinance';

interface SavingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SavingsModal: React.FC<SavingsModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [category, setCategory] = useState('Emergency Fund');
  const [deadlineDate, setDeadlineDate] = useState('');
  const [isSpecial, setIsSpecial] = useState(0);

  const createMutation = useCreateSavingsPot();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(targetAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter a valid target amount');
      return;
    }

    await createMutation.mutateAsync({
      name: name.trim(),
      targetAmount: numAmount,
      category: category.trim(),
      deadlineDate: deadlineDate || null,
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

        <h3 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
          <PiggyBank className="w-5 h-5 text-violet-400" />
          <span>Create Dedicated Savings Pot</span>
        </h3>
        <p className="text-xs text-zinc-400 mt-1">
          Isolate cash toward an objective without mixing into daily operating expenses.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-mono text-zinc-300 uppercase mb-1.5">
              Goal / Pot Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 6-Month Emergency Runway"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 min-h-[44px]"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-zinc-300 uppercase mb-1.5">
              Target Financial Goal
            </label>
            <input
              type="number"
              step="any"
              min="1"
              required
              placeholder="10000.00"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              className="w-full px-3.5 py-2.5 text-base font-bold font-mono rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 min-h-[44px]"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-zinc-300 uppercase mb-1.5">
              Category / Purpose
            </label>
            <input
              type="text"
              placeholder="e.g. Emergency, Travel, Hardware"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 min-h-[44px]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-zinc-300 uppercase mb-1.5">
                Target Date (Optional)
              </label>
              <input
                type="date"
                value={deadlineDate}
                onChange={(e) => setDeadlineDate(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-violet-500 min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-300 uppercase mb-1.5">
                Vault Type
              </label>
              <select
                value={isSpecial}
                onChange={(e) => setIsSpecial(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-violet-500 min-h-[44px]"
              >
                <option value={0}>Liquid Reserve (Regular)</option>
                <option value={1}>Capital Vault (Special)</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full min-h-[44px] rounded-xl bg-violet-600 hover:bg-violet-500 active:scale-[0.98] text-white font-medium text-sm flex items-center justify-center space-x-2 transition-all shadow-lg disabled:opacity-50"
            >
              <span>{createMutation.isPending ? 'Creating Vault...' : 'Initialize Savings Pot'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
