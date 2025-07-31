import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../constants/app_constants.dart';
import '../models/user_model.dart';

class SecureStorageService {
  static const _storage = FlutterSecureStorage(
    aOptions: AndroidOptions(
      encryptedSharedPreferences: true,
    ),
    iOptions: IOSOptions(
      accessibility: KeychainAccessibility.first_unlock_this_device,
    ),
  );

  // Token management
  static Future<void> saveToken(String token) async {
    await _storage.write(key: AppConstants.tokenKey, value: token);
  }

  static Future<String?> getToken() async {
    return await _storage.read(key: AppConstants.tokenKey);
  }

  static Future<void> saveRefreshToken(String refreshToken) async {
    await _storage.write(
        key: AppConstants.refreshTokenKey, value: refreshToken);
  }

  static Future<String?> getRefreshToken() async {
    return await _storage.read(key: AppConstants.refreshTokenKey);
  }

  // User data management
  static Future<void> saveUser(User user) async {
    final userJson = jsonEncode(user.toJson());
    await _storage.write(key: AppConstants.userDataKey, value: userJson);
  }

  static Future<User?> getUser() async {
    final userJson = await _storage.read(key: AppConstants.userDataKey);
    if (userJson != null) {
      try {
        final userMap = jsonDecode(userJson) as Map<String, dynamic>;
        return User.fromJson(userMap);
      } catch (e) {
        print('Error parsing user data: $e');
        return null;
      }
    }
    return null;
  }

  // Login state management
  static Future<void> setLoggedIn(bool isLoggedIn) async {
    await _storage.write(
        key: AppConstants.isLoggedInKey, value: isLoggedIn.toString());
  }

  static Future<bool> isLoggedIn() async {
    final value = await _storage.read(key: AppConstants.isLoggedInKey);
    return value == 'true';
  }

  // Clear all data (logout)
  static Future<void> clearAll() async {
    await Future.wait([
      _storage.delete(key: AppConstants.tokenKey),
      _storage.delete(key: AppConstants.refreshTokenKey),
      _storage.delete(key: AppConstants.userDataKey),
      _storage.delete(key: AppConstants.isLoggedInKey),
    ]);
  }

  // Update specific user data
  static Future<void> updateUserField(String field, dynamic value) async {
    final user = await getUser();
    if (user != null) {
      User updatedUser;
      switch (field) {
        case 'firstname':
          updatedUser = user.copyWith(firstname: value);
          break;
        case 'lastname':
          updatedUser = user.copyWith(lastname: value);
          break;
        case 'phone_number':
          updatedUser = user.copyWith(phoneNumber: value);
          break;
        case 'image':
          updatedUser = user.copyWith(image: value);
          break;
        case 'access':
          updatedUser = user.copyWith(access: value);
          break;
        default:
          return;
      }
      await saveUser(updatedUser);
    }
  }

  // Check if storage has data
  static Future<bool> hasData() async {
    final token = await getToken();
    final user = await getUser();
    return token != null && user != null;
  }
}
