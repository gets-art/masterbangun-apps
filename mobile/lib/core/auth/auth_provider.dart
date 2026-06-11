import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../models/user.dart';
import '../api/api_client.dart';

class AuthProvider extends ChangeNotifier {
  final _storage = const FlutterSecureStorage();
  User? _user;
  bool _initialized = false;

  User? get user => _user;
  bool get isLoggedIn => _user != null;
  bool get isInitialized => _initialized;

  AuthProvider() {
    ApiClient.init();
    _init();
  }

  Future<void> _init() async {
    final userJson = await _storage.read(key: 'user');
    if (userJson != null) _user = User.fromJson(jsonDecode(userJson));
    _initialized = true;
    notifyListeners();
  }

  Future<void> login(String email, String password) async {
    final res = await ApiClient.post('/auth/login', {'email': email, 'password': password});
    final token = res['access_token'];
    final user = User.fromJson(res['user']);
    await _storage.write(key: 'token', value: token);
    await _storage.write(key: 'user', value: jsonEncode(user.toJson()));
    _user = user;
    notifyListeners();
  }

  Future<void> logout() async {
    await _storage.deleteAll();
    _user = null;
    notifyListeners();
  }
}
