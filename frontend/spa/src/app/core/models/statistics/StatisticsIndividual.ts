/**
 * Modelo para estadísticas individuales
 */
export interface StatisticsIndividual {
  /** ID único de las estadísticas */
  id: string;

  /** ID del jugador */
  player_id: string;

  /** Nombre del jugador */
  player_name: string;

  /** Goles marcados */
  goals: number;

  /** Asistencias */
  assists: number;

  /** Tarjetas amarillas */
  yellow_cards: number;

  /** Tarjetas rojas */
  red_cards: number;

  /** Minutos jugados */
  minutes_played: number;

  /** Fecha de creación */
  created_at: Date;

  /** Fecha de última actualización */
  updated_at: Date;
}
