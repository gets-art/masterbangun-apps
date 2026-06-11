import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../../core/auth/auth_provider.dart';
import '../../../core/theme/app_theme.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final user = auth.user!;

    final menus = _getMenus(user.role);

    return Scaffold(
      appBar: AppBar(
        title: const Text('MasterBangun'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout, color: AppTheme.danger),
            onPressed: () async {
              await auth.logout();
              if (context.mounted) context.go('/login');
            },
          ),
        ],
      ),
      body: Column(
        children: [
          Container(
            margin: const EdgeInsets.all(16),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppTheme.primary.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppTheme.primary.withOpacity(0.3)),
            ),
            child: Row(
              children: [
                CircleAvatar(
                  backgroundColor: AppTheme.primary.withOpacity(0.2),
                  child: Text(user.name[0].toUpperCase(), style: const TextStyle(color: AppTheme.primary, fontWeight: FontWeight.bold)),
                ),
                const SizedBox(width: 12),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(user.name, style: const TextStyle(fontWeight: FontWeight.w600)),
                    Text(_roleLabel(user.role), style: TextStyle(color: AppTheme.textMuted, fontSize: 12)),
                  ],
                ),
              ],
            ),
          ),
          Expanded(
            child: menus.isEmpty
                ? const Center(
                    child: Padding(
                      padding: EdgeInsets.all(32.0),
                      child: Text(
                        'Silakan akses Web Dashboard melalui browser komputer Anda untuk mengelola laporan dan analitik.',
                        textAlign: TextAlign.center,
                        style: TextStyle(color: AppTheme.textMuted, height: 1.5),
                      ),
                    ),
                  )
                : GridView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2, crossAxisSpacing: 12, mainAxisSpacing: 12, childAspectRatio: 1.1,
                    ),
                    itemCount: menus.length,
                    itemBuilder: (_, i) {
                      final m = menus[i];
                      return GestureDetector(
                        onTap: () => context.go(m['route']!),
                        child: Card(
                          child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Text(m['icon']!, style: const TextStyle(fontSize: 36)),
                                const SizedBox(height: 10),
                                Text(m['label']!, textAlign: TextAlign.center, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }

  String _roleLabel(String role) {
    const labels = {
      'MANDOR': 'Mandor',
      'PENGAWAS': 'Pengawas Lapangan',
      'KONSUMEN': 'Konsumen',
      'MANAGER': 'Manager Operasional',
      'ADMIN_PROYEK': 'Admin Proyek',
      'SUPER_ADMIN': 'Super Admin',
    };
    return labels[role] ?? role;
  }

  List<Map<String, String>> _getMenus(String role) {
    switch (role) {
      case 'MANDOR':
        return [
          {'label': 'Absensi Tukang', 'icon': '📸', 'route': '/attendance'},
          {'label': 'Ajukan Material', 'icon': '📦', 'route': '/materials'},
        ];
      case 'PENGAWAS':
        return [
          {'label': 'Laporan Harian', 'icon': '📋', 'route': '/daily-report'},
          {'label': 'Approval Lembur', 'icon': '⏰', 'route': '/overtime'},
        ];
      case 'KONSUMEN':
        return [
          {'label': 'Gallery Foto', 'icon': '🖼️', 'route': '/gallery'},
        ];
      default:
        return [];
    }
  }
}
