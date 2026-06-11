import 'dart:io';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ApiClient {
  static String get baseUrl {
    if (kIsWeb) return 'http://localhost:3000/api';
    if (Platform.isAndroid) return 'http://10.0.2.2:3000/api';
    return 'http://localhost:3000/api';
  }
  static final _storage = FlutterSecureStorage();
  
  static final Dio _dio = Dio(BaseOptions(
    baseUrl: baseUrl,
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 10),
    headers: {'Content-Type': 'application/json'},
  ));

  static void init() {
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await _storage.read(key: 'token');
        if (token != null) options.headers['Authorization'] = 'Bearer $token';
        handler.next(options);
      },
      onError: (error, handler) {
        if (error.response?.statusCode == 401) {
          _storage.delete(key: 'token');
          _storage.delete(key: 'user');
        }
        handler.next(error);
      },
    ));
  }

  static Dio get dio => _dio;

  static Future<dynamic> get(String path, {Map<String, dynamic>? params}) async {
    final res = await _dio.get(path, queryParameters: params);
    return res.data;
  }

  static Future<dynamic> post(String path, dynamic data) async {
    final res = await _dio.post(path, data: data);
    return res.data;
  }

  static Future<dynamic> patch(String path, [dynamic data]) async {
    final res = await _dio.patch(path, data: data);
    return res.data;
  }

  static Future<dynamic> postFormData(String path, FormData data) async {
    final res = await _dio.post(path, data: data, options: Options(contentType: 'multipart/form-data'));
    return res.data;
  }
}
