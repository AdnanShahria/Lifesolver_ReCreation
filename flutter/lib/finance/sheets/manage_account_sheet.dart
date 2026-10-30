import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../_core/theme.dart';
import '../models/financial_account.dart';
import '../providers/finance_providers.dart';

class ManageAccountSheet extends ConsumerStatefulWidget {
  final FinancialAccount? accountToEdit;

  const ManageAccountSheet({super.key, this.accountToEdit});

  static Future<void> show(BuildContext context, {FinancialAccount? account}) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: CyberNoirTheme.surfaceCard,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (_) => ManageAccountSheet(accountToEdit: account),
    );
  }

  @override
  ConsumerState<ManageAccountSheet> createState() => _ManageAccountSheetState();
}

class _ManageAccountSheetState extends ConsumerState<ManageAccountSheet> {
  final _nameController = TextEditingController();
  final _balanceController = TextEditingController();
  String _type = 'bank';
  String? _subtype;
  String _currency = 'USD';
  String _colorHex = '#8B5CF6';

  static const List<Map<String, dynamic>> _typeOptions = [
    {'type': 'bank', 'label': 'Bank Account', 'icon': LucideIcons.landmark, 'color': '#3B82F6'},
    {'type': 'mobile_wallet', 'subtype': 'bkash', 'label': 'bKash Wallet', 'icon': LucideIcons.smartphone, 'color': '#E11D48', 'curr': 'BDT'},
    {'type': 'mobile_wallet', 'subtype': 'nagad', 'label': 'Nagad Wallet', 'icon': LucideIcons.smartphone, 'color': '#EA580C', 'curr': 'BDT'},
    {'type': 'online_wallet', 'subtype': 'paypal', 'label': 'PayPal USD', 'icon': LucideIcons.globe, 'color': '#0284C7', 'curr': 'USD'},
    {'type': 'online_wallet', 'subtype': 'wise', 'label': 'Wise Multi-Curr', 'icon': LucideIcons.globe, 'color': '#10B981', 'curr': 'USD'},
    {'type': 'cash', 'label': 'Cash / Wallet', 'icon': LucideIcons.banknote, 'color': '#10B981'},
    {'type': 'crypto', 'label': 'Crypto / Web3', 'icon': LucideIcons.coins, 'color': '#F59E0B', 'curr': 'USDT'},
  ];

  static const List<String> _colors = [
    '#10B981', // Emerald
    '#3B82F6', // Blue
    '#8B5CF6', // Violet
    '#E11D48', // Rose / bKash
    '#0284C7', // Sky / PayPal
    '#F59E0B', // Amber
    '#6366F1', // Indigo
    '#06B6D4', // Cyan
  ];

  @override
  void initState() {
    super.initState();
    if (widget.accountToEdit != null) {
      final a = widget.accountToEdit!;
      _nameController.text = a.name;
      _balanceController.text = a.currentBalance.toStringAsFixed(2);
      _type = a.type;
      _subtype = a.subtype;
      _currency = a.currency;
      _colorHex = a.colorHex;
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _balanceController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isEditing = widget.accountToEdit != null;

    return Padding(
      padding: EdgeInsets.only(
        left: 20,
        right: 20,
        top: 16,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Handle bar
            Center(
              child: Container(
                width: 36,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  isEditing ? 'Edit Account' : 'Add Financial Account',
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: CyberNoirTheme.textPrimary),
                ),
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(LucideIcons.x, size: 20, color: CyberNoirTheme.textSecondary),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Quick Type Presets
            const Text(
              'CHOOSE ACCOUNT TYPE',
              style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: CyberNoirTheme.textSecondary),
            ),
            const SizedBox(height: 8),
            SizedBox(
              height: 40,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: _typeOptions.length,
                separatorBuilder: (_, __) => const SizedBox(width: 8),
                itemBuilder: (context, idx) {
                  final opt = _typeOptions[idx];
                  final isSel = _type == opt['type'] && _subtype == opt['subtype'];
                  return InkWell(
                    onTap: () {
                      setState(() {
                        _type = opt['type'] as String;
                        _subtype = opt['subtype'] as String?;
                        _colorHex = opt['color'] as String;
                        if (opt['curr'] != null) {
                          _currency = opt['curr'] as String;
                        }
                        if (_nameController.text.isEmpty) {
                          _nameController.text = opt['label'] as String;
                        }
                      });
                    },
                    borderRadius: BorderRadius.circular(12),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: isSel ? CyberNoirTheme.cyanAccent : CyberNoirTheme.surfaceCardElevated,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: isSel ? CyberNoirTheme.cyanAccent : Colors.white.withOpacity(0.08),
                        ),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            opt['icon'] as IconData,
                            size: 14,
                            color: isSel ? Colors.black : CyberNoirTheme.textSecondary,
                          ),
                          const SizedBox(width: 6),
                          Text(
                            opt['label'] as String,
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: isSel ? FontWeight.bold : FontWeight.w500,
                              color: isSel ? Colors.black : CyberNoirTheme.textPrimary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 16),

            // Account Name
            TextField(
              controller: _nameController,
              style: const TextStyle(fontSize: 14, color: CyberNoirTheme.textPrimary),
              decoration: InputDecoration(
                labelText: 'Account Name',
                hintText: 'e.g. bKash Personal, Chase Checking',
                labelStyle: const TextStyle(color: CyberNoirTheme.textSecondary, fontSize: 13),
                filled: true,
                fillColor: CyberNoirTheme.surfaceCardElevated,
                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: BorderSide(color: Colors.white.withOpacity(0.08)),
                ),
              ),
            ),
            const SizedBox(height: 14),

            // Balance & Currency Row
            Row(
              children: [
                Expanded(
                  flex: 3,
                  child: TextField(
                    controller: _balanceController,
                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                    style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, fontFamily: 'monospace'),
                    decoration: InputDecoration(
                      labelText: isEditing ? 'Current Balance' : 'Starting Balance',
                      labelStyle: const TextStyle(color: CyberNoirTheme.textSecondary, fontSize: 13),
                      filled: true,
                      fillColor: CyberNoirTheme.surfaceCardElevated,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(14),
                        borderSide: BorderSide(color: Colors.white.withOpacity(0.08)),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  flex: 2,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    decoration: BoxDecoration(
                      color: CyberNoirTheme.surfaceCardElevated,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: Colors.white.withOpacity(0.08)),
                    ),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        value: _currency,
                        isExpanded: true,
                        dropdownColor: CyberNoirTheme.surfaceCardElevated,
                        items: ['USD', 'BDT', 'EUR', 'GBP', 'INR', 'USDT'].map((c) {
                          return DropdownMenuItem<String>(
                            value: c,
                            child: Text(c, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                          );
                        }).toList(),
                        onChanged: (val) {
                          if (val != null) setState(() => _currency = val);
                        },
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Color Swatches
            const Text(
              'ACCOUNT COLOR THEME',
              style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: CyberNoirTheme.textSecondary),
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: _colors.map((hex) {
                final isSelected = _colorHex == hex;
                final c = Color(int.parse('FF${hex.replaceAll('#', '')}', radix: 16));
                return InkWell(
                  onTap: () => setState(() => _colorHex = hex),
                  child: Container(
                    width: 32,
                    height: 32,
                    decoration: BoxDecoration(
                      color: c,
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: isSelected ? Colors.white : Colors.transparent,
                        width: 2.5,
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 24),

            // Submit Button
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                onPressed: _handleSubmit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: CyberNoirTheme.primaryViolet,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                child: Text(
                  isEditing ? 'Save Changes' : 'Create Account',
                  style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _handleSubmit() {
    final name = _nameController.text.trim();
    final balance = double.tryParse(_balanceController.text.trim()) ?? 0.0;
    if (name.isEmpty) return;

    if (widget.accountToEdit != null) {
      ref.read(accountsProvider.notifier).adjustBalance(widget.accountToEdit!.id, balance);
    } else {
      ref.read(accountsProvider.notifier).addAccount({
        'id': 'acc_${DateTime.now().millisecondsSinceEpoch}',
        'name': name,
        'type': _type,
        'subtype': _subtype,
        'currency': _currency,
        'currentBalance': balance,
        'initialBalance': balance,
        'color': _colorHex,
        'icon': 'Wallet',
      });
    }

    Navigator.pop(context);
  }
}
