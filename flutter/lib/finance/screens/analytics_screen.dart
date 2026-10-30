import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../_core/theme.dart';
import '../providers/finance_providers.dart';
import '../widgets/donut_chart_widget.dart';
import '../widgets/top_categories_widget.dart';

class AnalyticsScreen extends ConsumerStatefulWidget {
  const AnalyticsScreen({super.key});

  @override
  ConsumerState<AnalyticsScreen> createState() => _AnalyticsScreenState();
}

class _AnalyticsScreenState extends ConsumerState<AnalyticsScreen> {
  String _mode = 'Month'; // 'Month' | 'Year'
  int _selectedPeriodIndex = 3;

  final List<String> _monthPeriods = ['2022.5', '2022.6', '2022.7', 'Last Month'];

  @override
  Widget build(BuildContext context) {
    final analyticsAsync = ref.watch(financeAnalyticsProvider);

    return Scaffold(
      backgroundColor: CyberNoirTheme.bgRoot,
      appBar: AppBar(
        title: const Text('Reports & Analytics', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.calendar, size: 18),
            onPressed: () {},
          ),
        ],
      ),
      body: analyticsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator(strokeWidth: 2)),
        error: (err, _) => Center(child: Text('Error loading analytics: $err')),
        data: (analytics) {
          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            physics: const BouncingScrollPhysics(),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // ── Top Bar: Month / Year Segmented Switcher (Money Manager unnamed (1).webp) ──
                Container(
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFBBF24), // Money Manager Top Gold Bar
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: _buildTimeToggle('Month'),
                      ),
                      Expanded(
                        child: _buildTimeToggle('Year'),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 14),

                // ── Period Carousel (2022.5, 2022.6, 2022.7, Last Month) ──
                SizedBox(
                  height: 36,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    itemCount: _monthPeriods.length,
                    separatorBuilder: (_, __) => const SizedBox(width: 10),
                    itemBuilder: (context, idx) {
                      final isSelected = _selectedPeriodIndex == idx;
                      return InkWell(
                        onTap: () => setState(() => _selectedPeriodIndex = idx),
                        borderRadius: BorderRadius.circular(10),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                          decoration: BoxDecoration(
                            color: isSelected ? Colors.white.withOpacity(0.12) : Colors.transparent,
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(
                              color: isSelected ? const Color(0xFFFBBF24) : Colors.transparent,
                            ),
                          ),
                          child: Center(
                            child: Text(
                              _monthPeriods[idx],
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                                color: isSelected ? const Color(0xFFFBBF24) : CyberNoirTheme.textSecondary,
                              ),
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),
                const SizedBox(height: 16),

                // ── 1. Donut Spending Distribution Chart ──
                DonutChartWidget(
                  categories: analytics.topCategories,
                  totalAmount: analytics.totalExpense,
                ),
                const SizedBox(height: 20),

                // ── 2. Top Lists Ranked Progress Breakdown ──
                TopCategoriesWidget(
                  categories: analytics.topCategories,
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildTimeToggle(String mode) {
    final isSelected = _mode == mode;
    return InkWell(
      onTap: () => setState(() => _mode = mode),
      borderRadius: BorderRadius.circular(8),
      child: Container(
        height: 34,
        decoration: BoxDecoration(
          color: isSelected ? Colors.black87 : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
        ),
        alignment: Alignment.center,
        child: Text(
          mode,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.bold,
            color: isSelected ? Colors.white : Colors.black87,
          ),
        ),
      ),
    );
  }
}
