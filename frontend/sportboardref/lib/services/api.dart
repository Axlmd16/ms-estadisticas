import 'dart:convert';
import 'package:http/http.dart' as http;

class MatchService {
  static const String baseUrl = 'http://localhost:8012/api/v1';

  Future<List<dynamic>> getMatchesWithTeams() async {
    try {
      print('🔄 Iniciando petición a: $baseUrl/matches/with-teams');
      
      final response = await http.get(
        Uri.parse('$baseUrl/matches/with-teams'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      print('📡 Respuesta recibida - Status Code: ${response.statusCode}');
      print('📦 Body de la respuesta: ${response.body}');

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        print('✅ JSON parseado exitosamente');
        print('📋 Datos recibidos: $data');
        
        // El backend devuelve directamente una lista, no un objeto con matches
        if (data is List) {
          print('✅ Se encontraron ${data.length} matches');
          return data;
        } else {
          print('❌ Formato de respuesta inválido - se esperaba una lista');
          throw Exception('Formato de respuesta inválido');
        }
      } else {
        print('❌ Error del servidor: ${response.statusCode}');
        print('📄 Respuesta del servidor: ${response.body}');
        throw Exception('Error del servidor: ${response.statusCode}');
      }
    } catch (e) {
      print('💥 Error en getMatchesWithTeams: $e');
      throw Exception('Error de conexión: $e');
    }
  }

  Future<List<dynamic>> getMatches() async {
    try {
      print('🔄 Iniciando petición a: $baseUrl/matches');
      
      final response = await http.get(
        Uri.parse('$baseUrl/matches'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      print('📡 Respuesta recibida - Status Code: ${response.statusCode}');
      print('📦 Body de la respuesta: ${response.body}');

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        print('✅ JSON parseado exitosamente');
        
        // El backend devuelve directamente una lista, no un objeto con matches
        if (data is List) {
          print('✅ Se encontraron ${data.length} matches básicos');
          return data;
        } else {
          print('❌ Formato de respuesta inválido - se esperaba una lista');
          throw Exception('Formato de respuesta inválido');
        }
      } else {
        print('❌ Error del servidor: ${response.statusCode}');
        throw Exception('Error del servidor: ${response.statusCode}');
      }
    } catch (e) {
      print('💥 Error en getMatches: $e');
      throw Exception('Error de conexión: $e');
    }
  }
}
