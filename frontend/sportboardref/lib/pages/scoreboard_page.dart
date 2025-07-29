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
  Timer? _refreshTimer;
  bool _isLoading = true;
  bool _gameStarted = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadScoreboard();
  }

  @override
  void dispose() {
    _refreshTimer?.cancel();
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
        _gameStarted = scoreboard['time_restant'] < 90; // Si el tiempo es menor a 90, ya empezó
        _isLoading = false;
      });

      // Si el juego ya empezó, iniciar actualización automática
      if (_gameStarted && !(_scoreboard!['is_final'] ?? false)) {
        _startRealTimeUpdates();
      }
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
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
            if (!_gameStarted && !(_scoreboard!['is_final'] ?? false))
              _buildStartButton(),
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
      status = 'PARTIDO NO INICIADO';
      statusColor = Colors.blue;
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
}
