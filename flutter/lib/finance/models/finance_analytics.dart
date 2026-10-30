import 'package:flutter/material.dart';

class CategorySpend {
  final String category;
  final double currentAmount;
  final double percentageOfTotal;
  final Color color;

  const CategorySpend({
    required this.category,
    required this.currentAmount,
    required this.percentageOfTotal,
    required this.color,
  });

  factory CategorySpend.fromJson(Map<String, dynamic> json, int index) {
    const palette = [
      Color(0xFFF59E0B), // Shopping (Gold)
      Color(0xFF06B6D4), // Beauty (Cyan)
      Color(0xFFF43F5E), // Pet (Rose)
      Color(0xFF10B981), // Entertainment (Emerald)
      Color(0xFF8B5CF6), // Other (Violet)
      Color(0xFF6366F1), // Home (Indigo)
      Color(0xFFEC4899), // Snacks (Pink)
    ];

    return CategorySpend(
      category: json['category'] as String? ?? 'Other',
      currentAmount: (json['currentAmount'] as num?)?.toDouble() ?? 0.0,
      percentageOfTotal: (json['percentageOfTotal'] as num?)?.toDouble() ?? 0.0,
      color: palette[index % palette.length],
    );
  }
}

class FinanceAnalyticsModel {
  final double totalExpense;
  final double totalIncome;
  final List<CategorySpend> topCategories;

  const FinanceAnalyticsModel({
    this.totalExpense = 622.0,
    this.totalIncome = 5500.0,
    this.topCategories = const [],
  });

  factory FinanceAnalyticsModel.fromJson(Map<String, dynamic> json) {
    final rawCats = json['categoryBreakdown'] as List? ?? [];
    final cats = <CategorySpend>[];
    for (int i = 0; i < rawCats.length; i++) {
      cats.add(CategorySpend.fromJson(rawCats[i] as Map<String, dynamic>, i));
    }

    final mom = json['monthOverMonth'] as Map<String, dynamic>?;
    final exp = (mom?['currentExpense'] as num?)?.toDouble() ?? 622.0;
    final inc = (mom?['currentIncome'] as num?)?.toDouble() ?? 5500.0;

    return FinanceAnalyticsModel(
      totalExpense: exp,
      totalIncome: inc,
      topCategories: cats,
    );
  }
}
