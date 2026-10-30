import React, { useState, useMemo } from 'react';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Trash2, 
  Search, 
  Filter, 
  Plus, 
  Calendar,
  Layers,
  Sparkles,
  Tag,
  ShoppingBag,
  Utensils,
  Coffee,
  Heart,
  TrendingUp,
  Gift,
  HeartHandshake,
  Home,
  Tv,
  Zap,
  Plane,
  Briefcase,
  DollarSign,
  HelpCircle,
  Smartphone,
  CreditCard,
  Landmark,
  Banknote,
  Building2,
  Wallet
} from 'lucide-react';
import type { Transaction, FinancialAccount } from '../types';
import { formatCurrency, useDeleteTransaction, useAccounts } from '../hooks/useFinance';

interface LedgerTableProps {
  transactions: Transaction[];
  isLoading: boolean;
  currency: string;
  isSpecialMode?: boolean;
  onOpenCreateModal: () => void;
}

// ── Category Icon & Pastel Palette Mapping ──────────────────────────
export interface CategoryStyle {
  icon: React.ComponentType<{ className?: string }>;
  lightBg: string;
  darkBg: string;
  color: string;
}

export function getCategoryStyle(categoryName: string): CategoryStyle {
  const cat = (categoryName || '').toLowerCase().trim();

  // Shopping & Hardware
  if (cat.includes('shop') || cat.includes('store') || cat.includes('cloth') || cat.includes('mall') || cat.includes('beauty')) {
    return {
      icon: ShoppingBag,
      lightBg: 'bg-rose-100 text-rose-600 border-rose-200/80',
      darkBg: 'dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30',
      color: '#f43f5e'
    };
  }

  // Food & Dining & Groceries
  if (cat.includes('food') || cat.includes('dine') || cat.includes('dining') || cat.includes('grocer') || cat.includes('restaurant') || cat.includes('supermarket')) {
    return {
      icon: Utensils,
      lightBg: 'bg-orange-100 text-orange-600 border-orange-200/80',
      darkBg: 'dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-500/30',
      color: '#f97316'
    };
  }

  // Snacks & Coffee
  if (cat.includes('snack') || cat.includes('coffee') || cat.includes('cafe') || cat.includes('tea') || cat.includes('drink')) {
    return {
      icon: Coffee,
      lightBg: 'bg-amber-100 text-amber-700 border-amber-200/80',
      darkBg: 'dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30',
      color: '#f59e0b'
    };
  }

  // Pets & Animals
  if (cat.includes('pet') || cat.includes('dog') || cat.includes('cat') || cat.includes('vet')) {
    return {
      icon: Heart,
      lightBg: 'bg-yellow-100 text-yellow-700 border-yellow-200/80',
      darkBg: 'dark:bg-yellow-500/20 dark:text-yellow-300 dark:border-yellow-500/30',
      color: '#eab308'
    };
  }

  // Investments & Dividends & Capital
  if (cat.includes('invest') || cat.includes('dividend') || cat.includes('stock') || cat.includes('crypto') || cat.includes('asset') || cat.includes('capital')) {
    return {
      icon: TrendingUp,
      lightBg: 'bg-emerald-100 text-emerald-700 border-emerald-200/80',
      darkBg: 'dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30',
      color: '#10b981'
    };
  }

  // Gift & Celebrations
  if (cat.includes('gift') || cat.includes('present') || cat.includes('birthday')) {
    return {
      icon: Gift,
      lightBg: 'bg-pink-100 text-pink-600 border-pink-200/80',
      darkBg: 'dark:bg-pink-500/20 dark:text-pink-300 dark:border-pink-500/30',
      color: '#ec4899'
    };
  }

  // Donate & Charity
  if (cat.includes('donate') || cat.includes('charity') || cat.includes('zakat') || cat.includes('help')) {
    return {
      icon: HeartHandshake,
      lightBg: 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200/80',
      darkBg: 'dark:bg-fuchsia-500/20 dark:text-fuchsia-300 dark:border-fuchsia-500/30',
      color: '#d946ef'
    };
  }

  // Home & Rent & Living
  if (cat.includes('home') || cat.includes('rent') || cat.includes('house') || cat.includes('living') || cat.includes('mortgage')) {
    return {
      icon: Home,
      lightBg: 'bg-blue-100 text-blue-600 border-blue-200/80',
      darkBg: 'dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30',
      color: '#3b82f6'
    };
  }

  // Entertainment & Movies & Games & Streaming
  if (cat.includes('entertain') || cat.includes('movie') || cat.includes('stream') || cat.includes('game') || cat.includes('fun')) {
    return {
      icon: Tv,
      lightBg: 'bg-purple-100 text-purple-600 border-purple-200/80',
      darkBg: 'dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/30',
      color: '#8b5cf6'
    };
  }

  // Utilities & Bills & Electricity
  if (cat.includes('util') || cat.includes('elect') || cat.includes('water') || cat.includes('gas') || cat.includes('bill') || cat.includes('internet')) {
    return {
      icon: Zap,
      lightBg: 'bg-cyan-100 text-cyan-700 border-cyan-200/80',
      darkBg: 'dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-500/30',
      color: '#06b6d4'
    };
  }

  // Travel & Transport & Fuel
  if (cat.includes('travel') || cat.includes('trans') || cat.includes('flight') || cat.includes('uber') || cat.includes('taxi') || cat.includes('fuel') || cat.includes('car')) {
    return {
      icon: Plane,
      lightBg: 'bg-indigo-100 text-indigo-600 border-indigo-200/80',
      darkBg: 'dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/30',
      color: '#6366f1'
    };
  }

  // Freelance & Client Work
  if (cat.includes('free') || cat.includes('client') || cat.includes('project') || cat.includes('contract')) {
    return {
      icon: Briefcase,
      lightBg: 'bg-teal-100 text-teal-700 border-teal-200/80',
      darkBg: 'dark:bg-teal-500/20 dark:text-teal-300 dark:border-teal-500/30',
      color: '#14b8a6'
    };
  }

  // Salary & Wages
  if (cat.includes('salar') || cat.includes('wage') || cat.includes('payroll') || cat.includes('job')) {
    return {
      icon: DollarSign,
      lightBg: 'bg-emerald-100 text-emerald-700 border-emerald-200/80',
      darkBg: 'dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30',
      color: '#10b981'
    };
  }

  // Miscellaneous / Default fallback
  return {
    icon: Tag,
    lightBg: 'bg-zinc-100 text-zinc-600 border-zinc-200',
    darkBg: 'dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700',
    color: '#a1a1aa'
  };
}

// ── Account Chip Badge Helper ──────────────────────────────────────
function getAccountChipStyle(accountName?: string | null) {
  const name = (accountName || '').toLowerCase().trim();

  if (name.includes('bkash')) {
    return {
      label: accountName || 'bKash',
      badgeClass: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/20',
      icon: Smartphone
    };
  }
  if (name.includes('paypal')) {
    return {
      label: accountName || 'PayPal',
      badgeClass: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20',
      icon: CreditCard
    };
  }
  if (name.includes('cash')) {
    return {
      label: accountName || 'Cash',
      badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
      icon: Banknote
    };
  }
  if (name.includes('chase') || name.includes('bank') || name.includes('check') || name.includes('saving')) {
    return {
      label: accountName || 'Bank',
      badgeClass: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20',
      icon: Landmark
    };
  }

  return {
    label: accountName || 'Cash',
    badgeClass: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border border-zinc-500/20',
    icon: Wallet
  };
}

// ── Daily Date Formatter ('9/1 Thursday') ──────────────────────────
function formatDailyHeader(dateStr: string): string {
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      const dayOfWeek = d.toLocaleDateString('en-US', { weekday: 'long' });
      return `${month + 1}/${day} ${dayOfWeek}`;
    }
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()} ${d.toLocaleDateString('en-US', { weekday: 'long' })}`;
  } catch {
    return dateStr;
  }
}

export const LedgerTable: React.FC<LedgerTableProps> = ({
  transactions,
  isLoading,
  currency,
  isSpecialMode = false,
  onOpenCreateModal
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [accountFilter, setAccountFilter] = useState<string>('all');

  const deleteTransactionMutation = useDeleteTransaction();
  const { data: accountsData } = useAccounts();
  const accounts = accountsData?.accounts ?? [];

  // Map of accountId to account
  const accountMap = useMemo(() => {
    const map = new Map<string, FinancialAccount>();
    accounts.forEach((acc) => map.set(acc.id, acc));
    return map;
  }, [accounts]);

  // Extract unique categories for filter
  const categories = useMemo(() => {
    return Array.from(new Set(transactions.map((t) => t.category))).filter(Boolean);
  }, [transactions]);

  // Filtered transactions
  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      const accName = tx.accountName || (tx.accountId ? accountMap.get(tx.accountId)?.name : '') || '';
      const matchesSearch =
        tx.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tx.description && tx.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (tx.payee && tx.payee.toLowerCase().includes(searchTerm.toLowerCase())) ||
        accName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = typeFilter === 'all' || tx.type === typeFilter;
      const matchesCategory = categoryFilter === 'all' || tx.category === categoryFilter;
      const matchesAccount = accountFilter === 'all' || tx.accountId === accountFilter || accName === accountFilter;

      return matchesSearch && matchesType && matchesCategory && matchesAccount;
    });
  }, [transactions, searchTerm, typeFilter, categoryFilter, accountFilter, accountMap]);

  // Daily grouped transactions: Map<dateString, { date: string, income: number, expense: number, items: Transaction[] }>
  const dailyGroups = useMemo(() => {
    const map = new Map<string, { date: string; income: number; expense: number; items: Transaction[] }>();

    filtered.forEach((tx) => {
      const dateKey = tx.date || new Date(tx.createdAt).toISOString().slice(0, 10);
      if (!map.has(dateKey)) {
        map.set(dateKey, {
          date: dateKey,
          income: 0,
          expense: 0,
          items: []
        });
      }
      const group = map.get(dateKey)!;
      group.items.push(tx);
      if (tx.type === 'income') {
        group.income += tx.amount;
      } else {
        group.expense += tx.amount;
      }
    });

    // Sort descending by date
    return Array.from(map.values()).sort((a, b) => b.date.localeCompare(a.date));
  }, [filtered]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this transaction record?')) {
      await deleteTransactionMutation.mutateAsync(id);
    }
  };

  return (
    <div className="space-y-4">
      {/* ── Toolbar: Search, Filters & Action ── */}
      <div className="apple-glass rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-sm">
        <div className="flex-1 flex flex-wrap items-center gap-2">
          {/* Search bar */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search category, payee, account, notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl bg-zinc-100/80 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-violet-500 min-h-[44px]"
            />
          </div>

          {/* Type Filter Pills */}
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-950/90 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all min-h-[36px] ${
                typeFilter === 'all'
                  ? 'bg-violet-600 text-white shadow'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setTypeFilter('income')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all min-h-[36px] ${
                typeFilter === 'income'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              Income
            </button>
            <button
              onClick={() => setTypeFilter('expense')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all min-h-[36px] ${
                typeFilter === 'expense'
                  ? 'bg-rose-600 text-white shadow'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              Expense
            </button>
          </div>

          {/* Category Dropdown */}
          {categories.length > 0 && (
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-zinc-100/80 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-800 dark:text-zinc-300 focus:outline-none focus:border-violet-500 min-h-[44px]"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}

          {/* Account Dropdown */}
          {accounts.length > 0 && (
            <select
              value={accountFilter}
              onChange={(e) => setAccountFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-zinc-100/80 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-800 dark:text-zinc-300 focus:outline-none focus:border-violet-500 min-h-[44px]"
            >
              <option value="all">All Accounts</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Add Entry Button */}
        <button
          onClick={onOpenCreateModal}
          className="min-h-[44px] px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 active:scale-[0.98] text-white text-xs sm:text-sm font-semibold flex items-center justify-center space-x-2 transition-all shadow-md shadow-violet-500/20 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{isSpecialMode ? 'Add Capital Vault Entry' : 'Add Transaction'}</span>
        </button>
      </div>

      {/* ── Daily Grouped Stream ── */}
      {isLoading ? (
        <div className="apple-glass rounded-2xl p-12 text-center text-zinc-500 text-xs border border-zinc-200 dark:border-zinc-800">
          Loading daily financial ledger...
        </div>
      ) : dailyGroups.length === 0 ? (
        <div className="apple-glass rounded-2xl p-12 text-center border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center mx-auto text-zinc-400">
            <Layers className="w-6 h-6 text-violet-500" />
          </div>
          <div className="text-sm font-semibold text-zinc-900 dark:text-white">No transactions recorded</div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
            {searchTerm || typeFilter !== 'all' || categoryFilter !== 'all'
              ? 'No transactions matched your current search filters.'
              : isSpecialMode 
                ? 'Your capital investment vault is empty. Log high-ticket capital expenditures or asset buys here.'
                : 'Start tracking your daily operational cashflow by logging your first income or expense.'}
          </p>
          <button
            onClick={onOpenCreateModal}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-violet-600/10 hover:bg-violet-600/20 text-violet-700 dark:text-violet-300 border border-violet-500/30 text-xs font-medium inline-flex items-center space-x-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Entry</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {dailyGroups.map((group) => {
            const formattedHeader = formatDailyHeader(group.date);

            return (
              <div 
                key={group.date}
                className="apple-glass rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white/70 dark:bg-zinc-900/70 shadow-sm"
              >
                {/* ── Sticky Daily Header ('9/1 Thursday | Expenses: -622.00 | Income: 5500.00') ── */}
                <div className="sticky top-0 z-10 px-4 sm:px-5 py-2.5 bg-zinc-100/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2 text-xs sm:text-sm font-bold text-zinc-900 dark:text-white tracking-tight">
                    <Calendar className="w-3.5 h-3.5 text-violet-500 shrink-0" />
                    <span>{formattedHeader}</span>
                  </div>

                  {/* Daily Net Totals Header */}
                  <div className="flex items-center space-x-3 text-xs font-mono">
                    {group.expense > 0 && (
                      <div className="flex items-center space-x-1">
                        <span className="text-zinc-500 dark:text-zinc-400 text-[11px] font-sans">Expenses:</span>
                        <span className="text-rose-600 dark:text-rose-400 font-bold">
                          -{formatCurrency(group.expense, currency)}
                        </span>
                      </div>
                    )}

                    {group.income > 0 && group.expense > 0 && (
                      <span className="text-zinc-300 dark:text-zinc-700">|</span>
                    )}

                    {group.income > 0 && (
                      <div className="flex items-center space-x-1">
                        <span className="text-zinc-500 dark:text-zinc-400 text-[11px] font-sans">Income:</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                          +{formatCurrency(group.income, currency)}
                        </span>
                      </div>
                    )}

                    {group.expense === 0 && group.income === 0 && (
                      <span className="text-zinc-400 dark:text-zinc-500 text-[11px]">Net: $0.00</span>
                    )}
                  </div>
                </div>

                {/* ── Daily Transactions List ── */}
                <div className="divide-y divide-zinc-200/70 dark:divide-zinc-800/60">
                  {group.items.map((tx) => {
                    const isIncome = tx.type === 'income';
                    const categoryStyle = getCategoryStyle(tx.category);
                    const CategoryIcon = categoryStyle.icon;

                    // Resolve account name & chip style
                    const accountName = tx.accountName || (tx.accountId ? accountMap.get(tx.accountId)?.name : null) || 'Cash';
                    const accountChip = getAccountChipStyle(accountName);
                    const AccountIcon = accountChip.icon;

                    return (
                      <div
                        key={tx.id}
                        className="px-4 sm:px-5 py-3 sm:py-3.5 flex items-center justify-between gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors group"
                      >
                        {/* Left: Pastel Circular Category Badge & Details */}
                        <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
                          {/* Colorful Circular Pastel Category Icon Badge */}
                          <div 
                            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center shrink-0 border shadow-sm transition-transform group-hover:scale-105 ${categoryStyle.lightBg} ${categoryStyle.darkBg}`}
                            title={tx.category}
                          >
                            <CategoryIcon className="w-5 h-5 sm:w-5 sm:h-5" />
                          </div>

                          {/* Labels: Primary (Category / Payee) + Subline (Account Badge + Note) */}
                          <div className="min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-white truncate">
                                {tx.payee || tx.category}
                              </span>

                              {tx.payee && tx.category && (
                                <span className="hidden sm:inline-block text-[11px] text-zinc-500 dark:text-zinc-400">
                                  ({tx.category})
                                </span>
                              )}

                              {tx.isSpecial === 1 && (
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                                  Capital
                                </span>
                              )}
                            </div>

                            {/* Subline: Account Chip Badge + Description / Note */}
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1">
                              {/* Account Badge Pill Chip */}
                              <span 
                                className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-tight ${accountChip.badgeClass}`}
                                title={`Account: ${accountChip.label}`}
                              >
                                <AccountIcon className="w-3 h-3" />
                                <span>{accountChip.label}</span>
                              </span>

                              {tx.description && (
                                <>
                                  <span className="text-zinc-300 dark:text-zinc-700 hidden sm:inline">·</span>
                                  <span className="text-[11px] text-zinc-600 dark:text-zinc-400 truncate max-w-[180px] sm:max-w-md">
                                    {tx.description}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right: Clean, Signed Amount & Quick Actions */}
                        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
                          <div className={`font-mono text-sm sm:text-base font-bold tracking-tight ${
                            isIncome 
                              ? 'text-emerald-600 dark:text-emerald-400' 
                              : 'text-rose-600 dark:text-rose-400'
                          }`}>
                            {isIncome ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                          </div>

                          {/* Delete Trigger */}
                          <button
                            onClick={(e) => handleDelete(tx.id, e)}
                            title="Delete transaction"
                            className="min-h-[36px] min-w-[36px] flex items-center justify-center text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors opacity-70 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
