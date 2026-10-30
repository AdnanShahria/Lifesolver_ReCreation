import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../_core/theme.dart';
import '../models/financial_account.dart';
import '../providers/finance_providers.dart';

class AccountsCarouselWidget extends ConsumerWidget {
  final VoidCallback onAddAccount;
  final Function(FinancialAccount) onTransfer;
  final Function(FinancialAccount) onAdjust;

  const AccountsCarouselWidget({
    super.key,
    required this.onAddAccount,
    required this.onTransfer,
    required this.onAdjust,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final accountsAsync = ref.watch(accountsProvider);
    final selectedAccountId = ref.watch(selectedAccountFilterProvider);

    return accountsAsync.when(
      loading: () => const SizedBox(
        height: 180,
        child: Center(child: CircularProgressIndicator(strokeWidth: 2)),
      ),
      error: (_, __) => const SizedBox.shrink(),
      data: (accounts) {
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Section Title & Total Net Balance ──
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Row(
                    children: [
                      Icon(LucideIcons.wallet, size: 16, color: CyberNoirTheme.cyanAccent),
                      SizedBox(width: 8),
                      Text(
                        'WALLETS & ACCOUNTS',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 0.8,
                          color: CyberNoirTheme.cyanAccent,
                        ),
                      ),
                    ],
                  ),
                  Text(
                    '${accounts.length} Active',
                    style: const TextStyle(
                      fontSize: 12,
                      color: CyberNoirTheme.textSecondary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),

            // ── Horizontal Cards Carousel ──
            SizedBox(
              height: 164,
              child: ListView.separated(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                scrollDirection: Axis.horizontal,
                physics: const BouncingScrollPhysics(),
                itemCount: accounts.length + 1,
                separatorBuilder: (_, __) => const SizedBox(width: 12),
                itemBuilder: (context, index) {
                  if (index == accounts.length) {
                    // "+ Add New Account" Card
                    return _buildAddAccountCard(context);
                  }
                  final acc = accounts[index];
                  final isSelected = selectedAccountId == acc.id;
                  return _buildAccountCard(context, acc, isSelected, ref);
                },
              ),
            ),
            const SizedBox(height: 14),

            // ── Filter Pills Bar (All Accounts / Per-Account) ──
            SizedBox(
              height: 36,
              child: ListView(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                scrollDirection: Axis.horizontal,
                physics: const BouncingScrollPhysics(),
                children: [
                  // 'All Accounts' Pill
                  _buildFilterPill(
                    label: 'All Accounts',
                    isSelected: selectedAccountId == null,
                    count: accounts.length,
                    onTap: () => ref.read(selectedAccountFilterProvider.notifier).state = null,
                  ),
                  const SizedBox(width: 8),
                  // Each Account Pill
                  ...accounts.map(
                    (a) => Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: _buildFilterPill(
                        label: a.name,
                        icon: a.iconData,
                        dotColor: a.color,
                        isSelected: selectedAccountId == a.id,
                        onTap: () {
                          final current = ref.read(selectedAccountFilterProvider);
                          ref.read(selectedAccountFilterProvider.notifier).state =
                              current == a.id ? null : a.id;
                        },
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        );
      },
    );
  }

  Widget _buildAccountCard(
    BuildContext context,
    FinancialAccount account,
    bool isSelected,
    WidgetRef ref,
  ) {
    return Container(
      width: 240,
      decoration: BoxDecoration(
        color: CyberNoirTheme.surfaceCardElevated,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isSelected
              ? account.color.withOpacity(0.8)
              : Colors.white.withOpacity(0.08),
          width: isSelected ? 2 : 1,
        ),
        boxShadow: isSelected
            ? [
                BoxShadow(
                  color: account.color.withOpacity(0.25),
                  blurRadius: 16,
                  offset: const Offset(0, 4),
                )
              ]
            : null,
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // Top Row: Icon + Type Tag + Subtype Badge
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                width: 38,
                height: 38,
                decoration: BoxDecoration(
                  color: account.color.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: account.color.withOpacity(0.3)),
                ),
                child: Icon(account.iconData, size: 20, color: account.color),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.06),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  account.subtype?.toUpperCase() ?? account.type.toUpperCase(),
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 0.6,
                    color: account.color,
                  ),
                ),
              ),
            ],
          ),

          // Middle: Account Name & Balance
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                account.name,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: CyberNoirTheme.textSecondary,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                account.formattedBalance,
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w800,
                  letterSpacing: -0.5,
                  color: CyberNoirTheme.textPrimary,
                ),
              ),
            ],
          ),

          // Bottom Quick Actions: Transfer & Adjust
          Row(
            children: [
              Expanded(
                child: InkWell(
                  onTap: () => onTransfer(account),
                  borderRadius: BorderRadius.circular(8),
                  child: Container(
                    height: 28,
                    decoration: BoxDecoration(
                      color: account.color.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    alignment: Alignment.center,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(LucideIcons.arrowRightLeft, size: 12, color: account.color),
                        const SizedBox(width: 4),
                        Text(
                          'Transfer',
                          style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: account.color),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 6),
              InkWell(
                onTap: () => onAdjust(account),
                borderRadius: BorderRadius.circular(8),
                child: Container(
                  height: 28,
                  width: 32,
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.06),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  alignment: Alignment.center,
                  child: const Icon(LucideIcons.edit2, size: 12, color: CyberNoirTheme.textSecondary),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildAddAccountCard(BuildContext context) {
    return InkWell(
      onTap: onAddAccount,
      borderRadius: BorderRadius.circular(20),
      child: Container(
        width: 130,
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.02),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Colors.white.withOpacity(0.12), strokeAlign: BorderSide.strokeAlignCenter),
        ),
        child: const Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircleAvatar(
              radius: 20,
              backgroundColor: CyberNoirTheme.borderAccent,
              child: Icon(LucideIcons.plus, size: 20, color: CyberNoirTheme.primaryViolet),
            ),
            SizedBox(height: 10),
            Text(
              'Add Wallet\nor Bank',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: CyberNoirTheme.textPrimary),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFilterPill({
    required String label,
    IconData? icon,
    Color? dotColor,
    required bool isSelected,
    int? count,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? CyberNoirTheme.cyanAccent : CyberNoirTheme.surfaceCardElevated,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? CyberNoirTheme.cyanAccent : Colors.white.withOpacity(0.08),
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (dotColor != null) ...[
              Container(
                width: 7,
                height: 7,
                decoration: BoxDecoration(color: dotColor, shape: BoxShape.circle),
              ),
              const SizedBox(width: 6),
            ] else if (icon != null) ...[
              Icon(icon, size: 13, color: isSelected ? Colors.black : CyberNoirTheme.textSecondary),
              const SizedBox(width: 6),
            ],
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                color: isSelected ? Colors.black : CyberNoirTheme.textPrimary,
              ),
            ),
            if (count != null) ...[
              const SizedBox(width: 5),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                decoration: BoxDecoration(
                  color: isSelected ? Colors.black.withOpacity(0.15) : Colors.white.withOpacity(0.08),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  count.toString(),
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: isSelected ? Colors.black : CyberNoirTheme.textSecondary,
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
