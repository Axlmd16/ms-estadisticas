import 'dart:convert';
import 'package:http/http.dart' as http;

class MatchService {
  static const String baseUrl = 'http://localhost:8012/api/v1';

  // Obtener matches con información de equipos
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

  // Obtener todos los scoreboards
  Future<List<dynamic>> getScoreboards() async {
    try {
      print('🔄 Iniciando petición a: $baseUrl/scoreboards');
      
      final response = await http.get(
        Uri.parse('$baseUrl/scoreboards'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      print('📡 Respuesta recibida - Status Code: ${response.statusCode}');
      print('📦 Body de la respuesta: ${response.body}');

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        print('✅ JSON parseado exitosamente');
        
        if (data is List) {
          print('✅ Se encontraron ${data.length} scoreboards');
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
      print('💥 Error en getScoreboards: $e');
      throw Exception('Error de conexión: $e');
    }
  }

  // Obtener un scoreboard específico por ID
  Future<Map<String, dynamic>> getScoreboard(String scoreboardId) async {
    try {
      print('🔄 Iniciando petición a: $baseUrl/scoreboards/$scoreboardId');
      
      final response = await http.get(
        Uri.parse('$baseUrl/scoreboards/$scoreboardId'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      print('📡 Respuesta recibida - Status Code: ${response.statusCode}');
      print('📦 Body de la respuesta: ${response.body}');

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        print('✅ JSON parseado exitosamente');
        return data;
      } else {
        print('❌ Error del servidor: ${response.statusCode}');
        throw Exception('Error del servidor: ${response.statusCode}');
      }
    } catch (e) {
      print('💥 Error en getScoreboard: $e');
      throw Exception('Error de conexión: $e');
    }
  }

  // Iniciar el timer de un scoreboard
  Future<Map<String, dynamic>> startGameTimer(String scoreboardId) async {
    try {
      print('🔄 Iniciando timer para scoreboard: $scoreboardId');
      
      final response = await http.post(
        Uri.parse('$baseUrl/scoreboards/$scoreboardId/start-game'),
        headers: {
          'Content-Type': 'application/json',
        },
        body: json.encode({'start_game': true}),
      );

      print('📡 Respuesta recibida - Status Code: ${response.statusCode}');
      print('📦 Body de la respuesta: ${response.body}');

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        print('✅ Timer iniciado exitosamente');
        return data;
      } else {
        print('❌ Error del servidor: ${response.statusCode}');
        throw Exception('Error del servidor: ${response.statusCode}');
      }
    } catch (e) {
      print('💥 Error en startGameTimer: $e');
      throw Exception('Error de conexión: $e');
    }
  }
}
