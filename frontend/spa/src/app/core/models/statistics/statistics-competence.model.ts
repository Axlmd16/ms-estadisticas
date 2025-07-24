/**
 * Modelo para estadísticas de competencia
 */
export interface StatisticsCompetence {
    /** ID único de las estadísticas */
    id: string;

    /** ID de la competencia */
    competition_id: string;

    /** Nombre de la competencia */
    competition_name: string;

    /** Total de equipos */
    total_teams: number;

    /** Total de partidos */
    total_matches: number;

    /** Total de goles */
    total_goals: number;

    /** Promedio de goles por partido */
    average_goals_per_match: number;

    /** Total de tarjetas amarillas */
    total_yellow_cards: number;

    /** Total de tarjetas rojas */
    total_red_cards: number;

    /** Fecha de creación */
    created_at: Date;

    /** Fecha de última actualización */
    updated_at: Date;
}
