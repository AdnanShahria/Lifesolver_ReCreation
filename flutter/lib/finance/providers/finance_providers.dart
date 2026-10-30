import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/financial_account.dart';
import '../models/transaction.dart';
import '../models/account_transfer.dart';
import '../models/budget.dart';
import '../models/finance_analytics.dart';
import '../services/finance_api_service.dart';

final financeApiServiceProvider = Provider<FinanceApiService>((ref) {
  return FinanceApiService();
});

// Currently selected account for filtering ledger and cards (null = All Accounts)
final selectedAccountFilterProvider = StateProvider<String?>((ref) => null);

// ── Financial Accounts Provider ──
final accountsProvider = AsyncNotifierProvider<AccountsNotifier, List<FinancialAccount>>(() {
  return AccountsNotifier();
});

class AccountsNotifier extends AsyncNotifier<List<FinancialAccount>> {
  @override
  Future<List<FinancialAccount>> build() async {
    final api = ref.watch(financeApiServiceProvider);
    return api.getAccounts();
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() => ref.read(financeApiServiceProvider).getAccounts());
  }

  Future<bool> addAccount(Map<String, dynamic> data) async {
    final api = ref.read(financeApiServiceProvider);
    final created = await api.createAccount(data);
    if (created != null) {
      final current = state.value ?? [];
      state = AsyncValue.data([...current, created]);
      return true;
    }
    // Optimistic local add
    final fallback = FinancialAccount.fromJson(data);
    final current = state.value ?? [];
    state = AsyncValue.data([...current, fallback]);
    return true;
  }

  Future<bool> adjustBalance(String accountId, double newBalance) async {
    final api = ref.read(financeApiServiceProvider);
    await api.adjustBalance(accountId, newBalance);
    
    // Update local state
    final current = state.value ?? [];
    state = AsyncValue.data(
      current.map((a) {
        if (a.id == accountId) {
          return FinancialAccount(
            id: a.id,
            name: a.name,
            type: a.type,
            subtype: a.subtype,
            currency: a.currency,
            currentBalance: newBalance,
            initialBalance: a.initialBalance,
            colorHex: a.colorHex,
            iconKey: a.iconKey,
            isActive: a.isActive,
            excludeFromNetWorth: a.excludeFromNetWorth,
          );
        }
        return a;
      }).toList(),
    );
    return true;
  }
}

// ── Transactions Provider ──
final transactionsProvider = AsyncNotifierProvider<TransactionsNotifier, List<TransactionItem>>(() {
  return TransactionsNotifier();
});

class TransactionsNotifier extends AsyncNotifier<List<TransactionItem>> {
  @override
  Future<List<TransactionItem>> build() async {
    final api = ref.watch(financeApiServiceProvider);
    final selectedAcc = ref.watch(selectedAccountFilterProvider);
    return api.getTransactions(accountId: selectedAcc);
  }

  Future<void> addTransaction(Map<String, dynamic> data) async {
    final api = ref.read(financeApiServiceProvider);
    await api.createTransaction(data);
    
    // Optimistic prepend
    final current = state.value ?? [];
    final newTx = TransactionItem.fromJson({
      'id': 'tx_${DateTime.now().millisecondsSinceEpoch}',
      ...data,
    });
    state = AsyncValue.data([newTx, ...current]);

    // Also update account balance in accountsProvider if accountId is present
    final accId = data['accountId'] as String?;
    final amount = (data['amount'] as num?)?.toDouble() ?? 0.0;
    final isIncome = data['type'] == 'income';
    if (accId != null && amount > 0) {
      final accs = ref.read(accountsProvider).value ?? [];
      final target = accs.where((a) => a.id == accId).firstOrNull;
      if (target != null) {
        final updatedBal = isIncome ? target.currentBalance + amount : target.currentBalance - amount;
        ref.read(accountsProvider.notifier).adjustBalance(accId, updatedBal);
      }
    }
  }
}

// ── Transfers Provider ──
final transfersProvider = FutureProvider<List<AccountTransfer>>((ref) async {
  final api = ref.watch(financeApiServiceProvider);
  return api.getTransfers();
});

// ── Budgets Overview Provider ──
final budgetsOverviewProvider = FutureProvider<BudgetsOverview>((ref) async {
  final api = ref.watch(financeApiServiceProvider);
  return api.getBudgetsOverview();
});

// ── Analytics Provider ──
final financeAnalyticsProvider = FutureProvider<FinanceAnalyticsModel>((ref) async {
  final api = ref.watch(financeApiServiceProvider);
  return api.getAnalytics();
});
