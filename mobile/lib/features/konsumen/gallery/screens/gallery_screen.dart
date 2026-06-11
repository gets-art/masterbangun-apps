import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../../core/api/api_client.dart';
import '../../../../core/auth/auth_provider.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../models/project.dart';

class GalleryScreen extends StatefulWidget {
  const GalleryScreen({super.key});
  @override
  State<GalleryScreen> createState() => _GalleryScreenState();
}

class _GalleryScreenState extends State<GalleryScreen> {
  List<Project> _projects = [];
  List<dynamic> _photos = [];
  Project? _selected;
  bool _loading = true;

  @override
  void initState() { super.initState(); _loadProjects(); }

  Future<void> _loadProjects() async {
    final data = await ApiClient.get('/projects');
    setState(() {
      _projects = (data as List).map((j) => Project.fromJson(j)).toList();
      if (_projects.isNotEmpty) {
        _selected = _projects.first;
        _loadPhotos();
      } else {
        _loading = false;
      }
    });
  }

  Future<void> _loadPhotos() async {
    if (_selected == null) return;
    setState(() => _loading = true);
    try {
      final data = await ApiClient.get('/photos/consumer/${_selected!.id}');
      setState(() => _photos = data as List);
    } finally {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Gallery Foto Proyek')),
      body: Column(
        children: [
          if (_projects.isNotEmpty)
            Padding(
              padding: const EdgeInsets.all(16),
              child: DropdownButtonFormField<Project>(
                value: _selected,
                decoration: const InputDecoration(labelText: 'Pilih Proyek'),
                dropdownColor: AppTheme.bgCard,
                items: _projects.map((p) => DropdownMenuItem(value: p, child: Text(p.name, style: const TextStyle(color: Colors.white)))).toList(),
                onChanged: (p) { setState(() => _selected = p); _loadPhotos(); },
              ),
            ),
          Expanded(
            child: _loading
              ? const Center(child: CircularProgressIndicator(color: AppTheme.primary))
              : _photos.isEmpty
                ? const Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [Text('📷', style: TextStyle(fontSize: 48)), SizedBox(height: 12), Text('Belum ada foto', style: TextStyle(color: AppTheme.textMuted)), SizedBox(height: 4), Text('Foto akan muncul setelah disetujui Manager', style: TextStyle(color: AppTheme.textMuted, fontSize: 12))]))
                : GridView.builder(
                    padding: const EdgeInsets.all(16),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 2, crossAxisSpacing: 10, mainAxisSpacing: 10),
                    itemCount: _photos.length,
                    itemBuilder: (_, i) {
                      final p = _photos[i];
                      return Card(
                        clipBehavior: Clip.antiAlias,
                        child: Column(
                          children: [
                            Expanded(child: Container(
                              color: const Color(0x0DFFFFFF),
                              child: const Center(child: Text('📷', style: TextStyle(fontSize: 36))),
                            )),
                            Padding(
                              padding: const EdgeInsets.all(8),
                              child: Text(p['dailyReport']?['reportDate'] ?? '', style: const TextStyle(fontSize: 11, color: AppTheme.textMuted)),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
