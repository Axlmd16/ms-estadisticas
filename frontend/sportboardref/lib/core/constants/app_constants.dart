class AppConstants {
  // App Info
  static const String appName = 'SportBoard';
  static const String appVersion = '1.0.0';

  // Storage Keys
  static const String tokenKey = 'auth_token';
  static const String refreshTokenKey = 'refresh_token';
  static const String userDataKey = 'user_data';
  static const String isLoggedInKey = 'is_logged_in';

  // User Roles
  static const String roleAdmin = 'ADMIN';
  static const String roleUser = 'USER';
  static const String roleSpectator = 'ESPECTATOR';
  static const String roleCoach = 'COACH';
  static const String roleReferee = 'REFEREE';

  // Default Values
  static const String defaultRole = roleSpectator;

  // Validation
  static const int minPasswordLength = 8;
  static const int maxPasswordLength = 128;
  static const int minNameLength = 2;
  static const int maxNameLength = 50;

  // Network
  static const int connectTimeout = 30000; // 30 seconds
  static const int receiveTimeout = 30000; // 30 seconds

  // UI
  static const double borderRadius = 12.0;
  static const double padding = 16.0;
  static const double margin = 8.0;
}
