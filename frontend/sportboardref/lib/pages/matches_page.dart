import 'package:flutter/material.dart';
import '../services/api.dart';
import 'scoreboard_page.dart';

class MatchesPage extends StatefulWidget {
  const MatchesPage({Key? key}) : super(key: key);

  @override
  State<MatchesPage> createState() => _MatchesPageState();
}

class _MatchesPageState extends State<MatchesPage> {
  final MatchService _matchService = MatchService();
  List<dynamic> _matches = [];
  List<dynamic> _scoreboards = [];
  List<dynamic> _teams = [];
  bool _isLoading = true;
  String? _error;
  bool _showCreateForm = false;

  // Controladores del formulario
  final _dateController = TextEditingController();
  String? _selectedLocalTeamId;
  String? _selectedVisitorTeamId;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  @override
  void dispose() {
    _dateController.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    try {
      setState(() {
        _isLoading = true;
        _error = null;
      });

      // Cargar matches, scoreboards y equipos en paralelo
      final results = await Future.wait([
        _matchService.getMatches(),
        _matchService.getScoreboards(),
        _matchService.getTeams(),
      ]);

      setState(() {
        _matches = results[0];
        _scoreboards = results[1];
        _teams = results[2];
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  // Buscar scoreboard por match_id
  Map<String, dynamic>? _findScoreboardForMatch(String matchId) {
    for (var scoreboard in _scoreboards) {
      if (scoreboard['match_id'] == matchId) {
        return scoreboard;
      }
    }
    return null;
  }

  // Obtener estado del match basado en scoreboard
  String _getMatchStatus(Map<String, dynamic>? scoreboard) {
    if (scoreboard == null) return 'Sin Scoreboard';
    if (scoreboard['is_final'] == true) return 'Finalizado';
    if (scoreboard['time_restant'] < 90) return 'En Progreso';
    return 'Programado';
  }

  // Obtener color del estado
  Color _getStatusColor(String status) {
    switch (status) {
      case 'En Progreso':
        return Colors.green;
      case 'Finalizado':
        return Colors.red;
      case 'Programado':
        return Colors.blue;
      default:
        return Colors.grey;
    }
  }

  // Crear nuevo match
  Future<void> _createMatch() async {
    if (_selectedLocalTeamId == null || 
        _selectedVisitorTeamId == null || 
        _dateController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Por favor completa todos los campos requeridos'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

    if (_selectedLocalTeamId == _selectedVisitorTeamId) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Los equipos local y visitante deben ser diferentes'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

    try {
      await _matchService.createMatch(
        localTeamId: _selectedLocalTeamId!,
        visitorTeamId: _selectedVisitorTeamId!,
        date: _dateController.text,
      );

      // Limpiar formulario
      _dateController.clear();
      setState(() {
        _selectedLocalTeamId = null;
        _selectedVisitorTeamId = null;
        _showCreateForm = false;
      });

      // Recargar datos
      await _loadData();

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('¡Match creado exitosamente! ⚽'),
          backgroundColor: Colors.green,
        ),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error al crear match: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  // Obtener nombre del equipo por ID
  String _getTeamName(String teamId) {
    final team = _teams.firstWhere(
      (t) => t['_id'] == teamId,
      orElse: () => {'name': 'Equipo desconocido'},
    );
    return team['name'] ?? 'Equipo desconocido';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('⚽ SportBoard - Matches'),
        backgroundColor: Colors.blue[800],
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadData,
          ),
        ],
      ),
      body: _buildBody(),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          setState(() {
            _showCreateForm = !_showCreateForm;
          });
        },
        backgroundColor: Colors.blue[800],
        child: Icon(_showCreateForm ? Icons.close : Icons.add),
      ),
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
            Text('Cargando matches...'),
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
              onPressed: _loadData,
              child: const Text('Reintentar'),
            ),
          ],
        ),
      );
    }

    if (_matches.isEmpty) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.sports_soccer, size: 64, color: Colors.grey),
            SizedBox(height: 16),
            Text('No hay matches disponibles'),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _loadData,
      child: Column(
        children: [
          if (_showCreateForm) _buildCreateMatchForm(),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(8),
              itemCount: _matches.length,
              itemBuilder: (context, index) {
                final match = _matches[index];
                final scoreboard = _findScoreboardForMatch(match['_id']);
                final status = _getMatchStatus(scoreboard);

                return Card(
                  margin: const EdgeInsets.symmetric(vertical: 4, horizontal: 8),
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundColor: _getStatusColor(status),
                      child: const Icon(Icons.sports_soccer, color: Colors.white),
                    ),
                    title: Text(
                      '${_getTeamName(match['local_team_id'] ?? '')} vs ${_getTeamName(match['visitor_team_id'] ?? '')}',
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Fecha: ${match['date'] ?? 'No especificada'}'),
                        Text('Match ID: ${match['_id'].substring(0, 8)}...'),
                        const SizedBox(height: 4),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: _getStatusColor(status),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            status,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                    trailing: const Icon(Icons.arrow_forward_ios),
                    onTap: () {
                      if (scoreboard != null) {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => ScoreboardPage(
                              matchId: match['_id'],
                              scoreboardId: scoreboard['_id'],
                            ),
                          ),
                        );
                      } else {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Este match no tiene scoreboard asociado'),
                            backgroundColor: Colors.orange,
                          ),
                        );
                      }
                    },
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCreateMatchForm() {
    return Container(
      margin: const EdgeInsets.all(16),
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                children: [
                  const Icon(Icons.add_circle, color: Colors.blue),
                  const SizedBox(width: 8),
                  const Text(
                    'Crear Nuevo Match',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const Spacer(),
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () {
                      setState(() {
                        _showCreateForm = false;
                      });
                    },
                  ),
                ],
              ),
              const SizedBox(height: 16),
              
              // Selector de equipo local
              DropdownButtonFormField<String>(
                value: _selectedLocalTeamId,
                decoration: const InputDecoration(
                  labelText: 'Equipo Local *',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.home),
                ),
                items: _teams.map<DropdownMenuItem<String>>((team) {
                  return DropdownMenuItem<String>(
                    value: team['_id'],
                    child: Text('🏠 ${team['name']}'),
                  );
                }).toList(),
                onChanged: (value) {
                  setState(() {
                    _selectedLocalTeamId = value;
                  });
                },
              ),
              const SizedBox(height: 12),
              
              // Selector de equipo visitante
              DropdownButtonFormField<String>(
                value: _selectedVisitorTeamId,
                decoration: const InputDecoration(
                  labelText: 'Equipo Visitante *',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.flight),
                ),
                items: _teams.map<DropdownMenuItem<String>>((team) {
                  return DropdownMenuItem<String>(
                    value: team['_id'],
                    child: Text('✈️ ${team['name']}'),
                  );
                }).toList(),
                onChanged: (value) {
                  setState(() {
                    _selectedVisitorTeamId = value;
                  });
                },
              ),
              const SizedBox(height: 12),
              
              // Campo de fecha
              TextFormField(
                controller: _dateController,
                decoration: const InputDecoration(
                  labelText: 'Fecha y Hora *',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.calendar_today),
                  hintText: '2025-07-29T15:00:00',
                ),
                onTap: () async {
                  // Selector de fecha y hora
                  final DateTime? pickedDate = await showDatePicker(
                    context: context,
                    initialDate: DateTime.now(),
                    firstDate: DateTime.now(),
                    lastDate: DateTime.now().add(const Duration(days: 365)),
                  );
                  
                  if (pickedDate != null) {
                    final TimeOfDay? pickedTime = await showTimePicker(
                      context: context,
                      initialTime: TimeOfDay.now(),
                    );
                    
                    if (pickedTime != null) {
                      final DateTime combined = DateTime(
                        pickedDate.year,
                        pickedDate.month,
                        pickedDate.day,
                        pickedTime.hour,
                        pickedTime.minute,
                      );
                      _dateController.text = combined.toIso8601String();
                    }
                  }
                },
                readOnly: true,
              ),
              const SizedBox(height: 16),
              
              // Botón de crear
              ElevatedButton.icon(
                onPressed: _createMatch,
                icon: const Icon(Icons.sports_soccer),
                label: const Text('CREAR MATCH'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.blue[800],
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
