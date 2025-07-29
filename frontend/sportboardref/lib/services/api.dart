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

  // ===== MÉTODOS PARA EVENTOS =====
  
  // Obtener eventos por match
  Future<List<dynamic>> getEventsByMatch(String matchId) async {
    try {
      print('🔄 Obteniendo eventos para match: $matchId');
      
      final response = await http.get(
        Uri.parse('$baseUrl/event_matches/match/$matchId'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      print('📡 Respuesta recibida - Status Code: ${response.statusCode}');

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        print('✅ Se obtuvieron ${data.length} eventos');
        return data is List ? data : [];
      } else {
        print('❌ Error del servidor: ${response.statusCode}');
        throw Exception('Error del servidor: ${response.statusCode}');
      }
    } catch (e) {
      print('💥 Error en getEventsByMatch: $e');
      throw Exception('Error de conexión: $e');
    }
  }

  // Obtener atletas por equipo
  Future<List<dynamic>> getAthletesByTeam(String teamId) async {
    try {
      print('🔄 Obteniendo atletas para equipo: $teamId');
      
      final response = await http.get(
        Uri.parse('$baseUrl/athletes/team/$teamId'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      print('📡 Respuesta recibida - Status Code: ${response.statusCode}');

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        print('✅ Se obtuvieron ${data.length} atletas');
        return data is List ? data : [];
      } else {
        print('❌ Error del servidor: ${response.statusCode}');
        throw Exception('Error del servidor: ${response.statusCode}');
      }
    } catch (e) {
      print('💥 Error en getAthletesByTeam: $e');
      throw Exception('Error de conexión: $e');
    }
  }

  // Obtener match con equipos
  Future<Map<String, dynamic>> getMatchWithTeams(String matchId) async {
    try {
      print('🔄 Obteniendo match con equipos: $matchId');
      
      final response = await http.get(
        Uri.parse('$baseUrl/matches/$matchId/with-teams'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      print('📡 Respuesta recibida - Status Code: ${response.statusCode}');

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        print('✅ Match con equipos obtenido exitosamente');
        return data;
      } else {
        print('❌ Error del servidor: ${response.statusCode}');
        throw Exception('Error del servidor: ${response.statusCode}');
      }
    } catch (e) {
      print('💥 Error en getMatchWithTeams: $e');
      throw Exception('Error de conexión: $e');
    }
  }

  // Obtener tipos de eventos del catálogo
  Future<List<dynamic>> getCatalogItems() async {
    try {
      print('🔄 Obteniendo tipos de eventos del catálogo');
      
      final response = await http.get(
        Uri.parse('$baseUrl/catalog_items/'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      print('📡 Respuesta recibida - Status Code: ${response.statusCode}');

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        print('✅ Se obtuvieron ${data.length} tipos de eventos');
        return data is List ? data : [];
      } else {
        print('❌ Error del servidor: ${response.statusCode}');
        throw Exception('Error del servidor: ${response.statusCode}');
      }
    } catch (e) {
      print('💥 Error en getCatalogItems: $e');
      throw Exception('Error de conexión: $e');
    }
  }

  // Crear nuevo evento de partido
  Future<Map<String, dynamic>> createEventMatch({
    required String matchId,
    required String athleteId,
    required String typeEvent,
    required double minute,
    String description = '',
  }) async {
    try {
      print('🔄 Creando nuevo evento para match: $matchId');
      
      final body = {
        'match_id': matchId,
        'athlete_id': athleteId,
        'type_event': typeEvent,
        'minute': minute,
        'description': description,
      };

      final response = await http.post(
        Uri.parse('$baseUrl/event_matches/'),
        headers: {
          'Content-Type': 'application/json',
        },
        body: json.encode(body),
      );

      print('📡 Respuesta recibida - Status Code: ${response.statusCode}');

      if (response.statusCode == 201) {
        final data = json.decode(response.body);
        print('✅ Evento creado exitosamente');
        return data;
      } else {
        print('❌ Error del servidor: ${response.statusCode}');
        print('📄 Respuesta: ${response.body}');
        throw Exception('Error del servidor: ${response.statusCode}');
      }
    } catch (e) {
      print('💥 Error en createEventMatch: $e');
      throw Exception('Error de conexión: $e');
    }
  }

  // ===== MÉTODOS PARA GESTIÓN DE EQUIPOS =====
  
  Future<List<dynamic>> getTeams() async {
    try {
      print('🔄 Obteniendo equipos');
      
      final response = await http.get(
        Uri.parse('$baseUrl/teams/'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      print('📡 Respuesta recibida - Status Code: ${response.statusCode}');

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        print('✅ Se obtuvieron ${data.length} equipos');
        return data;
      } else {
        print('❌ Error del servidor: ${response.statusCode}');
        throw Exception('Error del servidor: ${response.statusCode}');
      }
    } catch (e) {
      print('💥 Error en getTeams: $e');
      throw Exception('Error de conexión: $e');
    }
  }

  // ===== MÉTODOS PARA GESTIÓN DE MATCHES =====
  
  Future<Map<String, dynamic>> createMatch({
    required String localTeamId,
    required String visitorTeamId,
    required String date,
    String? seasonId,
  }) async {
    try {
      print('🔄 Creando nuevo match');
      
      final body = {
        'local_team_id': localTeamId,
        'visitor_team_id': visitorTeamId,
        'date': date,
        if (seasonId != null) 'season_id': seasonId,
      };
      
      print('📤 Body de la petición: $body');
      
      final response = await http.post(
        Uri.parse('$baseUrl/matches/'),
        headers: {
          'Content-Type': 'application/json',
        },
        body: json.encode(body),
      );

      print('📡 Respuesta recibida - Status Code: ${response.statusCode}');

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = json.decode(response.body);
        print('✅ Match creado exitosamente');
        print('📋 Datos del match: $data');
        return data;
      } else {
        print('❌ Error del servidor: ${response.statusCode}');
        print('📄 Respuesta: ${response.body}');
        throw Exception('Error del servidor: ${response.statusCode}');
      }
    } catch (e) {
      print('💥 Error en createMatch: $e');
      throw Exception('Error de conexión: $e');
    }
  }

  // Iniciar el temporizador del partido
  Future<Map<String, dynamic>> startGame(String scoreboardId) async {
    try {
      print('🔄 Iniciando partido para scoreboard: $scoreboardId');
      
      final body = {
        'start_game': true,
      };
      
      print('📤 Body de la petición: $body');
      
      final response = await http.post(
        Uri.parse('$baseUrl/scoreboards/$scoreboardId/start-game'),
        headers: {
          'Content-Type': 'application/json',
        },
        body: json.encode(body),
      );

      print('📡 Respuesta recibida - Status Code: ${response.statusCode}');

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = json.decode(response.body);
        print('✅ Partido iniciado exitosamente');
        print('📋 Datos del scoreboard: $data');
        return data;
      } else {
        print('❌ Error del servidor: ${response.statusCode}');
        print('📄 Respuesta: ${response.body}');
        throw Exception('Error del servidor: ${response.statusCode}');
      }
    } catch (e) {
      print('💥 Error en startGame: $e');
      throw Exception('Error de conexión: $e');
    }
  }
}
