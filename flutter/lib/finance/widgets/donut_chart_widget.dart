import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../../_core/theme.dart';
import '../models/finance_analytics.dart';

class DonutChartWidget extends StatelessWidget {
  final List<CategorySpend> categories;
  final double totalAmount;

  const DonutChartWidget({
    super.key,
    required this.categories,
    required this.totalAmount,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: CyberNoirTheme.surfaceCardElevated,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.white.withOpacity(0.06)),
      ),
      child: Column(
        children: [
          // Donut Circle + Center Total (Money Manager unnamed (1).webp)
          SizedBox(
            height: 200,
            width: 200,
            child: Stack(
              alignment: Alignment.center,
              children: [
                CustomPaint(
                  size: const Size(200, 200),
                  painter: _DonutChartPainter(categories: categories),
                ),
                Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Text(
                      'TOTAL SPENT',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 0.6,
                        color: CyberNoirTheme.textSecondary,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      totalAmount.toStringAsFixed(2),
                      style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w800,
                        letterSpacing: -0.5,
                        color: CyberNoirTheme.textPrimary,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Legend Grid
          Wrap(
            spacing: 16,
            runSpacing: 10,
            alignment: WrapAlignment.center,
            children: categories.map((c) {
              return Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 10,
                    height: 10,
                    decoration: BoxDecoration(color: c.color, shape: BoxShape.circle),
                  ),
                  const SizedBox(width: 6),
                  Text(
                    c.category,
                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: CyberNoirTheme.textPrimary),
                  ),
                  const SizedBox(width: 4),
                  Text(
                    '${c.percentageOfTotal.toStringAsFixed(1)}%',
                    style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: CyberNoirTheme.textSecondary),
                  ),
                ],
              );
            }).toList(),
          ),
        ],
      ),
    );
  }
}

class _DonutChartPainter extends CustomPainter {
  final List<CategorySpend> categories;

  _DonutChartPainter({required this.categories});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2;
    const strokeWidth = 28.0;

    if (categories.isEmpty) {
      final paint = Paint()
        ..color = Colors.white.withOpacity(0.08)
        ..style = PaintingStyle.stroke
        ..strokeWidth = strokeWidth;
      canvas.drawCircle(center, radius - strokeWidth / 2, paint);
      return;
    }

    double startAngle = -math.pi / 2;

    for (final cat in categories) {
      final sweepAngle = (cat.percentageOfTotal / 100.0) * (2 * math.pi);
      final paint = Paint()
        ..color = cat.color
        ..style = PaintingStyle.stroke
        ..strokeWidth = strokeWidth
        ..strokeCap = StrokeCap.butt;

      canvas.drawArc(
        Rect.fromCircle(center: center, radius: radius - strokeWidth / 2),
        startAngle,
        sweepAngle,
        false,
        paint,
      );

      startAngle += sweepAngle;
    }
  }

  @override
  bool shouldRepaint(covariant _DonutChartPainter oldDelegate) => true;
}
