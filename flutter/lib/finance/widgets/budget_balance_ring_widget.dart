import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../_core/theme.dart';
import '../models/budget.dart';

class BudgetBalanceRingWidget extends StatelessWidget {
  final BudgetsOverview overview;
  final VoidCallback onSettingTap;

  const BudgetBalanceRingWidget({
    super.key,
    required this.overview,
    required this.onSettingTap,
  });

  @override
  Widget build(BuildContext context) {
    final balancePct = overview.balancePercentage;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: CyberNoirTheme.surfaceCardElevated,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.white.withOpacity(0.06)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header: "Monthly budget" + "+ Setting" Button
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Monthly budget',
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.bold,
                  color: CyberNoirTheme.textPrimary,
                ),
              ),
              InkWell(
                onTap: onSettingTap,
                borderRadius: BorderRadius.circular(8),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFBBF24), // Money Manager Amber Gold
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(LucideIcons.plusSquare, size: 12, color: Colors.black),
                      SizedBox(width: 4),
                      Text(
                        'Setting',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: Colors.black,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),

          // Ring + Metric Trio (Money Manager unnamed (3).webp)
          Row(
            children: [
              // Circular Balance Gauge
              SizedBox(
                width: 110,
                height: 110,
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    CustomPaint(
                      size: const Size(110, 110),
                      painter: _BalanceRingPainter(percentage: balancePct),
                    ),
                    Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Text(
                          'Balance',
                          style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: CyberNoirTheme.textSecondary),
                        ),
                        Text(
                          '${balancePct.toStringAsFixed(1)}%',
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w800,
                            color: CyberNoirTheme.textPrimary,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 24),

              // Metric Trio Column
              Expanded(
                child: Column(
                  children: [
                    _buildMetricRow('Balance :', overview.totalRemaining.toStringAsFixed(2), CyberNoirTheme.emeraldGreen),
                    const SizedBox(height: 10),
                    _buildMetricRow('Budget :', overview.totalTarget.toStringAsFixed(2), CyberNoirTheme.textPrimary),
                    const SizedBox(height: 10),
                    _buildMetricRow('Expenses :', overview.totalSpent.toStringAsFixed(2), CyberNoirTheme.roseRed),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildMetricRow(String label, String value, Color valueColor) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: CyberNoirTheme.textSecondary),
        ),
        Text(
          value,
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.bold,
            fontFamily: 'monospace',
            color: valueColor,
          ),
        ),
      ],
    );
  }
}

class _BalanceRingPainter extends CustomPainter {
  final double percentage; // 0 to 100

  _BalanceRingPainter({required this.percentage});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2;
    const strokeWidth = 14.0;

    // Background grey circle
    final bgPaint = Paint()
      ..color = Colors.white.withOpacity(0.08)
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth;
    canvas.drawCircle(center, radius - strokeWidth / 2, bgPaint);

    // Active progress arc (Money Manager Amber Gold)
    final sweepAngle = (percentage / 100.0) * (2 * math.pi);
    final activePaint = Paint()
      ..color = const Color(0xFFFBBF24)
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth
      ..strokeCap = StrokeCap.round;

    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius - strokeWidth / 2),
      -math.pi / 2,
      sweepAngle,
      false,
      activePaint,
    );
  }

  @override
  bool shouldRepaint(covariant _BalanceRingPainter oldDelegate) => true;
}
