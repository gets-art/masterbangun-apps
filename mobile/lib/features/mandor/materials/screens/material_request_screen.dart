import 'package:flutter/material.dart';
import '../../../../core/api/api_client.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../models/project.dart';

class MaterialRequestScreen extends StatefulWidget {
  const MaterialRequestScreen({super.key});
  @override
  State<MaterialRequestScreen> createState() => _MaterialRequestScreenState();
}

class _MaterialRequestScreenState extends State<MaterialRequestScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _qtyCtrl = TextEditingController();
  final _unitCtrl = TextEditingController();
  final _notesCtrl = TextEditingController();
  List<Project> _projects = [];
  Project? _selectedProject;
  String _urgency = 'SEDANG';
  bool _loading = false;
  List<dynamic> _requests = [];

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    final [p, r] = await Future.wait([ApiClient.get('/projects'), ApiClient.get('/materials')]);
    setState(() {
      _projects = (p as List).map((j) => Project.fromJson(j)).toList();
      if (_projects.isNotEmpty) _selectedProject = _projects.first;
      _requests = r as List;
    });
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate() || _selectedProject == null) return;
    setState(() => _loading = true);
    try {
      await ApiClient.post('/materials', {
        'projectId': _selectedProject!.id,
        'materialName': _nameCtrl.text,
        'quantity': double.parse(_qtyCtrl.text),
        'unit': _unitCtrl.text,
        'urgency': _urgency,
        'notes': _notesCtrl.text,
      });
      _nameCtrl.clear(); _qtyCtrl.clear(); _unitCtrl.clear(); _notesCtrl.clear();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Pengajuan berhasil!'), backgroundColor: AppTheme.success));
        _load();
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Gagal mengajukan material'), backgroundColor: AppTheme.danger));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Ajukan Material')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Form Pengajuan Material', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 15)),
                      const SizedBox(height: 16),
                      if (_projects.isNotEmpty)
                        DropdownButtonFormField<Project>(
                          value: _selectedProject,
                          decoration: const InputDecoration(labelText: 'Proyek'),
                          dropdownColor: AppTheme.bgCard,
                          items: _projects.map((p) => DropdownMenuItem(value: p, child: Text(p.name, style: const TextStyle(color: Colors.white)))).toList(),
                          onChanged: (p) => setState(() => _selectedProject = p),
                        ),
                      const SizedBox(height: 12),
                      TextFormField(controller: _nameCtrl, decoration: const InputDecoration(labelText: 'Nama Material'), style: const TextStyle(color: Colors.white), validator: (v) => v!.isEmpty ? 'Wajib diisi' : null),
                      const SizedBox(height: 12),
                      Row(children: [
                        Expanded(child: TextFormField(controller: _qtyCtrl, decoration: const InputDecoration(labelText: 'Jumlah'), keyboardType: TextInputType.number, style: const TextStyle(color: Colors.white), validator: (v) => v!.isEmpty ? 'Wajib' : null)),
                        const SizedBox(width: 12),
                        Expanded(child: TextFormField(controller: _unitCtrl, decoration: const InputDecoration(labelText: 'Satuan'), style: const TextStyle(color: Colors.white), validator: (v) => v!.isEmpty ? 'Wajib' : null)),
                      ]),
                      const SizedBox(height: 12),
                      DropdownButtonFormField<String>(
                        value: _urgency,
                        decoration: const InputDecoration(labelText: 'Urgensi'),
                        dropdownColor: AppTheme.bgCard,
                        items: ['RENDAH','SEDANG','TINGGI'].map((u) => DropdownMenuItem(value: u, child: Text(u, style: const TextStyle(color: Colors.white)))).toList(),
                        onChanged: (v) => setState(() => _urgency = v!),
                      ),
                      const SizedBox(height: 12),
                      TextFormField(controller: _notesCtrl, decoration: const InputDecoration(labelText: 'Catatan (opsional)'), style: const TextStyle(color: Colors.white), maxLines: 2),
                      const SizedBox(height: 16),
                      ElevatedButton(onPressed: _loading ? null : _submit, child: Text(_loading ? 'Mengirim...' : 'Ajukan Material')),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(height: 20),
            const Text('Riwayat Pengajuan', style: TextStyle(fontWeight: FontWeight.w600)),
            const SizedBox(height: 12),
            ..._requests.map((r) => Card(
              margin: const EdgeInsets.only(bottom: 8),
              child: ListTile(
                title: Text(r['materialName'] ?? ''),
                subtitle: Text('${r['quantity']} ${r['unit']} • ${r['urgency']}'),
                trailing: Chip(
                  label: Text(r['status'] ?? '', style: const TextStyle(fontSize: 11)),
                  backgroundColor: r['status'] == 'APPROVED' ? AppTheme.success.withOpacity(0.15) : r['status'] == 'REJECTED' ? AppTheme.danger.withOpacity(0.15) : AppTheme.primary.withOpacity(0.15),
                ),
              ),
            )),
          ],
        ),
      ),
    );
  }
}
