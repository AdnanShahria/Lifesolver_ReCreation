import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  ArrowRightLeft,
  ArrowRight,
  Wallet,
  Calendar,
  FileText,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Percent,
  TrendingDown,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import type { FinancialAccount } from '../../types';
import { useCreateTransfer, formatCurrency } from '../../hooks/useFinance';
import { renderAccountIcon } from '../AccountsCarousel';

export interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: FinancialAccount[];
  defaultSourceAccountId?: string | null;
  defaultDestinationAccountId?: string | null;
  onSuccess?: () => void;
}

// ── Default Exchange Rates Table (Fallback Multi-currency Presets) ──
const DEFAULT_EXCHANGE_RATES: Record<string, Record<string, number>> = {
  USD: { BDT: 121.5, EUR: 0.92, GBP: 0.78, INR: 86.5, BTC: 0.000015, ETH: 0.00038, CAD: 1.38, AUD: 1.52 },
  BDT: { USD: 0.0082, EUR: 0.0076, GBP: 0.0064, INR: 0.71 },
  EUR: { USD: 1.08, BDT: 131.2, GBP: 0.85, INR: 93.8 },
  GBP: { USD: 1.28, BDT: 155.5, EUR: 1.18, INR: 110.4 },
  BTC: { USD: 68500, BDT: 8322750, EUR: 63400, GBP: 53500 },
  ETH: { USD: 2650, BDT: 321975, EUR: 2450, GBP: 2070 }
};

export function getEstimatedRate(sourceCurr: string, destCurr: string): number {
  if (sourceCurr === destCurr) return 1.0;
  if (DEFAULT_EXCHANGE_RATES[sourceCurr]?.[destCurr]) {
    return DEFAULT_EXCHANGE_RATES[sourceCurr][destCurr];
  }
  if (DEFAULT_EXCHANGE_RATES[destCurr]?.[sourceCurr]) {
    return 1 / DEFAULT_EXCHANGE_RATES[destCurr][sourceCurr];
  }
  return 1.0;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  onClose,
  accounts,
  defaultSourceAccountId,
  defaultDestinationAccountId,
  onSuccess
}) => {
  // Filter active accounts only
  const activeAccounts = useMemo(() => accounts.filter((a) => a.isActive !== 0), [accounts]);

  // Account selection states
  const [sourceAccountId, setSourceAccountId] = useState<string>('');
  const [destAccountId, setDestAccountId] = useState<string>('');

  // Transfer parameters
  const [amount, setAmount] = useState<string>('');
  const [feeAmount, setFeeAmount] = useState<string>('0');
  const [exchangeRate, setExchangeRate] = useState<string>('1.0');
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const transferMutation = useCreateTransfer();

  // Find source and destination account objects
  const sourceAccount = activeAccounts.find((a) => a.id === sourceAccountId) || null;
  const destAccount = activeAccounts.find((a) => a.id === destAccountId) || null;

  // Initialize selections when modal opens or defaults change
  useEffect(() => {
    if (isOpen && activeAccounts.length > 0) {
      // Pick source
      let initialSource = defaultSourceAccountId;
      if (!initialSource || !activeAccounts.some((a) => a.id === initialSource)) {
        initialSource = activeAccounts[0].id;
      }
      setSourceAccountId(initialSource);

      // Pick destination (must differ from source)
      let initialDest = defaultDestinationAccountId;
      if (!initialDest || initialDest === initialSource || !activeAccounts.some((a) => a.id === initialDest)) {
        const other = activeAccounts.find((a) => a.id !== initialSource);
        initialDest = other ? other.id : '';
      }
      setDestAccountId(initialDest);

      setAmount('');
      setFeeAmount('0');
      setDate(new Date().toISOString().slice(0, 10));
      setNotes('');
      setErrorMsg(null);
    }
  }, [isOpen, defaultSourceAccountId, defaultDestinationAccountId, activeAccounts]);

  // Update exchange rate automatically when currencies change
  useEffect(() => {
    if (sourceAccount && destAccount) {
      if (sourceAccount.currency === destAccount.currency) {
        setExchangeRate('1.0');
      } else {
        const rate = getEstimatedRate(sourceAccount.currency, destAccount.currency);
        setExchangeRate(String(parseFloat(rate.toFixed(6))));
      }
    }
  }, [sourceAccount?.currency, destAccount?.currency]);

  if (!isOpen) return null;

  // Numerical calculations
  const parsedAmount = parseFloat(amount) || 0;
  const parsedFee = parseFloat(feeAmount) || 0;
  const parsedRate = parseFloat(exchangeRate) || 1.0;
  const totalDeductedFromSource = parsedAmount + parsedFee;
  const convertedDestinationAmount = parsedAmount * parsedRate;

  // Real-time balance projections
  const sourceOldBalance = sourceAccount ? sourceAccount.currentBalance : 0;
  const sourceNewBalance = sourceOldBalance - totalDeductedFromSource;

  const destOldBalance = destAccount ? destAccount.currentBalance : 0;
  const destNewBalance = destOldBalance + convertedDestinationAmount;

  // Validations
  const isSameAccount = Boolean(sourceAccountId && destAccountId && sourceAccountId === destAccountId);
  const isInsufficientBalance = Boolean(sourceAccount && totalDeductedFromSource > sourceAccount.currentBalance);
  const isInvalidAmount = parsedAmount <= 0;
  const canSubmit = !isSameAccount && !isInsufficientBalance && !isInvalidAmount && !transferMutation.isPending;

  // Quick Amount Percentage handlers
  const handleSetPercentage = (percent: number) => {
    if (!sourceAccount) return;
    const maxAvailable = Math.max(0, sourceAccount.currentBalance - parsedFee);
    const calculated = (maxAvailable * (percent / 100)).toFixed(2);
    setAmount(calculated);
  };

  // Quick Swap Handler
  const handleSwapAccounts = () => {
    const temp = sourceAccountId;
    setSourceAccountId(destAccountId);
    setDestAccountId(temp);
  };

  // Quick Fee Presets
  const handleApplyFeePreset = (type: 'none' | 'bkash' | 'flat5' | 'flat15') => {
    if (type === 'none') {
      setFeeAmount('0');
    } else if (type === 'bkash') {
      // 1.85% cashout standard fee
      const fee = ((parsedAmount || 0) * 0.0185).toFixed(2);
      setFeeAmount(fee);
    } else if (type === 'flat5') {
      setFeeAmount('5');
    } else if (type === 'flat15') {
      setFeeAmount('15');
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    if (!sourceAccount || !destAccount) {
      setErrorMsg('Please select both source and destination accounts.');
      return;
    }

    try {
      setErrorMsg(null);
      await transferMutation.mutateAsync({
        fromAccountId: sourceAccountId,
        toAccountId: destAccountId,
        amount: parsedAmount,
        destinationAmount: convertedDestinationAmount,
        exchangeRate: parsedRate,
        feeAmount: parsedFee,
        date,
        notes: notes.trim() || undefined
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Transfer failed. Please try again.';
      setErrorMsg(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto font-sans">
      {/* ── Apple Frosted Backdrop ── */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/35 backdrop-blur-xl saturate-150 transition-opacity animate-in fade-in duration-200"
      />

      {/* ── Apple Modal Glass Container ── */}
      <div
        className="relative w-full max-w-2xl apple-modal-glass rounded-3xl flex flex-col max-h-[92vh] overflow-hidden transition-all animate-in zoom-in-95 duration-200 z-10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.06] dark:border-white/[0.08] bg-white/40 dark:bg-white/[0.03] shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-violet-600/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center shadow-xs">
              <ArrowRightLeft className="w-4 h-4 stroke-[2.4]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#1d1d1f] dark:text-zinc-100 tracking-tight">
                Transfer Funds Between Accounts
              </h2>
              <p className="text-[11px] text-[#8d8d93] dark:text-zinc-400">
                Move balances with instant preview &amp; fee calculation
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] rounded-full flex items-center justify-center text-[#8d8d93] hover:text-[#1d1d1f] dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-transparent">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ── Interactive Instant Visual Preview Banner ── */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6e6e73] dark:text-zinc-400 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                <span>Instant Balance Preview</span>
              </span>
              {parsedFee > 0 && (
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                  Fee: {sourceAccount ? formatCurrency(parsedFee, sourceAccount.currency) : parsedFee}
                </span>
              )}
            </div>

            {/* Apple Preview Card */}
            <div className="rounded-3xl p-4 sm:p-5 apple-card-glass border border-violet-500/20 bg-gradient-to-r from-violet-500/[0.04] via-transparent to-emerald-500/[0.04]">
              <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center">
                {/* Source Account Box (Left 5 cols) */}
                <div className="md:col-span-5 p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: sourceAccount?.color || '#8b5cf6' }}
                      />
                      <span className="text-xs font-bold text-[#1d1d1f] dark:text-zinc-100 truncate max-w-[140px]">
                        {sourceAccount ? sourceAccount.name : 'Select Source'}
                      </span>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400 flex items-center space-x-0.5">
                      <TrendingDown className="w-3 h-3" />
                      <span>Outgoing</span>
                    </span>
                  </div>

                  {/* Before -> After Balance */}
                  <div className="pt-1.5 flex items-baseline justify-between text-xs">
                    <span className="text-[#8d8d93] dark:text-zinc-400 font-mono">
                      {sourceAccount ? formatCurrency(sourceOldBalance, sourceAccount.currency) : '$0'}
                    </span>
                    <span className="text-[#8d8d93] font-semibold text-[11px]">➔</span>
                    <span
                      className={`font-mono font-bold ${
                        sourceNewBalance < 0
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-[#1d1d1f] dark:text-zinc-100'
                      }`}
                    >
                      {sourceAccount ? formatCurrency(sourceNewBalance, sourceAccount.currency) : '$0'}
                    </span>
                  </div>
                </div>

                {/* Transfer Arrow Indicator (Center 1 col) */}
                <div className="md:col-span-1 flex flex-col items-center justify-center py-1">
                  <div className="w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center shadow-md animate-pulse">
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  {sourceAccount?.currency !== destAccount?.currency && (
                    <span className="text-[9px] font-mono text-violet-600 dark:text-violet-400 mt-1">
                      Rate {parsedRate}
                    </span>
                  )}
                </div>

                {/* Destination Account Box (Right 5 cols) */}
                <div className="md:col-span-5 p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: destAccount?.color || '#10b981' }}
                      />
                      <span className="text-xs font-bold text-[#1d1d1f] dark:text-zinc-100 truncate max-w-[140px]">
                        {destAccount ? destAccount.name : 'Select Destination'}
                      </span>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-0.5">
                      <TrendingUp className="w-3 h-3" />
                      <span>Incoming</span>
                    </span>
                  </div>

                  {/* Before -> After Balance */}
                  <div className="pt-1.5 flex items-baseline justify-between text-xs">
                    <span className="text-[#8d8d93] dark:text-zinc-400 font-mono">
                      {destAccount ? formatCurrency(destOldBalance, destAccount.currency) : '৳0'}
                    </span>
                    <span className="text-[#8d8d93] font-semibold text-[11px]">➔</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {destAccount ? formatCurrency(destNewBalance, destAccount.currency) : '৳0'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Insufficient Balance Alert */}
              {isInsufficientBalance && (
                <div className="mt-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>
                    Insufficient balance: total needed is{' '}
                    <strong>{formatCurrency(totalDeductedFromSource, sourceAccount?.currency)}</strong>, but only{' '}
                    <strong>{formatCurrency(sourceOldBalance, sourceAccount?.currency)}</strong> is available.
                  </span>
                </div>
              )}

              {/* Same Account Alert */}
              {isSameAccount && (
                <div className="mt-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Source and Destination accounts cannot be the same.</span>
                </div>
              )}
            </div>
          </div>

          {/* ── Account Selectors Row with Quick Swap ── */}
          <div className="grid grid-cols-1 sm:grid-cols-11 gap-3 items-center">
            {/* Source Account (5 cols) */}
            <div className="sm:col-span-5 space-y-1.5">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6e6e73] dark:text-zinc-400">
                Source Account (From)
              </label>
              <select
                value={sourceAccountId}
                onChange={(e) => setSourceAccountId(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] text-xs font-semibold text-[#1d1d1f] dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 cursor-pointer"
              >
                {activeAccounts.map((acc) => (
                  <option key={acc.id} value={acc.id} className="dark:bg-zinc-900">
                    {acc.name} ({formatCurrency(acc.currentBalance, acc.currency)})
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Swap Button (1 col) */}
            <div className="sm:col-span-1 flex justify-center pt-5 sm:pt-4">
              <button
                type="button"
                onClick={handleSwapAccounts}
                title="Swap source and destination accounts"
                className="min-h-[44px] min-w-[44px] rounded-2xl flex items-center justify-center bg-black/[0.04] dark:bg-white/[0.06] hover:bg-violet-500/15 text-[#6e6e73] dark:text-zinc-400 hover:text-violet-600 dark:hover:text-violet-400 transition-all active:scale-90 cursor-pointer shadow-xs"
              >
                <ArrowRightLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Destination Account (5 cols) */}
            <div className="sm:col-span-5 space-y-1.5">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6e6e73] dark:text-zinc-400">
                Destination Account (To)
              </label>
              <select
                value={destAccountId}
                onChange={(e) => setDestAccountId(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] text-xs font-semibold text-[#1d1d1f] dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 cursor-pointer"
              >
                {activeAccounts.map((acc) => (
                  <option key={acc.id} value={acc.id} className="dark:bg-zinc-900">
                    {acc.name} ({formatCurrency(acc.currentBalance, acc.currency)})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ── Transfer Amount & Quick Percentages ── */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#6e6e73] dark:text-zinc-400">
                Transfer Amount ({sourceAccount?.currency || 'USD'})
              </label>
              <div className="flex items-center space-x-1.5">
                {[25, 50, 75, 100].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => handleSetPercentage(pct)}
                    className="min-h-[36px] px-2.5 py-1 rounded-xl text-[10px] font-bold bg-black/[0.03] dark:bg-white/[0.06] hover:bg-violet-500/15 text-[#6e6e73] dark:text-zinc-300 hover:text-violet-600 dark:hover:text-violet-300 transition-colors cursor-pointer"
                  >
                    {pct === 100 ? 'MAX' : `${pct}%`}
                  </button>
                ))}
              </div>
            </div>

            <input
              type="number"
              step="any"
              autoFocus
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full text-2xl font-bold font-mono px-4 py-3 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] text-[#1d1d1f] dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
            />
          </div>

          {/* ── Multi-Currency Exchange Rate & Destination Amount (if different currencies) ── */}
          {sourceAccount?.currency !== destAccount?.currency && (
            <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.08] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1d1d1f] dark:text-zinc-200">
                  Cross-Currency Conversion
                </span>
                <span className="text-[11px] text-[#6e6e73] dark:text-zinc-400">
                  1 {sourceAccount?.currency} = {parsedRate} {destAccount?.currency}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-[#8d8d93] dark:text-zinc-400 mb-1">
                    Exchange Rate
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={exchangeRate}
                    onChange={(e) => setExchangeRate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.1] text-xs font-mono font-bold text-[#1d1d1f] dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-semibold text-[#8d8d93] dark:text-zinc-400 mb-1">
                    Destination Receives ({destAccount?.currency})
                  </label>
                  <div className="w-full px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300">
                    {formatCurrency(convertedDestinationAmount, destAccount?.currency)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Transfer Fee & Date & Notes Grid ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Optional Fee */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#6e6e73] dark:text-zinc-400">
                  Transfer Fee (Optional)
                </label>
                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => handleApplyFeePreset('none')}
                    className="text-[10px] text-[#8d8d93] hover:text-[#1d1d1f] dark:hover:text-white"
                  >
                    $0
                  </button>
                  <span className="text-[#8d8d93] text-[10px]">·</span>
                  <button
                    type="button"
                    onClick={() => handleApplyFeePreset('bkash')}
                    className="text-[10px] text-pink-600 hover:text-pink-700 font-semibold"
                  >
                    bKash 1.85%
                  </button>
                </div>
              </div>
              <input
                type="number"
                step="any"
                value={feeAmount}
                onChange={(e) => setFeeAmount(e.target.value)}
                placeholder="0.00"
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] text-xs font-semibold font-mono text-[#1d1d1f] dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              />
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6e6e73] dark:text-zinc-400">
                Transfer Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] text-xs font-semibold text-[#1d1d1f] dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 cursor-pointer"
              />
            </div>
          </div>

          {/* Notes Input */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6e6e73] dark:text-zinc-400">
              Notes / Memo (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Freelance payout to local bKash, Monthly savings transfer"
              className="w-full min-h-[44px] px-4 py-2.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] text-xs text-[#1d1d1f] dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
            />
          </div>
        </div>

        {/* ── Modal Footer ── */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-black/[0.06] dark:border-white/[0.08] bg-white/40 dark:bg-white/[0.02] shrink-0">
          <div className="text-[11px] text-[#8d8d93] dark:text-zinc-400 hidden sm:block">
            {sourceAccount && destAccount ? (
              <span>
                {sourceAccount.name} ➔ {destAccount.name}
              </span>
            ) : null}
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold text-[#6e6e73] dark:text-zinc-400 hover:text-[#1d1d1f] dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={!canSubmit}
              onClick={handleSubmit}
              className="min-h-[44px] px-6 py-2.5 rounded-full bg-violet-600 hover:bg-violet-700 active:scale-95 text-xs font-bold text-white shadow-md transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>{transferMutation.isPending ? 'Transferring...' : 'Confirm Transfer'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
