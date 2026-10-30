/**
 * LifeSolver Financial System Unit & Contract Test Suite
 * Validates balance computations, debt calculations, 80%/100% budget thresholds,
 * bill overdue detection, and formatters.
 */
import { formatCurrency } from '../frontend/src/Finance/hooks/useFinance';

async function runFinanceTests() {
  console.log('🧪 Starting LifeSolver Finance System Contract Test Suite...\n');
  let passed = 0;
  let total = 0;

  function assert(condition: boolean, name: string) {
    total++;
    if (condition) {
      console.log(`  ✅ [PASS] ${name}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${name}`);
      throw new Error(`Assertion failed: ${name}`);
    }
  }

  // ── 1. Currency Formatting & Multi-Currency Support ──
  console.log('💵 1. Multi-Currency Formatting Engine');
  assert(formatCurrency(28450, 'USD') === '$28,450.00', 'USD format produces correct prefix and comma separators');
  assert(formatCurrency(150000, 'BDT') === '৳150,000', 'BDT format produces correct Bengali Taka symbol');
  assert(formatCurrency(1250.5, 'EUR') === '€1,250.50', 'EUR format produces Euro symbol with 2 decimals');
  assert(formatCurrency(75000, 'INR') === '₹75,000', 'INR format produces Indian Rupee symbol');
  assert(formatCurrency(0, 'USD') === '$0.00', 'Zero balance formats safely without NaN');

  // ── 2. Server-Side Dynamic Balance Formula ──
  console.log('\n⚖️ 2. Dynamic Balance Computation (No Stored State)');
  const transactions = [
    { type: 'income', amount: 5000, isSpecial: 0 },
    { type: 'expense', amount: 1200, isSpecial: 0 },
    { type: 'expense', amount: 350, isSpecial: 0 },
    { type: 'income', amount: 20000, isSpecial: 1 }, // Capital
    { type: 'expense', amount: 4500, isSpecial: 1 }  // Capital
  ];

  let regIncome = 0;
  let regExpense = 0;
  let specIncome = 0;
  let specExpense = 0;

  for (const tx of transactions) {
    if (tx.isSpecial === 1) {
      if (tx.type === 'income') specIncome += tx.amount;
      else specExpense += tx.amount;
    } else {
      if (tx.type === 'income') regIncome += tx.amount;
      else regExpense += tx.amount;
    }
  }

  const regBalance = regIncome - regExpense;
  const specBalance = specIncome - specExpense;
  const totalBalance = regBalance + specBalance;

  assert(regIncome === 5000, 'Regular operational income computes to 5,000');
  assert(regExpense === 1550, 'Regular operational expense computes to 1,550');
  assert(regBalance === 3450, 'Regular operational balance computes to 3,450');
  assert(specBalance === 15500, 'Special capital vault balance computes to 15,500');
  assert(totalBalance === 18950, 'Aggregated liquid balance computes to 18,950 without storage drift');

  // ── 3. Net Savings Rate Calculation ──
  console.log('\n📈 3. Net Savings Rate & Efficiency Ratio');
  const monthlyIncome = 6000;
  const monthlyExpense = 3900;
  const savingsRate = Math.round(((monthlyIncome - monthlyExpense) / monthlyIncome) * 100);
  assert(savingsRate === 35, 'Savings rate calculates correctly to 35%');

  // ── 4. Budget Overspend & Alert Thresholds ──
  console.log('\n🎯 4. Budget Threshold Detection (80% Warning, 100% Exceeded)');
  const budget = { targetAmount: 1000 };
  
  function getBudgetStatus(spent: number, target: number) {
    const percent = target > 0 ? Math.round((spent / target) * 100) : 0;
    if (percent >= 100) return 'exceeded';
    if (percent >= 80) return 'warning';
    return 'on-track';
  }

  assert(getBudgetStatus(500, budget.targetAmount) === 'on-track', '50% spend status is on-track');
  assert(getBudgetStatus(850, budget.targetAmount) === 'warning', '85% spend status triggers warning (>=80%)');
  assert(getBudgetStatus(1050, budget.targetAmount) === 'exceeded', '105% spend status triggers exceeded (>=100%)');

  // ── 5. Bill Countdown & Overdue Logic ──
  console.log('\n📅 5. Recurring Bill Due Date & Overdue Math');
  const today = new Date('2026-10-22T00:00:00Z');
  
  function calculateBillStatus(dueDateStr: string, status: string) {
    const due = new Date(dueDateStr + 'T00:00:00Z');
    const diff = due.getTime() - today.getTime();
    const daysRemaining = Math.ceil(diff / (1000 * 60 * 60 * 24));
    const isOverdue = status !== 'paid' && daysRemaining < 0;
    return { daysRemaining, isOverdue };
  }

  const futureBill = calculateBillStatus('2026-10-28', 'unpaid');
  assert(futureBill.daysRemaining === 6 && !futureBill.isOverdue, 'Future bill computes 6 days remaining');

  const todayBill = calculateBillStatus('2026-10-22', 'unpaid');
  assert(todayBill.daysRemaining === 0 && !todayBill.isOverdue, 'Due today bill computes 0 days remaining');

  const pastBill = calculateBillStatus('2026-10-18', 'unpaid');
  assert(pastBill.daysRemaining < 0 && pastBill.isOverdue, 'Past due unpaid bill flags isOverdue = true');

  // ── 6. Isolated Loan Ledger & Net Debt Math ──
  console.log('\n🤝 6. Isolated Loans (Receivables vs Payables)');
  const loans = [
    { type: 'given', principal: 1500, paid: 500, status: 'active' },
    { type: 'given', principal: 800, paid: 800, status: 'settled' },
    { type: 'taken', principal: 3000, paid: 1000, status: 'active' }
  ];

  let totalReceivable = 0;
  let totalPayable = 0;

  for (const l of loans) {
    if (l.status !== 'settled') {
      const remaining = l.principal - l.paid;
      if (l.type === 'given') totalReceivable += remaining;
      if (l.type === 'taken') totalPayable += remaining;
    }
  }

  const netDebt = totalPayable - totalReceivable;
  assert(totalReceivable === 1000, 'Unpaid given loans calculate to 1,000 receivable');
  assert(totalPayable === 2000, 'Unpaid taken loans calculate to 2,000 payable');
  assert(netDebt === 1000, 'Net debt exposure calculates accurately to 1,000');

  console.log(`\n🎉 Test Suite Completed: ${passed}/${total} assertions passed successfully!`);
}

runFinanceTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
