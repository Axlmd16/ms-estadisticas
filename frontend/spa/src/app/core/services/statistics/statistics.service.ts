import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {
    Team,
    Season,
    StatisticsTeam,
    StatisticsSeason,
    StatisticsIndividual,
    StatisticsCompetence,
    TableRating,
} from '../../models/statistics';
import { ApiResponse, ApiPaginationResponse } from '../../models/api-response';
import { API_ENDPOINTS, ApiUrlBuilder } from '../../config/api-endpoints';

/**
 * Servicio para gestionar las estadísticas
 */
@Injectable({
    providedIn: 'root',
})
export class StatisticsService {
    private teamsUrl = ApiUrlBuilder.buildUrl(API_ENDPOINTS.STATISTICS.TEAMS);
    private seasonsUrl = ApiUrlBuilder.buildUrl(
        API_ENDPOINTS.STATISTICS.SEASONS
    );
    private playersUrl = ApiUrlBuilder.buildUrl(
        API_ENDPOINTS.STATISTICS.PLAYERS
    );
    private competitionsUrl = ApiUrlBuilder.buildUrl(
        API_ENDPOINTS.STATISTICS.COMPETITIONS
    );

    constructor(private http: HttpClient) {}

    // ==================== EQUIPOS ====================

    /**
     * Obtiene las estadísticas de un equipo
     */
    getTeamStatistics(teamId: string): Observable<StatisticsTeam> {
        return this.http
            .get<ApiResponse<StatisticsTeam>>(`${this.teamsUrl}/${teamId}`)
            .pipe(map((response) => response.data));
    }

    /**
     * Obtiene las estadísticas de todos los equipos
     */
    getAllTeamsStatistics(): Observable<StatisticsTeam[]> {
        return this.http
            .get<ApiResponse<StatisticsTeam[]>>(this.teamsUrl)
            .pipe(map((response) => response.data));
    }

    // ==================== TEMPORADAS ====================

    /**
     * Obtiene las estadísticas de una temporada
     */
    getSeasonStatistics(seasonId: string): Observable<StatisticsSeason> {
        return this.http
            .get<ApiResponse<StatisticsSeason>>(
                `${this.seasonsUrl}/${seasonId}`
            )
            .pipe(map((response) => response.data));
    }

    /**
     * Obtiene las estadísticas de todas las temporadas
     */
    getAllSeasonsStatistics(): Observable<StatisticsSeason[]> {
        return this.http
            .get<ApiResponse<StatisticsSeason[]>>(this.seasonsUrl)
            .pipe(map((response) => response.data));
    }

    // ==================== INDIVIDUALES ====================

    /**
     * Obtiene las estadísticas individuales de un jugador
     */
    getPlayerStatistics(playerId: string): Observable<StatisticsIndividual> {
        return this.http
            .get<ApiResponse<StatisticsIndividual>>(
                `${this.playersUrl}/${playerId}`
            )
            .pipe(map((response) => response.data));
    }

    /**
     * Obtiene las estadísticas de todos los jugadores
     */
    getAllPlayersStatistics(): Observable<StatisticsIndividual[]> {
        return this.http
            .get<ApiResponse<StatisticsIndividual[]>>(this.playersUrl)
            .pipe(map((response) => response.data));
    }

    // ==================== COMPETENCIAS ====================

    /**
     * Obtiene las estadísticas de una competencia
     */
    getCompetitionStatistics(
        competitionId: string
    ): Observable<StatisticsCompetence> {
        return this.http
            .get<ApiResponse<StatisticsCompetence>>(
                `${this.competitionsUrl}/${competitionId}`
            )
            .pipe(map((response) => response.data));
    }

    /**
     * Obtiene las estadísticas de todas las competencias
     */
    getAllCompetitionsStatistics(): Observable<StatisticsCompetence[]> {
        return this.http
            .get<ApiResponse<StatisticsCompetence[]>>(this.competitionsUrl)
            .pipe(map((response) => response.data));
    }

    // ==================== TABLA DE POSICIONES ====================

    /**
     * Obtiene la tabla de posiciones de una competencia
     */
    getTableRating(competitionId: string): Observable<TableRating[]> {
        return this.http
            .get<ApiResponse<TableRating[]>>(
                `${this.competitionsUrl}/${competitionId}/table`
            )
            .pipe(map((response) => response.data));
    }
}
