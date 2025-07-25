export interface StatisticsFilter {
    page?: number;
    pageSize?: number;
    search?: string;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
    startDate?: string;
    endDate?: string;
    teamId?: string;
    seasonId?: string;
    playerId?: string;
    competitionId?: string;
}
