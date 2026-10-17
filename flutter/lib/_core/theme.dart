import 'package:flutter/material.dart';

class CyberNoirTheme {
  static const Color bgRoot = Color(0xFF09090B);
  static const Color surfaceCard = Color(0xFF18181B);
  static const Color primaryViolet = Color(0xFF8B5CF6);
  static const Color deepViolet = Color(0xFF7C3AED);
  static const Color indigoAccent = Color(0xFF6366F1);
  static const Color borderSubtle = Color(0x268B5CF6);
  static const Color textPrimary = Color(0xFFF4F4F5);
  static const Color textSecondary = Color(0xFFA1A1AA);

  static ThemeData get darkTheme {
    return ThemeData(
      brightness: Brightness.dark,
      scaffoldBackgroundColor: bgRoot,
      colorScheme: const ColorScheme.dark(
        primary: primaryViolet,
        secondary: indigoAccent,
        surface: surfaceCard,
      ),
      cardTheme: const CardTheme(
        color: surfaceCard,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(12)),
          side: BorderSide(color: borderSubtle),
        ),
      ),
      useMaterial3: true,
    );
  }
}
