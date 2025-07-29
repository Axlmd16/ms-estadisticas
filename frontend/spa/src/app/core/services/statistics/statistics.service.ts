// Interfaces para tabla de posiciones con equipos
export interface TableRatingPosition {
    id: string;
    position: number;
    points_total?: number;
    matches_played?: number;
    matches_won?: number;
    matches_drawn?: number;
    matches_lost?: number;
    goals_for?: number;
    goals_against?: number;
    team_id: string;
    team: Team;
}

export interface TableRatingWithTeams {
    table_rating: {
        id: string;
        competition_id: string;
        last_update?: string;
        positions: string[];
    };
    positions: TableRatingPosition[];
}

// ...otros imports y código existentes...


import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';

import {
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

// Interface para competición con información completa de equipos
export interface CompetitionWithTeams {
    id?: string;
    _id?: string;
    name: string;
    start_date?: Date | string;
    end_date?: Date | string;
    teams: Team[];
}

// Interface para estadísticas de equipo con información del equipo
export interface TeamStatisticsWithInfo {
    description?: string;
    date_generation?: Date | string;
    value?: number;
    games_played?: number;
    matches_drawn?: number;
    matches_lost?: number;
    matches_won?: number;
    points?: number;
    id_team: string;
    _id: string;
    team: Team;
    athletes?: Athlete[]; // Array de atletas del equipo
}

// Interfaces para Teams (CRUD)
export interface Team {
    id?: string;
    _id?: string;
    name: string;
    description?: string;
    founded?: number;
    athletes?: any[]; // Array de atletas del equipo
}

export interface TeamCreate {
    name: string;
    description?: string;
    founded?: number;
}

export interface TeamUpdate {
    name?: string;
    description?: string;
    founded?: number;
}

// Interfaces para Athletes/Players (CRUD)
export interface Athlete {
    id?: string;
    _id?: string;
    name: string;
    position?: string;
    team_id?: string;
}

export interface AthleteCreate {
    name: string;
    position?: string;
    team_id?: string;
}

export interface AthleteUpdate {
    name?: string;
    position?: string;
    team_id?: string;
}

// Interface para estadísticas individuales con información del atleta
export interface StatisticsIndividualWithAthlete {
    id?: string;
    _id?: string;
    description?: string;
    date_generation?: Date | string;
    value?: number;
    id_athlete?: string;
    goals?: number;
    assists?: number;
    yellow_cards?: number;
    red_cards?: number;
    games_played?: number;
    fouls_committed?: number;
    fouls_received?: number;
    offsides?: number;
    saves?: number;
    passes_completed?: number;
    passes_attempted?: number;
    shots_on_target?: number;
    shots_off_target?: number;
    distance_covered?: number;
    top_speed?: number;
    average_speed?: number;
    time_played?: number;
    // Información del atleta
    athlete: {
        id: string;
        name: string;
        position?: string;
        team_id?: string;
    };
}

// Interfaces para Seasons (CRUD)
export interface Season {
    id?: string;
    _id?: string;
    name: string;
    description: string;
    startDate: Date | string;
    endDate: Date | string;
}

export interface SeasonCreate {
    name: string;
    description: string;
    startDate: Date | string;
    endDate: Date | string;
}

export interface SeasonUpdate {
    name?: string;
    description?: string;
    startDate?: Date | string;
    endDate?: Date | string;
}

// Interfaces para Matches (CRUD)
export interface Match {
    id?: string;
    _id?: string;
    season_id?: string;
    local_team_id: string;
    visitor_team_id: string;
    date?: Date | string;
}

export interface MatchCreate {
    season_id?: string;
    local_team_id: string;
    visitor_team_id: string;
    date?: Date | string;
}

export interface MatchUpdate {
    season_id?: string;
    local_team_id?: string;
    visitor_team_id?: string;
    date?: Date | string;
}

// Interfaces para Results (CRUD)
export interface Result {
    id?: string;
    _id?: string;
    date_registration?: Date | string;
    details?: string;
    loser?: string;
    score_local?: number;
    score_visitor?: number;
    winner?: string;
    scoreboard_id?: string;
}

export interface ResultCreate {
    date_registration?: Date | string;
    details?: string;
    loser?: string;
    score_local?: number;
    score_visitor?: number;
    winner?: string;
    scoreboard_id?: string;
}

export interface ResultUpdate {
    date_registration?: Date | string;
    details?: string;
    loser?: string;
    score_local?: number;
    score_visitor?: number;
    winner?: string;
    scoreboard_id?: string;
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
    
    // URLs para CRUD operations (direct API endpoints)
    private teamsApiUrl = 'http://localhost:8012/api/v1/teams';
    private athletesApiUrl = 'http://localhost:8012/api/v1/athletes';
    private seasonsApiUrl = 'http://localhost:8012/api/v1/seasons';
    private matchesApiUrl = 'http://localhost:8012/api/v1/matches';
    private resultsApiUrl = 'http://localhost:8012/api/v1/results';

    constructor(private http: HttpClient) {
        console.log('🔧 StatisticsService initialized');
        console.log('📊 Teams URL:', this.teamsUrl);
        console.log('🏆 Competitions URL:', this.competitionsUrl);
    }

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
     * Obtiene las estadísticas de un equipo con información completa del equipo
     */
    getTeamStatisticsWithInfo(teamId: string): Observable<TeamStatisticsWithInfo> {
        // Usar URL directa para debugging
        const directUrl = `http://localhost:8012/api/v1/statistics/team/by-team/${teamId}`;
        console.log('🌐 Making API call to:', directUrl);
        console.log('🔗 Teams URL base:', this.teamsUrl);
        
        return this.http.get<TeamStatisticsWithInfo>(directUrl).pipe(
            tap((response: any) => {
                console.log('✅ API Response received:', response);
            }),
            catchError((error: any) => {
                console.error('❌ API Error:', error);
                console.error('📍 Error details:', {
                    status: error.status,
                    statusText: error.statusText,
                    url: error.url,
                    message: error.message
                });
                throw error;
            })
        );
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
     * Obtiene las estadísticas de una competencia por ID de competencia
     */
    getCompetitionStatisticsByCompetitionId(
        competitionId: string
    ): Observable<StatisticsCompetence> {
        return this.http.get<StatisticsCompetence>(
            `http://localhost:8012/api/v1/statistics/competence/by-competition/${competitionId}`
        );
    }

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
     * Obtiene una competición por ID con información completa de los equipos
     */
    getCompetitionWithTeams(competitionId: string): Observable<CompetitionWithTeams> {
        return this.http.get<CompetitionWithTeams>(`${this.competitionsApiUrl}/${competitionId}/with-teams`);
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

    // ==================== TEAMS (CRUD) ====================

    /**
     * Crea un nuevo equipo
     */
    createTeam(team: TeamCreate): Observable<Team> {
        return this.http.post<Team>(this.teamsApiUrl, team);
    }

    /**
     * Obtiene todos los equipos
     */
    getAllTeams(): Observable<Team[]> {
        return this.http.get<Team[]>(this.teamsApiUrl);
    }

    /**
     * Obtiene un equipo por ID
     */
    getTeam(teamId: string): Observable<Team> {
        return this.http.get<Team>(`${this.teamsApiUrl}/${teamId}`);
    }

    /**
     * Actualiza un equipo
     */
    updateTeam(teamId: string, team: TeamUpdate): Observable<Team> {
        return this.http.put<Team>(`${this.teamsApiUrl}/${teamId}`, team);
    }

    /**
     * Elimina un equipo
     */
    deleteTeam(teamId: string): Observable<void> {
        return this.http.delete<void>(`${this.teamsApiUrl}/${teamId}`);
    }

    // ==================== ATHLETES (CRUD) ====================

    /**
     * Crea un nuevo atleta
     */
    createAthlete(athlete: AthleteCreate): Observable<Athlete> {
        return this.http.post<Athlete>(this.athletesApiUrl, athlete);
    }

    /**
     * Obtiene todos los atletas
     */
    getAllAthletes(): Observable<Athlete[]> {
        return this.http.get<Athlete[]>(this.athletesApiUrl);
    }

    /**
     * Obtiene un atleta por ID
     */
    getAthlete(athleteId: string): Observable<Athlete> {
        return this.http.get<Athlete>(`${this.athletesApiUrl}/${athleteId}`);
    }

    /**
     * Actualiza un atleta
     */
    updateAthlete(athleteId: string, athlete: AthleteUpdate): Observable<Athlete> {
        return this.http.put<Athlete>(`${this.athletesApiUrl}/${athleteId}`, athlete);
    }

    /**
     * Elimina un atleta
     */
    deleteAthlete(athleteId: string): Observable<void> {
        return this.http.delete<void>(`${this.athletesApiUrl}/${athleteId}`);
    }

    /**
     * Obtiene las estadísticas de un atleta específico con información completa del atleta
     */
    getAthleteStatistics(athleteId: string): Observable<StatisticsIndividualWithAthlete> {
        // Primero intentamos el endpoint principal que ya funciona
        return this.http.get<StatisticsIndividualWithAthlete>(`http://localhost:8012/api/v1/statistics/individual/by-athlete/${athleteId}`)
            .pipe(
                tap(response => {
                    console.log('✅ Estadísticas del atleta obtenidas:', response);
                }),
                catchError(error => {
                    console.error('❌ Error fetching athlete statistics from main endpoint:', error);
                    // Si falla, obtenemos la información del atleta y las estadísticas por separado
                    return forkJoin({
                        athlete: this.http.get<Athlete>(`${this.athletesApiUrl}/${athleteId}`),
                        stats: this.http.get<StatisticsIndividual>(`http://localhost:8012/api/v1/statistics/individual/athlete/${athleteId}/calculate`)
                    }).pipe(
                        map(({ athlete, stats }) => {
                            // Combinamos la información del atleta con las estadísticas calculadas
                            return {
                                ...stats,
                                athlete: {
                                    id: athlete._id || athlete.id || athleteId,
                                    name: athlete.name,
                                    position: athlete.position,
                                    team_id: athlete.team_id
                                }
                            } as StatisticsIndividualWithAthlete;
                        }),
                        catchError(fallbackError => {
                            console.error('❌ Error in fallback method:', fallbackError);
                            throw error; // Lanzamos el error original
                        })
                    );
                })
            );
    }

    /**
     * Calcula las estadísticas de un atleta basándose en todos sus eventos de match
     */
    calculateAthleteStatisticsFromEvents(athleteId: string): Observable<StatisticsIndividual> {
        return this.http.get<StatisticsIndividual>(`http://localhost:8012/api/v1/statistics/individual/athlete/${athleteId}/calculate`)
            .pipe(
                catchError(error => {
                    console.error('❌ Error calculating athlete statistics from events:', error);
                    throw error;
                })
            );
    }

    // ==================== SEASONS (CRUD) ====================

    /**
     * Crea una nueva temporada
     */
    createSeason(season: SeasonCreate): Observable<Season> {
        return this.http.post<Season>(this.seasonsApiUrl, season);
    }

    /**
     * Obtiene todas las temporadas
     */
    getAllSeasons(): Observable<Season[]> {
        return this.http.get<Season[]>(this.seasonsApiUrl);
    }

    /**
     * Obtiene una temporada por ID
     */
    getSeason(seasonId: string): Observable<Season> {
        return this.http.get<Season>(`${this.seasonsApiUrl}/${seasonId}`);
    }

    /**
     * Actualiza una temporada
     */
    updateSeason(seasonId: string, season: SeasonUpdate): Observable<Season> {
        return this.http.put<Season>(`${this.seasonsApiUrl}/${seasonId}`, season);
    }

    /**
     * Elimina una temporada
     */
    deleteSeason(seasonId: string): Observable<void> {
        return this.http.delete<void>(`${this.seasonsApiUrl}/${seasonId}`);
    }

    // ==================== MATCHES (CRUD) ====================

    /**
     * Crea un nuevo partido
     */
    createMatch(match: MatchCreate): Observable<Match> {
        return this.http.post<Match>(this.matchesApiUrl, match);
    }

    /**
     * Obtiene todos los partidos
     */
    getAllMatches(): Observable<Match[]> {
        return this.http.get<Match[]>(this.matchesApiUrl);
    }

    /**
     * Obtiene un partido por ID
     */
    getMatch(matchId: string): Observable<Match> {
        return this.http.get<Match>(`${this.matchesApiUrl}/${matchId}`);
    }

    /**
     * Actualiza un partido
     */
    updateMatch(matchId: string, match: MatchUpdate): Observable<Match> {
        return this.http.put<Match>(`${this.matchesApiUrl}/${matchId}`, match);
    }

    /**
     * Elimina un partido
     */
    deleteMatch(matchId: string): Observable<void> {
        return this.http.delete<void>(`${this.matchesApiUrl}/${matchId}`);
    }

    // ==================== RESULTS (CRUD) ====================

    /**
     * Crea un nuevo resultado
     */
    createResult(result: ResultCreate): Observable<Result> {
        return this.http.post<Result>(this.resultsApiUrl, result);
    }

    /**
     * Obtiene todos los resultados
     */
    getAllResults(): Observable<Result[]> {
        return this.http.get<Result[]>(this.resultsApiUrl);
    }

    /**
     * Obtiene un resultado por ID
     */
    getResult(resultId: string): Observable<Result> {
        return this.http.get<Result>(`${this.resultsApiUrl}/${resultId}`);
    }

    /**
     * Actualiza un resultado
     */
    updateResult(resultId: string, result: ResultUpdate): Observable<Result> {
        return this.http.put<Result>(`${this.resultsApiUrl}/${resultId}`, result);
    }

    /**
     * Obtiene la tabla de posiciones de una competencia con equipos y posiciones anidadas
     */
    getTableRatingWithTeams(competitionId: string): Observable<TableRatingWithTeams> {
        const url = `http://localhost:8012/api/v1/table_ratings/competition/${competitionId}`;
        return this.http.get<TableRatingWithTeams>(url);
    }

    /**
     * Elimina un resultado
     */
    deleteResult(resultId: string): Observable<void> {
        return this.http.delete<void>(`${this.resultsApiUrl}/${resultId}`);
    }
}
