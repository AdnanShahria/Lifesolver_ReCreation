import React, { useState } from 'react';
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
  Tag
} from 'lucide-react';
import type { Transaction } from '../types';
import { formatCurrency, useDeleteTransaction } from '../hooks/useFinance';

interface LedgerTableProps {
  transactions: Transaction[];
  isLoading: boolean;
  currency: string;
  isSpecialMode?: boolean;
  onOpenCreateModal: () => void;
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

  const deleteTransactionMutation = useDeleteTransaction();

  // Extract unique categories
  const categories = Array.from(new Set(transactions.map((t) => t.category))).filter(Boolean);

  // Filtered transactions
  const filtered = transactions.filter((tx) => {
    const matchesSearch = 
      tx.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.description && tx.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === 'all' || tx.type === typeFilter;
    const matchesCategory = categoryFilter === 'all' || tx.category === categoryFilter;
    return matchesSearch && matchesType && matchesCategory;
  });

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this transaction record?')) {
      await deleteTransactionMutation.mutateAsync(id);
    }
  };

  return (
    <div className="space-y-4">
      {/* ── Toolbar: Search & Filters ── */}
      <div className="apple-glass rounded-2xl p-4 border border-zinc-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex-1 flex flex-wrap items-center gap-2">
          {/* Search bar */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by description or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl bg-zinc-900/90 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500/50 min-h-[44px]"
            />
          </div>

          {/* Type Filter Pills */}
          <div className="flex items-center bg-zinc-900/80 p-1 rounded-xl border border-zinc-800 text-xs">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all min-h-[36px] ${
                typeFilter === 'all' ? 'bg-violet-600 text-white shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setTypeFilter('income')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all min-h-[36px] ${
                typeFilter === 'income' ? 'bg-emerald-600 text-white shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Income
            </button>
            <button
              onClick={() => setTypeFilter('expense')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all min-h-[36px] ${
                typeFilter === 'expense' ? 'bg-rose-600 text-white shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Expense
            </button>
          </div>

          {/* Category Dropdown */}
          {categories.length > 0 && (
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs text-zinc-300 focus:outline-none focus:border-violet-500/50 min-h-[44px]"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Add Entry Button */}
        <button
          onClick={onOpenCreateModal}
          className="min-h-[44px] px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 active:scale-[0.98] text-white text-xs sm:text-sm font-medium flex items-center justify-center space-x-2 transition-all shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>{isSpecialMode ? 'Add Capital Entry' : 'Add Transaction'}</span>
        </button>
      </div>

      {/* ── Transaction Feed / Table ── */}
      {isLoading ? (
        <div className="apple-glass rounded-2xl p-12 text-center text-zinc-500 text-xs">
          Loading ledger stream...
        </div>
      ) : filtered.length === 0 ? (
        <div className="apple-glass rounded-2xl p-12 text-center border border-zinc-800/80 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
            <Layers className="w-6 h-6 text-violet-400" />
          </div>
          <div className="text-sm font-semibold text-white">No transactions recorded</div>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            {searchTerm || typeFilter !== 'all' || categoryFilter !== 'all'
              ? 'No transactions matched your current search filters.'
              : isSpecialMode 
                ? 'Your capital investment vault is empty. Log high-ticket capital expenditures or asset buys here.'
                : 'Start tracking your daily operational cashflow by logging your first income or expense.'}
          </p>
          <button
            onClick={onOpenCreateModal}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 text-xs font-medium inline-flex items-center space-x-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Entry</span>
          </button>
        </div>
      ) : (
        <div className="apple-glass rounded-2xl border border-zinc-800 overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/70 border-b border-zinc-800 text-zinc-400 font-mono uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Type / Flow</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filtered.map((tx) => {
                  const isIncome = tx.type === 'income';
                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-zinc-800/30 transition-colors group"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                            isIncome 
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' 
                              : 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                          }`}>
                            {isIncome ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                          </div>
                          <span className={`font-mono text-xs font-semibold uppercase ${
                            isIncome ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                            {tx.type}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-zinc-400 text-xs">
                        {tx.date}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-zinc-800/80 border border-zinc-700/60 text-zinc-300 font-medium text-[11px]">
                          <Tag className="w-3 h-3 text-violet-400" />
                          <span>{tx.category}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-zinc-200 text-xs max-w-xs truncate">
                        {tx.description || <span className="text-zinc-600 italic">No note provided</span>}
                      </td>

                      <td className={`py-3.5 px-4 text-right font-mono text-sm font-bold ${
                        isIncome ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {isIncome ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => handleDelete(tx.id, e)}
                          title="Delete entry"
                          className="min-h-[32px] min-w-[32px] p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors inline-flex items-center justify-center opacity-70 group-hover:opacity-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Feed View (Touch target >= 44px) */}
          <div className="md:hidden divide-y divide-zinc-800/70">
            {filtered.map((tx) => {
              const isIncome = tx.type === 'income';
              return (
                <div
                  key={tx.id}
                  className="p-4 flex items-center justify-between gap-3 hover:bg-zinc-800/20 transition-colors"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isIncome 
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                    }`}>
                      {isIncome ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>

                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-white truncate">
                        {tx.description || tx.category}
                      </div>
                      <div className="flex items-center space-x-2 text-[11px] text-zinc-400 mt-0.5">
                        <span className="font-mono text-zinc-500">{tx.date}</span>
                        <span>·</span>
                        <span className="text-violet-400 font-medium">{tx.category}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <div className={`font-mono text-sm font-bold ${
                      isIncome ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {isIncome ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                    </div>

                    <button
                      onClick={(e) => handleDelete(tx.id, e)}
                      className="min-h-[44px] min-w-[44px] flex items-center justify-center text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
