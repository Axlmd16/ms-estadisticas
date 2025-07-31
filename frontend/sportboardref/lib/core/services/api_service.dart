import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import '../constants/api_constants.dart';
import '../constants/app_constants.dart';

class ApiService {
  static const int _timeoutDuration = AppConstants.connectTimeout;

  // Generic GET request
  static Future<http.Response> get(String endpoint,
      {Map<String, String>? headers}) async {
    try {
      final uri = Uri.parse(endpoint);
      final response = await http
          .get(
            uri,
            headers: headers ?? ApiConstants.headers,
          )
          .timeout(const Duration(milliseconds: _timeoutDuration));

      return response;
    } on SocketException {
      throw Exception('No Internet connection');
    } on HttpException {
      throw Exception('Failed to fetch data');
    } on FormatException {
      throw Exception('Bad response format');
    } catch (e) {
      throw Exception('Request failed: $e');
    }
  }

  // Generic POST request
  static Future<http.Response> post(
    String endpoint,
    Map<String, dynamic> body, {
    Map<String, String>? headers,
  }) async {
    try {
      final uri = Uri.parse(endpoint);
      final response = await http
          .post(
            uri,
            headers: headers ?? ApiConstants.headers,
            body: jsonEncode(body),
          )
          .timeout(const Duration(milliseconds: _timeoutDuration));

      return response;
    } on SocketException {
      throw Exception('No Internet connection');
    } on HttpException {
      throw Exception('Failed to send data');
    } on FormatException {
      throw Exception('Bad response format');
    } catch (e) {
      throw Exception('Request failed: $e');
    }
  }

  // Generic PATCH request
  static Future<http.Response> patch(
    String endpoint,
    Map<String, dynamic> body, {
    Map<String, String>? headers,
  }) async {
    try {
      final uri = Uri.parse(endpoint);
      final response = await http
          .patch(
            uri,
            headers: headers ?? ApiConstants.headers,
            body: jsonEncode(body),
          )
          .timeout(const Duration(milliseconds: _timeoutDuration));

      return response;
    } on SocketException {
      throw Exception('No Internet connection');
    } on HttpException {
      throw Exception('Failed to update data');
    } on FormatException {
      throw Exception('Bad response format');
    } catch (e) {
      throw Exception('Request failed: $e');
    }
  }

  // Generic PUT request
  static Future<http.Response> put(
    String endpoint,
    Map<String, dynamic> body, {
    Map<String, String>? headers,
  }) async {
    try {
      final uri = Uri.parse(endpoint);
      final response = await http
          .put(
            uri,
            headers: headers ?? ApiConstants.headers,
            body: jsonEncode(body),
          )
          .timeout(const Duration(milliseconds: _timeoutDuration));

      return response;
    } on SocketException {
      throw Exception('No Internet connection');
    } on HttpException {
      throw Exception('Failed to update data');
    } on FormatException {
      throw Exception('Bad response format');
    } catch (e) {
      throw Exception('Request failed: $e');
    }
  }

  // Generic DELETE request
  static Future<http.Response> delete(String endpoint,
      {Map<String, String>? headers}) async {
    try {
      final uri = Uri.parse(endpoint);
      final response = await http
          .delete(
            uri,
            headers: headers ?? ApiConstants.headers,
          )
          .timeout(const Duration(milliseconds: _timeoutDuration));

      return response;
    } on SocketException {
      throw Exception('No Internet connection');
    } on HttpException {
      throw Exception('Failed to delete data');
    } on FormatException {
      throw Exception('Bad response format');
    } catch (e) {
      throw Exception('Request failed: $e');
    }
  }

  // Handle API response and check for errors
  static Map<String, dynamic> handleResponse(http.Response response) {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      if (response.body.isEmpty) {
        return {};
      }
      try {
        return jsonDecode(response.body) as Map<String, dynamic>;
      } catch (e) {
        throw Exception('Invalid JSON response');
      }
    } else {
      Map<String, dynamic> errorBody = {};
      try {
        errorBody = jsonDecode(response.body) as Map<String, dynamic>;
      } catch (e) {
        // If response body is not JSON, create a generic error
        errorBody = {'message': 'Server error occurred'};
      }

      String errorMessage = errorBody['message'] ??
          errorBody['detail'] ??
          errorBody['error'] ??
          'Unknown error occurred';

      switch (response.statusCode) {
        case 400:
          throw Exception('Bad Request: $errorMessage');
        case 401:
          throw Exception('Unauthorized: $errorMessage');
        case 403:
          throw Exception('Forbidden: $errorMessage');
        case 404:
          throw Exception('Not Found: $errorMessage');
        case 422:
          throw Exception('Validation Error: $errorMessage');
        case 500:
          throw Exception('Server Error: $errorMessage');
        default:
          throw Exception('HTTP ${response.statusCode}: $errorMessage');
      }
    }
  }
}
