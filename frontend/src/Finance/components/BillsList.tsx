import React from 'react';
import { 
  CreditCard, 
  Plus, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Trash2, 
  Zap,
  Repeat
} from 'lucide-react';
import type { Bill, BillsResponse } from '../types';
import { formatCurrency, usePayBill, useDeleteBill } from '../hooks/useFinance';

interface BillsListProps {
  billsData?: BillsResponse;
  isLoading: boolean;
  currency: string;
  onOpenCreateBillModal: () => void;
}

export const BillsList: React.FC<BillsListProps> = ({
  billsData,
  isLoading,
  currency,
  onOpenCreateBillModal
}) => {
  const payBillMutation = usePayBill();
  const deleteBillMutation = useDeleteBill();

  const bills = billsData?.bills ?? [];
  const summary = billsData?.summary;

  const handlePay = async (id: string, name: string, amount: number) => {
    if (window.confirm(`Mark "${name}" as paid? This will automatically log a ${formatCurrency(amount, currency)} expense in your everyday cash ledger.`)) {
      await payBillMutation.mutateAsync(id);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Delete bill reminder for "${name}"?`)) {
      await deleteBillMutation.mutateAsync(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Summary Banner ── */}
      <div className="apple-glass rounded-2xl p-6 border border-zinc-800 bg-gradient-to-r from-zinc-900 via-zinc-900/80 to-zinc-950 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-violet-400">
            <CreditCard className="w-4 h-4 text-violet-400" />
            <span>Recurring Obligations Engine</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
            Bills & Subscriptions
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Monitor recurring renewals, utility commitments, and prevent accidental subscription churn.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="bg-zinc-900/80 px-4 py-2.5 rounded-xl border border-zinc-800">
            <div className="text-[10px] font-mono text-zinc-400 uppercase">Monthly Burn Rate</div>
            <div className="text-sm sm:text-base font-bold text-rose-400 mt-0.5">
              {formatCurrency(summary?.totalAmount ?? 0, currency)}
            </div>
          </div>

          <div className="bg-zinc-900/80 px-4 py-2.5 rounded-xl border border-zinc-800">
            <div className="text-[10px] font-mono text-zinc-400 uppercase">Unpaid Outstanding</div>
            <div className="text-sm sm:text-base font-bold text-amber-400 mt-0.5">
              {formatCurrency(summary?.unpaidAmount ?? 0, currency)}
            </div>
          </div>

          <button
            onClick={onOpenCreateBillModal}
            className="min-h-[44px] px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 active:scale-[0.98] text-white text-xs sm:text-sm font-medium flex items-center space-x-2 transition-all shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>New Bill</span>
          </button>
        </div>
      </div>

      {/* ── Overdue Warning Banner if any ── */}
      {(summary?.overdueCount ?? 0) > 0 && (
        <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 flex items-center space-x-3 text-rose-300 text-xs">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>
            You have <strong className="text-rose-200 font-bold">{summary?.overdueCount} overdue</strong> bill(s). Pay them promptly to avoid service disruption or late penalties.
          </span>
        </div>
      )}

      {/* ── Bills List ── */}
      {isLoading ? (
        <div className="apple-glass rounded-2xl p-12 text-center text-zinc-500 text-xs">
          Loading billing schedule...
        </div>
      ) : bills.length === 0 ? (
        <div className="apple-glass rounded-2xl p-12 text-center border border-zinc-800/80 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
            <Repeat className="w-6 h-6 text-violet-400" />
          </div>
          <div className="text-sm font-semibold text-white">No active subscriptions or bills</div>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Add recurring subscriptions like Spotify, Cloudflare, Gym, or your internet bill for automated countdowns.
          </p>
          <button
            onClick={onOpenCreateBillModal}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 text-xs font-medium inline-flex items-center space-x-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Bill</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bills.map((bill) => {
            const isPaid = bill.status === 'paid';
            const isOverdue = bill.isOverdue;

            return (
              <div
                key={bill.id}
                className={`apple-glass-card p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  isOverdue 
                    ? 'border-rose-500/40 bg-rose-950/10' 
                    : isPaid 
                      ? 'border-zinc-800/80 bg-zinc-900/40 opacity-80' 
                      : 'border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-base font-bold text-white flex items-center space-x-2">
                        <span>{bill.name}</span>
                        {bill.autoPay === 1 && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20 flex items-center space-x-1">
                            <Zap className="w-3 h-3 text-violet-400" />
                            <span>Auto-Pay</span>
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-zinc-400 mt-1 flex items-center space-x-2">
                        <span>{bill.category}</span>
                        <span>·</span>
                        <span className="capitalize text-zinc-400">{bill.recurrencePeriod}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border flex items-center space-x-1 ${
                        isPaid 
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' 
                          : isOverdue 
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' 
                            : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                      }`}>
                        {isPaid ? <CheckCircle2 className="w-3 h-3" /> : isOverdue ? <AlertCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        <span className="capitalize">{bill.status}</span>
                      </span>

                      <button
                        onClick={() => handleDelete(bill.id, bill.name)}
                        className="min-h-[36px] min-w-[36px] p-2 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Amount & Due Date */}
                  <div className="mt-4 pt-4 border-t border-zinc-800/80 flex items-baseline justify-between">
                    <div className="text-2xl font-extrabold text-white">
                      {formatCurrency(bill.amount, currency)}
                    </div>
                    
                    <div className="text-right text-xs">
                      <div className="font-mono text-zinc-400">Due {bill.dueDate}</div>
                      <div className={`text-[11px] font-medium mt-0.5 ${
                        isOverdue 
                          ? 'text-rose-400' 
                          : isPaid 
                            ? 'text-emerald-400' 
                            : bill.daysRemaining <= 3 
                              ? 'text-amber-400' 
                              : 'text-zinc-500'
                      }`}>
                        {isPaid 
                          ? 'Paid for cycle' 
                          : isOverdue 
                            ? `${Math.abs(bill.daysRemaining)} days overdue!` 
                            : bill.daysRemaining === 0 
                              ? 'Due today!' 
                              : `${bill.daysRemaining} days remaining`}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Action (Touch target >= 44px) */}
                <div className="mt-4 pt-3 border-t border-zinc-800/60">
                  {isPaid ? (
                    <div className="text-xs text-emerald-400/80 font-mono flex items-center justify-center space-x-1.5 py-2">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Expense logged in ledger</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handlePay(bill.id, bill.name, bill.amount)}
                      className="w-full min-h-[44px] py-2 px-4 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 active:scale-[0.98] text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center justify-center space-x-2 transition-all shadow-md"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Mark as Paid (Auto-Log Expense)</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
