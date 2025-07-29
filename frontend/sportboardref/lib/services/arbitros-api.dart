import 'dart:convert';
import 'package:http/http.dart' as http;

class ArbitrosApiService {
  static const String baseUrl = 'http://localhost:8012/api/v1';

  // Métodos para árbitros (cuando los implementes en el backend)
  Future<List<dynamic>> getArbitros() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/arbitros'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return data['arbitros'] ?? [];
      } else {
        throw Exception('Error del servidor: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error de conexión: $e');
    }
  }

  Future<Map<String, dynamic>> createArbitro(Map<String, dynamic> arbitroData) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/arbitros'),
        headers: {
          'Content-Type': 'application/json',
        },
        body: json.encode(arbitroData),
      );

      if (response.statusCode == 201) {
        return json.decode(response.body);
      } else {
        throw Exception('Error al crear árbitro: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error de conexión: $e');
    }
  }

  Future<Map<String, dynamic>> getArbitroById(String id) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/arbitros/$id'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('Error del servidor: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error de conexión: $e');
    }
  }

  Future<Map<String, dynamic>> updateArbitro(String id, Map<String, dynamic> arbitroData) async {
    try {
      final response = await http.put(
        Uri.parse('$baseUrl/arbitros/$id'),
        headers: {
          'Content-Type': 'application/json',
        },
        body: json.encode(arbitroData),
      );

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('Error al actualizar árbitro: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error de conexión: $e');
    }
  }

  Future<bool> deleteArbitro(String id) async {
    try {
      final response = await http.delete(
        Uri.parse('$baseUrl/arbitros/$id'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200 || response.statusCode == 204) {
        return true;
      } else {
        throw Exception('Error al eliminar árbitro: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error de conexión: $e');
    }
  }

  // Métodos adicionales para otras entidades
  Future<List<dynamic>> getTeams() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/teams'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return data['teams'] ?? [];
      } else {
        throw Exception('Error del servidor: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error de conexión: $e');
    }
  }

  Future<List<dynamic>> getSeasons() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/seasons'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return data['seasons'] ?? [];
      } else {
        throw Exception('Error del servidor: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error de conexión: $e');
    }
  }

  // Método genérico para hacer peticiones GET
  Future<Map<String, dynamic>> getGeneric(String endpoint) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/$endpoint'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('Error del servidor: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error de conexión: $e');
    }
  }

  // Método genérico para hacer peticiones POST
  Future<Map<String, dynamic>> postGeneric(String endpoint, Map<String, dynamic> data) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/$endpoint'),
        headers: {
          'Content-Type': 'application/json',
        },
        body: json.encode(data),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        return json.decode(response.body);
      } else {
        throw Exception('Error del servidor: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error de conexión: $e');
    }
  }
}
