import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../_core/theme.dart';
import '../providers/finance_providers.dart';
import '../widgets/accounts_carousel_widget.dart';
import '../widgets/daily_grouped_ledger_widget.dart';
import '../sheets/add_transaction_sheet.dart';
import '../sheets/transfer_funds_sheet.dart';
import '../sheets/manage_account_sheet.dart';

class FinanceScreen extends ConsumerWidget {
  const FinanceScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final analyticsAsync = ref.watch(financeAnalyticsProvider);

    return Scaffold(
      backgroundColor: CyberNoirTheme.bgRoot,
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: CyberNoirTheme.cyanAccent.withOpacity(0.15),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: CyberNoirTheme.cyanAccent.withOpacity(0.3)),
              ),
              child: const Icon(LucideIcons.wallet, size: 16, color: CyberNoirTheme.cyanAccent),
            ),
            const SizedBox(width: 10),
            const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Money Manager', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                Text('Cashflow & Multi-Accounts', style: TextStyle(fontSize: 10, color: CyberNoirTheme.textSecondary)),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.refreshCw, size: 18, color: CyberNoirTheme.textSecondary),
            onPressed: () {
              ref.read(accountsProvider.notifier).refresh();
              ref.invalidate(transactionsProvider);
              ref.invalidate(budgetsOverviewProvider);
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          await ref.read(accountsProvider.notifier).refresh();
          ref.invalidate(transactionsProvider);
        },
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
          padding: const EdgeInsets.only(bottom: 96),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ── Top Summary Header Card (Money Manager Style: 2022 09 | Expenses -622.00 | Income 5500.00) ──
              Container(
                margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFFFBBF24), Color(0xFFF59E0B)], // Money Manager Gold
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFFF59E0B).withOpacity(0.3),
                      blurRadius: 16,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    // Period Selector (2022 09 ▼)
                    const Row(
                      children: [
                        Text(
                          '2022\n09',
                          style: TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.w900,
                            color: Colors.black87,
                            height: 1.1,
                          ),
                        ),
                        SizedBox(width: 4),
                        Icon(Icons.arrow_drop_down, color: Colors.black87),
                      ],
                    ),
                    Container(height: 36, width: 1, color: Colors.black12),

                    // Expenses
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Expenses',
                          style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.black54),
                        ),
                        Text(
                          '-${analyticsAsync.value?.totalExpense.toStringAsFixed(2) ?? "622.00"}',
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w900,
                            color: Colors.black87,
                            fontFamily: 'monospace',
                          ),
                        ),
                      ],
                    ),

                    // Income
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Income',
                          style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.black54),
                        ),
                        Text(
                          analyticsAsync.value?.totalIncome.toStringAsFixed(2) ?? "5500.00",
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w900,
                            color: Colors.black87,
                            fontFamily: 'monospace',
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 12),

              // ── 1. Financial Wallets & Accounts Carousel ──
              AccountsCarouselWidget(
                onAddAccount: () => ManageAccountSheet.show(context),
                onTransfer: (source) => TransferFundsSheet.show(context, sourceAccount: source),
                onAdjust: (acc) => ManageAccountSheet.show(context, account: acc),
              ),
              const SizedBox(height: 16),

              // ── 2. Daily Grouped Records Feed (Money Manager) ──
              DailyGroupedLedgerWidget(
                onAddTransaction: () => AddTransactionSheet.show(context),
              ),
            ],
          ),
        ),
      ),

      // Floating Action Button (+)
      floatingActionButton: FloatingActionButton(
        backgroundColor: const Color(0xFFFBBF24), // Money Manager Gold Button
        foregroundColor: Colors.black,
        elevation: 6,
        onPressed: () => _showQuickActionSheet(context),
        child: const Icon(LucideIcons.plus, size: 26),
      ),
    );
  }

  void _showQuickActionSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: CyberNoirTheme.surfaceCard,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                ListTile(
                  leading: const CircleAvatar(
                    backgroundColor: Color(0x26F43F5E),
                    child: Icon(LucideIcons.arrowUpRight, color: CyberNoirTheme.roseRed),
                  ),
                  title: const Text('Add Expense', style: TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: const Text('Log daily purchase with category and account', style: TextStyle(fontSize: 12)),
                  onTap: () {
                    Navigator.pop(context);
                    AddTransactionSheet.show(context);
                  },
                ),
                ListTile(
                  leading: const CircleAvatar(
                    backgroundColor: Color(0x2610B981),
                    child: Icon(LucideIcons.arrowDownLeft, color: CyberNoirTheme.emeraldGreen),
                  ),
                  title: const Text('Add Income', style: TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: const Text('Record deposit, salary, or investment return', style: TextStyle(fontSize: 12)),
                  onTap: () {
                    Navigator.pop(context);
                    AddTransactionSheet.show(context);
                  },
                ),
                ListTile(
                  leading: const CircleAvatar(
                    backgroundColor: Color(0x2606B6D4),
                    child: Icon(LucideIcons.arrowRightLeft, color: CyberNoirTheme.cyanAccent),
                  ),
                  title: const Text('Transfer Funds', style: TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: const Text('Move money between bKash, PayPal, Bank, or Cash', style: TextStyle(fontSize: 12)),
                  onTap: () {
                    Navigator.pop(context);
                    TransferFundsSheet.show(context);
                  },
                ),
                ListTile(
                  leading: const CircleAvatar(
                    backgroundColor: Color(0x268B5CF6),
                    child: Icon(LucideIcons.wallet, color: CyberNoirTheme.primaryViolet),
                  ),
                  title: const Text('Create New Account', style: TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: const Text('Connect a new bank, mobile wallet, or crypto', style: TextStyle(fontSize: 12)),
                  onTap: () {
                    Navigator.pop(context);
                    ManageAccountSheet.show(context);
                  },
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
