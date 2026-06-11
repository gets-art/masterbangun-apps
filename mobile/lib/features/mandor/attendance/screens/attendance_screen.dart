import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../../../core/api/api_client.dart';
import '../../../../core/auth/auth_provider.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../models/project.dart';
import '../../../../models/tukang.dart';

class AttendanceScreen extends StatefulWidget {
  const AttendanceScreen({super.key});
  @override
  State<AttendanceScreen> createState() => _AttendanceScreenState();
}

class _AttendanceScreenState extends State<AttendanceScreen> {
  List<Project> _projects = [];
  List<dynamic> _todayAttendance = [];
  Project? _selectedProject;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadProjects();
  }

  Future<void> _loadProjects() async {
    try {
      final data = await ApiClient.get('/projects');
      setState(() {
        _projects = (data as List).map((j) => Project.fromJson(j)).toList();
        if (_projects.isNotEmpty) {
          _selectedProject = _projects.first;
          _loadToday();
        }
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  Future<void> _loadToday() async {
    if (_selectedProject == null) return;
    try {
      final data = await ApiClient.get('/attendance/today/${_selectedProject!.id}');
      setState(() => _todayAttendance = data as List);
    } catch (_) {}
  }

  bool _hasClockedIn(String tukangId) => _todayAttendance.any((a) => a['tukangId'] == tukangId && a['clockIn'] != null);
  bool _hasClockedOut(String tukangId) => _todayAttendance.any((a) => a['tukangId'] == tukangId && a['clockOut'] != null);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Absensi Tukang')),
      body: _loading
        ? const Center(child: CircularProgressIndicator(color: AppTheme.primary))
        : Column(
            children: [
              if (_projects.isNotEmpty)
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: DropdownButtonFormField<Project>(
                    value: _selectedProject,
                    decoration: const InputDecoration(labelText: 'Pilih Proyek'),
                    dropdownColor: AppTheme.bgCard,
                    items: _projects.map((p) => DropdownMenuItem(value: p, child: Text(p.name, style: const TextStyle(color: Colors.white)))).toList(),
                    onChanged: (p) { setState(() => _selectedProject = p); _loadToday(); },
                  ),
                ),
              if (_selectedProject != null)
                Expanded(child: _TukangList(
                  projectId: _selectedProject!.id,
                  hasClockedIn: _hasClockedIn,
                  hasClockedOut: _hasClockedOut,
                  onRefresh: _loadToday,
                )),
            ],
          ),
    );
  }
}

class _TukangList extends StatefulWidget {
  final String projectId;
  final bool Function(String) hasClockedIn;
  final bool Function(String) hasClockedOut;
  final VoidCallback onRefresh;
  const _TukangList({required this.projectId, required this.hasClockedIn, required this.hasClockedOut, required this.onRefresh});
  @override
  State<_TukangList> createState() => _TukangListState();
}

class _TukangListState extends State<_TukangList> {
  List<Tukang> _tukang = [];

  @override
  void initState() { super.initState(); _load(); }

  @override
  void didUpdateWidget(_TukangList old) {
    super.didUpdateWidget(old);
    if (old.projectId != widget.projectId) _load();
  }

  Future<void> _load() async {
    try {
      final data = await ApiClient.get('/projects/${widget.projectId}/tukang');
      setState(() => _tukang = (data as List).map((j) => Tukang.fromJson(j['tukang'])).toList());
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    if (_tukang.isEmpty) return const Center(child: Text('Belum ada tukang di proyek ini'));
    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      itemCount: _tukang.length,
      itemBuilder: (_, i) {
        final t = _tukang[i];
        final in_ = widget.hasClockedIn(t.id);
        final out = widget.hasClockedOut(t.id);
        return Card(
          margin: const EdgeInsets.only(bottom: 10),
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: Row(
              children: [
                CircleAvatar(
                  backgroundColor: AppTheme.primary.withOpacity(0.1),
                  child: Text(t.name[0], style: const TextStyle(color: AppTheme.primary)),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(t.name, style: const TextStyle(fontWeight: FontWeight.w600)),
                      if (t.skill != null) Text(t.skill!, style: TextStyle(color: AppTheme.textMuted, fontSize: 12)),
                    ],
                  ),
                ),
                Row(
                  children: [
                    if (!in_) ElevatedButton(
                      onPressed: () => context.go('/camera', extra: {'tukangId': t.id, 'projectId': widget.projectId, 'type': 'in'}),
                      style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8), minimumSize: Size.zero),
                      child: const Text('Masuk', style: TextStyle(fontSize: 12)),
                    ),
                    if (in_ && !out) ...[const SizedBox(width: 8), ElevatedButton(
                      onPressed: () => context.go('/camera', extra: {'tukangId': t.id, 'projectId': widget.projectId, 'type': 'out'}),
                      style: ElevatedButton.styleFrom(backgroundColor: Colors.orange, padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8), minimumSize: Size.zero),
                      child: const Text('Keluar', style: TextStyle(fontSize: 12, color: Colors.black)),
                    )],
                    if (out) const Chip(label: Text('✓ Selesai', style: TextStyle(fontSize: 12)), backgroundColor: Color(0x1A10B981)),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
