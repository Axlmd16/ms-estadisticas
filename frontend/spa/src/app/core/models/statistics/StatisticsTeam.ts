import { Team } from './Team';

/**
 * Modelo para estadísticas de equipo
 */
export interface StatisticsTeam {
    /** ID único de las estadísticas */
    id: string;

    /** ID del equipo */
    teamId: string;

    /** Nombre del equipo */
    name: string;

    /** URL del logo del equipo */
    logo?: string;

    /** Número total de partidos jugados */
    gamesPlayed: number;

    /** Número de partidos ganados */
    gamesWon: number;

    /** Número de partidos empatados */
    gamesTied: number;

    /** Número de partidos perdidos */
    gamesLost: number;

    /** Goles anotados */
    goalsScored: number;

    /** Goles recibidos */
    goalsAgainst: number;

    /** ID de la temporada */
    seasonId: string;

    /** Fecha de creación */
    createdAt: string;

    /** Fecha de última actualización */
    updatedAt: string;
}
