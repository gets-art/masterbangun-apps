import 'package:flutter/material.dart';
import '../../../../core/api/api_client.dart';
import '../../../../core/theme/app_theme.dart';

class OvertimeScreen extends StatefulWidget {
  const OvertimeScreen({super.key});
  @override
  State<OvertimeScreen> createState() => _OvertimeScreenState();
}

class _OvertimeScreenState extends State<OvertimeScreen> {
  List<dynamic> _pending = [];
  bool _loading = true;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final data = await ApiClient.get('/attendance/overtime/pending');
      setState(() => _pending = data as List);
    } finally { setState(() => _loading = false); }
  }

  Future<void> _approve(String id) async {
    await ApiClient.patch('/attendance/overtime/$id/approve');
    _load();
    if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Lembur disetujui'), backgroundColor: AppTheme.success));
  }

  Future<void> _reject(String id) async {
    await ApiClient.patch('/attendance/overtime/$id/reject');
    _load();
    if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Lembur ditolak'), backgroundColor: AppTheme.danger));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Approval Lembur')),
      body: _loading
        ? const Center(child: CircularProgressIndicator(color: AppTheme.primary))
        : _pending.isEmpty
          ? const Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [Text('⏰', style: TextStyle(fontSize: 48)), SizedBox(height: 12), Text('Tidak ada lembur pending', style: TextStyle(color: AppTheme.textMuted))]))
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _pending.length,
              itemBuilder: (_, i) {
                final a = _pending[i];
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: Padding(
                    padding: const EdgeInsets.all(14),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(a['tukang']?['name'] ?? '', style: const TextStyle(fontWeight: FontWeight.w600)),
                        const SizedBox(height: 4),
                        Text('Proyek: ${a['project']?['name'] ?? ''}', style: TextStyle(color: AppTheme.textMuted, fontSize: 12)),
                        Text('Tanggal: ${a['attendanceDate']}', style: TextStyle(color: AppTheme.textMuted, fontSize: 12)),
                        Text('Lembur: ${a['overtimeHours']} jam', style: const TextStyle(color: AppTheme.primary, fontWeight: FontWeight.w600)),
                        const SizedBox(height: 12),
                        Row(children: [
                          Expanded(child: ElevatedButton(onPressed: () => _approve(a['id']), child: const Text('✓ Setujui'))),
                          const SizedBox(width: 8),
                          Expanded(child: OutlinedButton(onPressed: () => _reject(a['id']), style: OutlinedButton.styleFrom(foregroundColor: AppTheme.danger, side: const BorderSide(color: AppTheme.danger)), child: const Text('✗ Tolak'))),
                        ]),
                      ],
                    ),
                  ),
                );
              },
            ),
    );
  }
}
