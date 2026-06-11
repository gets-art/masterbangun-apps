import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'dart:io' as io;
import 'package:image_picker/image_picker.dart';
import 'package:dio/dio.dart';
import '../../../../core/api/api_client.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../models/project.dart';

class DailyReportScreen extends StatefulWidget {
  const DailyReportScreen({super.key});
  @override
  State<DailyReportScreen> createState() => _DailyReportScreenState();
}

class _DailyReportScreenState extends State<DailyReportScreen> {
  final _descCtrl = TextEditingController();
  final _notesCtrl = TextEditingController();
  List<Project> _projects = [];
  Project? _selected;
  String _weather = 'CERAH';
  int _progress = 50;
  bool _loading = false;
  List<dynamic> _reports = [];
  final List<XFile> _photos = [];

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    final [p, r] = await Future.wait([ApiClient.get('/projects'), ApiClient.get('/daily-reports')]);
    setState(() {
      _projects = (p as List).map((j) => Project.fromJson(j)).toList();
      if (_projects.isNotEmpty) _selected = _projects.first;
      _reports = r as List;
    });
  }

  Future<void> _pickPhoto() async {
    final imgs = await ImagePicker().pickMultiImage(imageQuality: 70);
    if (imgs.isNotEmpty) setState(() => _photos.addAll(imgs));
  }

  Future<void> _submit() async {
    if (_selected == null || _descCtrl.text.isEmpty) return;
    setState(() => _loading = true);
    try {
      List<String> photoUrls = [];
      for (var photo in _photos) {
        final bytes = await photo.readAsBytes();
        final formData = FormData.fromMap({'file': MultipartFile.fromBytes(bytes, filename: photo.name)});
        final res = await ApiClient.postFormData('/upload/photo', formData);
        photoUrls.add(res['url']);
      }

      await ApiClient.post('/daily-reports', {
        'projectId': _selected!.id,
        'reportDate': DateTime.now().toIso8601String().split('T')[0],
        'weather': _weather,
        'description': _descCtrl.text,
        'progressPercentage': _progress,
        'notes': _notesCtrl.text,
        'photoUrls': photoUrls,
      });
      _descCtrl.clear(); _notesCtrl.clear(); _photos.clear();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Laporan berhasil dikirim!'), backgroundColor: AppTheme.success));
        _load();
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e'), backgroundColor: AppTheme.danger));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Laporan Harian')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Buat Laporan Harian', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 15)),
                    const SizedBox(height: 16),
                    if (_projects.isNotEmpty)
                      DropdownButtonFormField<Project>(
                        value: _selected,
                        decoration: const InputDecoration(labelText: 'Proyek'),
                        dropdownColor: AppTheme.bgCard,
                        items: _projects.map((p) => DropdownMenuItem(value: p, child: Text(p.name, style: const TextStyle(color: Colors.white)))).toList(),
                        onChanged: (p) => setState(() => _selected = p),
                      ),
                    const SizedBox(height: 12),
                    DropdownButtonFormField<String>(
                      value: _weather,
                      decoration: const InputDecoration(labelText: 'Cuaca'),
                      dropdownColor: AppTheme.bgCard,
                      items: [('CERAH','☀️ Cerah'),('MENDUNG','☁️ Mendung'),('HUJAN','🌧️ Hujan')].map((w) => DropdownMenuItem(value: w.$1, child: Text(w.$2, style: const TextStyle(color: Colors.white)))).toList(),
                      onChanged: (v) => setState(() => _weather = v!),
                    ),
                    const SizedBox(height: 12),
                    Text('Progress: $_progress%', style: const TextStyle(fontWeight: FontWeight.w500)),
                    Slider(value: _progress.toDouble(), min: 0, max: 100, divisions: 20, onChanged: (v) => setState(() => _progress = v.toInt()), activeColor: AppTheme.primary),
                    const SizedBox(height: 12),
                    TextFormField(controller: _descCtrl, decoration: const InputDecoration(labelText: 'Deskripsi Pekerjaan'), style: const TextStyle(color: Colors.white), maxLines: 3),
                    const SizedBox(height: 12),
                    TextFormField(controller: _notesCtrl, decoration: const InputDecoration(labelText: 'Catatan (opsional)'), style: const TextStyle(color: Colors.white), maxLines: 2),
                    const SizedBox(height: 16),
                    Text('Lampiran Foto (${_photos.length})', style: const TextStyle(fontWeight: FontWeight.w500)),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        ..._photos.map((p) => Stack(
                          children: [
                            ClipRRect(borderRadius: BorderRadius.circular(8), child: kIsWeb ? Image.network(p.path, width: 80, height: 80, fit: BoxFit.cover) : Image.file(io.File(p.path), width: 80, height: 80, fit: BoxFit.cover)),
                            Positioned(right: 0, top: 0, child: GestureDetector(onTap: () => setState(() => _photos.remove(p)), child: Container(padding: const EdgeInsets.all(2), decoration: const BoxDecoration(color: Colors.black54, shape: BoxShape.circle), child: const Icon(Icons.close, size: 16, color: Colors.white))))
                          ],
                        )),
                        GestureDetector(
                          onTap: _pickPhoto,
                          child: Container(width: 80, height: 80, decoration: BoxDecoration(border: Border.all(color: Colors.white24), borderRadius: BorderRadius.circular(8)), child: const Icon(Icons.add_a_photo, color: Colors.white54)),
                        )
                      ],
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton(onPressed: _loading ? null : _submit, child: Text(_loading ? 'Mengirim...' : 'Kirim Laporan')),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),
            const Text('Riwayat Laporan', style: TextStyle(fontWeight: FontWeight.w600)),
            const SizedBox(height: 12),
            ..._reports.map((r) => Card(
              margin: const EdgeInsets.only(bottom: 8),
              child: ListTile(
                title: Text(r['project']?['name'] ?? ''),
                subtitle: Text('${r['reportDate']} • ${r['weather']} • ${r['progressPercentage']}%'),
                trailing: Chip(label: Text(r['status'] ?? '', style: const TextStyle(fontSize: 11)), backgroundColor: r['status'] == 'APPROVED' ? AppTheme.success.withOpacity(0.15) : AppTheme.primary.withOpacity(0.15)),
              ),
            )),
          ],
        ),
      ),
    );
  }
}
