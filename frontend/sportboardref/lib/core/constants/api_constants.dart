class ApiConstants {
  // Kong API Gateway URL (using real microservice)
  // Para emulador Android usar 10.0.2.2, para iOS Simulator usar localhost
  // Para dispositivo físico usar la IP de tu máquina (ej: 192.168.x.x)
  // static const String baseUrl = 'http://10.0.2.2:8000/auth';  // Android Emulator -> Kong
  static const String baseUrl =
      'http://localhost:8000/auth'; // Web/iOS Simulator -> Kong
  // static const String baseUrl = 'http://192.168.1.XXX:8000/auth';  // Physical device -> Kong

  // Auth routes (updated to match actual microservice endpoints)
  static const String authBaseUrl = '$baseUrl/api/v1/auth';
  static const String userBaseUrl = '$baseUrl/api/v1/user';

  // Endpoints (matching Django microservice URL patterns)
  static const String loginEndpoint = '$authBaseUrl/login/';
  static const String registerEndpoint = '$authBaseUrl/register/';
  static const String refreshTokenEndpoint = '$authBaseUrl/token/refresh/';
  static const String verifyTokenEndpoint = '$authBaseUrl/token/verify/';
  static const String changePasswordEndpoint = '$authBaseUrl/change-password/';
  static const String resetPasswordEndpoint =
      '$authBaseUrl/initiate-password-reset/';
  static const String createPasswordEndpoint = '$authBaseUrl/create-password/';

  // User endpoints
  static const String userProfileEndpoint = userBaseUrl;

  // Headers
  static const Map<String, String> headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  static Map<String, String> getAuthHeaders(String token) {
    return {
      ...headers,
      'Authorization': 'Bearer $token',
    };
  }
}
