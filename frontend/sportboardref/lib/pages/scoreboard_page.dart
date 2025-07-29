import 'package:flutter/material.dart';
import 'dart:async';
import '../services/api.dart';

class ScoreboardPage extends StatefulWidget {
  final String matchId;
  final String scoreboardId;

  const ScoreboardPage({
    Key? key,
    required this.matchId,
    required this.scoreboardId,
  }) : super(key: key);

  @override
  State<ScoreboardPage> createState() => _ScoreboardPageState();
}

class _ScoreboardPageState extends State<ScoreboardPage> {
  final MatchService _matchService = MatchService();
  Map<String, dynamic>? _scoreboard;
  List<dynamic> _events = [];
  List<dynamic> _athletes = [];
  List<dynamic> _catalogItems = [];
  Map<String, dynamic>? _matchData;
  Timer? _refreshTimer;
  bool _isLoading = true;
  bool _gameStarted = false;
  bool _timerRunning = false;
  String? _error;
  bool _showAddEventForm = false;

  // Controladores del formulario
  final _minuteController = TextEditingController();
  final _descriptionController = TextEditingController();
  String? _selectedAthleteId;
  String? _selectedEventType;

  @override
  void initState() {
    super.initState();
    _loadScoreboard();
    _loadInitialData();
  }

  @override
  void dispose() {
    _refreshTimer?.cancel();
    _minuteController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  Future<void> _loadScoreboard() async {
    try {
      setState(() {
        _isLoading = true;
        _error = null;
      });

      final scoreboard = await _matchService.getScoreboard(widget.scoreboardId);
      
      setState(() {
        _scoreboard = scoreboard;
        // El botón aparece si no está finalizado y el temporizador no ha sido iniciado
        _timerRunning = scoreboard['timer_started'] ?? false;
        _gameStarted = _timerRunning; // Solo para compatibilidad con otras partes del código
        _isLoading = false;
      });

      // Si el temporizador está corriendo, iniciar actualización automática
      if (_timerRunning && !(_scoreboard!['is_final'] ?? false)) {
        _startRealTimeUpdates();
      }
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  // Cargar datos iniciales (match, atletas, catálogo)
  Future<void> _loadInitialData() async {
    try {
      // Cargar datos del match
      final matchData = await _matchService.getMatchWithTeams(widget.matchId);
      
      // Cargar atletas de ambos equipos
      final localTeamId = matchData['local_team']?['id'];
      final visitorTeamId = matchData['visitor_team']?['id'];
      
      List<dynamic> athletes = [];
      if (localTeamId != null) {
        final localAthletes = await _matchService.getAthletesByTeam(localTeamId);
        athletes.addAll(localAthletes);
      }
      if (visitorTeamId != null) {
        final visitorAthletes = await _matchService.getAthletesByTeam(visitorTeamId);
        athletes.addAll(visitorAthletes);
      }
      
      // Cargar tipos de eventos
      final catalogItems = await _matchService.getCatalogItems();
      final footballEvents = catalogItems.where((item) => 
        ['GOL', 'GOL_PENAL', 'AUTOGOL', 'GOL_TIRO_LIBRE', 'TARJETA_AMARILLA', 'TARJETA_ROJA']
        .contains(item['code'])
      ).toList();
      
      // Cargar eventos existentes
      await _loadEvents();
      
      setState(() {
        _matchData = matchData;
        _athletes = athletes;
        _catalogItems = footballEvents;
      });
    } catch (e) {
      print('Error cargando datos iniciales: $e');
    }
  }

  // Cargar eventos del partido
  Future<void> _loadEvents() async {
    try {
      final events = await _matchService.getEventsByMatch(widget.matchId);
      setState(() {
        _events = events;
      });
    } catch (e) {
      print('Error cargando eventos: $e');
    }
  }

  Future<void> _startGame() async {
    try {
      setState(() {
        _isLoading = true;
      });

      await _matchService.startGameTimer(widget.scoreboardId);
      
      setState(() {
        _gameStarted = true;
        _timerRunning = true;
        _isLoading = false;
      });

      // Iniciar actualizaciones en tiempo real
      _startRealTimeUpdates();
      
      // Recargar datos inmediatamente
      await _loadScoreboard();

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('¡Partido iniciado! ⚽'),
          backgroundColor: Colors.green,
        ),
      );
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error al iniciar partido: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  void _startRealTimeUpdates() {
    _refreshTimer?.cancel();
    _refreshTimer = Timer.periodic(const Duration(seconds: 10), (timer) async {
      if (!mounted) {
        timer.cancel();
        return;
      }

      try {
        final scoreboard = await _matchService.getScoreboard(widget.scoreboardId);
        await _loadEvents(); // También actualizar eventos
        
        if (mounted) {
          setState(() {
            _scoreboard = scoreboard;
          });

          // Si el juego terminó, detener las actualizaciones
          if (scoreboard['is_final'] == true) {
            timer.cancel();
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('¡Partido finalizado! 🏁'),
                backgroundColor: Colors.blue,
              ),
            );
          }
        }
      } catch (e) {
        print('Error actualizando scoreboard: $e');
      }
    });
  }

  String _formatTime(int minutes) {
    if (minutes <= 0) return "90' FINAL";
    return "${90 - minutes}'";
  }

  // Crear nuevo evento
  Future<void> _createEvent() async {
    if (_selectedAthleteId == null || _selectedEventType == null || _minuteController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Por favor completa todos los campos requeridos'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

    try {
      final minute = double.tryParse(_minuteController.text) ?? 0;
      
      await _matchService.createEventMatch(
        matchId: widget.matchId,
        athleteId: _selectedAthleteId!,
        typeEvent: _selectedEventType!,
        minute: minute,
        description: _descriptionController.text,
      );

      // Limpiar formulario
      _minuteController.clear();
      _descriptionController.clear();
      setState(() {
        _selectedAthleteId = null;
        _selectedEventType = null;
        _showAddEventForm = false;
      });

      // Recargar eventos
      await _loadEvents();

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('¡Evento registrado exitosamente! ⚽'),
          backgroundColor: Colors.green,
        ),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error al registrar evento: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  // Obtener icono según tipo de evento
  String _getEventIcon(String? eventType) {
    switch (eventType?.toUpperCase()) {
      case 'GOL':
        return '⚽';
      case 'GOL_PENAL':
        return '🥅';
      case 'AUTOGOL':
        return '😔';
      case 'GOL_TIRO_LIBRE':
        return '🎯';
      case 'TARJETA_AMARILLA':
        return '🟨';
      case 'TARJETA_ROJA':
        return '🟥';
      default:
        return '📋';
    }
  }

  // Obtener código del tipo de evento por ID
  String _getEventCodeById(String eventId) {
    final catalogItem = _catalogItems.firstWhere(
      (item) => item['_id'] == eventId,
      orElse: () => {'code': 'UNKNOWN'},
    );
    return catalogItem['code'] ?? 'UNKNOWN';
  }

  // Obtener descripción del tipo de evento por ID
  String _getEventDescriptionById(String eventId) {
    final catalogItem = _catalogItems.firstWhere(
      (item) => item['_id'] == eventId,
      orElse: () => {'description': 'Evento desconocido'},
    );
    return catalogItem['description'] ?? 'Evento desconocido';
  }

  // Obtener nombre del atleta
  String _getAthleteName(String athleteId) {
    final athlete = _athletes.firstWhere(
      (a) => a['_id'] == athleteId,
      orElse: () => {'name': 'Jugador desconocido'},
    );
    return athlete['name'] ?? 'Jugador desconocido';
  }

  // Obtener equipo del atleta
  String _getAthleteTeam(String athleteId) {
    final athlete = _athletes.firstWhere(
      (a) => a['_id'] == athleteId,
      orElse: () => {'team_id': null},
    );
    
    if (_matchData != null && athlete['team_id'] != null) {
      if (athlete['team_id'] == _matchData!['local_team']?['id']) {
        return _matchData!['local_team']?['name'] ?? 'Local';
      } else if (athlete['team_id'] == _matchData!['visitor_team']?['id']) {
        return _matchData!['visitor_team']?['name'] ?? 'Visitante';
      }
    }
    
    return '';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('⚽ Scoreboard Live'),
        backgroundColor: Colors.green[800],
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadScoreboard,
          ),
        ],
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircularProgressIndicator(),
            SizedBox(height: 16),
            Text('Cargando scoreboard...'),
          ],
        ),
      );
    }

    if (_error != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error, size: 64, color: Colors.red),
            const SizedBox(height: 16),
            Text('Error: $_error'),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _loadScoreboard,
              child: const Text('Reintentar'),
            ),
          ],
        ),
      );
    }

    if (_scoreboard == null) {
      return const Center(
        child: Text('No se encontró el scoreboard'),
      );
    }

    return RefreshIndicator(
      onRefresh: _loadScoreboard,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            _buildMatchInfo(),
            const SizedBox(height: 20),
            _buildScoreDisplay(),
            const SizedBox(height: 20),
            _buildTimer(),
            const SizedBox(height: 20),
            _buildGameStatus(),
            const SizedBox(height: 20),
            if (!(_scoreboard!['is_final'] ?? false) && !_timerRunning)
              _buildStartButton(),
            const SizedBox(height: 20),
            _buildEventsSection(),
          ],
        ),
      ),
    );
  }

  Widget _buildMatchInfo() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            const Text(
              'Información del Match',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text('Match ID: ${widget.matchId}'),
            Text('Scoreboard ID: ${widget.scoreboardId}'),
          ],
        ),
      ),
    );
  }

  Widget _buildScoreDisplay() {
    final scoreLocal = _scoreboard!['score_local'] ?? 0;
    final scoreVisitor = _scoreboard!['score_visitor'] ?? 0;

    return Card(
      elevation: 8,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            const Text(
              '⚽ MARCADOR',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Colors.blue,
              ),
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                Column(
                  children: [
                    const Text(
                      'LOCAL',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.blue,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Container(
                      width: 80,
                      height: 80,
                      decoration: BoxDecoration(
                        color: Colors.blue[100],
                        borderRadius: BorderRadius.circular(40),
                        border: Border.all(color: Colors.blue, width: 2),
                      ),
                      child: Center(
                        child: Text(
                          '$scoreLocal',
                          style: const TextStyle(
                            fontSize: 36,
                            fontWeight: FontWeight.bold,
                            color: Colors.blue,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
                const Text(
                  'VS',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Colors.grey,
                  ),
                ),
                Column(
                  children: [
                    const Text(
                      'VISITANTE',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.red,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Container(
                      width: 80,
                      height: 80,
                      decoration: BoxDecoration(
                        color: Colors.red[100],
                        borderRadius: BorderRadius.circular(40),
                        border: Border.all(color: Colors.red, width: 2),
                      ),
                      child: Center(
                        child: Text(
                          '$scoreVisitor',
                          style: const TextStyle(
                            fontSize: 36,
                            fontWeight: FontWeight.bold,
                            color: Colors.red,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTimer() {
    final timeRestant = _scoreboard!['time_restant'] ?? 90;
    final timeText = _formatTime(timeRestant);
    final isGameRunning = _gameStarted && !(_scoreboard!['is_final'] ?? false);

    return Card(
      color: isGameRunning ? Colors.green[50] : Colors.grey[50],
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            Icon(
              isGameRunning ? Icons.timer : Icons.timer_off,
              size: 48,
              color: isGameRunning ? Colors.green : Colors.grey,
            ),
            const SizedBox(height: 8),
            Text(
              timeText,
              style: TextStyle(
                fontSize: 32,
                fontWeight: FontWeight.bold,
                color: isGameRunning ? Colors.green : Colors.grey[600],
              ),
            ),
            const SizedBox(height: 4),
            Text(
              isGameRunning ? 'En progreso...' : 'Detenido',
              style: TextStyle(
                fontSize: 16,
                color: isGameRunning ? Colors.green[700] : Colors.grey[600],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildGameStatus() {
    final isFinal = _scoreboard!['is_final'] ?? false;
    final timeRestant = _scoreboard!['time_restant'] ?? 90;
    
    String status;
    Color statusColor;
    
    if (isFinal) {
      status = 'PARTIDO FINALIZADO';
      statusColor = Colors.red;
    } else if (_gameStarted) {
      status = 'PARTIDO EN PROGRESO';
      statusColor = Colors.green;
    } else {
      // Verificar si el partido está programado para el futuro
      final now = DateTime.now();
      final matchDate = _matchData?['date'] != null 
          ? DateTime.tryParse(_matchData!['date']) 
          : null;
      
      if (matchDate != null && matchDate.isAfter(now)) {
        status = 'PARTIDO PROGRAMADO';
        statusColor = Colors.orange;
      } else {
        status = 'PARTIDO NO INICIADO';
        statusColor = Colors.blue;
      }
    }

    return Card(
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                color: statusColor,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                status,
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
              ),
            ),
            const SizedBox(height: 12),
            Text('Tiempo restante: $timeRestant minutos'),
            Text('Última actualización: ${_scoreboard!['last_update'] ?? 'N/A'}'),
          ],
        ),
      ),
    );
  }

  Widget _buildStartButton() {
    return SizedBox(
      width: double.infinity,
      height: 56,
      child: ElevatedButton.icon(
        onPressed: _isLoading ? null : _startGame,
        icon: const Icon(Icons.play_arrow, size: 28),
        label: const Text(
          'INICIAR PARTIDO',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.green,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      ),
    );
  }

  // ===== SECCIÓN DE EVENTOS =====
  
  Widget _buildEventsSection() {
    return Column(
      children: [
        _buildAddEventButton(),
        const SizedBox(height: 16),
        if (_showAddEventForm) _buildAddEventForm(),
        if (_showAddEventForm) const SizedBox(height: 16),
        _buildEventsList(),
      ],
    );
  }

  Widget _buildAddEventButton() {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton.icon(
        onPressed: () {
          setState(() {
            _showAddEventForm = !_showAddEventForm;
          });
        },
        icon: Icon(_showAddEventForm ? Icons.close : Icons.add),
        label: Text(_showAddEventForm ? 'CANCELAR' : 'AGREGAR EVENTO'),
        style: ElevatedButton.styleFrom(
          backgroundColor: _showAddEventForm ? Colors.red : Colors.blue,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(vertical: 12),
        ),
      ),
    );
  }

  Widget _buildAddEventForm() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text(
              '📝 Nuevo Evento',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            
            // Selector de jugador
            DropdownButtonFormField<String>(
              value: _selectedAthleteId,
              decoration: const InputDecoration(
                labelText: 'Jugador *',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.person),
              ),
              items: _athletes.map<DropdownMenuItem<String>>((athlete) {
                final teamName = _getAthleteTeam(athlete['_id']);
                return DropdownMenuItem<String>(
                  value: athlete['_id'],
                  child: Text('${athlete['name']} ($teamName)'),
                );
              }).toList(),
              onChanged: (value) {
                setState(() {
                  _selectedAthleteId = value;
                });
              },
            ),
            const SizedBox(height: 12),
            
            // Selector de tipo de evento
            DropdownButtonFormField<String>(
              value: _selectedEventType,
              decoration: const InputDecoration(
                labelText: 'Tipo de evento *',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.event),
              ),
              items: _catalogItems.map<DropdownMenuItem<String>>((item) {
                return DropdownMenuItem<String>(
                  value: item['_id'],
                  child: Text('${_getEventIcon(item['code'])} ${item['description']}'),
                );
              }).toList(),
              onChanged: (value) {
                setState(() {
                  _selectedEventType = value;
                });
              },
            ),
            const SizedBox(height: 12),
            
            // Campo de minuto
            TextFormField(
              controller: _minuteController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: 'Minuto *',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.timer),
                hintText: 'Ej: 25',
              ),
            ),
            const SizedBox(height: 12),
            
            // Campo de descripción
            TextFormField(
              controller: _descriptionController,
              decoration: const InputDecoration(
                labelText: 'Descripción (opcional)',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.notes),
                hintText: 'Detalles del evento...',
              ),
              maxLines: 2,
            ),
            const SizedBox(height: 16),
            
            // Botón de guardar
            ElevatedButton.icon(
              onPressed: _createEvent,
              icon: const Icon(Icons.save),
              label: const Text('REGISTRAR EVENTO'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.green,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 12),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEventsList() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Text(
                  '📊 Eventos del Partido',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const Spacer(),
                Text(
                  '(${_events.length})',
                  style: const TextStyle(fontSize: 16, color: Colors.grey),
                ),
              ],
            ),
            const SizedBox(height: 16),
            
            if (_events.isEmpty)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(32),
                child: const Column(
                  children: [
                    Icon(Icons.event_busy, size: 48, color: Colors.grey),
                    SizedBox(height: 8),
                    Text(
                      'No hay eventos registrados',
                      style: TextStyle(color: Colors.grey, fontSize: 16),
                    ),
                  ],
                ),
              )
            else
              ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: _events.length,
                separatorBuilder: (context, index) => const Divider(),
                itemBuilder: (context, index) {
                  final event = _events[index];
                  final athleteName = _getAthleteName(event['athlete_id'] ?? '');
                  final teamName = _getAthleteTeam(event['athlete_id'] ?? '');
                  final minute = (event['minute'] ?? 0).toInt();
                  final eventTypeId = event['type_event'] ?? '';
                  final eventCode = _getEventCodeById(eventTypeId);
                  final eventDescription = _getEventDescriptionById(eventTypeId);
                  
                  return ListTile(
                    leading: CircleAvatar(
                      backgroundColor: Colors.blue.shade100,
                      child: Text(
                        "$minute'",
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          color: Colors.blue,
                        ),
                      ),
                    ),
                    title: Row(
                      children: [
                        Text(_getEventIcon(eventCode)),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            eventDescription,
                            style: const TextStyle(fontWeight: FontWeight.bold),
                          ),
                        ),
                      ],
                    ),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('👤 $athleteName${teamName.isNotEmpty ? ' ($teamName)' : ''}'),
                        if (event['description'] != null && event['description'].toString().isNotEmpty)
                          Text('📝 ${event['description']}'),
                      ],
                    ),
                    trailing: const Icon(Icons.sports_soccer, color: Colors.green),
                  );
                },
              ),
          ],
        ),
      ),
    );
  }
}
