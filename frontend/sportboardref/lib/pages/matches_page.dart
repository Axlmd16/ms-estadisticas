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
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      setState(() {
        _isLoading = true;
        _error = null;
      });

      // Cargar matches y scoreboards en paralelo
      final results = await Future.wait([
        _matchService.getMatches(),
        _matchService.getScoreboards(),
      ]);

      setState(() {
        _matches = results[0];
        _scoreboards = results[1];
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
                'Match ${match['_id'].substring(0, 8)}...',
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
              subtitle: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Fecha: ${match['date'] ?? 'No especificada'}'),
                  Text('Local: ${match['local_team_id']?.substring(0, 8) ?? 'N/A'}...'),
                  Text('Visitante: ${match['visitor_team_id']?.substring(0, 8) ?? 'N/A'}...'),
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
    );
  }
}
