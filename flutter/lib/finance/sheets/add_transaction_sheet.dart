import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../_core/theme.dart';
import '../providers/finance_providers.dart';

class AddTransactionSheet extends ConsumerStatefulWidget {
  final String? initialAccountId;

  const AddTransactionSheet({super.key, this.initialAccountId});

  static Future<void> show(BuildContext context, {String? accountId}) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: CyberNoirTheme.surfaceCard,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (_) => AddTransactionSheet(initialAccountId: accountId),
    );
  }

  @override
  ConsumerState<AddTransactionSheet> createState() => _AddTransactionSheetState();
}

class _AddTransactionSheetState extends ConsumerState<AddTransactionSheet> {
  String _type = 'expense'; // 'income' | 'expense'
  final _amountController = TextEditingController();
  final _payeeController = TextEditingController();
  final _notesController = TextEditingController();
  String _selectedCategory = 'Shopping';
  String? _selectedAccountId;
  DateTime _selectedDate = DateTime.now();

  static const List<String> _expenseCategories = [
    'Shopping',
    'Food',
    'Snacks',
    'Beauty',
    'Pet',
    'Entertainment',
    'Home',
    'Donate',
    'Gift',
    'Investments',
  ];

  static const List<String> _incomeCategories = [
    'Salary',
    'Freelance',
    'Investments',
    'Gift',
    'Refund',
    'Other',
  ];

  @override
  void initState() {
    super.initState();
    _selectedAccountId = widget.initialAccountId;
  }

  @override
  void dispose() {
    _amountController.dispose();
    _payeeController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final accounts = ref.watch(accountsProvider).value ?? [];
    if (_selectedAccountId == null && accounts.isNotEmpty) {
      _selectedAccountId = accounts.first.id;
    }

    final categories = _type == 'expense' ? _expenseCategories : _incomeCategories;

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

            // Header: Income / Expense Segmented Control
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.06),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Row(
                    children: [
                      _buildTypeToggle('expense', 'Expense', CyberNoirTheme.roseRed),
                      const SizedBox(width: 4),
                      _buildTypeToggle('income', 'Income', CyberNoirTheme.emeraldGreen),
                    ],
                  ),
                ),
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(LucideIcons.x, size: 20, color: CyberNoirTheme.textSecondary),
                ),
              ],
            ),
            const SizedBox(height: 18),

            // Amount Input
            TextField(
              controller: _amountController,
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
              autofocus: true,
              style: const TextStyle(
                fontSize: 32,
                fontWeight: FontWeight.w800,
                fontFamily: 'monospace',
                color: CyberNoirTheme.textPrimary,
              ),
              decoration: InputDecoration(
                hintText: '0.00',
                hintStyle: TextStyle(color: Colors.white.withOpacity(0.2)),
                prefixText: _type == 'expense' ? '- \$ ' : '+ \$ ',
                prefixStyle: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: _type == 'expense' ? CyberNoirTheme.roseRed : CyberNoirTheme.emeraldGreen,
                ),
                border: InputBorder.none,
              ),
            ),
            const SizedBox(height: 14),

            // Account Selector Dropdown
            const Text(
              'PAY FROM / DEPOSIT TO ACCOUNT',
              style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: CyberNoirTheme.textSecondary),
            ),
            const SizedBox(height: 6),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14),
              decoration: BoxDecoration(
                color: CyberNoirTheme.surfaceCardElevated,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: Colors.white.withOpacity(0.08)),
              ),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  value: _selectedAccountId,
                  isExpanded: true,
                  dropdownColor: CyberNoirTheme.surfaceCardElevated,
                  items: accounts.map((a) {
                    return DropdownMenuItem<String>(
                      value: a.id,
                      child: Row(
                        children: [
                          Icon(a.iconData, size: 16, color: a.color),
                          const SizedBox(width: 10),
                          Text(a.name, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                          const Spacer(),
                          Text(
                            a.formattedBalance,
                            style: const TextStyle(fontSize: 12, color: CyberNoirTheme.textSecondary, fontFamily: 'monospace'),
                          ),
                        ],
                      ),
                    );
                  }).toList(),
                  onChanged: (val) => setState(() => _selectedAccountId = val),
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Category Picker Carousel
            const Text(
              'CATEGORY',
              style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: CyberNoirTheme.textSecondary),
            ),
            const SizedBox(height: 8),
            SizedBox(
              height: 40,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: categories.length,
                separatorBuilder: (_, __) => const SizedBox(width: 8),
                itemBuilder: (context, idx) {
                  final cat = categories[idx];
                  final isSelected = _selectedCategory == cat;
                  return InkWell(
                    onTap: () => setState(() => _selectedCategory = cat),
                    borderRadius: BorderRadius.circular(20),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      decoration: BoxDecoration(
                        color: isSelected ? CyberNoirTheme.primaryViolet : CyberNoirTheme.surfaceCardElevated,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: isSelected ? CyberNoirTheme.primaryViolet : Colors.white.withOpacity(0.08),
                        ),
                      ),
                      child: Text(
                        cat,
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                          color: isSelected ? Colors.white : CyberNoirTheme.textPrimary,
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 16),

            // Payee / Merchant Input
            TextField(
              controller: _payeeController,
              style: const TextStyle(fontSize: 14, color: CyberNoirTheme.textPrimary),
              decoration: InputDecoration(
                labelText: 'Payee or Merchant (optional)',
                labelStyle: const TextStyle(color: CyberNoirTheme.textSecondary, fontSize: 13),
                filled: true,
                fillColor: CyberNoirTheme.surfaceCardElevated,
                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: BorderSide(color: Colors.white.withOpacity(0.08)),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: BorderSide(color: Colors.white.withOpacity(0.08)),
                ),
              ),
            ),
            const SizedBox(height: 20),

            // Submit Button
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                onPressed: _handleSubmit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: _type == 'expense' ? CyberNoirTheme.roseRed : CyberNoirTheme.emeraldGreen,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  elevation: 0,
                ),
                child: Text(
                  _type == 'expense' ? 'Save Expense' : 'Save Income',
                  style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTypeToggle(String type, String label, Color activeColor) {
    final isSelected = _type == type;
    return InkWell(
      onTap: () {
        setState(() {
          _type = type;
          _selectedCategory = type == 'expense' ? _expenseCategories.first : _incomeCategories.first;
        });
      },
      borderRadius: BorderRadius.circular(10),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? activeColor : Colors.transparent,
          borderRadius: BorderRadius.circular(10),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.bold,
            color: isSelected ? Colors.white : CyberNoirTheme.textSecondary,
          ),
        ),
      ),
    );
  }

  void _handleSubmit() {
    final amount = double.tryParse(_amountController.text.trim()) ?? 0.0;
    if (amount <= 0) return;

    final accounts = ref.read(accountsProvider).value ?? [];
    final selectedAcc = accounts.where((a) => a.id == _selectedAccountId).firstOrNull;

    final dateStr =
        '${_selectedDate.year}-${_selectedDate.month.toString().padLeft(2, '0')}-${_selectedDate.day.toString().padLeft(2, '0')}';

    ref.read(transactionsProvider.notifier).addTransaction({
      'type': _type,
      'amount': amount,
      'category': _selectedCategory,
      'payee': _payeeController.text.trim().isEmpty ? null : _payeeController.text.trim(),
      'description': _notesController.text.trim().isEmpty ? null : _notesController.text.trim(),
      'date': dateStr,
      'accountId': _selectedAccountId,
      'accountName': selectedAcc?.name,
      'accountColor': selectedAcc?.colorHex,
    });

    Navigator.pop(context);
  }
}
