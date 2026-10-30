import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';

class FinancialAccount {
  final String id;
  final String name;
  final String type; // 'bank' | 'mobile_wallet' | 'online_wallet' | 'cash' | 'credit_card' | 'crypto' | 'investment' | 'custom'
  final String? subtype; // 'bkash' | 'nagad' | 'paypal' | 'wise' | 'stripe' | 'crypto'
  final String currency; // 'BDT' | 'USD' | 'EUR' | 'GBP' | 'BTC' | 'ETH'
  final double currentBalance;
  final double initialBalance;
  final double? creditLimit;
  final String colorHex;
  final String iconKey;
  final bool isActive;
  final bool excludeFromNetWorth;

  const FinancialAccount({
    required this.id,
    required this.name,
    required this.type,
    this.subtype,
    this.currency = 'USD',
    this.currentBalance = 0.0,
    this.initialBalance = 0.0,
    this.creditLimit,
    this.colorHex = '#8B5CF6',
    this.iconKey = 'Wallet',
    this.isActive = true,
    this.excludeFromNetWorth = false,
  });

  factory FinancialAccount.fromJson(Map<String, dynamic> json) {
    return FinancialAccount(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? 'Account',
      type: json['type'] as String? ?? 'custom',
      subtype: json['subtype'] as String?,
      currency: json['currency'] as String? ?? 'USD',
      currentBalance: (json['currentBalance'] as num?)?.toDouble() ?? 0.0,
      initialBalance: (json['initialBalance'] as num?)?.toDouble() ?? 0.0,
      creditLimit: (json['creditLimit'] as num?)?.toDouble(),
      colorHex: json['color'] as String? ?? json['colorHex'] as String? ?? '#8B5CF6',
      iconKey: json['icon'] as String? ?? json['iconKey'] as String? ?? 'Wallet',
      isActive: (json['isActive'] is int ? json['isActive'] == 1 : json['isActive'] as bool? ?? true),
      excludeFromNetWorth: (json['excludeFromNetWorth'] is int ? json['excludeFromNetWorth'] == 1 : json['excludeFromNetWorth'] as bool? ?? false),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'type': type,
      'subtype': subtype,
      'currency': currency,
      'currentBalance': currentBalance,
      'initialBalance': initialBalance,
      'creditLimit': creditLimit,
      'color': colorHex,
      'icon': iconKey,
      'isActive': isActive ? 1 : 0,
      'excludeFromNetWorth': excludeFromNetWorth ? 1 : 0,
    };
  }

  Color get color {
    try {
      final hex = colorHex.replaceAll('#', '');
      return Color(int.parse('FF$hex', radix: 16));
    } catch (_) {
      return const Color(0xFF8B5CF6);
    }
  }

  IconData get iconData {
    final sub = (subtype ?? '').toLowerCase();
    if (sub == 'bkash' || sub == 'nagad' || type == 'mobile_wallet') {
      return LucideIcons.smartphone;
    }
    if (sub == 'paypal' || sub == 'wise' || sub == 'stripe' || type == 'online_wallet') {
      return LucideIcons.globe;
    }
    if (type == 'bank') return LucideIcons.landmark;
    if (type == 'cash') return LucideIcons.banknote;
    if (type == 'credit_card') return LucideIcons.creditCard;
    if (type == 'crypto') return LucideIcons.coins;
    return LucideIcons.wallet;
  }

  String get currencySymbol {
    switch (currency.toUpperCase()) {
      case 'BDT':
        return '৳';
      case 'EUR':
        return '€';
      case 'GBP':
        return '£';
      case 'INR':
        return '₹';
      case 'BTC':
        return '₿';
      case 'ETH':
        return 'Ξ';
      case 'USD':
      default:
        return '\$';
    }
  }

  String get formattedBalance {
    final absVal = currentBalance.abs().toStringAsFixed(2);
    final sign = currentBalance < 0 ? '-' : '';
    return '$sign$currencySymbol$absVal';
  }
}
