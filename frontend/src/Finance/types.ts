export interface Transaction {
  id: string;
  userId: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string | null;
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
