import React, { useRef, useState } from 'react';
import {
  Wallet,
  Building2,
  Smartphone,
  Globe,
  Landmark,
  Coins,
  CreditCard,
  Banknote,
  ShieldCheck,
  Plus,
  ArrowRightLeft,
  Pencil,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  X,
  Check,
  AlertCircle
} from 'lucide-react';
import type { FinancialAccount } from '../types';
import { formatCurrency, useAdjustAccountBalance } from '../hooks/useFinance';

// ── Icon Registry ─────────────────────────────────────────────────
export const ACCOUNT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Wallet,
  Building2,
  Smartphone,
  Globe,
  Landmark,
  Coins,
  CreditCard,
  Banknote,
  ShieldCheck
};

export function renderAccountIcon(iconName?: string, className = 'w-5 h-5') {
  const IconComponent = (iconName && ACCOUNT_ICONS[iconName]) || Wallet;
  return <IconComponent className={className} />;
}

// ── Human-readable Type Labels ────────────────────────────────────
export const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  bank: 'Bank Account',
  mobile_wallet: 'Mobile Wallet',
  online_wallet: 'Online Wallet',
  cash: 'Cash',
  credit_card: 'Credit Card',
  crypto: 'Crypto',
  investment: 'Investment',
  custom: 'Custom'
};

export interface AccountsCarouselProps {
  accounts: FinancialAccount[];
  selectedAccountId: string | null;
  onSelectAccount: (accountId: string | null) => void;
  onAddNewAccount: () => void;
  onEditAccount: (account: FinancialAccount) => void;
  onTransfer: (sourceAccount?: FinancialAccount) => void;
  onAddFunds?: (account: FinancialAccount) => void;
  isLoading?: boolean;
}

export const AccountsCarousel: React.FC<AccountsCarouselProps> = ({
  accounts,
  selectedAccountId,
  onSelectAccount,
  onAddNewAccount,
  onEditAccount,
  onTransfer,
  onAddFunds,
  isLoading = false
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Quick Add Funds Modal State (for instant inline top-ups)
  const [quickFundsAccount, setQuickFundsAccount] = useState<FinancialAccount | null>(null);
  const [fundsAmount, setFundsAmount] = useState<string>('');
  const [fundsReason, setFundsReason] = useState<string>('Quick deposit');
  const [isSubmittingFunds, setIsSubmittingFunds] = useState<boolean>(false);
  const [fundsError, setFundsError] = useState<string | null>(null);

  const adjustMutation = useAdjustAccountBalance();

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollOffset = direction === 'left' ? -340 : 340;
      scrollContainerRef.current.scrollBy({ left: scrollOffset, behavior: 'smooth' });
    }
  };

  const handleOpenAddFunds = (account: FinancialAccount) => {
    if (onAddFunds) {
      onAddFunds(account);
    } else {
      setQuickFundsAccount(account);
      setFundsAmount('');
      setFundsReason('Top-up funds');
      setFundsError(null);
    }
  };

  const handleQuickFundsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickFundsAccount) return;

    const amountNum = parseFloat(fundsAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setFundsError('Please enter an amount greater than zero');
      return;
    }

    try {
      setIsSubmittingFunds(true);
      setFundsError(null);
      const newTotal = (quickFundsAccount.currentBalance || 0) + amountNum;
      await adjustMutation.mutateAsync({
        accountId: quickFundsAccount.id,
        newBalance: newTotal,
        reason: fundsReason.trim() || 'Quick funds deposit',
        logTransaction: true
      });
      setQuickFundsAccount(null);
      setFundsAmount('');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to adjust balance';
      setFundsError(errorMsg);
    } finally {
      setIsSubmittingFunds(false);
    }
  };

  // Group accounts or sum total for the "All Accounts" pill
  const activeAccounts = accounts.filter((a) => a.isActive !== 0);
  const totalCount = activeAccounts.length;

  return (
    <div className="space-y-4 font-sans select-none">
      {/* ── Top Bar: Filter Pills Tray & Scroll Navigation ── */}
      <div className="flex items-center justify-between gap-3">
        {/* Horizontal scrollable pills */}
        <div className="flex-1 overflow-x-auto scrollbar-none py-1">
          <div className="inline-flex items-center gap-2 p-1.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] backdrop-blur-md">
            {/* Pill: All Accounts */}
            <button
              type="button"
              onClick={() => onSelectAccount(null)}
              className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer ${
                selectedAccountId === null
                  ? 'bg-white dark:bg-zinc-800 text-[#1d1d1f] dark:text-white shadow-sm ring-1 ring-black/[0.06] dark:ring-white/[0.12] font-bold'
                  : 'text-[#6e6e73] dark:text-zinc-400 hover:text-[#1d1d1f] dark:hover:text-zinc-200 hover:bg-black/[0.03] dark:hover:bg-white/[0.05]'
              }`}
            >
              <Wallet className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>All Accounts</span>
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-black/[0.06] dark:bg-white/[0.1] font-mono">
                {totalCount}
              </span>
            </button>

            {/* Individual Account Pills */}
            {activeAccounts.map((acc) => {
              const isSelected = selectedAccountId === acc.id;
              const pillColor = acc.color || '#8b5cf6';

              return (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => onSelectAccount(acc.id)}
                  className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-medium flex items-center space-x-2 transition-all cursor-pointer shrink-0 ${
                    isSelected
                      ? 'bg-white dark:bg-zinc-800 text-[#1d1d1f] dark:text-white shadow-sm ring-1 ring-black/[0.08] dark:ring-white/[0.15] font-bold'
                      : 'text-[#6e6e73] dark:text-zinc-400 hover:text-[#1d1d1f] dark:hover:text-zinc-200 hover:bg-black/[0.03] dark:hover:bg-white/[0.05]'
                  }`}
                >
                  {/* Color dot or mini icon */}
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                    style={{ backgroundColor: pillColor }}
                  />
                  <span className="truncate max-w-[120px]">{acc.name}</span>
                  <span className="text-[11px] font-mono opacity-80 shrink-0">
                    {formatCurrency(acc.currentBalance, acc.currency)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Carousel Prev/Next Buttons */}
        <div className="hidden sm:flex items-center space-x-1.5 shrink-0">
          <button
            type="button"
            onClick={() => handleScroll('left')}
            title="Scroll accounts left"
            className="min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] text-[#6e6e73] dark:text-zinc-400 hover:text-[#1d1d1f] dark:hover:text-white hover:bg-black/[0.06] dark:hover:bg-white/[0.08] active:scale-95 transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 stroke-[2.2]" />
          </button>
          <button
            type="button"
            onClick={() => handleScroll('right')}
            title="Scroll accounts right"
            className="min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] text-[#6e6e73] dark:text-zinc-400 hover:text-[#1d1d1f] dark:hover:text-white hover:bg-black/[0.06] dark:hover:bg-white/[0.08] active:scale-95 transition-all cursor-pointer"
          >
            <ChevronRight className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>
      </div>

      {/* ── Accounts Cards Carousel (Snap Scroll Container) ── */}
      <div
        ref={scrollContainerRef}
        className="flex items-stretch gap-4 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-3 pt-1 px-0.5"
      >
        {/* Render each Account Wallet Card */}
        {activeAccounts.map((account) => {
          const isSelected = selectedAccountId === account.id;
          const cardColor = account.color || '#8b5cf6';
          const typeLabel = ACCOUNT_TYPE_LABELS[account.type] || account.type;

          return (
            <div
              key={account.id}
              onClick={() => onSelectAccount(isSelected ? null : account.id)}
              className={`min-w-[290px] sm:min-w-[320px] max-w-[340px] h-[210px] shrink-0 snap-start rounded-3xl p-5 relative overflow-hidden flex flex-col justify-between transition-all duration-300 group cursor-pointer apple-card-glass ${
                isSelected
                  ? 'ring-2 ring-violet-500/80 shadow-xl'
                  : 'hover:-translate-y-1 hover:shadow-lg'
              }`}
              style={{
                boxShadow: isSelected
                  ? `0 16px 36px -10px ${cardColor}40, inset 0 1px 1.5px rgba(255, 255, 255, 0.4)`
                  : undefined
              }}
            >
              {/* ── Ambient Radial Glow matching Account Color ── */}
              <div
                className="absolute -top-12 -right-12 w-44 h-44 rounded-full blur-3xl pointer-events-none opacity-30 group-hover:opacity-50 transition-opacity duration-500"
                style={{ backgroundColor: cardColor }}
              />
              <div
                className="absolute -bottom-12 -left-12 w-32 h-32 rounded-full blur-2xl pointer-events-none opacity-15 group-hover:opacity-30 transition-opacity duration-500"
                style={{ backgroundColor: cardColor }}
              />

              {/* ── Top Row: Icon Badge, Account Type & Currency ── */}
              <div className="relative z-10 flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  {/* Account Icon */}
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105 duration-300"
                    style={{
                      backgroundColor: `${cardColor}20`,
                      color: cardColor,
                      border: `1px solid ${cardColor}40`
                    }}
                  >
                    {renderAccountIcon(account.icon, 'w-5 h-5 stroke-[2.2]')}
                  </div>

                  <div>
                    <h4 className="font-bold text-sm sm:text-base text-[#1d1d1f] dark:text-zinc-100 tracking-tight truncate max-w-[150px]">
                      {account.name}
                    </h4>
                    <span className="text-[11px] text-[#6e6e73] dark:text-zinc-400 capitalize">
                      {account.subtype ? account.subtype.toUpperCase() : typeLabel}
                    </span>
                  </div>
                </div>

                {/* Badges: Currency & Type */}
                <div className="flex flex-col items-end gap-1">
                  <span
                    className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-wide shadow-xs"
                    style={{
                      backgroundColor: `${cardColor}15`,
                      color: cardColor,
                      border: `1px solid ${cardColor}30`
                    }}
                  >
                    {account.currency || 'USD'}
                  </span>
                  {account.type === 'credit_card' && (
                    <span className="text-[9px] uppercase font-semibold text-amber-600 dark:text-amber-400">
                      Credit
                    </span>
                  )}
                </div>
              </div>

              {/* ── Middle Row: Current Balance Display ── */}
              <div className="relative z-10 my-auto py-1">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#8d8d93] dark:text-zinc-500">
                  Current Balance
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold tracking-tight font-apple-display text-[#1d1d1f] dark:text-white mt-0.5">
                  {formatCurrency(account.currentBalance, account.currency)}
                </div>
                {account.creditLimit && account.creditLimit > 0 && (
                  <div className="text-[10px] text-[#6e6e73] dark:text-zinc-400 mt-0.5">
                    Limit: {formatCurrency(account.creditLimit, account.currency)}
                  </div>
                )}
              </div>

              {/* ── Bottom Row: Quick Action Buttons (Min 44px tap target) ── */}
              <div
                className="relative z-10 flex items-center justify-between gap-2 pt-2 border-t border-black/[0.06] dark:border-white/[0.08]"
                onClick={(e) => e.stopPropagation()}
              >
                {/* '+ Add Funds' Button */}
                <button
                  type="button"
                  onClick={() => handleOpenAddFunds(account)}
                  title="Add funds or deposit to this account"
                  className="min-h-[44px] flex-1 px-3 py-2 rounded-xl text-xs font-semibold bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.14] text-[#1d1d1f] dark:text-zinc-200 transition-all active:scale-95 flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Add Funds</span>
                </button>

                {/* 'Transfer' Button */}
                <button
                  type="button"
                  onClick={() => onTransfer(account)}
                  title="Transfer money from this account"
                  className="min-h-[44px] flex-1 px-3 py-2 rounded-xl text-xs font-semibold bg-violet-600/10 dark:bg-violet-500/20 hover:bg-violet-600/20 dark:hover:bg-violet-500/30 text-violet-700 dark:text-violet-300 transition-all active:scale-95 flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5 stroke-[2.2]" />
                  <span>Transfer</span>
                </button>

                {/* 'Edit' Icon Button */}
                <button
                  type="button"
                  onClick={() => onEditAccount(account)}
                  title="Edit account details"
                  className="min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.14] text-[#6e6e73] dark:text-zinc-400 hover:text-[#1d1d1f] dark:hover:text-white transition-all active:scale-95 cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5 stroke-[2.2]" />
                </button>
              </div>
            </div>
          );
        })}

        {/* ── '+ Add New Account' Dashed Apple-Glass Card ── */}
        <div
          onClick={onAddNewAccount}
          className="min-w-[240px] sm:min-w-[270px] h-[210px] shrink-0 snap-start rounded-3xl p-5 border-2 border-dashed border-black/15 dark:border-white/15 hover:border-violet-500/60 dark:hover:border-violet-400/60 bg-black/[0.015] dark:bg-white/[0.02] hover:bg-violet-500/[0.04] dark:hover:bg-violet-500/[0.06] backdrop-blur-md flex flex-col items-center justify-center text-center cursor-pointer group transition-all duration-300"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onAddNewAccount();
            }
          }}
        >
          <div className="w-12 h-12 rounded-2xl bg-black/[0.04] dark:bg-white/[0.06] group-hover:bg-violet-500/15 group-hover:scale-110 flex items-center justify-center transition-all duration-300 text-[#6e6e73] dark:text-zinc-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 shadow-sm">
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </div>

          <h4 className="text-sm font-bold text-[#1d1d1f] dark:text-zinc-100 mt-3 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
            Add New Account
          </h4>
          <p className="text-[11px] text-[#8d8d93] dark:text-zinc-400 mt-0.5">
            Bank, bKash, PayPal, Crypto
          </p>

          <span className="mt-3 px-3 py-1 rounded-full text-[10px] font-semibold bg-black/[0.04] dark:bg-white/[0.06] text-[#6e6e73] dark:text-zinc-300 group-hover:bg-violet-500/10 group-hover:text-violet-600 dark:group-hover:text-violet-300 transition-colors">
            + Connect Account
          </span>
        </div>
      </div>

      {/* ── Quick Add Funds Inline Modal ── */}
      {quickFundsAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/35 backdrop-blur-md transition-opacity animate-in fade-in"
            onClick={() => setQuickFundsAccount(null)}
          />

          <div
            className="relative w-full max-w-sm apple-modal-glass rounded-3xl p-6 shadow-2xl z-10 transition-all animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.08]">
              <div className="flex items-center space-x-2.5">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
                  style={{ backgroundColor: quickFundsAccount.color || '#8b5cf6' }}
                >
                  {renderAccountIcon(quickFundsAccount.icon, 'w-4 h-4')}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1d1d1f] dark:text-zinc-100">
                    Add Funds
                  </h3>
                  <p className="text-[11px] text-[#6e6e73] dark:text-zinc-400 truncate max-w-[180px]">
                    {quickFundsAccount.name}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setQuickFundsAccount(null)}
                className="min-h-[44px] min-w-[44px] rounded-full flex items-center justify-center text-[#8d8d93] hover:text-[#1d1d1f] dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleQuickFundsSubmit} className="mt-4 space-y-4">
              {fundsError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{fundsError}</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6e6e73] dark:text-zinc-400 mb-1.5">
                  Amount to Deposit ({quickFundsAccount.currency})
                </label>
                <input
                  type="number"
                  step="any"
                  autoFocus
                  required
                  value={fundsAmount}
                  onChange={(e) => setFundsAmount(e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full text-lg font-bold px-4 py-3 rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.1] text-[#1d1d1f] dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6e6e73] dark:text-zinc-400 mb-1.5">
                  Reason / Note
                </label>
                <input
                  type="text"
                  value={fundsReason}
                  onChange={(e) => setFundsReason(e.target.value)}
                  placeholder="e.g. Bank deposit, Salary split"
                  className="w-full text-xs px-4 py-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.1] text-[#1d1d1f] dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                />
              </div>

              {/* Balance Preview */}
              {parseFloat(fundsAmount) > 0 && (
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                  <div className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">
                    Updated Balance Preview:
                  </div>
                  <div className="font-bold text-emerald-800 dark:text-emerald-200 mt-0.5">
                    {formatCurrency(
                      quickFundsAccount.currentBalance + (parseFloat(fundsAmount) || 0),
                      quickFundsAccount.currency
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setQuickFundsAccount(null)}
                  className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold text-[#6e6e73] dark:text-zinc-400 hover:text-[#1d1d1f] dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingFunds}
                  className="min-h-[44px] px-5 py-2 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white shadow-md active:scale-95 transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingFunds ? (
                    <span>Depositing...</span>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Confirm Deposit</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
