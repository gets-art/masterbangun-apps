import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'dart:io' as io;
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:dio/dio.dart';
import 'package:geolocator/geolocator.dart';
import '../../../../core/api/api_client.dart';
import '../../../../core/theme/app_theme.dart';

class CameraCaptureScreen extends StatefulWidget {
  final String tukangId, projectId, type;
  const CameraCaptureScreen({super.key, required this.tukangId, required this.projectId, required this.type});
  @override
  State<CameraCaptureScreen> createState() => _CameraCaptureScreenState();
}

class _CameraCaptureScreenState extends State<CameraCaptureScreen> {
  XFile? _photo;
  bool _loading = false;
  String? _error;

  Future<void> _takePhoto() async {
    final img = await ImagePicker().pickImage(source: ImageSource.camera, imageQuality: 70);
    if (img != null) setState(() => _photo = img);
  }

  Future<void> _submit() async {
    if (_photo == null) { setState(() => _error = 'Ambil foto terlebih dahulu'); return; }
    setState(() { _loading = true; _error = null; });
    try {
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          setState(() { _error = 'Izin lokasi wajib diberikan untuk absen!'; _loading = false; });
          return;
        }
      }
      Position position = await Geolocator.getCurrentPosition(desiredAccuracy: LocationAccuracy.high);
      
      // Upload photo (Web compatible)
      final bytes = await _photo!.readAsBytes();
      final formData = FormData.fromMap({
        'file': MultipartFile.fromBytes(bytes, filename: 'attendance.jpg')
      });
      final uploadRes = await ApiClient.postFormData('/upload/photo', formData);
      final photoUrl = uploadRes['url'];

      final endpoint = widget.type == 'in' ? '/attendance/clock-in' : '/attendance/clock-out';
      await ApiClient.post(endpoint, {'tukangId': widget.tukangId, 'projectId': widget.projectId, 'photoUrl': photoUrl});

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(widget.type == 'in' ? 'Absen masuk berhasil!' : 'Absen keluar berhasil!'), backgroundColor: AppTheme.success));
        context.go('/attendance');
      }
    } catch (e) {
      setState(() => _error = 'Gagal menyimpan absensi. Coba lagi.');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.type == 'in' ? 'Foto Absen Masuk' : 'Foto Absen Keluar')),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            Expanded(
              child: GestureDetector(
                onTap: _takePhoto,
                child: Container(
                  width: double.infinity,
                  decoration: BoxDecoration(color: AppTheme.bgCard, borderRadius: BorderRadius.circular(16), border: Border.all(color: _photo == null ? const Color(0x14FFFFFF) : AppTheme.primary, width: _photo == null ? 1 : 2)),
                  child: _photo == null
                    ? const Column(mainAxisAlignment: MainAxisAlignment.center, children: [Icon(Icons.camera_alt, size: 64, color: AppTheme.primary), SizedBox(height: 16), Text('Tap untuk mengambil foto', style: TextStyle(color: AppTheme.textMuted)), SizedBox(height: 8), Text('Wajib menggunakan kamera', style: TextStyle(color: AppTheme.textMuted, fontSize: 12))])
                    : ClipRRect(
                        borderRadius: BorderRadius.circular(16),
                        child: kIsWeb ? Image.network(_photo!.path, fit: BoxFit.cover) : Image.file(io.File(_photo!.path), fit: BoxFit.cover),
                      ),
                ),
              ),
            ),
            const SizedBox(height: 16),
            if (_photo != null)
              OutlinedButton.icon(onPressed: _takePhoto, icon: const Icon(Icons.refresh, color: AppTheme.textMuted), label: const Text('Ambil Ulang', style: TextStyle(color: AppTheme.textMuted)), style: OutlinedButton.styleFrom(minimumSize: const Size(double.infinity, 44))),
            const SizedBox(height: 12),
            if (_error != null) Padding(padding: const EdgeInsets.only(bottom: 12), child: Text(_error!, style: const TextStyle(color: AppTheme.danger))),
            ElevatedButton.icon(onPressed: _loading ? null : _submit, icon: _loading ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black)) : const Icon(Icons.check), label: Text(_loading ? 'Menyimpan...' : 'Simpan Absensi')),
          ],
        ),
      ),
    );
  }
}
