import 'package:flutter/material.dart';
import '../models/user_model.dart';
import '../models/auth_models.dart';
import '../services/api_service.dart';
import '../services/secure_storage_service.dart';
import '../constants/api_constants.dart';

class AuthProvider with ChangeNotifier {
  User? _currentUser;
  bool _isLoading = false;
  bool _isLoggedIn = false;
  String? _error;

  // Getters
  User? get currentUser => _currentUser;
  bool get isLoading => _isLoading;
  bool get isLoggedIn => _isLoggedIn;
  String? get error => _error;

  AuthProvider() {
    _initializeAuth();
  }

  // Initialize authentication state from storage
  Future<void> _initializeAuth() async {
    _setLoading(true);
    try {
      final isLoggedIn = await SecureStorageService.isLoggedIn();
      if (isLoggedIn) {
        final user = await SecureStorageService.getUser();
        if (user != null) {
          _currentUser = user;
          _isLoggedIn = true;
          // Verify token is still valid
          await _verifyToken();
        }
      }
    } catch (e) {
      print('Error initializing auth: $e');
      await logout();
    }
    _setLoading(false);
  }

  // Set loading state
  void _setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }

  // Set error
  void _setError(String? error) {
    _error = error;
    notifyListeners();
  }

  // Clear error
  void clearError() {
    _setError(null);
  }

  // Login
  Future<bool> login(String email, String password) async {
    _setLoading(true);
    _setError(null);

    try {
      final loginRequest = LoginRequest(email: email, password: password);
      final response = await ApiService.post(
        ApiConstants.loginEndpoint,
        loginRequest.toJson(),
      );

      final data = ApiService.handleResponse(response);
      final user = User.fromJson(data);

      // Save user data and tokens
      await SecureStorageService.saveUser(user);
      await SecureStorageService.saveToken(user.access);
      await SecureStorageService.saveRefreshToken(user.refresh);
      await SecureStorageService.setLoggedIn(true);

      _currentUser = user;
      _isLoggedIn = true;
      _setLoading(false);
      notifyListeners();
      return true;
    } catch (e) {
      _setError(e.toString());
      _setLoading(false);
      return false;
    }
  }

  // Register
  Future<bool> register({
    required String username,
    required String email,
    required String password,
    required String firstname,
    required String lastname,
    String? phoneNumber,
  }) async {
    _setLoading(true);
    _setError(null);

    try {
      final registerRequest = RegisterRequest(
        username: username,
        email: email,
        password: password,
        firstname: firstname,
        lastname: lastname,
        phoneNumber: phoneNumber,
      );

      final response = await ApiService.post(
        ApiConstants.registerEndpoint,
        registerRequest.toJson(),
      );

      ApiService.handleResponse(response);
      _setLoading(false);
      return true;
    } catch (e) {
      _setError(e.toString());
      _setLoading(false);
      return false;
    }
  }

  // Logout
  Future<void> logout() async {
    _setLoading(true);

    try {
      await SecureStorageService.clearAll();
      _currentUser = null;
      _isLoggedIn = false;
      _setError(null);
    } catch (e) {
      print('Error during logout: $e');
    }

    _setLoading(false);
    notifyListeners();
  }

  // Refresh token
  Future<bool> refreshToken() async {
    try {
      final refreshToken = await SecureStorageService.getRefreshToken();
      if (refreshToken == null) {
        await logout();
        return false;
      }

      final refreshRequest = RefreshTokenRequest(refresh: refreshToken);
      final response = await ApiService.post(
        ApiConstants.refreshTokenEndpoint,
        refreshRequest.toJson(),
      );

      final data = ApiService.handleResponse(response);
      final newToken = data['access'] as String;

      // Update token in storage and current user
      await SecureStorageService.saveToken(newToken);
      await SecureStorageService.updateUserField('access', newToken);

      if (_currentUser != null) {
        _currentUser = _currentUser!.copyWith(access: newToken);
        notifyListeners();
      }

      return true;
    } catch (e) {
      print('Error refreshing token: $e');
      await logout();
      return false;
    }
  }

  // Verify token
  Future<bool> _verifyToken() async {
    try {
      if (_currentUser == null) return false;

      final response = await ApiService.post(
        ApiConstants.verifyTokenEndpoint,
        {'token': _currentUser!.access},
      );

      ApiService.handleResponse(response);
      return true;
    } catch (e) {
      print('Token verification failed: $e');
      // Try to refresh token
      return await refreshToken();
    }
  }

  // Change password
  Future<bool> changePassword(String oldPassword, String newPassword) async {
    _setLoading(true);
    _setError(null);

    try {
      if (_currentUser == null) {
        throw Exception('User not authenticated');
      }

      final changePasswordRequest = ChangePasswordRequest(
        oldPassword: oldPassword,
        newPassword: newPassword,
      );

      final headers = ApiConstants.getAuthHeaders(_currentUser!.access);
      final response = await ApiService.post(
        ApiConstants.changePasswordEndpoint,
        changePasswordRequest.toJson(),
        headers: headers,
      );

      ApiService.handleResponse(response);
      _setLoading(false);
      return true;
    } catch (e) {
      _setError(e.toString());
      _setLoading(false);
      return false;
    }
  }

  // Request password reset
  Future<bool> requestPasswordReset(String email) async {
    _setLoading(true);
    _setError(null);

    try {
      final resetRequest = ResetPasswordRequest(email: email);
      final response = await ApiService.post(
        ApiConstants.resetPasswordEndpoint,
        resetRequest.toJson(),
      );

      ApiService.handleResponse(response);
      _setLoading(false);
      return true;
    } catch (e) {
      _setError(e.toString());
      _setLoading(false);
      return false;
    }
  }

  // Create new password with reset token
  Future<bool> createPassword(String token, String newPassword) async {
    _setLoading(true);
    _setError(null);

    try {
      final createPasswordRequest = CreatePasswordRequest(
        token: token,
        newPassword: newPassword,
      );

      final response = await ApiService.post(
        ApiConstants.createPasswordEndpoint,
        createPasswordRequest.toJson(),
      );

      ApiService.handleResponse(response);
      _setLoading(false);
      return true;
    } catch (e) {
      _setError(e.toString());
      _setLoading(false);
      return false;
    }
  }

  // Update user profile
  Future<bool> updateProfile({
    String? firstname,
    String? lastname,
    String? phoneNumber,
    String? image,
  }) async {
    _setLoading(true);
    _setError(null);

    try {
      if (_currentUser == null) {
        throw Exception('User not authenticated');
      }

      final updateRequest = UpdateProfileRequest(
        firstname: firstname,
        lastname: lastname,
        phoneNumber: phoneNumber,
        image: image,
      );

      final headers = ApiConstants.getAuthHeaders(_currentUser!.access);
      final endpoint =
          '${ApiConstants.userProfileEndpoint}/${_currentUser!.id}/';

      final response = await ApiService.patch(
        endpoint,
        updateRequest.toJson(),
        headers: headers,
      );

      final data = ApiService.handleResponse(response);
      final updatedUser = User.fromJson(data);

      // Update stored user data
      await SecureStorageService.saveUser(updatedUser);
      _currentUser = updatedUser;

      _setLoading(false);
      notifyListeners();
      return true;
    } catch (e) {
      _setError(e.toString());
      _setLoading(false);
      return false;
    }
  }

  // Get current user profile (refresh from server)
  Future<bool> refreshProfile() async {
    _setLoading(true);
    _setError(null);

    try {
      if (_currentUser == null) {
        throw Exception('User not authenticated');
      }

      final headers = ApiConstants.getAuthHeaders(_currentUser!.access);
      final endpoint =
          '${ApiConstants.userProfileEndpoint}/${_currentUser!.id}/';

      final response = await ApiService.get(endpoint, headers: headers);
      final data = ApiService.handleResponse(response);

      final updatedUser = _currentUser!.copyWith(
        firstname: data['firstname'],
        lastname: data['lastname'],
        phoneNumber: data['phone_number'],
        image: data['image'],
        verified: data['verified'],
      );

      // Update stored user data
      await SecureStorageService.saveUser(updatedUser);
      _currentUser = updatedUser;

      _setLoading(false);
      notifyListeners();
      return true;
    } catch (e) {
      _setError(e.toString());
      _setLoading(false);
      return false;
    }
  }
}
