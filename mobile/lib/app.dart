import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'core/auth/auth_provider.dart';
import 'core/theme/app_theme.dart';
import 'features/auth/screens/login_screen.dart';
import 'features/mandor/attendance/screens/attendance_screen.dart';
import 'features/mandor/attendance/screens/camera_capture_screen.dart';
import 'features/mandor/materials/screens/material_request_screen.dart';
import 'features/pengawas/daily_report/screens/daily_report_screen.dart';
import 'features/pengawas/overtime/screens/overtime_screen.dart';
import 'features/konsumen/gallery/screens/gallery_screen.dart';
import 'features/shared/screens/home_screen.dart';

class MasterBangunApp extends StatelessWidget {
  const MasterBangunApp({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    final router = GoRouter(
      initialLocation: auth.isLoggedIn ? '/home' : '/login',
      redirect: (ctx, state) {
        final loggedIn = auth.isLoggedIn;
        final onLogin = state.matchedLocation == '/login';
        if (!loggedIn && !onLogin) return '/login';
        if (loggedIn && onLogin) return '/home';
        return null;
      },
      routes: [
        GoRoute(path: '/login', builder: (_, __) => const LoginScreen()),
        GoRoute(path: '/home', builder: (_, __) => const HomeScreen()),
        GoRoute(path: '/attendance', builder: (_, __) => const AttendanceScreen()),
        GoRoute(
          path: '/camera',
          builder: (_, state) {
            final extra = state.extra as Map<String, dynamic>;
            return CameraCaptureScreen(
              tukangId: extra['tukangId'],
              projectId: extra['projectId'],
              type: extra['type'],
            );
          },
        ),
        GoRoute(path: '/materials', builder: (_, __) => const MaterialRequestScreen()),
        GoRoute(path: '/daily-report', builder: (_, __) => const DailyReportScreen()),
        GoRoute(path: '/overtime', builder: (_, __) => const OvertimeScreen()),
        GoRoute(path: '/gallery', builder: (_, __) => const GalleryScreen()),
      ],
    );

    return MaterialApp.router(
      title: 'MasterBangun',
      theme: AppTheme.theme,
      debugShowCheckedModeBanner: false,
      routerConfig: router,
    );
  }
}
