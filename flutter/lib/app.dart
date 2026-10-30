import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '_core/theme.dart';
import 'finance/screens/finance_screen.dart';
import 'finance/screens/analytics_screen.dart';
import 'finance/screens/budgets_screen.dart';

final GoRouter router = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => const MainNavigationShell(),
    ),
  ],
);

class LifeSolverApp extends StatelessWidget {
  const LifeSolverApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'LifeSolver OS',
      debugShowCheckedModeBanner: false,
      theme: CyberNoirTheme.darkTheme,
      routerConfig: router,
    );
  }
}

class MainNavigationShell extends StatefulWidget {
  const MainNavigationShell({super.key});

  @override
  State<MainNavigationShell> createState() => _MainNavigationShellState();
}

class _MainNavigationShellState extends State<MainNavigationShell> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    FinanceScreen(), // Records
    AnalyticsScreen(), // Chart
    BudgetsScreen(), // Reports / Budgets
    MobileCommandCenterScreen(), // Me / System
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (index) {
          setState(() => _currentIndex = index);
        },
        backgroundColor: CyberNoirTheme.surfaceCard,
        surfaceTintColor: Colors.transparent,
        indicatorColor: const Color(0x33FBBF24), // Subtle Gold Indicator
        destinations: const [
          NavigationDestination(
            icon: Icon(LucideIcons.fileText, size: 20),
            selectedIcon: Icon(LucideIcons.fileText, size: 20, color: Color(0xFFFBBF24)),
            label: 'Records',
          ),
          NavigationDestination(
            icon: Icon(LucideIcons.pieChart, size: 20),
            selectedIcon: Icon(LucideIcons.pieChart, size: 20, color: Color(0xFFFBBF24)),
            label: 'Chart',
          ),
          NavigationDestination(
            icon: Icon(LucideIcons.barChart2, size: 20),
            selectedIcon: Icon(LucideIcons.barChart2, size: 20, color: Color(0xFFFBBF24)),
            label: 'Reports',
          ),
          NavigationDestination(
            icon: Icon(LucideIcons.user, size: 20),
            selectedIcon: Icon(LucideIcons.user, size: 20, color: Color(0xFFFBBF24)),
            label: 'Me',
          ),
        ],
      ),
    );
  }
}

class MobileCommandCenterScreen extends StatelessWidget {
  const MobileCommandCenterScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('LifeSolver OS', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.sparkles, color: CyberNoirTheme.primaryViolet),
            onPressed: () {},
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: const [
          Card(
            child: Padding(
              padding: EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(LucideIcons.sparkles, size: 16, color: CyberNoirTheme.primaryViolet),
                      SizedBox(width: 8),
                      Text(
                        'COMMAND CENTER',
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: CyberNoirTheme.primaryViolet),
                      ),
                    ],
                  ),
                  SizedBox(height: 8),
                  Text('All 8 Core Verticals Synchronized', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  SizedBox(height: 4),
                  Text('Drift offline-first outbox queue active on device.', style: TextStyle(fontSize: 12, color: CyberNoirTheme.textSecondary)),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
