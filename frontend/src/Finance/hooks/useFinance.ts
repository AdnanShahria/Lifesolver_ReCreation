import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../_core/api';
import type {
  Transaction,
  LedgerResponse,
  BudgetsResponse,
  SavingsResponse,
  BillsResponse,
  LoansResponse,
  FinanceAnalyticsResponse,
  Budget,
  SavingsPot,
  Bill,
  Loan,
  FinancialAccount,
  AccountTransfer,
  CreateAccountInput,
  UpdateAccountInput,
  AdjustBalanceInput,
  TransferInput,
  AccountsResponse,
  TransfersResponse
} from '../types';

// ── Currency Formatter ────────────────────────────────────────────
export function formatCurrency(amount: number, currency = 'USD'): string {
  const numeric = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  
  if (currency === 'BDT') {
    return `৳${numeric.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  }
  if (currency === 'EUR') {
    return `€${numeric.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  if (currency === 'INR') {
    return `₹${numeric.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  }
  if (currency === 'GBP') {
    return `£${numeric.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  if (currency === 'CAD') {
    return `CA$${numeric.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  if (currency === 'AUD') {
    return `A$${numeric.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  if (currency === 'JPY') {
    return `¥${numeric.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }
  if (currency === 'BTC') {
    return `₿${numeric.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}`;
  }
  if (currency === 'ETH') {
    return `Ξ${numeric.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`;
  }

  return `$${numeric.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ── Financial Accounts Queries & Mutations ────────────────────────

export const DEFAULT_ACCOUNTS: FinancialAccount[] = [
  { id: 'acc_bkash', userId: '', name: 'bKash Personal', type: 'mobile_wallet', subtype: 'bkash', currency: 'BDT', currentBalance: 42500, initialBalance: 12500, color: '#ec4899', icon: 'Smartphone', isActive: 1, excludeFromNetWorth: 0, createdAt: '' },
  { id: 'acc_nagad', userId: '', name: 'Nagad Wallet', type: 'mobile_wallet', subtype: 'nagad', currency: 'BDT', currentBalance: 18500, initialBalance: 18500, color: '#f97316', icon: 'Smartphone', isActive: 1, excludeFromNetWorth: 0, createdAt: '' },
  { id: 'acc_paypal', userId: '', name: 'PayPal USD', type: 'online_wallet', subtype: 'paypal', currency: 'USD', currentBalance: 1420, initialBalance: 1420, color: '#0a84ff', icon: 'Globe', isActive: 1, excludeFromNetWorth: 0, createdAt: '' },
  { id: 'acc_chase', userId: '', name: 'Chase Checking', type: 'bank', subtype: 'bank', currency: 'USD', currentBalance: 3420.5, initialBalance: 3200, color: '#3b82f6', icon: 'Building2', isActive: 1, excludeFromNetWorth: 0, createdAt: '' },
  { id: 'acc_cash', userId: '', name: 'Cash Vault', type: 'cash', subtype: 'cash', currency: 'BDT', currentBalance: 12000, initialBalance: 650, color: '#10b981', icon: 'Banknote', isActive: 1, excludeFromNetWorth: 0, createdAt: '' },
  { id: 'acc_crypto', userId: '', name: 'Binance Crypto', type: 'crypto', subtype: 'crypto', currency: 'BTC', currentBalance: 0.24, initialBalance: 0.24, color: '#8b5cf6', icon: 'Coins', isActive: 1, excludeFromNetWorth: 0, createdAt: '' }
];

export function useAccounts() {
  return useQuery({
    queryKey: ['finance', 'accounts'],
    queryFn: async () => {
      try {
        const res = await api.get<AccountsResponse>('/api/finance/accounts');
        if (res?.accounts && res.accounts.length > 0) return res;
      } catch {
        // Fallback gracefully
      }
      return { accounts: DEFAULT_ACCOUNTS };
    },
    staleTime: 1000 * 30
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAccountInput) =>
      api.post<{ account: FinancialAccount; message: string }>('/api/finance/accounts', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'accounts'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'ledger'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'analytics'] });
    }
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...data
    }: { id: string } & UpdateAccountInput) =>
      api.put<{ account: FinancialAccount; message: string }>(`/api/finance/accounts/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'accounts'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'ledger'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'analytics'] });
    }
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.delete<{ message: string }>(`/api/finance/accounts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'accounts'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'ledger'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'analytics'] });
    }
  });
}

export function useAdjustAccountBalance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AdjustBalanceInput) =>
      api.post<{ account: FinancialAccount; message: string }>(
        `/api/finance/accounts/${data.accountId}/adjust`,
        data
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'accounts'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'ledger'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'analytics'] });
    }
  });
}

// ── Account Transfers Queries & Mutations ─────────────────────────

export interface TransferFilters {
  fromAccountId?: string;
  toAccountId?: string;
  limit?: number;
}

export function useTransfers(filters?: TransferFilters) {
  const queryParams = new URLSearchParams();
  if (filters?.fromAccountId) queryParams.set('fromAccountId', filters.fromAccountId);
  if (filters?.toAccountId) queryParams.set('toAccountId', filters.toAccountId);
  if (filters?.limit) queryParams.set('limit', String(filters.limit));

  const qs = queryParams.toString();
  const endpoint = `/api/finance/transfers${qs ? `?${qs}` : ''}`;

  return useQuery({
    queryKey: ['finance', 'transfers', filters],
    queryFn: () => api.get<TransfersResponse>(endpoint),
    staleTime: 1000 * 30
  });
}

export function useCreateTransfer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TransferInput) =>
      api.post<{ transfer: AccountTransfer; message: string }>('/api/finance/transfers', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'accounts'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'transfers'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'ledger'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'analytics'] });
    }
  });
}

export function useDeleteTransfer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.delete<{ message: string }>(`/api/finance/transfers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'accounts'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'transfers'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'ledger'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'analytics'] });
    }
  });
}

// ── Ledger Queries & Mutations ────────────────────────────────────

export interface LedgerFilters {
  accountId?: string;
  isSpecial?: number | 'all';
  type?: 'income' | 'expense';
  category?: string;
  limit?: number;
  cursor?: string;
}

export function useLedger(filters?: LedgerFilters) {
  const queryParams = new URLSearchParams();
  if (filters?.accountId) queryParams.set('accountId', filters.accountId);
  if (filters?.isSpecial !== undefined) queryParams.set('isSpecial', String(filters.isSpecial));
  if (filters?.type) queryParams.set('type', filters.type);
  if (filters?.category) queryParams.set('category', filters.category);
  if (filters?.limit) queryParams.set('limit', String(filters.limit));
  if (filters?.cursor) queryParams.set('cursor', filters.cursor);

  const qs = queryParams.toString();
  const endpoint = `/api/finance/ledger${qs ? `?${qs}` : ''}`;

  return useQuery({
    queryKey: ['finance', 'ledger', filters],
    queryFn: () => api.get<LedgerResponse>(endpoint),
    staleTime: 1000 * 30
  });
}

// Alias for flexibility across components
export const useTransactions = useLedger;

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      type: 'income' | 'expense';
      amount: number;
      category: string;
      description?: string;
      date?: string;
      isSpecial?: number;
      budgetId?: string | null;
      accountId?: string | null;
      accountName?: string | null;
      accountColor?: string | null;
      payee?: string | null;
      tags?: string[];
    }) => api.post<{ transaction: Transaction; message: string }>('/api/finance/transactions', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance'] });
    }
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...data
    }: {
      id: string;
      type?: 'income' | 'expense';
      amount?: number;
      category?: string;
      description?: string;
      date?: string;
      isSpecial?: number;
      budgetId?: string | null;
      accountId?: string | null;
      accountName?: string | null;
      accountColor?: string | null;
      payee?: string | null;
      tags?: string[];
    }) => api.put<{ transaction: Transaction; message: string }>(`/api/finance/transactions/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance'] });
    }
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<{ message: string }>(`/api/finance/transactions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance'] });
    }
  });
}

// ── Budgets Queries & Mutations ───────────────────────────────────

export function useBudgets() {
  return useQuery({
    queryKey: ['finance', 'budgets'],
    queryFn: () => api.get<BudgetsResponse>('/api/finance/budgets'),
    staleTime: 1000 * 30
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name: string;
      targetAmount: number;
      category: string;
      period?: 'weekly' | 'monthly' | 'yearly';
      isSpecial?: number;
    }) => api.post<{ budget: Budget; message: string }>('/api/finance/budgets', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'budgets'] });
    }
  });
}

export function useUpdateBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...data
    }: {
      id: string;
      name?: string;
      targetAmount?: number;
      category?: string;
      period?: 'weekly' | 'monthly' | 'yearly';
    }) => api.put<{ budget: Budget; message: string }>(`/api/finance/budgets/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'budgets'] });
    }
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<{ message: string }>(`/api/finance/budgets/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'budgets'] });
    }
  });
}

// ── Savings Pots Queries & Mutations ──────────────────────────────

export function useSavings() {
  return useQuery({
    queryKey: ['finance', 'savings'],
    queryFn: () => api.get<SavingsResponse>('/api/finance/savings'),
    staleTime: 1000 * 30
  });
}

export function useCreateSavingsPot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name: string;
      targetAmount: number;
      category?: string;
      deadlineDate?: string | null;
      isSpecial?: number;
    }) => api.post<{ pot: SavingsPot; message: string }>('/api/finance/savings', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'savings'] });
    }
  });
}

export function useDepositSavings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      amount,
      description,
      logToLedger
    }: {
      id: string;
      amount: number;
      description?: string;
      logToLedger?: boolean;
    }) => api.post<{ pot: SavingsPot; message: string }>(`/api/finance/savings/${id}/deposit`, {
      amount,
      description,
      logToLedger
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'savings'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'ledger'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'analytics'] });
    }
  });
}

export function useWithdrawSavings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      amount,
      description,
      logToLedger
    }: {
      id: string;
      amount: number;
      description?: string;
      logToLedger?: boolean;
    }) => api.post<{ pot: SavingsPot; message: string }>(`/api/finance/savings/${id}/withdraw`, {
      amount,
      description,
      logToLedger
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'savings'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'ledger'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'analytics'] });
    }
  });
}

export function useDeleteSavingsPot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<{ message: string }>(`/api/finance/savings/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'savings'] });
    }
  });
}

// ── Bills & Subscriptions Queries & Mutations ─────────────────────

export function useBills() {
  return useQuery({
    queryKey: ['finance', 'bills'],
    queryFn: () => api.get<BillsResponse>('/api/finance/bills'),
    staleTime: 1000 * 30
  });
}

export function useCreateBill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name: string;
      amount: number;
      category?: string;
      recurrencePeriod?: 'monthly' | 'yearly' | 'weekly';
      dueDate: string;
      autoPay?: boolean | number;
    }) => api.post<{ bill: Bill; message: string }>('/api/finance/bills', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'bills'] });
    }
  });
}

export function usePayBill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<{ bill: Bill; transaction: Transaction; message: string }>(`/api/finance/bills/${id}/pay`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'bills'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'ledger'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'analytics'] });
    }
  });
}

export function useUpdateBill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...data
    }: {
      id: string;
      name?: string;
      amount?: number;
      category?: string;
      recurrencePeriod?: 'monthly' | 'yearly' | 'weekly';
      dueDate?: string;
      autoPay?: boolean | number;
      status?: 'paid' | 'unpaid' | 'overdue';
    }) => api.put<{ bill: Bill; message: string }>(`/api/finance/bills/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'bills'] });
    }
  });
}

export function useDeleteBill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<{ message: string }>(`/api/finance/bills/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'bills'] });
    }
  });
}

// ── Loans & Debt Tracker Queries & Mutations ──────────────────────

export function useLoans() {
  return useQuery({
    queryKey: ['finance', 'loans'],
    queryFn: () => api.get<LoansResponse>('/api/finance/loans'),
    staleTime: 1000 * 30
  });
}

export function useCreateLoan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      type: 'given' | 'taken';
      personName: string;
      contactInfo?: string | null;
      principalAmount: number;
      interestRate?: number;
      dueDate?: string | null;
      notes?: string | null;
    }) => api.post<{ loan: Loan; message: string }>('/api/finance/loans', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'loans'] });
    }
  });
}

export function useRepayLoan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      repaymentAmount,
      logToLedger
    }: {
      id: string;
      repaymentAmount: number;
      logToLedger?: boolean;
    }) => api.post<{ loan: Loan; transaction?: Transaction | null; message: string }>(`/api/finance/loans/${id}/repay`, {
      repaymentAmount,
      logToLedger
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'loans'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'ledger'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'analytics'] });
    }
  });
}

export function useDeleteLoan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<{ message: string }>(`/api/finance/loans/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'loans'] });
    }
  });
}

// ── Financial Analytics ───────────────────────────────────────────

export function useFinanceAnalytics() {
  return useQuery({
    queryKey: ['finance', 'analytics'],
    queryFn: () => api.get<FinanceAnalyticsResponse>('/api/finance/analytics'),
    staleTime: 1000 * 60
  });
}
