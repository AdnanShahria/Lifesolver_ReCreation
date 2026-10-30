import React, { useState, useEffect } from 'react';
import {
  X,
  Wallet,
  Building2,
  Smartphone,
  Globe,
  Landmark,
  Coins,
  CreditCard,
  Banknote,
  ShieldCheck,
  Check,
  Trash2,
  AlertTriangle,
  ArrowRight,
  Eye,
  SlidersHorizontal,
  DollarSign
} from 'lucide-react';
import type { FinancialAccount, AccountType, AccountSubtype } from '../../types';
import {
  useCreateAccount,
  useUpdateAccount,
  useDeleteAccount,
  formatCurrency
} from '../../hooks/useFinance';
import { renderAccountIcon, ACCOUNT_ICONS } from '../AccountsCarousel';

export interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountToEdit?: FinancialAccount | null;
  onSuccess?: () => void;
}

// ── Apple Pastel Palette ──────────────────────────────────────────
export const APPLE_COLOR_PALETTE = [
  { name: 'Emerald', hex: '#10b981', desc: 'Cash / Growth' },
  { name: 'Violet', hex: '#8b5cf6', desc: 'Primary Apple' },
  { name: 'Blue', hex: '#0a84ff', desc: 'Checking / PayPal' },
  { name: 'Rose', hex: '#ec4899', desc: 'bKash / Lifestyle' },
  { name: 'Amber', hex: '#f97316', desc: 'Nagad / Crypto' },
  { name: 'Cyan', hex: '#06b6d4', desc: 'Digital / Modern' },
  { name: 'Indigo', hex: '#6366f1', desc: 'Vault / Fixed' },
  { name: 'Slate', hex: '#64748b', desc: 'Neutral' }
];

// ── Supported Currencies ──────────────────────────────────────────
export const CURRENCY_OPTIONS = [
  { code: 'USD', symbol: '$', name: 'USD ($)' },
  { code: 'BDT', symbol: '৳', name: 'BDT (৳)' },
  { code: 'EUR', symbol: '€', name: 'EUR (€)' },
  { code: 'GBP', symbol: '£', name: 'GBP (£)' },
  { code: 'BTC', symbol: '₿', name: 'BTC (₿)' },
  { code: 'ETH', symbol: 'Ξ', name: 'ETH (Ξ)' },
  { code: 'INR', symbol: '₹', name: 'INR (₹)' }
];

// ── Account Types ─────────────────────────────────────────────────
export const ACCOUNT_TYPES: { id: AccountType; label: string; defaultSubtype?: AccountSubtype }[] = [
  { id: 'bank', label: 'Bank Account' },
  { id: 'mobile_wallet', label: 'Mobile Wallet (bKash/Nagad)', defaultSubtype: 'bkash' },
  { id: 'online_wallet', label: 'Online Wallet (PayPal/Wise)', defaultSubtype: 'paypal' },
  { id: 'cash', label: 'Cash' },
  { id: 'credit_card', label: 'Credit Card' },
  { id: 'crypto', label: 'Crypto' },
  { id: 'custom', label: 'Custom' }
];

// ── Common Subtypes ───────────────────────────────────────────────
export const SUBTYPE_OPTIONS: { id: AccountSubtype; label: string; defaultColor: string; defaultIcon: string }[] = [
  { id: 'bkash', label: 'bKash', defaultColor: '#ec4899', defaultIcon: 'Smartphone' },
  { id: 'nagad', label: 'Nagad', defaultColor: '#f97316', defaultIcon: 'Smartphone' },
  { id: 'paypal', label: 'PayPal', defaultColor: '#0a84ff', defaultIcon: 'Globe' },
  { id: 'wise', label: 'Wise', defaultColor: '#06b6d4', defaultIcon: 'Globe' },
  { id: 'stripe', label: 'Stripe', defaultColor: '#6366f1', defaultIcon: 'CreditCard' },
  { id: 'crypto', label: 'Crypto / Exchange', defaultColor: '#f97316', defaultIcon: 'Coins' },
  { id: 'revolut', label: 'Revolut', defaultColor: '#8b5cf6', defaultIcon: 'CreditCard' },
  { id: null, label: 'None / Standard', defaultColor: '#10b981', defaultIcon: 'Wallet' }
];

export const AVAILABLE_ICONS = [
  'Wallet',
  'Building2',
  'Smartphone',
  'Globe',
  'Landmark',
  'Coins',
  'CreditCard',
  'Banknote',
  'ShieldCheck'
];

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  accountToEdit,
  onSuccess
}) => {
  const isEditing = Boolean(accountToEdit);

  // Form states
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('bank');
  const [subtype, setSubtype] = useState<AccountSubtype | null>(null);
  const [currency, setCurrency] = useState('BDT');
  const [balance, setBalance] = useState<string>('0');
  const [creditLimit, setCreditLimit] = useState<string>('');
  const [color, setColor] = useState('#8b5cf6');
  const [icon, setIcon] = useState('Building2');
  const [excludeFromNetWorth, setExcludeFromNetWorth] = useState(false);

  // Confirmation state for deleting
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const createMutation = useCreateAccount();
  const updateMutation = useUpdateAccount();
  const deleteMutation = useDeleteAccount();

  // Reset or fill form when modal opens or account changes
  useEffect(() => {
    if (isOpen) {
      if (accountToEdit) {
        setName(accountToEdit.name || '');
        setType(accountToEdit.type || 'bank');
        setSubtype(accountToEdit.subtype || null);
        setCurrency(accountToEdit.currency || 'BDT');
        setBalance(String(accountToEdit.currentBalance ?? 0));
        setCreditLimit(accountToEdit.creditLimit ? String(accountToEdit.creditLimit) : '');
        setColor(accountToEdit.color || '#8b5cf6');
        setIcon(accountToEdit.icon || 'Wallet');
        setExcludeFromNetWorth(Boolean(accountToEdit.excludeFromNetWorth));
      } else {
        // Defaults for new account
        setName('');
        setType('mobile_wallet');
        setSubtype('bkash');
        setCurrency('BDT');
        setBalance('0');
        setCreditLimit('');
        setColor('#ec4899');
        setIcon('Smartphone');
        setExcludeFromNetWorth(false);
      }
      setConfirmDelete(false);
      setFormError(null);
    }
  }, [isOpen, accountToEdit]);

  // Handle subtype change with smart presets
  const handleSelectSubtype = (sub: AccountSubtype | null) => {
    setSubtype(sub);
    const preset = SUBTYPE_OPTIONS.find((s) => s.id === sub);
    if (preset) {
      setColor(preset.defaultColor);
      setIcon(preset.defaultIcon);

      if (sub === 'bkash' || sub === 'nagad') {
        setType('mobile_wallet');
        setCurrency('BDT');
        if (!name || name === 'bKash Personal' || name === 'Nagad Personal') {
          setName(sub === 'bkash' ? 'bKash Personal' : 'Nagad Personal');
        }
      } else if (sub === 'paypal' || sub === 'wise' || sub === 'stripe') {
        setType('online_wallet');
        if (!name || name === 'PayPal USD' || name === 'Wise Account') {
          setName(sub === 'paypal' ? 'PayPal USD' : sub === 'wise' ? 'Wise EUR/USD' : 'Stripe Payouts');
        }
      } else if (sub === 'crypto') {
        setType('crypto');
        if (!name) setName('Crypto Wallet');
      }
    }
  };

  // Handle Type Change with smart icon/color presets
  const handleTypeChange = (newType: AccountType) => {
    setType(newType);
    if (newType === 'bank') {
      setIcon('Building2');
      setColor('#0a84ff');
      setSubtype(null);
    } else if (newType === 'mobile_wallet') {
      setIcon('Smartphone');
      setColor('#ec4899');
      setSubtype('bkash');
    } else if (newType === 'online_wallet') {
      setIcon('Globe');
      setColor('#0a84ff');
      setSubtype('paypal');
    } else if (newType === 'cash') {
      setIcon('Banknote');
      setColor('#10b981');
      setSubtype(null);
    } else if (newType === 'credit_card') {
      setIcon('CreditCard');
      setColor('#8b5cf6');
      setSubtype(null);
    } else if (newType === 'crypto') {
      setIcon('Coins');
      setColor('#f97316');
      setSubtype('crypto');
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setFormError('Please enter an account name.');
      return;
    }

    const numBalance = parseFloat(balance);
    if (isNaN(numBalance)) {
      setFormError('Please enter a valid balance amount.');
      return;
    }

    const numCreditLimit = creditLimit ? parseFloat(creditLimit) : undefined;

    setFormError(null);

    try {
      if (isEditing && accountToEdit) {
        await updateMutation.mutateAsync({
          id: accountToEdit.id,
          name: name.trim(),
          type,
          subtype,
          currency,
          creditLimit: numCreditLimit,
          color,
          icon,
          excludeFromNetWorth: excludeFromNetWorth ? 1 : 0
        });
      } else {
        await createMutation.mutateAsync({
          name: name.trim(),
          type,
          subtype,
          currency,
          initialBalance: numBalance,
          creditLimit: numCreditLimit,
          color,
          icon,
          excludeFromNetWorth: excludeFromNetWorth ? 1 : 0
        });
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save account.';
      setFormError(msg);
    }
  };

  const handleDelete = async () => {
    if (!accountToEdit) return;

    try {
      await deleteMutation.mutateAsync(accountToEdit.id);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete account.';
      setFormError(msg);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* ── Apple Frosted Backdrop ── */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/35 backdrop-blur-xl saturate-150 transition-opacity animate-in fade-in duration-200"
      />

      {/* ── Apple Modal Glass Container ── */}
      <div
        className="relative w-full max-w-xl apple-modal-glass rounded-3xl flex flex-col max-h-[92vh] overflow-hidden transition-all animate-in zoom-in-95 duration-200 z-10 font-sans shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Modal Header Bar ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.06] dark:border-white/[0.08] bg-white/40 dark:bg-white/[0.03] shrink-0">
          <div className="flex items-center space-x-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm"
              style={{ backgroundColor: color }}
            >
              {renderAccountIcon(icon, 'w-4 h-4 stroke-[2.2]')}
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#1d1d1f] dark:text-zinc-100 tracking-tight">
                {isEditing ? 'Edit Account' : 'Create Financial Account'}
              </h2>
              <p className="text-[11px] text-[#8d8d93] dark:text-zinc-400">
                bKash, Nagad, PayPal, Bank, Cash, Crypto
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

        {/* ── Scrollable Modal Body ── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-transparent">
          {formError && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* ── Interactive Live Wallet Card Preview ── */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6e6e73] dark:text-zinc-400 flex items-center space-x-1.5">
                <Eye className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                <span>Live Card Preview</span>
              </span>
              <span className="text-[10px] text-[#8d8d93] dark:text-zinc-500">
                Updates as you customize
              </span>
            </div>

            <div
              className="rounded-3xl p-5 relative overflow-hidden flex flex-col justify-between h-[155px] apple-card-glass shadow-lg border transition-all duration-300"
              style={{
                borderColor: `${color}40`,
                boxShadow: `0 12px 30px -10px ${color}35`
              }}
            >
              {/* Background ambient glow */}
              <div
                className="absolute -top-10 -right-10 w-36 h-36 rounded-full blur-2xl pointer-events-none opacity-30"
                style={{ backgroundColor: color }}
              />

              {/* Card top */}
              <div className="relative z-10 flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xs"
                    style={{
                      backgroundColor: `${color}20`,
                      color: color,
                      border: `1px solid ${color}40`
                    }}
                  >
                    {renderAccountIcon(icon, 'w-5 h-5 stroke-[2.2]')}
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-[#1d1d1f] dark:text-white tracking-tight truncate max-w-[200px]">
                      {name.trim() || 'My Account Name'}
                    </h4>
                    <span className="text-[11px] text-[#6e6e73] dark:text-zinc-400 capitalize">
                      {subtype ? subtype.toUpperCase() : type.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <span
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono"
                  style={{
                    backgroundColor: `${color}15`,
                    color: color,
                    border: `1px solid ${color}30`
                  }}
                >
                  {currency}
                </span>
              </div>

              {/* Card balance */}
              <div className="relative z-10 pt-2">
                <div className="text-[10px] uppercase font-semibold text-[#8d8d93] dark:text-zinc-500">
                  Current Balance
                </div>
                <div className="text-2xl font-extrabold tracking-tight font-apple-display text-[#1d1d1f] dark:text-white">
                  {formatCurrency(parseFloat(balance) || 0, currency)}
                </div>
              </div>
            </div>
          </div>

          {/* ── Form Inputs ── */}
          <form id="account-form" onSubmit={handleSubmit} className="space-y-5">
            {/* Account Name */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6e6e73] dark:text-zinc-400 mb-1.5">
                Account Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. bKash Personal, Chase Premier, PayPal USD"
                className="w-full px-4 py-3 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] text-sm font-semibold text-[#1d1d1f] dark:text-white placeholder:text-[#8d8d93] focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              />
            </div>

            {/* Quick Subtypes Bar (bKash, Nagad, PayPal, Wise, Stripe, Crypto) */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6e6e73] dark:text-zinc-400 mb-1.5">
                Quick Service Preset
              </label>
              <div className="flex flex-wrap gap-1.5">
                {SUBTYPE_OPTIONS.map((sub) => {
                  const isSubActive = subtype === sub.id;
                  return (
                    <button
                      key={sub.label}
                      type="button"
                      onClick={() => handleSelectSubtype(sub.id)}
                      className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                        isSubActive
                          ? 'bg-violet-600 text-white shadow-xs'
                          : 'bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.08] text-[#6e6e73] dark:text-zinc-300 hover:text-[#1d1d1f] dark:hover:text-white hover:bg-black/[0.06] dark:hover:bg-white/[0.08]'
                      }`}
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: sub.defaultColor }}
                      />
                      <span>{sub.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Grid: Account Type & Currency */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Account Type */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6e6e73] dark:text-zinc-400 mb-1.5">
                  Account Type
                </label>
                <select
                  value={type}
                  onChange={(e) => handleTypeChange(e.target.value as AccountType)}
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] text-xs font-semibold text-[#1d1d1f] dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 cursor-pointer"
                >
                  {ACCOUNT_TYPES.map((t) => (
                    <option key={t.id} value={t.id} className="dark:bg-zinc-900">
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Currency Selector */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6e6e73] dark:text-zinc-400 mb-1.5">
                  Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] text-xs font-semibold text-[#1d1d1f] dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 cursor-pointer"
                >
                  {CURRENCY_OPTIONS.map((c) => (
                    <option key={c.code} value={c.code} className="dark:bg-zinc-900">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Grid: Initial/Current Balance & Credit Limit */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Initial / Current Balance */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6e6e73] dark:text-zinc-400 mb-1.5">
                  {isEditing ? 'Current Balance' : 'Initial Balance'}
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  placeholder="0.00"
                  className="w-full min-h-[44px] px-4 py-2.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] text-sm font-bold font-mono text-[#1d1d1f] dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                />
              </div>

              {/* Credit Limit (Optional or for credit cards) */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6e6e73] dark:text-zinc-400 mb-1.5">
                  Credit Limit (Optional)
                </label>
                <input
                  type="number"
                  step="any"
                  value={creditLimit}
                  onChange={(e) => setCreditLimit(e.target.value)}
                  placeholder="e.g. 5000"
                  className="w-full min-h-[44px] px-4 py-2.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] text-sm font-semibold font-mono text-[#1d1d1f] dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                />
              </div>
            </div>

            {/* ── Apple Pastel Color Palette ── */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6e6e73] dark:text-zinc-400 mb-2">
                Card Color Tone
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {APPLE_COLOR_PALETTE.map((pal) => {
                  const isColorSelected = color.toLowerCase() === pal.hex.toLowerCase();
                  return (
                    <button
                      key={pal.hex}
                      type="button"
                      onClick={() => setColor(pal.hex)}
                      title={`${pal.name} (${pal.desc})`}
                      className={`min-h-[44px] rounded-2xl flex flex-col items-center justify-center p-1.5 transition-all cursor-pointer ${
                        isColorSelected
                          ? 'ring-2 ring-black dark:ring-white scale-105 shadow-md'
                          : 'hover:scale-102 opacity-85 hover:opacity-100'
                      }`}
                    >
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white shadow-xs"
                        style={{ backgroundColor: pal.hex }}
                      >
                        {isColorSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </span>
                      <span className="text-[9px] font-medium text-[#6e6e73] dark:text-zinc-400 mt-1 truncate">
                        {pal.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Icon Selector ── */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6e6e73] dark:text-zinc-400 mb-2">
                Card Icon
              </label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_ICONS.map((iconKey) => {
                  const isIconSelected = icon === iconKey;
                  return (
                    <button
                      key={iconKey}
                      type="button"
                      onClick={() => setIcon(iconKey)}
                      className={`min-h-[44px] min-w-[44px] p-2 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
                        isIconSelected
                          ? 'bg-violet-600 text-white shadow-md ring-2 ring-violet-500/30'
                          : 'bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.08] text-[#6e6e73] dark:text-zinc-300 hover:text-[#1d1d1f] dark:hover:text-white hover:bg-black/[0.06] dark:hover:bg-white/[0.08]'
                      }`}
                    >
                      {renderAccountIcon(iconKey, 'w-5 h-5 stroke-[2.2]')}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Exclude from Net Worth Checkbox */}
            <label className="flex items-center space-x-2.5 pt-1 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={excludeFromNetWorth}
                onChange={(e) => setExcludeFromNetWorth(e.target.checked)}
                className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500 border-zinc-400 dark:border-zinc-600 cursor-pointer"
              />
              <span className="text-xs text-[#6e6e73] dark:text-zinc-400">
                Exclude this account from Net Worth calculation
              </span>
            </label>
          </form>

          {/* Delete confirmation panel if editing */}
          {isEditing && confirmDelete && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-2 animate-in fade-in">
              <div className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Are you sure you want to delete {accountToEdit?.name}?</span>
              </div>
              <p className="text-[11px] text-[#6e6e73] dark:text-zinc-400">
                Transactions associated with this account will remain, but the account card will be permanently removed.
              </p>
              <div className="flex items-center space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="min-h-[38px] px-3 rounded-xl text-xs font-semibold bg-black/[0.05] dark:bg-white/[0.1] text-[#1d1d1f] dark:text-white"
                >
                  Keep Account
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isSaving}
                  className="min-h-[38px] px-4 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs cursor-pointer"
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Yes, Delete Account'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Modal Footer Bar ── */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-black/[0.06] dark:border-white/[0.08] bg-white/40 dark:bg-white/[0.02] shrink-0">
          <div>
            {isEditing && !confirmDelete && (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center space-x-1 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold text-[#6e6e73] dark:text-zinc-400 hover:text-[#1d1d1f] dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              form="account-form"
              disabled={isSaving}
              className="min-h-[44px] px-6 py-2.5 rounded-full bg-violet-600 hover:bg-violet-700 active:scale-95 text-xs font-bold text-white shadow-md transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              <span>{isSaving ? 'Saving...' : isEditing ? 'Update Account' : 'Create Account'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
