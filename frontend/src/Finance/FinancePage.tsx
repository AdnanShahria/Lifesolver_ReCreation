import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTheme } from '../_core/ThemeContext';
import { 
  Wallet, 
  ArrowLeft, 
  Target, 
  PiggyBank, 
  CreditCard, 
  HandCoins, 
  BarChart3, 
  Sparkles,
  Layers,
  LayoutGrid
} from 'lucide-react';

import { 
  useLedger, 
  useBudgets, 
  useSavings, 
  useBills, 
  useLoans, 
  useFinanceAnalytics 
} from './hooks/useFinance';

import type { SavingsPot, Loan } from './types';

import { Sidebar } from '../_core/Sidebar';
import { FinanceOverviewDemo } from './components/FinanceOverviewDemo';
import { SummaryCards } from './components/SummaryCards';
import { LedgerTable } from './components/LedgerTable';
import { BudgetsPanel } from './components/BudgetsPanel';
import { SavingsPots } from './components/SavingsPots';
import { BillsList } from './components/BillsList';
import { LoansTracker } from './components/LoansTracker';
import { FinanceAnalytics } from './components/FinanceAnalytics';

import { TransactionModal } from './components/modals/TransactionModal';
import { BudgetModal } from './components/modals/BudgetModal';
import { SavingsModal } from './components/modals/SavingsModal';
import { SavingsActionModal } from './components/modals/SavingsActionModal';
import { BillModal } from './components/modals/BillModal';
import { LoanModal } from './components/modals/LoanModal';
import { RepaymentModal } from './components/modals/RepaymentModal';

type FinanceTab = 'overview' | 'ledger' | 'budgets' | 'savings' | 'bills' | 'loans' | 'analytics';

export const FinancePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Tab state (query param sync: ?tab=...) - defaults to 'overview' (the demo design)
  const activeTab = (searchParams.get('tab') as FinanceTab) || 'overview';
  const setActiveTab = (tab: FinanceTab) => {
    setSearchParams({ tab });
  };

  // Global theme synchronization (White / Light mode default)
  const { theme, isDark, toggleTheme } = useTheme();

  // Currency preference: default to BDT to match user's screenshot
  const [currency, setCurrency] = useState<'BDT' | 'USD' | 'EUR' | 'INR'>('BDT');
  const [ledgerSubMode, setLedgerSubMode] = useState<'regular' | 'special'>('regular');

  // Queries
  const { data: ledgerData, isLoading: isLedgerLoading } = useLedger({
    isSpecial: ledgerSubMode === 'regular' ? 0 : 1
  });
  const { data: budgetsData, isLoading: isBudgetsLoading } = useBudgets();
  const { data: savingsData, isLoading: isSavingsLoading } = useSavings();
  const { data: billsData, isLoading: isBillsLoading } = useBills();
  const { data: loansData, isLoading: isLoansLoading } = useLoans();
  const { data: analyticsData, isLoading: isAnalyticsLoading } = useFinanceAnalytics();

  // Modal states
  const [transactionModalOpen, setTransactionModalOpen] = useState(false);
  const [transactionModalType, setTransactionModalType] = useState<'income' | 'expense'>('expense');
  const [transactionModalIsSpecial, setTransactionModalIsSpecial] = useState(0);

  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [savingsModalOpen, setSavingsModalOpen] = useState(false);
  
  const [savingsActionModalOpen, setSavingsActionModalOpen] = useState(false);
  const [selectedSavingsPot, setSelectedSavingsPot] = useState<SavingsPot | null>(null);
  const [savingsActionType, setSavingsActionType] = useState<'deposit' | 'withdraw'>('deposit');

  const [billModalOpen, setBillModalOpen] = useState(false);
  const [loanModalOpen, setLoanModalOpen] = useState(false);

  const [repaymentModalOpen, setRepaymentModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);

  const handleOpenTransaction = (type: 'income' | 'expense', isSpecial = 0) => {
    setTransactionModalType(type);
    setTransactionModalIsSpecial(isSpecial);
    setTransactionModalOpen(true);
  };

  const handleOpenSavingsAction = (pot: SavingsPot, action: 'deposit' | 'withdraw') => {
    setSelectedSavingsPot(pot);
    setSavingsActionType(action);
    setSavingsActionModalOpen(true);
  };

  const handleOpenRepay = (loan: Loan) => {
    setSelectedLoan(loan);
    setRepaymentModalOpen(true);
  };

  // Counts for badge notifications
  const overdueBillsCount = billsData?.summary?.overdueCount ?? 0;
  const activeLoansCount = loansData?.summary?.totalLoansCount ?? 0;

  return (
    <div className={`h-screen w-screen overflow-hidden flex transition-colors duration-200 font-sans ${
      isDark ? 'bg-[#07080e] text-zinc-100' : 'bg-[#f4f7fb] text-zinc-900'
    }`}>
      {/* ── Desktop & Mobile Unified Left Sidebar Navigation ── */}
      <Sidebar
        currentVertical="finance"
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* ── Main Viewport Area ── */}
      <main className="flex-1 min-w-0 p-4 sm:p-8 pb-32 sm:pb-16 overflow-y-auto h-screen">
        <div className="max-w-6xl mx-auto space-y-6">

          {/* ── Header: Title & Subtitle + Currency Switcher ── */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              {/* Squircle Finance Logo */}
              <div className="w-11 h-11 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-sm shrink-0">
                <Wallet className="w-6 h-6 text-cyan-400" />
              </div>

              <div>
                <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-zinc-950'}`}>
                  Finance
                </h1>
                <p className={`text-xs sm:text-sm font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  Track your income and expenses
                </p>
              </div>
            </div>

            {/* Currency Switcher */}
            <div className={`flex items-center space-x-1.5 p-1 rounded-2xl border text-xs ${
              isDark ? 'bg-[#10131d] border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
            }`}>
              {(['BDT', 'USD', 'EUR', 'INR'] as const).map((curr) => (
                <button
                  key={curr}
                  onClick={() => setCurrency(curr)}
                  className={`min-h-[36px] px-3 py-1.5 rounded-xl font-mono font-bold transition-all ${
                    currency === curr
                      ? 'bg-cyan-500 text-zinc-950 shadow-sm'
                      : isDark
                        ? 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                        : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
                  }`}
                >
                  {curr === 'BDT' ? '৳ BDT' : curr === 'USD' ? '$ USD' : curr === 'EUR' ? '€ EUR' : '₹ INR'}
                </button>
              ))}
            </div>
          </div>

          {/* ── Horizontal Navigation Bar (Apple HIG: touch target >= 44px) ── */}
          <div className={`flex items-center space-x-1 p-1.5 rounded-2xl border overflow-x-auto select-none ${
            isDark ? 'bg-[#10131d] border-zinc-800/80' : 'bg-white border-zinc-200/80 shadow-sm'
          }`}>
            <button
              onClick={() => setActiveTab('overview')}
              className={`min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center space-x-2 transition-all shrink-0 ${
                activeTab === 'overview'
                  ? 'bg-cyan-500 text-zinc-950 shadow-md font-bold'
                  : isDark
                    ? 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'
                    : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('ledger')}
              className={`min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center space-x-2 transition-all shrink-0 ${
                activeTab === 'ledger'
                  ? 'bg-cyan-500 text-zinc-950 shadow-md font-bold'
                  : isDark
                    ? 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'
                    : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span>Dual Ledgers</span>
            </button>

            <button
              onClick={() => setActiveTab('budgets')}
              className={`min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center space-x-2 transition-all shrink-0 ${
                activeTab === 'budgets'
                  ? 'bg-cyan-500 text-zinc-950 shadow-md font-bold'
                  : isDark
                    ? 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'
                    : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
              }`}
            >
              <Target className="w-4 h-4" />
              <span>Spending Budgets</span>
            </button>

            <button
              onClick={() => setActiveTab('savings')}
              className={`min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center space-x-2 transition-all shrink-0 ${
                activeTab === 'savings'
                  ? 'bg-cyan-500 text-zinc-950 shadow-md font-bold'
                  : isDark
                    ? 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'
                    : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
              }`}
            >
              <PiggyBank className="w-4 h-4" />
              <span>Savings Pots</span>
            </button>

            <button
              onClick={() => setActiveTab('bills')}
              className={`min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center space-x-2 transition-all shrink-0 ${
                activeTab === 'bills'
                  ? 'bg-cyan-500 text-zinc-950 shadow-md font-bold'
                  : isDark
                    ? 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'
                    : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Bills & Subs</span>
              {overdueBillsCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-rose-500 text-white font-mono text-[10px] flex items-center justify-center font-bold">
                  {overdueBillsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('loans')}
              className={`min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center space-x-2 transition-all shrink-0 ${
                activeTab === 'loans'
                  ? 'bg-cyan-500 text-zinc-950 shadow-md font-bold'
                  : isDark
                    ? 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'
                    : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
              }`}
            >
              <HandCoins className="w-4 h-4" />
              <span>Loans & Debt</span>
              {activeLoansCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-300 font-mono text-[10px] flex items-center justify-center">
                  {activeLoansCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center space-x-2 transition-all shrink-0 ${
                activeTab === 'analytics'
                  ? 'bg-cyan-500 text-zinc-950 shadow-md font-bold'
                  : isDark
                    ? 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'
                    : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Analytics & MoM</span>
            </button>
          </div>

          {/* ── Active Tab Viewport ── */}
          <div className="pt-1">
            {/* 1. Overview (Previous Design Demo Layout) */}
            {activeTab === 'overview' && (
              <FinanceOverviewDemo
                summary={ledgerData?.summary}
                transactions={ledgerData?.transactions ?? []}
                budgetsData={budgetsData}
                savingsData={savingsData}
                analyticsData={analyticsData}
                currency={currency}
                theme={theme}
                onOpenTransactionModal={handleOpenTransaction}
                onSwitchTab={setActiveTab}
              />
            )}

            {/* 2. Dual Ledgers */}
            {activeTab === 'ledger' && (
              <div className="space-y-4">
                <SummaryCards
                  summary={ledgerData?.summary}
                  loansData={loansData}
                  currency={currency}
                  onOpenTransactionModal={handleOpenTransaction}
                />

                {/* Dual Ledger Mode Switcher */}
                <div className="flex items-center justify-between">
                  <div className={`flex items-center p-1 rounded-2xl border text-xs ${
                    isDark ? 'bg-[#10131d] border-zinc-800' : 'bg-white border-zinc-200'
                  }`}>
                    <button
                      onClick={() => setLedgerSubMode('regular')}
                      className={`min-h-[40px] px-4 py-2 rounded-xl font-medium transition-all ${
                        ledgerSubMode === 'regular'
                          ? 'bg-cyan-500 text-zinc-950 font-bold shadow-md'
                          : isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-zinc-950'
                      }`}
                    >
                      Everyday Operational Ledger
                    </button>

                    <button
                      onClick={() => setLedgerSubMode('special')}
                      className={`min-h-[40px] px-4 py-2 rounded-xl font-medium transition-all ${
                        ledgerSubMode === 'special'
                          ? 'bg-indigo-600 text-white font-bold shadow-md'
                          : isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-zinc-950'
                      }`}
                    >
                      Special Capital & Asset Ledger
                    </button>
                  </div>

                  <div className="hidden sm:block text-xs font-mono text-zinc-500">
                    Showing {ledgerSubMode === 'regular' ? 'Everyday Operational Cash' : 'High-Ticket Capital'}
                  </div>
                </div>

                <LedgerTable
                  transactions={ledgerData?.transactions ?? []}
                  isLoading={isLedgerLoading}
                  currency={currency}
                  isSpecialMode={ledgerSubMode === 'special'}
                  onOpenCreateModal={() => handleOpenTransaction('expense', ledgerSubMode === 'special' ? 1 : 0)}
                />
              </div>
            )}

            {/* 3. Spending Budgets */}
            {activeTab === 'budgets' && (
              <BudgetsPanel
                budgetsData={budgetsData}
                isLoading={isBudgetsLoading}
                currency={currency}
                onOpenCreateBudgetModal={() => setBudgetModalOpen(true)}
              />
            )}

            {/* 4. Savings Pots */}
            {activeTab === 'savings' && (
              <SavingsPots
                savingsData={savingsData}
                isLoading={isSavingsLoading}
                currency={currency}
                onOpenCreateSavingsModal={() => setSavingsModalOpen(true)}
                onOpenActionModal={handleOpenSavingsAction}
              />
            )}

            {/* 5. Bills & Subscriptions */}
            {activeTab === 'bills' && (
              <BillsList
                billsData={billsData}
                isLoading={isBillsLoading}
                currency={currency}
                onOpenCreateBillModal={() => setBillModalOpen(true)}
              />
            )}

            {/* 6. Loans & Debt Tracker */}
            {activeTab === 'loans' && (
              <LoansTracker
                loansData={loansData}
                isLoading={isLoansLoading}
                currency={currency}
                onOpenCreateLoanModal={() => setLoanModalOpen(true)}
                onOpenRepayModal={handleOpenRepay}
              />
            )}

            {/* 7. Deep Analytics */}
            {activeTab === 'analytics' && (
              <FinanceAnalytics
                analyticsData={analyticsData}
                isLoading={isAnalyticsLoading}
                currency={currency}
              />
            )}
          </div>

        </div>
      </main>

      {/* ── Mobile Docked Navigation Bar (Apple HIG: touch target >= 44px) ── */}
      <div className={`sm:hidden fixed bottom-3 left-3 right-3 z-40 backdrop-blur-xl border rounded-2xl p-1.5 flex justify-around items-center shadow-2xl ${
        isDark ? 'bg-zinc-950/95 border-zinc-800' : 'bg-white/95 border-zinc-200'
      }`}>
        <button
          onClick={() => setActiveTab('overview')}
          className={`min-h-[48px] min-w-[48px] flex flex-col items-center justify-center rounded-xl px-2 py-1 transition-all ${
            activeTab === 'overview' ? 'text-cyan-400 bg-cyan-500/10' : 'text-zinc-500'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-medium">Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('ledger')}
          className={`min-h-[48px] min-w-[48px] flex flex-col items-center justify-center rounded-xl px-2 py-1 transition-all ${
            activeTab === 'ledger' ? 'text-cyan-400 bg-cyan-500/10' : 'text-zinc-500'
          }`}
        >
          <Wallet className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-medium">Ledger</span>
        </button>

        <button
          onClick={() => setActiveTab('budgets')}
          className={`min-h-[48px] min-w-[48px] flex flex-col items-center justify-center rounded-xl px-2 py-1 transition-all ${
            activeTab === 'budgets' ? 'text-cyan-400 bg-cyan-500/10' : 'text-zinc-500'
          }`}
        >
          <Target className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-medium">Budgets</span>
        </button>

        <button
          onClick={() => setActiveTab('savings')}
          className={`min-h-[48px] min-w-[48px] flex flex-col items-center justify-center rounded-xl px-2 py-1 transition-all ${
            activeTab === 'savings' ? 'text-cyan-400 bg-cyan-500/10' : 'text-zinc-500'
          }`}
        >
          <PiggyBank className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-medium">Savings</span>
        </button>

        <button
          onClick={() => setActiveTab('bills')}
          className={`min-h-[48px] min-w-[48px] flex flex-col items-center justify-center rounded-xl px-2 py-1 transition-all relative ${
            activeTab === 'bills' ? 'text-cyan-400 bg-cyan-500/10' : 'text-zinc-500'
          }`}
        >
          <CreditCard className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-medium">Bills</span>
          {overdueBillsCount > 0 && (
            <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-zinc-950" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('loans')}
          className={`min-h-[48px] min-w-[48px] flex flex-col items-center justify-center rounded-xl px-2 py-1 transition-all ${
            activeTab === 'loans' ? 'text-cyan-400 bg-cyan-500/10' : 'text-zinc-500'
          }`}
        >
          <HandCoins className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-medium">Loans</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`min-h-[48px] min-w-[48px] flex flex-col items-center justify-center rounded-xl px-2 py-1 transition-all ${
            activeTab === 'analytics' ? 'text-cyan-400 bg-cyan-500/10' : 'text-zinc-500'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-medium">MoM</span>
        </button>
      </div>

      {/* ── Action Modals ── */}
      <TransactionModal
        isOpen={transactionModalOpen}
        onClose={() => setTransactionModalOpen(false)}
        defaultType={transactionModalType}
        defaultIsSpecial={transactionModalIsSpecial}
      />

      <BudgetModal
        isOpen={budgetModalOpen}
        onClose={() => setBudgetModalOpen(false)}
      />

      <SavingsModal
        isOpen={savingsModalOpen}
        onClose={() => setSavingsModalOpen(false)}
      />

      <SavingsActionModal
        isOpen={savingsActionModalOpen}
        onClose={() => {
          setSavingsActionModalOpen(false);
          setSelectedSavingsPot(null);
        }}
        pot={selectedSavingsPot}
        action={savingsActionType}
        currency={currency}
      />

      <BillModal
        isOpen={billModalOpen}
        onClose={() => setBillModalOpen(false)}
      />

      <LoanModal
        isOpen={loanModalOpen}
        onClose={() => setLoanModalOpen(false)}
      />

      <RepaymentModal
        isOpen={repaymentModalOpen}
        onClose={() => {
          setRepaymentModalOpen(false);
          setSelectedLoan(null);
        }}
        loan={selectedLoan}
        currency={currency}
      />

    </div>
  );
};
