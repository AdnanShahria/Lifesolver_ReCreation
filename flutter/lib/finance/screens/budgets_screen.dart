import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../_core/theme.dart';
import '../providers/finance_providers.dart';
import '../widgets/budget_balance_ring_widget.dart';

class BudgetsScreen extends ConsumerWidget {
  const BudgetsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final budgetsOverviewAsync = ref.watch(budgetsOverviewProvider);

    return Scaffold(
      backgroundColor: CyberNoirTheme.bgRoot,
      appBar: AppBar(
        title: const Text('Spending Budgets', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.sliders, size: 18),
            onPressed: () {},
          ),
        ],
      ),
      body: budgetsOverviewAsync.when(
        loading: () => const Center(child: CircularProgressIndicator(strokeWidth: 2)),
        error: (err, _) => Center(child: Text('Error loading budgets: $err')),
        data: (overview) {
          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            physics: const BouncingScrollPhysics(),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // ── Money Manager Monthly Budget Balance Ring ──
                BudgetBalanceRingWidget(
                  overview: overview,
                  onSettingTap: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Budget limits updated.')),
                    );
                  },
                ),
                const SizedBox(height: 20),

                // ── Category Budget Limits ──
                const Text(
                  'Category Guardrails',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: CyberNoirTheme.textPrimary),
                ),
                const SizedBox(height: 12),

                _buildCategoryBudgetCard('Shopping', 236.00, 500.00, CyberNoirTheme.amberOrange),
                const SizedBox(height: 10),
                _buildCategoryBudgetCard('Food & Groceries', 180.00, 450.00, CyberNoirTheme.roseRed),
                const SizedBox(height: 10),
                _buildCategoryBudgetCard('Entertainment', 71.00, 200.00, CyberNoirTheme.primaryViolet),
                const SizedBox(height: 10),
                _buildCategoryBudgetCard('Housing & Utilities', 63.00, 800.00, CyberNoirTheme.indigoAccent),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildCategoryBudgetCard(String name, double spent, double target, Color accent) {
    final ratio = (spent / target).clamp(0.0, 1.0);
    final remaining = target - spent;

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: CyberNoirTheme.surfaceCardElevated,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.06)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(name, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
              Text(
                '\$${spent.toStringAsFixed(2)} / \$${target.toStringAsFixed(2)}',
                style: const TextStyle(fontSize: 12, fontFamily: 'monospace', color: CyberNoirTheme.textSecondary),
              ),
            ],
          ),
          const SizedBox(height: 8),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: ratio,
              minHeight: 6,
              backgroundColor: Colors.white.withOpacity(0.06),
              valueColor: AlwaysStoppedAnimation<Color>(accent),
            ),
          ),
          const SizedBox(height: 6),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '${(ratio * 100).toStringAsFixed(1)}% spent',
                style: const TextStyle(fontSize: 10, color: CyberNoirTheme.textSecondary),
              ),
              Text(
                '\$${remaining.toStringAsFixed(2)} left',
                style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: CyberNoirTheme.emeraldGreen),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
