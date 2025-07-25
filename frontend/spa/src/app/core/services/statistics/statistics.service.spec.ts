import { TestBed } from '@angular/core/testing';
import {
    HttpClientTestingModule,
    HttpTestingController,
} from '@angular/common/http/testing';
import { StatisticsService } from './statistics.service';
import { API_ENDPOINTS } from '../../config/api-endpoints';
import {
    StatisticsTeam,
    StatisticsSeason,
    StatisticsIndividual,
    StatisticsCompetence,
    TableRating,
} from '../../models/statistics';

describe('StatisticsService', () => {
    let service: StatisticsService;
    let httpMock: HttpTestingController;
    const baseUrl = API_ENDPOINTS.BASE_URL;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [StatisticsService],
        });
        service = TestBed.inject(StatisticsService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    // Tests para estadísticas de equipos
    describe('Team Statistics', () => {
        it('should get team statistics by ID', () => {
            const mockTeamId = '123';
            const mockResponse = { data: { id: mockTeamId } as StatisticsTeam };

            service.getTeamStatistics(mockTeamId).subscribe((response) => {
                expect(response).toBeTruthy();
                expect(response.id).toBe(mockTeamId);
            });

            const req = httpMock.expectOne(
                `${baseUrl}/statistics/teams/${mockTeamId}`
            );
            expect(req.request.method).toBe('GET');
            req.flush(mockResponse);
        });

        it('should get all teams statistics with filters', () => {
            const mockFilter = { page: 1, pageSize: 10 };
            const mockResponse = {
                data: [{ id: '1' }] as StatisticsTeam[],
                meta: { pagination: { count: 1 } },
            };

            service.getAllTeamsStatistics(mockFilter).subscribe((response) => {
                expect(response.data).toBeTruthy();
                expect(response.data.length).toBe(1);
                expect(response.meta.pagination.count).toBe(1);
            });

            const req = httpMock.expectOne(
                `${baseUrl}/statistics/teams?page=1&page_size=10`
            );
            expect(req.request.method).toBe('GET');
            req.flush(mockResponse);
        });
    });

    // Tests para estadísticas de temporadas
    describe('Season Statistics', () => {
        it('should get season statistics by ID', () => {
            const mockSeasonId = '123';
            const mockResponse = {
                data: { id: mockSeasonId } as StatisticsSeason,
            };

            service.getSeasonStatistics(mockSeasonId).subscribe((response) => {
                expect(response).toBeTruthy();
                expect(response.id).toBe(mockSeasonId);
            });

            const req = httpMock.expectOne(
                `${baseUrl}/statistics/seasons/${mockSeasonId}`
            );
            expect(req.request.method).toBe('GET');
            req.flush(mockResponse);
        });
    });

    // Tests para estadísticas de jugadores
    describe('Player Statistics', () => {
        it('should get player statistics by ID', () => {
            const mockPlayerId = '123';
            const mockResponse = {
                data: { id: mockPlayerId } as StatisticsIndividual,
            };

            service.getPlayerStatistics(mockPlayerId).subscribe((response) => {
                expect(response).toBeTruthy();
                expect(response.id).toBe(mockPlayerId);
            });

            const req = httpMock.expectOne(
                `${baseUrl}/statistics/players/${mockPlayerId}`
            );
            expect(req.request.method).toBe('GET');
            req.flush(mockResponse);
        });
    });

    // Tests para estadísticas de competencias
    describe('Competition Statistics', () => {
        it('should get competition statistics by ID', () => {
            const mockCompetitionId = '123';
            const mockResponse = {
                data: { id: mockCompetitionId } as StatisticsCompetence,
            };

            service
                .getCompetitionStatistics(mockCompetitionId)
                .subscribe((response) => {
                    expect(response).toBeTruthy();
                    expect(response.id).toBe(mockCompetitionId);
                });

            const req = httpMock.expectOne(
                `${baseUrl}/statistics/competitions/${mockCompetitionId}`
            );
            expect(req.request.method).toBe('GET');
            req.flush(mockResponse);
        });

        it('should get table rating with filters', () => {
            const mockCompetitionId = '123';
            const mockFilter = { page: 1, pageSize: 10 };
            const mockResponse = {
                data: [{ id: '1', position: 1 }] as TableRating[],
                meta: { pagination: { count: 1 } },
            };

            service
                .getTableRating(mockCompetitionId, mockFilter)
                .subscribe((response) => {
                    expect(response.data).toBeTruthy();
                    expect(response.data.length).toBe(1);
                    expect(response.meta.pagination.count).toBe(1);
                });

            const req = httpMock.expectOne(
                `${baseUrl}/statistics/competitions/${mockCompetitionId}/table?page=1&page_size=10`
            );
            expect(req.request.method).toBe('GET');
            req.flush(mockResponse);
        });
    });
});
