import 'package:flutter/material.dart';
import '../../_core/theme.dart';
import '../models/finance_analytics.dart';

class TopCategoriesWidget extends StatelessWidget {
  final List<CategorySpend> categories;

  const TopCategoriesWidget({
    super.key,
    required this.categories,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 4, vertical: 8),
          child: Text(
            'Top lists',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: CyberNoirTheme.textPrimary,
            ),
          ),
        ),
        const SizedBox(height: 4),

        // List of Ranked Categories (Money Manager unnamed (1).webp)
        ListView.separated(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: categories.length,
          separatorBuilder: (_, __) => const SizedBox(height: 12),
          itemBuilder: (context, index) {
            final item = categories[index];
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
                      Row(
                        children: [
                          Container(
                            width: 10,
                            height: 10,
                            decoration: BoxDecoration(color: item.color, shape: BoxShape.circle),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            item.category,
                            style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                              color: CyberNoirTheme.textPrimary,
                            ),
                          ),
                          const SizedBox(width: 6),
                          Text(
                            '${item.percentageOfTotal.toStringAsFixed(2)}%',
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: CyberNoirTheme.textSecondary,
                            ),
                          ),
                        ],
                      ),
                      Text(
                        item.currentAmount.toStringAsFixed(2),
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w800,
                          fontFamily: 'monospace',
                          color: CyberNoirTheme.textPrimary,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),

                  // Horizontal Proportional Yellow/Gold Progress Bar
                  ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: LinearProgressIndicator(
                      value: (item.percentageOfTotal / 100.0).clamp(0.0, 1.0),
                      minHeight: 6,
                      backgroundColor: Colors.white.withOpacity(0.06),
                      valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFFFBBF24)), // Money Manager Gold
                    ),
                  ),
                ],
              ),
            );
          },
        ),
      ],
    );
  }
}
