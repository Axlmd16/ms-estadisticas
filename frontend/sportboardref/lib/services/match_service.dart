import 'dart:convert';
import 'package:http/http.dart' as http;

class MatchService {
  static const String baseUrl = 'http://localhost:8012/api/v1';

  Future<List<dynamic>> getMatchesWithTeams() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/matches/with-teams'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['matches'] != null && data['matches'] is List) {
          return data['matches'];
        } else {
          throw Exception('Formato de respuesta inválido');
        }
      } else {
        throw Exception('Error del servidor: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error de conexión: $e');
    }
  }

  Future<List<dynamic>> getMatches() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/matches'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['matches'] != null && data['matches'] is List) {
          return data['matches'];
        } else {
          throw Exception('Formato de respuesta inválido');
        }
      } else {
        throw Exception('Error del servidor: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error de conexión: $e');
    }
  }
}
