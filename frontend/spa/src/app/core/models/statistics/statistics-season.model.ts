import { Season } from './season.model';

/**
 * Modelo para estadísticas de temporada
 */
export interface StatisticsSeason {
    /** ID único de las estadísticas */
    id: string;

    /** Temporada a la que pertenecen las estadísticas */
    season: Season;

    /** Total de partidos jugados */
    total_matches: number;

    /** Total de goles marcados */
    total_goals: number;

    /** Promedio de goles por partido */
    goals_per_match: number;

    /** Mayor victoria */
    biggest_win: string;

    /** Mayor derrota */
    biggest_loss: string;

    /** Fecha de creación */
    created_at: Date;

    /** Fecha de última actualización */
    updated_at: Date;
}
