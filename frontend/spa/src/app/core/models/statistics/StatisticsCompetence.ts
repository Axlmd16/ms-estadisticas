/**
 * Modelo para estadísticas de competencia
 */
export interface StatisticsCompetence {
  /** ID único de las estadísticas */
  id?: string;

  /** ID de la competencia */
  competition_id?: string;
  
  /** ID de la competencia (alias) */
  id_competition?: string;

  /** Nombre de la competencia */
  competition_name?: string;
  
  /** Descripción de la competencia */
  description?: string;

  /** Total de equipos */
  total_teams?: number;

  /** Total de partidos */
  total_matches?: number;
  
  /** Total de partidos (alias) */
  total_parties?: number;

  /** Total de goles */
  total_goals?: number;

  /** Promedio de goles por partido */
  average_goals_per_match?: number;
  
  /** Puntuación promedio */
  average_score?: number;

  /** Total de tarjetas amarillas */
  total_yellow_cards?: number;

  /** Total de tarjetas rojas */
  total_red_cards?: number;
  
  /** Partidos completados */
  matches_completed?: number;
  
  /** Puntuación récord */
  record_score?: number;
  
  /** Fecha de generación */
  date_generation?: Date | string;

  /** Fecha de creación */
  created_at?: Date;

  /** Fecha de última actualización */
  updated_at?: Date;
}
