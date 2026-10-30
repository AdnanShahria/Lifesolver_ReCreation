import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../_core/theme.dart';
import '../models/financial_account.dart';
import '../providers/finance_providers.dart';

class TransferFundsSheet extends ConsumerStatefulWidget {
  final FinancialAccount? initialSourceAccount;

  const TransferFundsSheet({super.key, this.initialSourceAccount});

  static Future<void> show(BuildContext context, {FinancialAccount? sourceAccount}) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: CyberNoirTheme.surfaceCard,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (_) => TransferFundsSheet(initialSourceAccount: sourceAccount),
    );
  }

  @override
  ConsumerState<TransferFundsSheet> createState() => _TransferFundsSheetState();
}

class _TransferFundsSheetState extends ConsumerState<TransferFundsSheet> {
  final _amountController = TextEditingController();
  final _feeController = TextEditingController();
  String? _fromAccountId;
  String? _toAccountId;

  @override
  void initState() {
    super.initState();
    _fromAccountId = widget.initialSourceAccount?.id;
  }

  @override
  void dispose() {
    _amountController.dispose();
    _feeController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final accounts = ref.watch(accountsProvider).value ?? [];
    if (_fromAccountId == null && accounts.isNotEmpty) {
      _fromAccountId = accounts.first.id;
    }
    if (_toAccountId == null && accounts.length > 1) {
      _toAccountId = accounts.firstWhere((a) => a.id != _fromAccountId).id;
    }

    final fromAcc = accounts.where((a) => a.id == _fromAccountId).firstOrNull;
    final toAcc = accounts.where((a) => a.id == _toAccountId).firstOrNull;

    final transferAmount = double.tryParse(_amountController.text.trim()) ?? 0.0;
    final feeAmount = double.tryParse(_feeController.text.trim()) ?? 0.0;

    final newFromBalance = (fromAcc?.currentBalance ?? 0.0) - transferAmount - feeAmount;
    final newToBalance = (toAcc?.currentBalance ?? 0.0) + transferAmount;

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
                const Row(
                  children: [
                    Icon(LucideIcons.arrowRightLeft, size: 18, color: CyberNoirTheme.cyanAccent),
                    SizedBox(width: 8),
                    Text(
                      'Transfer Funds',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: CyberNoirTheme.textPrimary),
                    ),
                  ],
                ),
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(LucideIcons.x, size: 20, color: CyberNoirTheme.textSecondary),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Source & Destination Row with Swap Button
            Row(
              children: [
                // From Account
                Expanded(
                  child: _buildAccountDropdown('FROM ACCOUNT', _fromAccountId, accounts, (val) {
                    setState(() => _fromAccountId = val);
                  }),
                ),
                // Swap Icon Button
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 8),
                  child: IconButton(
                    onPressed: () {
                      setState(() {
                        final temp = _fromAccountId;
                        _fromAccountId = _toAccountId;
                        _toAccountId = temp;
                      });
                    },
                    icon: const CircleAvatar(
                      radius: 16,
                      backgroundColor: CyberNoirTheme.borderAccent,
                      child: Icon(LucideIcons.arrowRightLeft, size: 14, color: CyberNoirTheme.primaryViolet),
                    ),
                  ),
                ),
                // To Account
                Expanded(
                  child: _buildAccountDropdown('TO ACCOUNT', _toAccountId, accounts, (val) {
                    setState(() => _toAccountId = val);
                  }),
                ),
              ],
            ),
            const SizedBox(height: 18),

            // Transfer Amount Input
            const Text(
              'AMOUNT TO TRANSFER',
              style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: CyberNoirTheme.textSecondary),
            ),
            const SizedBox(height: 6),
            TextField(
              controller: _amountController,
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, fontFamily: 'monospace'),
              onChanged: (_) => setState(() {}),
              decoration: InputDecoration(
                hintText: '0.00',
                filled: true,
                fillColor: CyberNoirTheme.surfaceCardElevated,
                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: BorderSide(color: Colors.white.withOpacity(0.08)),
                ),
              ),
            ),
            const SizedBox(height: 8),

            // Quick Percentage Chips (25%, 50%, 75%, MAX)
            if (fromAcc != null && fromAcc.currentBalance > 0)
              Row(
                children: [
                  _buildPercentChip('25%', fromAcc.currentBalance * 0.25),
                  const SizedBox(width: 6),
                  _buildPercentChip('50%', fromAcc.currentBalance * 0.50),
                  const SizedBox(width: 6),
                  _buildPercentChip('75%', fromAcc.currentBalance * 0.75),
                  const SizedBox(width: 6),
                  _buildPercentChip('MAX', fromAcc.currentBalance),
                ],
              ),
            const SizedBox(height: 16),

            // Transfer Fee Presets (e.g. bKash 1.85%)
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _feeController,
                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                    style: const TextStyle(fontSize: 14),
                    onChanged: (_) => setState(() {}),
                    decoration: InputDecoration(
                      labelText: 'Transfer Fee (optional)',
                      labelStyle: const TextStyle(fontSize: 12, color: CyberNoirTheme.textSecondary),
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
                const SizedBox(width: 8),
                InkWell(
                  onTap: () {
                    final amt = double.tryParse(_amountController.text.trim()) ?? 0.0;
                    final fee = amt * 0.0185; // bKash cash out 1.85%
                    _feeController.text = fee.toStringAsFixed(2);
                    setState(() {});
                  },
                  borderRadius: BorderRadius.circular(10),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 12),
                    decoration: BoxDecoration(
                      color: CyberNoirTheme.bkashPink.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: CyberNoirTheme.bkashPink.withOpacity(0.3)),
                    ),
                    child: const Text(
                      'bKash 1.85%',
                      style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: CyberNoirTheme.bkashPink),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 18),

            // Live Balance Preview Card
            if (fromAcc != null && toAcc != null)
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.04),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.white.withOpacity(0.06)),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(fromAcc.name, style: const TextStyle(fontSize: 11, color: CyberNoirTheme.textSecondary)),
                        const SizedBox(height: 2),
                        Text(
                          '${fromAcc.formattedBalance} → \$${newFromBalance.toStringAsFixed(2)}',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            fontFamily: 'monospace',
                            color: newFromBalance < 0 ? CyberNoirTheme.roseRed : CyberNoirTheme.textPrimary,
                          ),
                        ),
                      ],
                    ),
                    const Icon(LucideIcons.arrowRight, size: 14, color: CyberNoirTheme.textSecondary),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(toAcc.name, style: const TextStyle(fontSize: 11, color: CyberNoirTheme.textSecondary)),
                        const SizedBox(height: 2),
                        Text(
                          '${toAcc.formattedBalance} → \$${newToBalance.toStringAsFixed(2)}',
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            fontFamily: 'monospace',
                            color: CyberNoirTheme.emeraldGreen,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            const SizedBox(height: 20),

            // Submit Button
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                onPressed: (transferAmount > 0 && fromAcc != null && toAcc != null && _fromAccountId != _toAccountId)
                    ? _handleTransfer
                    : null,
                style: ElevatedButton.styleFrom(
                  backgroundColor: CyberNoirTheme.cyanAccent,
                  foregroundColor: Colors.black,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                child: const Text('Confirm Transfer', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAccountDropdown(
    String label,
    String? selectedId,
    List<FinancialAccount> accounts,
    Function(String?) onChanged,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: CyberNoirTheme.textSecondary)),
        const SizedBox(height: 4),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10),
          decoration: BoxDecoration(
            color: CyberNoirTheme.surfaceCardElevated,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.white.withOpacity(0.08)),
          ),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              value: selectedId,
              isExpanded: true,
              dropdownColor: CyberNoirTheme.surfaceCardElevated,
              items: accounts.map((a) {
                return DropdownMenuItem<String>(
                  value: a.id,
                  child: Text(
                    a.name,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                  ),
                );
              }).toList(),
              onChanged: onChanged,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildPercentChip(String label, double targetVal) {
    return InkWell(
      onTap: () {
        _amountController.text = targetVal.toStringAsFixed(2);
        setState(() {});
      },
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.06),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Text(label, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: CyberNoirTheme.textSecondary)),
      ),
    );
  }

  void _handleTransfer() {
    final transferAmount = double.tryParse(_amountController.text.trim()) ?? 0.0;
    final feeAmount = double.tryParse(_feeController.text.trim()) ?? 0.0;
    if (transferAmount <= 0 || _fromAccountId == null || _toAccountId == null) return;

    final accounts = ref.read(accountsProvider).value ?? [];
    final fromAcc = accounts.where((a) => a.id == _fromAccountId).firstOrNull;
    final toAcc = accounts.where((a) => a.id == _toAccountId).firstOrNull;

    if (fromAcc != null && toAcc != null) {
      final updatedFromBal = fromAcc.currentBalance - transferAmount - feeAmount;
      final updatedToBal = toAcc.currentBalance + transferAmount;

      ref.read(accountsProvider.notifier).adjustBalance(fromAcc.id, updatedFromBal);
      ref.read(accountsProvider.notifier).adjustBalance(toAcc.id, updatedToBal);

      // Also record transfer via API
      ref.read(financeApiServiceProvider).createTransfer({
        'fromAccountId': fromAcc.id,
        'toAccountId': toAcc.id,
        'amount': transferAmount,
        'destinationAmount': transferAmount,
        'feeAmount': feeAmount,
        'date': DateTime.now().toIso8601String().split('T').first,
      });
    }

    Navigator.pop(context);
  }
}
