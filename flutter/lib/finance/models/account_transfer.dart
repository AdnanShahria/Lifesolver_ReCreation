class AccountTransfer {
  final String id;
  final String fromAccountId;
  final String toAccountId;
  final double amount;
  final double destinationAmount;
  final double exchangeRate;
  final double feeAmount;
  final String date;
  final String? notes;
  final String? fromAccountName;
  final String? toAccountName;

  const AccountTransfer({
    required this.id,
    required this.fromAccountId,
    required this.toAccountId,
    required this.amount,
    required this.destinationAmount,
    this.exchangeRate = 1.0,
    this.feeAmount = 0.0,
    required this.date,
    this.notes,
    this.fromAccountName,
    this.toAccountName,
  });

  factory AccountTransfer.fromJson(Map<String, dynamic> json) {
    return AccountTransfer(
      id: json['id'] as String? ?? '',
      fromAccountId: json['fromAccountId'] as String? ?? '',
      toAccountId: json['toAccountId'] as String? ?? '',
      amount: (json['amount'] as num?)?.toDouble() ?? 0.0,
      destinationAmount: (json['destinationAmount'] as num?)?.toDouble() ?? 0.0,
      exchangeRate: (json['exchangeRate'] as num?)?.toDouble() ?? 1.0,
      feeAmount: (json['feeAmount'] as num?)?.toDouble() ?? 0.0,
      date: json['date'] as String? ?? '',
      notes: json['notes'] as String?,
      fromAccountName: json['fromAccountName'] as String?,
      toAccountName: json['toAccountName'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'fromAccountId': fromAccountId,
      'toAccountId': toAccountId,
      'amount': amount,
      'destinationAmount': destinationAmount,
      'exchangeRate': exchangeRate,
      'feeAmount': feeAmount,
      'date': date,
      'notes': notes,
    };
  }
}
