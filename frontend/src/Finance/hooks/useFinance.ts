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
  Loan
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

  return `$${numeric.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ── Ledger Queries & Mutations ────────────────────────────────────

export interface LedgerFilters {
  isSpecial?: number | 'all';
  type?: 'income' | 'expense';
  category?: string;
  limit?: number;
  cursor?: string;
}

export function useLedger(filters?: LedgerFilters) {
  const queryParams = new URLSearchParams();
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
