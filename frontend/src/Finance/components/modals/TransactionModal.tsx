import React, { useState, useEffect } from 'react';
import { 
  X, 
  ArrowDownLeft, 
  ArrowUpRight, 
  DollarSign, 
  Calendar, 
  Tag, 
  FileText, 
  Landmark, 
  Wallet,
  Building2,
  CreditCard,
  Banknote,
  Smartphone,
  User,
  Sparkles
} from 'lucide-react';
import { useCreateTransaction, useAccounts, DEFAULT_ACCOUNTS } from '../../hooks/useFinance';
import { getCategoryStyle } from '../LedgerTable';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: 'income' | 'expense';
  defaultIsSpecial?: number;
}

const DEFAULT_CATEGORIES = [
  'Shopping',
  'Food & Dining',
  'Snacks & Coffee',
  'Beauty & Health',
  'Pets',
  'Home & Rent',
  'Utilities & Bills',
  'Travel & Transport',
  'Entertainment',
  'Investments',
  'Salary / Wages',
  'Freelance / Client',
  'Gift',
  'Donate & Charity',
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
  const [category, setCategory] = useState(DEFAULT_CATEGORIES[0]);
  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [accountId, setAccountId] = useState('');
  const [payee, setPayee] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [isSpecial, setIsSpecial] = useState<number>(defaultIsSpecial);

  // Accounts query
  const { data: accountsData } = useAccounts();
  const accounts = accountsData?.accounts && accountsData.accounts.length > 0 
    ? accountsData.accounts 
    : DEFAULT_ACCOUNTS;

  // Initialize selected account
  useEffect(() => {
    if (!accountId && accounts.length > 0) {
      setAccountId(accounts[0].id);
    }
  }, [accounts, accountId]);

  // Sync default type when opened
  useEffect(() => {
    if (isOpen) {
      setType(defaultType);
      setIsSpecial(defaultIsSpecial);
    }
  }, [isOpen, defaultType, defaultIsSpecial]);

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
    const selectedAccount = accounts.find((a) => a.id === accountId);

    await createMutation.mutateAsync({
      type,
      amount: numAmount,
      category: finalCategory,
      description: description.trim() || undefined,
      payee: payee.trim() || undefined,
      accountId: accountId || undefined,
      accountName: selectedAccount?.name || undefined,
      date,
      isSpecial
    });

    onClose();
  };

  const selectedCategoryStyle = getCategoryStyle(isCustomCategory ? customCategory : category);
  const CategoryIcon = selectedCategoryStyle.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="apple-glass rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 w-full max-w-md p-6 sm:p-7 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 min-h-[40px] min-w-[40px] flex items-center justify-center text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">
            Log Financial Transaction
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Record cash movement with account and category tags
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Flow Type Toggle (Income / Expense) */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setType('income')}
              className={`min-h-[42px] rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all ${
                type === 'income' 
                  ? 'bg-emerald-600 text-white shadow-md' 
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>Income</span>
            </button>

            <button
              type="button"
              onClick={() => setType('expense')}
              className={`min-h-[42px] rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all ${
                type === 'expense' 
                  ? 'bg-rose-600 text-white shadow-md' 
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Expense</span>
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1.5">
              Amount
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                min="0.01"
                required
                autoFocus
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-2.5 text-xl font-bold font-mono rounded-xl bg-zinc-100/80 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-violet-500 min-h-[46px]"
              />
            </div>
          </div>

          {/* Account Selector Dropdown */}
          <div>
            <label className="block text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1.5 flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <Wallet className="w-3.5 h-3.5 text-violet-500" />
                <span>Account / Wallet</span>
              </span>
              <span className="text-[10px] text-zinc-400 font-sans">bKash, PayPal, Bank, Cash</span>
            </label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-zinc-100/80 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:border-violet-500 min-h-[44px]"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.currency} {acc.currentBalance.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          {/* Category Selector with Pastel Badge Preview */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300 uppercase flex items-center space-x-1.5">
                <Tag className="w-3.5 h-3.5 text-violet-500" />
                <span>Category</span>
              </label>
              <button
                type="button"
                onClick={() => setIsCustomCategory(!isCustomCategory)}
                className="text-[11px] font-semibold text-violet-600 dark:text-violet-400 hover:underline"
              >
                {isCustomCategory ? 'Select from standard' : '+ Custom Category'}
              </button>
            </div>

            <div className="flex items-center space-x-2">
              {/* Pastel Preview Circle */}
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${selectedCategoryStyle.lightBg} ${selectedCategoryStyle.darkBg}`}
                title="Category Badge Preview"
              >
                <CategoryIcon className="w-4 h-4" />
              </div>

              {isCustomCategory ? (
                <input
                  type="text"
                  placeholder="Enter custom category name..."
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-zinc-100/80 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-violet-500 min-h-[44px]"
                />
              ) : (
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-zinc-100/80 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:border-violet-500 min-h-[44px]"
                >
                  {DEFAULT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Payee / Merchant Input */}
          <div>
            <label className="block text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1.5 flex items-center space-x-1.5">
              <User className="w-3.5 h-3.5 text-zinc-400" />
              <span>Payee / Merchant (Optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Unimart, Starbucks, Steam, Landlord..."
              value={payee}
              onChange={(e) => setPayee(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-zinc-100/80 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-violet-500 min-h-[44px]"
            />
          </div>

          {/* Notes / Description */}
          <div>
            <label className="block text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1.5 flex items-center space-x-1.5">
              <FileText className="w-3.5 h-3.5 text-zinc-400" />
              <span>Notes / Description (Optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Weekly supermarket groceries, monthly subscription..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-zinc-100/80 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-violet-500 min-h-[44px]"
            />
          </div>

          {/* Date & Ledger Vault Split */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1.5 flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                <span>Date</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-zinc-100/80 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:border-violet-500 min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1.5 flex items-center space-x-1.5">
                <Landmark className="w-3.5 h-3.5 text-zinc-400" />
                <span>Ledger Vault</span>
              </label>
              <select
                value={isSpecial}
                onChange={(e) => setIsSpecial(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-100/80 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:border-violet-500 min-h-[44px]"
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
              className="w-full min-h-[46px] rounded-xl bg-violet-600 hover:bg-violet-500 active:scale-[0.98] text-white font-bold text-sm flex items-center justify-center space-x-2 transition-all shadow-lg shadow-violet-500/20 disabled:opacity-50"
            >
              <span>{createMutation.isPending ? 'Recording Transaction...' : 'Record Transaction'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
