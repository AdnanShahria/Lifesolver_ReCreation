import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '_core/theme.dart';

final GoRouter router = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => const MobileCommandCenterScreen(),
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
                      Text('COMMAND CENTER', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: CyberNoirTheme.primaryViolet)),
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
