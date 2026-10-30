import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ApiClient {
  static const String baseUrl = 'http://10.0.2.2:8787'; // Android emulator localhost or production Cloudflare URL
  static const FlutterSecureStorage _storage = FlutterSecureStorage();

  static Dio? _dioInstance;

  static Dio get client {
    if (_dioInstance != null) return _dioInstance!;

    final dio = Dio(
      BaseOptions(
        baseUrl: baseUrl,
        connectTimeout: const Duration(seconds: 10),
        receiveTimeout: const Duration(seconds: 10),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await _storage.read(key: 'jwt_token');
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (DioException error, handler) {
          // Log or handle centralized refresh
          return handler.next(error);
        },
      ),
    );

    _dioInstance = dio;
    return _dioInstance!;
  }
}
