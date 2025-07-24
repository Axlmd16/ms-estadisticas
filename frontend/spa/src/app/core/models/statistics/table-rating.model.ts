import { Team } from './team.model';

/**
 * Modelo para tabla de posiciones
 */
export interface TableRating {
    /** ID único de la posición */
    id: string;

    /** Equipo */
    team: Team;

    /** Posición en la tabla */
    position: number;

    /** Puntos */
    points: number;

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

    /** Fecha de creación */
    created_at: Date;

    /** Fecha de última actualización */
    updated_at: Date;
}
