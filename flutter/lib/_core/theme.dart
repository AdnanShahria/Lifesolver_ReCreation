import 'package:flutter/material.dart';

class CyberNoirTheme {
  static const Color bgRoot = Color(0xFF09090B);
  static const Color surfaceCard = Color(0xFF141418);
  static const Color surfaceCardElevated = Color(0xFF1E1E24);
  
  static const Color primaryViolet = Color(0xFF8B5CF6);
  static const Color deepViolet = Color(0xFF7C3AED);
  static const Color indigoAccent = Color(0xFF6366F1);
  static const Color cyanAccent = Color(0xFF06B6D4);
  static const Color emeraldGreen = Color(0xFF10B981);
  static const Color roseRed = Color(0xFFF43F5E);
  static const Color amberOrange = Color(0xFFF59E0B);
  static const Color skyBlue = Color(0xFF0284C7);
  static const Color bkashPink = Color(0xFFE11D48);

  static const Color borderSubtle = Color(0x1FFFFFFF);
  static const Color borderAccent = Color(0x338B5CF6);
  static const Color textPrimary = Color(0xFFF4F4F5);
  static const Color textSecondary = Color(0xFFA1A1AA);
  static const Color textMuted = Color(0xFF71717A);

  // Category Pastel Backgrounds
  static const Color pastelFood = Color(0xFFFEE2E2);
  static const Color pastelShopping = Color(0xFFFEF3C7);
  static const Color pastelBeauty = Color(0xFFFCE7F3);
  static const Color pastelPet = Color(0xFFCCFBF1);
  static const Color pastelEntertainment = Color(0xFFEDE9FE);
  static const Color pastelInvestments = Color(0xFFD1FAE5);
  static const Color pastelHome = Color(0xFFE0E7FF);
  static const Color pastelSnacks = Color(0xFFFFEDD5);

  static ThemeData get darkTheme {
    return ThemeData(
      brightness: Brightness.dark,
      scaffoldBackgroundColor: bgRoot,
      colorScheme: const ColorScheme.dark(
        primary: primaryViolet,
        secondary: cyanAccent,
        surface: surfaceCard,
      ),
      cardTheme: const CardTheme(
        color: surfaceCard,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(16)),
          side: BorderSide(color: borderSubtle),
        ),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: bgRoot,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
      ),
      bottomSheetTheme: const BottomSheetThemeData(
        backgroundColor: surfaceCard,
        surfaceTintColor: Colors.transparent,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
        ),
      ),
      useMaterial3: true,
    );
  }
}
