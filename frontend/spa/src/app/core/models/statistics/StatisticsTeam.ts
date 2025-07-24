import { Team } from './team.model';

/**
 * Modelo para estadísticas de equipo
 */
export interface StatisticsTeam {
  /** ID único de las estadísticas */
  id: string;

  /** Equipo al que pertenecen las estadísticas */
  team: Team;

  /** Partidos jugados */
  matches_played: number;

  /** Partidos ganados */
  matches_won: number;

  /** Partidos empatados */
  matches_drawn: number;

  /** Partidos perdidos */
  matches_lost: number;

  /** Goles a favor */
  goals_for: number;

  /** Goles en contra */
  goals_against: number;

  /** Diferencia de goles */
  goal_difference: number;

  /** Puntos totales */
  points: number;

  /** Fecha de creación */
  created_at: Date;

  /** Fecha de última actualización */
  updated_at: Date;
}
