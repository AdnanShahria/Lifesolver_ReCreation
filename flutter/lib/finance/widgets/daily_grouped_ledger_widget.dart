import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../_core/theme.dart';
import '../models/transaction.dart';
import '../providers/finance_providers.dart';

class DailyGroupedLedgerWidget extends ConsumerWidget {
  final VoidCallback onAddTransaction;

  const DailyGroupedLedgerWidget({
    super.key,
    required this.onAddTransaction,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final transactionsAsync = ref.watch(transactionsProvider);

    return transactionsAsync.when(
      loading: () => const Center(
        child: Padding(
          padding: EdgeInsets.all(32),
          child: CircularProgressIndicator(strokeWidth: 2),
        ),
      ),
      error: (err, _) => Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Text('Failed to load transactions: $err'),
        ),
      ),
      data: (transactions) {
        if (transactions.isEmpty) {
          return _buildEmptyState(context);
        }

        // Group by Date
        final Map<String, List<TransactionItem>> grouped = {};
        for (final tx in transactions) {
          grouped.putIfAbsent(tx.date, () => []).add(tx);
        }

        final sortedDates = grouped.keys.toList()..sort((a, b) => b.compareTo(a));

        return ListView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          itemCount: sortedDates.length,
          itemBuilder: (context, index) {
            final dateKey = sortedDates[index];
            final dailyList = grouped[dateKey]!;

            double dailyExpense = 0;
            double dailyIncome = 0;
            for (final t in dailyList) {
              if (t.isIncome) {
                dailyIncome += t.amount;
              } else {
                dailyExpense += t.amount;
              }
            }

            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // ── Date Header (Money Manager Style: 9/1 Thursday | Expenses: -622.00 Income: 5500.00) ──
                Container(
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        _formatDateHeader(dateKey),
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                          color: CyberNoirTheme.textPrimary,
                        ),
                      ),
                      Row(
                        children: [
                          if (dailyExpense > 0)
                            Text(
                              'Expenses: -${dailyExpense.toStringAsFixed(2)}',
                              style: const TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                                color: CyberNoirTheme.roseRed,
                              ),
                            ),
                          if (dailyExpense > 0 && dailyIncome > 0)
                            const SizedBox(width: 8),
                          if (dailyIncome > 0)
                            Text(
                              'Income: +${dailyIncome.toStringAsFixed(2)}',
                              style: const TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                                color: CyberNoirTheme.emeraldGreen,
                              ),
                            ),
                        ],
                      ),
                    ],
                  ),
                ),

                // ── List of Transactions for this Date ──
                Container(
                  decoration: BoxDecoration(
                    color: CyberNoirTheme.surfaceCardElevated,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.white.withOpacity(0.06)),
                  ),
                  child: ListView.separated(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: dailyList.length,
                    separatorBuilder: (_, __) => Divider(
                      height: 1,
                      indent: 64,
                      color: Colors.white.withOpacity(0.04),
                    ),
                    itemBuilder: (context, txIdx) {
                      final item = dailyList[txIdx];
                      return _buildTransactionTile(context, item);
                    },
                  ),
                ),
                const SizedBox(height: 14),
              ],
            );
          },
        );
      },
    );
  }

  Widget _buildTransactionTile(BuildContext context, TransactionItem item) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      child: Row(
        children: [
          // ── Circular Pastel Category Icon (Money Manager) ──
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              color: item.pastelColor,
              shape: BoxShape.circle,
            ),
            child: Center(
              child: Icon(
                item.iconData,
                size: 20,
                color: item.iconColor,
              ),
            ),
          ),
          const SizedBox(width: 14),

          // ── Category & Payee / Account Chip ──
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.category,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: CyberNoirTheme.textPrimary,
                  ),
                ),
                const SizedBox(height: 3),
                Row(
                  children: [
                    if (item.payee != null && item.payee!.isNotEmpty) ...[
                      Text(
                        item.payee!,
                        style: const TextStyle(
                          fontSize: 11,
                          color: CyberNoirTheme.textSecondary,
                        ),
                      ),
                      const SizedBox(width: 6),
                    ],
                    // Account Chip
                    if (item.accountName != null)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.06),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          item.accountName!,
                          style: const TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w600,
                            color: CyberNoirTheme.cyanAccent,
                          ),
                        ),
                      ),
                  ],
                ),
              ],
            ),
          ),

          // ── Signed Amount ──
          Text(
            item.isIncome
                ? '+${item.amount.toStringAsFixed(2)}'
                : '-${item.amount.toStringAsFixed(2)}',
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w800,
              fontFamily: 'monospace',
              color: item.isIncome ? CyberNoirTheme.emeraldGreen : CyberNoirTheme.textPrimary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.symmetric(vertical: 36, horizontal: 20),
      decoration: BoxDecoration(
        color: CyberNoirTheme.surfaceCardElevated,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withOpacity(0.06)),
      ),
      child: Center(
        child: Column(
          children: [
            const CircleAvatar(
              radius: 28,
              backgroundColor: CyberNoirTheme.borderAccent,
              child: Icon(Icons.receipt_long, color: CyberNoirTheme.primaryViolet, size: 28),
            ),
            const SizedBox(height: 14),
            const Text(
              'No Transactions Yet',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: CyberNoirTheme.textPrimary),
            ),
            const SizedBox(height: 6),
            const Text(
              'Tap + below to log your first income, expense, or transfer.',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 12, color: CyberNoirTheme.textSecondary),
            ),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: onAddTransaction,
              style: ElevatedButton.styleFrom(
                backgroundColor: CyberNoirTheme.primaryViolet,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              icon: const Icon(Icons.add, size: 16),
              label: const Text('Add Transaction'),
            ),
          ],
        ),
      ),
    );
  }

  String _formatDateHeader(String dateStr) {
    try {
      final parts = dateStr.split('-');
      if (parts.length == 3) {
        final d = DateTime(int.parse(parts[0]), int.parse(parts[1]), int.parse(parts[2]));
        const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        return '${d.month}/${d.day} ${weekdays[d.weekday - 1]}';
      }
    } catch (_) {}
    return dateStr;
  }
}
