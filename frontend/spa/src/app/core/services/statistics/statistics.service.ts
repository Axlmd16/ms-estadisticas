import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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
    StatisticsFilter,
} from '../../models/statistics';
import { ApiResponse, ApiPaginationResponse } from '../../models/api-response';
import { API_ENDPOINTS, ApiUrlBuilder } from '../../config/api-endpoints';

// Interfaces para competiciones (no estadísticas)
export interface Competition {
    id?: string;
    _id?: string;
    name: string;
    start_date?: Date | string;
    end_date?: Date | string;
    id_team?: string[];
}

export interface CompetitionCreate {
    name: string;
    start_date?: Date | string;
    end_date?: Date | string;
}

export interface CompetitionUpdate {
    name?: string;
    start_date?: Date | string;
    end_date?: Date | string;
    id_team?: string[];
}

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
    // URL para endpoints de competiciones (no estadísticas)
    private competitionsApiUrl = 'http://localhost:8012/api/v1/competitions';

    constructor(private http: HttpClient) {}

    /**
     * Construye los parámetros HTTP para filtrado y paginación
     */
    private buildParams(filter?: StatisticsFilter): HttpParams {
        let params = new HttpParams();

        if (filter) {
            if (filter.page)
                params = params.set('page', filter.page.toString());
            if (filter.pageSize)
                params = params.set('page_size', filter.pageSize.toString());
            if (filter.search) params = params.set('search', filter.search);
            if (filter.sortBy) params = params.set('sort_by', filter.sortBy);
            if (filter.sortDirection)
                params = params.set('sort_direction', filter.sortDirection);
            if (filter.startDate)
                params = params.set('start_date', filter.startDate);
            if (filter.endDate) params = params.set('end_date', filter.endDate);
            if (filter.teamId) params = params.set('team_id', filter.teamId);
            if (filter.seasonId)
                params = params.set('season_id', filter.seasonId);
            if (filter.playerId)
                params = params.set('player_id', filter.playerId);
            if (filter.competitionId)
                params = params.set('competition_id', filter.competitionId);
        }

        return params;
    }

    // ==================== EQUIPOS ====================

    /**
     * Obtiene las estadísticas de un equipo por ID
     */
    getTeamStatistics(teamId: string): Observable<StatisticsTeam> {
        return this.http
            .get<ApiResponse<StatisticsTeam>>(`${this.teamsUrl}/${teamId}`)
            .pipe(map((response) => response.data));
    }

    /**
     * Obtiene las estadísticas de todos los equipos con paginación y filtros
     */
    getAllTeamsStatistics(
        filter?: StatisticsFilter
    ): Observable<ApiPaginationResponse<StatisticsTeam>> {
        return this.http.get<ApiPaginationResponse<StatisticsTeam>>(
            this.teamsUrl,
            { params: this.buildParams(filter) }
        );
    }

    /**
     * Crea las estadísticas de un equipo
     */
    createTeamStatistics(
        statistics: StatisticsTeam
    ): Observable<StatisticsTeam> {
        return this.http
            .post<ApiResponse<StatisticsTeam>>(this.teamsUrl, statistics)
            .pipe(map((response) => response.data));
    }

    /**
     * Actualiza las estadísticas de un equipo
     */
    updateTeamStatistics(
        teamId: string,
        statistics: StatisticsTeam
    ): Observable<StatisticsTeam> {
        return this.http
            .put<ApiResponse<StatisticsTeam>>(
                `${this.teamsUrl}/${teamId}`,
                statistics
            )
            .pipe(map((response) => response.data));
    }

    /**
     * Elimina las estadísticas de un equipo
     */
    deleteTeamStatistics(teamId: string): Observable<void> {
        return this.http.delete<void>(`${this.teamsUrl}/${teamId}`);
    }

    /**
     * Busca estadísticas de equipos por criterios
     */
    searchTeamStatistics(
        filter: StatisticsFilter
    ): Observable<ApiPaginationResponse<StatisticsTeam>> {
        return this.http.get<ApiPaginationResponse<StatisticsTeam>>(
            `${this.teamsUrl}/search`,
            { params: this.buildParams(filter) }
        );
    }

    // ==================== TEMPORADAS ====================

    /**
     * Obtiene las estadísticas de una temporada por ID
     */
    getSeasonStatistics(seasonId: string): Observable<StatisticsSeason> {
        return this.http
            .get<ApiResponse<StatisticsSeason>>(
                `${this.seasonsUrl}/${seasonId}`
            )
            .pipe(map((response) => response.data));
    }

    /**
     * Obtiene las estadísticas de todas las temporadas con paginación y filtros
     */
    getAllSeasonsStatistics(
        filter?: StatisticsFilter
    ): Observable<ApiPaginationResponse<StatisticsSeason>> {
        return this.http.get<ApiPaginationResponse<StatisticsSeason>>(
            this.seasonsUrl,
            { params: this.buildParams(filter) }
        );
    }

    /**
     * Crea las estadísticas de una temporada
     */
    createSeasonStatistics(
        statistics: StatisticsSeason
    ): Observable<StatisticsSeason> {
        return this.http
            .post<ApiResponse<StatisticsSeason>>(this.seasonsUrl, statistics)
            .pipe(map((response) => response.data));
    }

    /**
     * Actualiza las estadísticas de una temporada
     */
    updateSeasonStatistics(
        seasonId: string,
        statistics: StatisticsSeason
    ): Observable<StatisticsSeason> {
        return this.http
            .put<ApiResponse<StatisticsSeason>>(
                `${this.seasonsUrl}/${seasonId}`,
                statistics
            )
            .pipe(map((response) => response.data));
    }

    /**
     * Elimina las estadísticas de una temporada
     */
    deleteSeasonStatistics(seasonId: string): Observable<void> {
        return this.http.delete<void>(`${this.seasonsUrl}/${seasonId}`);
    }

    /**
     * Busca estadísticas de temporadas por criterios
     */
    searchSeasonStatistics(
        filter: StatisticsFilter
    ): Observable<ApiPaginationResponse<StatisticsSeason>> {
        return this.http.get<ApiPaginationResponse<StatisticsSeason>>(
            `${this.seasonsUrl}/search`,
            { params: this.buildParams(filter) }
        );
    }

    // ==================== INDIVIDUALES ====================

    /**
     * Obtiene las estadísticas individuales de un jugador por ID
     */
    getPlayerStatistics(playerId: string): Observable<StatisticsIndividual> {
        return this.http
            .get<ApiResponse<StatisticsIndividual>>(
                `${this.playersUrl}/${playerId}`
            )
            .pipe(map((response) => response.data));
    }

    /**
     * Obtiene las estadísticas de todos los jugadores con paginación y filtros
     */
    getAllPlayersStatistics(
        filter?: StatisticsFilter
    ): Observable<ApiPaginationResponse<StatisticsIndividual>> {
        return this.http.get<ApiPaginationResponse<StatisticsIndividual>>(
            this.playersUrl,
            { params: this.buildParams(filter) }
        );
    }

    /**
     * Crea las estadísticas de un jugador
     */
    createPlayerStatistics(
        statistics: StatisticsIndividual
    ): Observable<StatisticsIndividual> {
        return this.http
            .post<ApiResponse<StatisticsIndividual>>(
                this.playersUrl,
                statistics
            )
            .pipe(map((response) => response.data));
    }

    /**
     * Actualiza las estadísticas de un jugador
     */
    updatePlayerStatistics(
        playerId: string,
        statistics: StatisticsIndividual
    ): Observable<StatisticsIndividual> {
        return this.http
            .put<ApiResponse<StatisticsIndividual>>(
                `${this.playersUrl}/${playerId}`,
                statistics
            )
            .pipe(map((response) => response.data));
    }

    /**
     * Elimina las estadísticas de un jugador
     */
    deletePlayerStatistics(playerId: string): Observable<void> {
        return this.http.delete<void>(`${this.playersUrl}/${playerId}`);
    }

    /**
     * Busca estadísticas de jugadores por criterios
     */
    searchPlayerStatistics(
        filter: StatisticsFilter
    ): Observable<ApiPaginationResponse<StatisticsIndividual>> {
        return this.http.get<ApiPaginationResponse<StatisticsIndividual>>(
            `${this.playersUrl}/search`,
            { params: this.buildParams(filter) }
        );
    }

    // ==================== COMPETENCIAS ====================

    /**
     * Obtiene las estadísticas de una competencia por ID
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
     * Obtiene las estadísticas de todas las competencias con paginación y filtros
     */
    getAllCompetitionsStatistics(
        filter?: StatisticsFilter
    ): Observable<ApiPaginationResponse<StatisticsCompetence>> {
        return this.http.get<ApiPaginationResponse<StatisticsCompetence>>(
            this.competitionsUrl,
            { params: this.buildParams(filter) }
        );
    }

    /**
     * Crea las estadísticas de una competencia
     */
    createCompetitionStatistics(
        statistics: StatisticsCompetence
    ): Observable<StatisticsCompetence> {
        return this.http
            .post<ApiResponse<StatisticsCompetence>>(
                this.competitionsUrl,
                statistics
            )
            .pipe(map((response) => response.data));
    }

    /**
     * Actualiza las estadísticas de una competencia
     */
    updateCompetitionStatistics(
        competitionId: string,
        statistics: StatisticsCompetence
    ): Observable<StatisticsCompetence> {
        return this.http
            .put<ApiResponse<StatisticsCompetence>>(
                `${this.competitionsUrl}/${competitionId}`,
                statistics
            )
            .pipe(map((response) => response.data));
    }

    /**
     * Elimina las estadísticas de una competencia
     */
    deleteCompetitionStatistics(competitionId: string): Observable<void> {
        return this.http.delete<void>(
            `${this.competitionsUrl}/${competitionId}`
        );
    }

    /**
     * Busca estadísticas de competencias por criterios
     */
    searchCompetitionStatistics(
        filter: StatisticsFilter
    ): Observable<ApiPaginationResponse<StatisticsCompetence>> {
        return this.http.get<ApiPaginationResponse<StatisticsCompetence>>(
            `${this.competitionsUrl}/search`,
            { params: this.buildParams(filter) }
        );
    }

    // ==================== TABLA DE POSICIONES ====================

    /**
     * Obtiene la tabla de posiciones de una competencia con paginación y filtros opcionales
     */
    getTableRating(
        competitionId: string,
        filter?: StatisticsFilter
    ): Observable<ApiPaginationResponse<TableRating>> {
        return this.http.get<ApiPaginationResponse<TableRating>>(
            `${this.competitionsUrl}/${competitionId}/table`,
            { params: this.buildParams(filter) }
        );
    }

    /**
     * Actualiza la tabla de posiciones de una competencia
     */
    updateTableRating(
        competitionId: string,
        ratings: TableRating[]
    ): Observable<TableRating[]> {
        return this.http
            .put<ApiResponse<TableRating[]>>(
                `${this.competitionsUrl}/${competitionId}/table`,
                ratings
            )
            .pipe(map((response) => response.data));
    }

    // ==================== COMPETICIONES (CRUD) ====================

    /**
     * Crea una nueva competición
     */
    createCompetition(competition: CompetitionCreate): Observable<Competition> {
        return this.http
            .post<Competition>(this.competitionsApiUrl, competition)
            .pipe(map((response: any) => response));
    }

    /**
     * Obtiene todas las competiciones
     */
    getAllCompetitions(): Observable<Competition[]> {
        return this.http.get<Competition[]>(this.competitionsApiUrl);
    }

    /**
     * Obtiene una competición por ID
     */
    getCompetition(competitionId: string): Observable<Competition> {
        return this.http.get<Competition>(`${this.competitionsApiUrl}/${competitionId}`);
    }

    /**
     * Actualiza una competición
     */
    updateCompetition(competitionId: string, competition: CompetitionUpdate): Observable<Competition> {
        return this.http
            .put<Competition>(`${this.competitionsApiUrl}/${competitionId}`, competition);
    }

    /**
     * Elimina una competición
     */
    deleteCompetition(competitionId: string): Observable<void> {
        return this.http.delete<void>(`${this.competitionsApiUrl}/${competitionId}`);
    }

    /**
     * Agrega un equipo a una competición
     */
    addTeamToCompetition(competitionId: string, teamId: string): Observable<Competition> {
        return this.http
            .post<Competition>(`${this.competitionsApiUrl}/${competitionId}/add_team/${teamId}`, {});
    }

    /**
     * Recalcula las estadísticas de una competición
     */
    recalculateCompetitionStatistics(competitionId: string): Observable<Competition> {
        return this.http
            .post<Competition>(`${this.competitionsApiUrl}/recalculate/${competitionId}`, {});
    }
}
