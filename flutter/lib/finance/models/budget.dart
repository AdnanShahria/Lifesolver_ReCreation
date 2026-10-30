class BudgetModel {
  final String id;
  final String name;
  final String type; // 'budget' | 'savings'
  final double targetAmount;
  final double currentAmount;
  final String? period;
  final String? category;
  final double percentSpent;
  final String status;
  final double remaining;

  const BudgetModel({
    required this.id,
    required this.name,
    required this.type,
    required this.targetAmount,
    this.currentAmount = 0.0,
    this.period = 'monthly',
    this.category,
    this.percentSpent = 0.0,
    this.status = 'on-track',
    this.remaining = 0.0,
  });

  factory BudgetModel.fromJson(Map<String, dynamic> json) {
    return BudgetModel(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      type: json['type'] as String? ?? 'budget',
      targetAmount: (json['targetAmount'] as num?)?.toDouble() ?? 0.0,
      currentAmount: (json['currentAmount'] as num?)?.toDouble() ?? 0.0,
      period: json['period'] as String? ?? 'monthly',
      category: json['category'] as String?,
      percentSpent: (json['percentSpent'] as num?)?.toDouble() ?? 0.0,
      status: json['status'] as String? ?? 'on-track',
      remaining: (json['remaining'] as num?)?.toDouble() ?? 0.0,
    );
  }
}

class BudgetsOverview {
  final double totalTarget;
  final double totalSpent;
  final double totalRemaining;
  final double overallPercent;

  const BudgetsOverview({
    this.totalTarget = 6000.0,
    this.totalSpent = 622.0,
    this.totalRemaining = 5378.0,
    this.overallPercent = 10.37, // or 89.63% remaining
  });

  double get balancePercentage {
    if (totalTarget <= 0) return 100.0;
    final pct = (totalRemaining / totalTarget) * 100.0;
    return pct.clamp(0.0, 100.0);
  }

  factory BudgetsOverview.fromJson(Map<String, dynamic> json) {
    return BudgetsOverview(
      totalTarget: (json['totalTarget'] as num?)?.toDouble() ?? 0.0,
      totalSpent: (json['totalSpent'] as num?)?.toDouble() ?? 0.0,
      totalRemaining: (json['totalRemaining'] as num?)?.toDouble() ?? 0.0,
      overallPercent: (json['overallPercent'] as num?)?.toDouble() ?? 0.0,
    );
  }
}
