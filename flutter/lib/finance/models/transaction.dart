import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';

class TransactionItem {
  final String id;
  final String type; // 'income' | 'expense'
  final double amount;
  final String category;
  final String? description;
  final String? payee;
  final String date; // YYYY-MM-DD
  final String? accountId;
  final String? accountName;
  final String? accountColor;
  final String? transferId;
  final int isSpecial;

  const TransactionItem({
    required this.id,
    required this.type,
    required this.amount,
    required this.category,
    this.description,
    this.payee,
    required this.date,
    this.accountId,
    this.accountName,
    this.accountColor,
    this.transferId,
    this.isSpecial = 0,
  });

  factory TransactionItem.fromJson(Map<String, dynamic> json) {
    return TransactionItem(
      id: json['id'] as String? ?? '',
      type: json['type'] as String? ?? 'expense',
      amount: (json['amount'] as num?)?.toDouble() ?? 0.0,
      category: json['category'] as String? ?? 'Miscellaneous',
      description: json['description'] as String?,
      payee: json['payee'] as String?,
      date: json['date'] as String? ?? '',
      accountId: json['accountId'] as String?,
      accountName: json['accountName'] as String?,
      accountColor: json['accountColor'] as String?,
      transferId: json['transferId'] as String?,
      isSpecial: (json['isSpecial'] as num?)?.toInt() ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'type': type,
      'amount': amount,
      'category': category,
      'description': description,
      'payee': payee,
      'date': date,
      'accountId': accountId,
      'isSpecial': isSpecial,
    };
  }

  bool get isIncome => type == 'income';

  // Category Pastel Visuals matching Money Manager
  Color get pastelColor {
    switch (category.toLowerCase()) {
      case 'shopping':
        return const Color(0xFFFEF3C7); // Warm Pastel Yellow
      case 'beauty':
        return const Color(0xFFFCE7F3); // Pastel Rose Pink
      case 'pet':
      case 'pets':
        return const Color(0xFFCCFBF1); // Pastel Mint
      case 'entertainment':
        return const Color(0xFFEDE9FE); // Pastel Purple
      case 'food':
      case 'dining':
        return const Color(0xFFFEE2E2); // Pastel Coral Red
      case 'snacks':
        return const Color(0xFFFFEDD5); // Pastel Amber Orange
      case 'investments':
      case 'capital':
        return const Color(0xFFD1FAE5); // Pastel Emerald
      case 'gift':
      case 'gifts':
        return const Color(0xFFFEF9C3); // Soft Gold
      case 'home':
      case 'housing':
        return const Color(0xFFE0E7FF); // Pastel Indigo
      case 'donate':
      case 'charity':
        return const Color(0xFFE0F2FE); // Pastel Sky
      default:
        return const Color(0xFFF3F4F6); // Neutral Grey
    }
  }

  Color get iconColor {
    switch (category.toLowerCase()) {
      case 'shopping':
        return const Color(0xFFD97706);
      case 'beauty':
        return const Color(0xFFDB2777);
      case 'pet':
      case 'pets':
        return const Color(0xFF0D9488);
      case 'entertainment':
        return const Color(0xFF7C3AED);
      case 'food':
      case 'dining':
        return const Color(0xFFDC2626);
      case 'snacks':
        return const Color(0xFFEA580C);
      case 'investments':
      case 'capital':
        return const Color(0xFF059669);
      case 'gift':
      case 'gifts':
        return const Color(0xFFCA8A04);
      case 'home':
      case 'housing':
        return const Color(0xFF4F46E5);
      case 'donate':
      case 'charity':
        return const Color(0xFF0284C7);
      default:
        return const Color(0xFF4B5563);
    }
  }

  IconData get iconData {
    switch (category.toLowerCase()) {
      case 'shopping':
        return LucideIcons.shoppingCart;
      case 'beauty':
        return LucideIcons.sparkles;
      case 'pet':
      case 'pets':
        return LucideIcons.dog;
      case 'entertainment':
        return LucideIcons.film;
      case 'food':
      case 'dining':
        return LucideIcons.utensils;
      case 'snacks':
        return LucideIcons.coffee;
      case 'investments':
      case 'capital':
        return LucideIcons.trendingUp;
      case 'gift':
      case 'gifts':
        return LucideIcons.gift;
      case 'home':
      case 'housing':
        return LucideIcons.home;
      case 'donate':
      case 'charity':
        return LucideIcons.heart;
      case 'salary':
      case 'freelance':
        return LucideIcons.banknote;
      default:
        return LucideIcons.tag;
    }
  }
}
