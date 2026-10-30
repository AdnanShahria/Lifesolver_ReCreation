// ── Accounts & Multi-Currency Transfers ───────────────────────────

export type AccountType =
  | 'bank'
  | 'mobile_wallet'
  | 'online_wallet'
  | 'cash'
  | 'credit_card'
  | 'crypto'
  | 'investment'
  | 'custom';

export type AccountSubtype =
  | 'bkash'
  | 'nagad'
  | 'paypal'
  | 'wise'
  | 'stripe'
  | 'crypto'
  | 'revolut'
  | 'bank'
  | 'cash'
  | 'custom'
  | null;

export type Currency =
  | 'USD'
  | 'BDT'
  | 'EUR'
  | 'GBP'
  | 'INR'
  | 'CAD'
  | 'AUD'
  | 'JPY'
  | 'CNY'
  | 'BTC'
  | 'ETH'
  | string;

export interface FinancialAccount {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  subtype?: AccountSubtype;
  currency: string;
  currentBalance: number;
  initialBalance: number;
  creditLimit?: number;
  color: string;
  icon: string;
  isActive: number;
  excludeFromNetWorth: number;
  createdAt: string;
}

export interface AccountTransfer {
  id: string;
  userId: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  destinationAmount: number;
  exchangeRate: number;
  feeAmount: number;
  date: string;
  notes?: string | null;
  fromAccountName?: string;
  toAccountName?: string;
  createdAt: string;
}

export interface CreateAccountInput {
  name: string;
  type: AccountType;
  subtype?: AccountSubtype;
  currency?: string;
  initialBalance?: number;
  creditLimit?: number;
  color?: string;
  icon?: string;
  excludeFromNetWorth?: number;
}

export interface UpdateAccountInput {
  name?: string;
  type?: AccountType;
  subtype?: AccountSubtype;
  currency?: string;
  creditLimit?: number;
  color?: string;
  icon?: string;
  isActive?: number;
  excludeFromNetWorth?: number;
}

export interface AdjustBalanceInput {
  accountId: string;
  newBalance: number;
  reason?: string;
  logTransaction?: boolean;
}

export interface TransferInput {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  destinationAmount?: number;
  exchangeRate?: number;
  feeAmount?: number;
  date?: string;
  notes?: string;
}

export interface AccountsSummary {
  totalBalance: number;
  netWorth: number;
  accountsCount: number;
  byType?: Record<string, number>;
}

export interface AccountsResponse {
  accounts: FinancialAccount[];
  summary?: AccountsSummary;
}

export interface TransfersResponse {
  transfers: AccountTransfer[];
  totalTransfers?: number;
}

// ── Transactions & General Ledger ─────────────────────────────────

export interface Transaction {
  id: string;
  userId: string;
  accountId?: string | null;
  accountName?: string | null;
  accountColor?: string | null;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string | null;
  payee?: string | null;
  transferId?: string | null;
  tags?: string[];
  date: string;
  isSpecial: number; // 0 = everyday cashflow, 1 = capital/investment
  budgetId: string | null;
  taskId?: string | null;
  createdAt: string;
}

export interface LedgerSummary {
  totalBalance: number;
  regularBalance: number;
  regularIncome: number;
  regularExpense: number;
  specialBalance: number;
  specialIncome: number;
  specialExpense: number;
  monthlyIncome: number;
  monthlyExpense: number;
  netSavingsRate: number;
}

export interface LedgerResponse {
  transactions: Transaction[];
  nextCursor: string | null;
  summary: LedgerSummary;
}

export interface Budget {
  id: string;
  userId: string;
  name: string;
  type: 'budget' | 'savings';
  targetAmount: number;
  currentAmount: number;
  period: 'weekly' | 'monthly' | 'yearly' | null;
  category: string | null;
  startDate: string | null;
  deadlineDate: string | null;
  isSpecial: number;
  createdAt: string;
  percentSpent: number;
  status: 'on-track' | 'warning' | 'exceeded';
  remaining: number;
}

export interface BudgetsResponse {
  budgets: Budget[];
  overview: {
    totalTarget: number;
    totalSpent: number;
    totalRemaining: number;
    overallPercent: number;
  };
}

export interface SavingsTransaction {
  id: string;
  savingsId: string;
  userId: string;
  type: 'deposit' | 'withdraw';
  amount: number;
  description: string | null;
  date: string;
  createdAt: string;
}

export interface SavingsPot {
  id: string;
  userId: string;
  name: string;
  type: 'savings';
  targetAmount: number;
  currentAmount: number;
  period: string | null;
  category: string | null;
  startDate: string | null;
  deadlineDate: string | null;
  isSpecial: number;
  createdAt: string;
  progressPercentage: number;
  remainingTarget: number;
  transactions: SavingsTransaction[];
}

export interface SavingsResponse {
  savings: SavingsPot[];
  summary: {
    totalSaved: number;
    totalTarget: number;
    totalRemaining: number;
    overallProgress: number;
    activePotsCount: number;
  };
}

export interface Bill {
  id: string;
  userId: string;
  name: string;
  amount: number;
  category: string;
  recurrencePeriod: 'monthly' | 'yearly' | 'weekly';
  dueDate: string;
  autoPay: number;
  status: 'paid' | 'unpaid' | 'overdue';
  daysRemaining: number;
  isOverdue: boolean;
  computedStatus: string;
  createdAt: string;
}

export interface BillsResponse {
  bills: Bill[];
  summary: {
    totalBills: number;
    totalAmount: number;
    paidAmount: number;
    unpaidAmount: number;
    overdueCount: number;
  };
}

export interface Loan {
  id: string;
  userId: string;
  type: 'given' | 'taken';
  personName: string;
  contactInfo: string | null;
  principalAmount: number;
  paidAmount: number;
  interestRate: number;
  dueDate: string | null;
  status: 'active' | 'settled' | 'overdue';
  notes: string | null;
  createdAt: string;
  remainingAmount: number;
  progressPercent: number;
}

export interface LoansResponse {
  loans: Loan[];
  summary: {
    totalReceivable: number;
    totalPayable: number;
    netDebt: number;
    totalLoansCount: number;
    settledCount: number;
  };
}

export interface CategoryBreakdown {
  category: string;
  currentAmount: number;
  previousAmount: number;
  changePercent: number;
  percentageOfTotal: number;
}

export interface CashflowMonth {
  month: string;
  label: string;
  income: number;
  expense: number;
  net: number;
  savingsRate: number;
}

export interface MonthOverMonth {
  currentMonth: string;
  previousMonth: string;
  currentIncome: number;
  previousIncome: number;
  incomeMoMPercent: number;
  currentExpense: number;
  previousExpense: number;
  expenseMoMPercent: number;
  currentNet: number;
  previousNet: number;
  netSavingsRate: number;
}

export interface FinanceAnalyticsResponse {
  monthOverMonth: MonthOverMonth;
  categoryBreakdown: CategoryBreakdown[];
  cashflowHistory: CashflowMonth[];
  topSpendingCategory: CategoryBreakdown | null;
}
