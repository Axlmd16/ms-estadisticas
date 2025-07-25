import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { StatisticsService } from '../../../../core/services/statistics/statistics.service';
import {
    StatisticsCompetence,
    StatisticsFilter,
    TableRating,
} from '../../../../core/models/statistics';
import { ApiPaginationResponse } from '../../../../core/models/api-response';

@Component({
    selector: 'app-competencias',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatFormFieldModule,
        MatInputModule,
        MatTabsModule,
        FormsModule,
    ],
    template: `
        <div class="competitions-container">
            <mat-card class="header-card">
                <mat-card-header>
                    <mat-card-title>Competencias</mat-card-title>
                    <mat-card-subtitle>
                        Estadísticas y tablas de posiciones
                    </mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                    <div
                        class="d-flex justify-content-between align-items-center"
                    >
                        <mat-form-field
                            appearance="outline"
                            class="search-field"
                        >
                            <mat-label>Buscar competencia</mat-label>
                            <input
                                matInput
                                [ngModel]="filter.search"
                                (ngModelChange)="onSearchChange($event)"
                                placeholder="Nombre de la competencia..."
                            />
                            <mat-icon matSuffix>search</mat-icon>
                        </mat-form-field>

                        <button mat-raised-button color="primary">
                            <mat-icon>download</mat-icon>
                            Exportar Datos
                        </button>
                    </div>
                </mat-card-content>
            </mat-card>

            <mat-card class="content-card">
                <mat-tab-group>
                    <!-- Pestaña de Competencias -->
                    <mat-tab label="Competencias">
                        <table mat-table [dataSource]="dataSource" matSort>
                            <!-- Nombre -->
                            <ng-container matColumnDef="competition_name">
                                <th
                                    mat-header-cell
                                    *matHeaderCellDef
                                    mat-sort-header
                                >
                                    Competencia
                                </th>
                                <td mat-cell *matCellDef="let competition">
                                    {{ competition.competition_name }}
                                </td>
                            </ng-container>

                            <!-- Total Equipos -->
                            <ng-container matColumnDef="totalTeams">
                                <th
                                    mat-header-cell
                                    *matHeaderCellDef
                                    mat-sort-header
                                >
                                    Equipos
                                </th>
                                <td mat-cell *matCellDef="let competition">
                                    {{ competition.total_teams }}
                                </td>
                            </ng-container>

                            <!-- Ronda Actual -->
                            <ng-container matColumnDef="currentRound">
                                <th
                                    mat-header-cell
                                    *matHeaderCellDef
                                    mat-sort-header
                                >
                                    Ronda
                                </th>
                                <td mat-cell *matCellDef="let competition">
                                    {{ competition.currentRound }}
                                </td>
                            </ng-container>

                            <!-- Estado -->
                            <ng-container matColumnDef="status">
                                <th
                                    mat-header-cell
                                    *matHeaderCellDef
                                    mat-sort-header
                                >
                                    Estado
                                </th>
                                <td mat-cell *matCellDef="let competition">
                                    <span
                                        [class]="
                                            'status-badge ' +
                                            competition.status.toLowerCase()
                                        "
                                    >
                                        {{ competition.status }}
                                    </span>
                                </td>
                            </ng-container>

                            <!-- Acciones -->
                            <ng-container matColumnDef="actions">
                                <th mat-header-cell *matHeaderCellDef>
                                    Acciones
                                </th>
                                <td mat-cell *matCellDef="let competition">
                                    <button
                                        mat-icon-button
                                        color="primary"
                                        (click)="viewTable(competition)"
                                    >
                                        <mat-icon>leaderboard</mat-icon>
                                    </button>
                                </td>
                            </ng-container>

                            <tr
                                mat-header-row
                                *matHeaderRowDef="displayedColumns"
                            ></tr>
                            <tr
                                mat-row
                                *matRowDef="let row; columns: displayedColumns"
                            ></tr>
                        </table>

                        <mat-paginator
                            [length]="totalItems"
                            [pageSize]="filter.pageSize"
                            [pageSizeOptions]="[5, 10, 25, 100]"
                            (page)="onPageChange($event)"
                        >
                        </mat-paginator>
                    </mat-tab>

                    <!-- Pestaña de Tabla de Posiciones -->
                    <mat-tab
                        label="Tabla de Posiciones"
                        *ngIf="selectedCompetition"
                    >
                        <div class="table-header">
                            <h3>
                                {{ selectedCompetition.competition_name }} - Tabla de
                                Posiciones
                            </h3>
                        </div>

                        <table
                            mat-table
                            [dataSource]="tableRatings"
                            class="standings-table"
                        >
                            <!-- Posición -->
                            <ng-container matColumnDef="position">
                                <th mat-header-cell *matHeaderCellDef>#</th>
                                <td mat-cell *matCellDef="let team">
                                    {{ team.position }}
                                </td>
                            </ng-container>

                            <!-- Equipo -->
                            <ng-container matColumnDef="team">
                                <th mat-header-cell *matHeaderCellDef>
                                    Equipo
                                </th>
                                <td mat-cell *matCellDef="let team">
                                    <div class="team-cell">
                                        <img
                                            [src]="team.logo"
                                            class="team-logo"
                                            alt="logo"
                                        />
                                        {{ team.name }}
                                    </div>
                                </td>
                            </ng-container>

                            <!-- Puntos -->
                            <ng-container matColumnDef="points">
                                <th mat-header-cell *matHeaderCellDef>PTS</th>
                                <td mat-cell *matCellDef="let team">
                                    {{ team.points }}
                                </td>
                            </ng-container>

                            <!-- Partidos Jugados -->
                            <ng-container matColumnDef="played">
                                <th mat-header-cell *matHeaderCellDef>PJ</th>
                                <td mat-cell *matCellDef="let team">
                                    {{ team.gamesPlayed }}
                                </td>
                            </ng-container>

                            <!-- Goles a Favor -->
                            <ng-container matColumnDef="goalsFor">
                                <th mat-header-cell *matHeaderCellDef>GF</th>
                                <td mat-cell *matCellDef="let team">
                                    {{ team.goalsScored }}
                                </td>
                            </ng-container>

                            <!-- Goles en Contra -->
                            <ng-container matColumnDef="goalsAgainst">
                                <th mat-header-cell *matHeaderCellDef>GC</th>
                                <td mat-cell *matCellDef="let team">
                                    {{ team.goalsAgainst }}
                                </td>
                            </ng-container>

                            <!-- Diferencia de Goles -->
                            <ng-container matColumnDef="goalDiff">
                                <th mat-header-cell *matHeaderCellDef>DG</th>
                                <td mat-cell *matCellDef="let team">
                                    {{ team.goalDifference }}
                                </td>
                            </ng-container>

                            <tr
                                mat-header-row
                                *matHeaderRowDef="standingsColumns"
                            ></tr>
                            <tr
                                mat-row
                                *matRowDef="let row; columns: standingsColumns"
                            ></tr>
                        </table>
                    </mat-tab>
                </mat-tab-group>
            </mat-card>
        </div>
    `,
    styles: [
        `
            @use '../../../../../styles/variables' as vars;
            @use '../../../../../styles/mixins' as mixins;

            .competitions-container {
                padding: vars.$spacing-6;
                max-width: vars.$container-lg;
                margin: 0 auto;
            }

            .header-card {
                margin-bottom: vars.$spacing-6;
                @include mixins.card;
            }

            .content-card {
                @include mixins.card;
            }

            .search-field {
                width: 300px;
            }

            table {
                width: 100%;
            }

            .status-badge {
                padding: vars.$spacing-1 vars.$spacing-2;
                border-radius: vars.$border-radius-sm;
                font-size: vars.$font-size-sm;
                font-weight: vars.$font-weight-medium;

                &.active {
                    background-color: vars.$success-color;
                    color: vars.$white;
                }

                &.pending {
                    background-color: vars.$warning-color;
                    color: vars.$white;
                }

                &.finished {
                    background-color: vars.$info-color;
                    color: vars.$white;
                }
            }

            .team-cell {
                display: flex;
                align-items: center;
                gap: vars.$spacing-2;

                .team-logo {
                    width: 24px;
                    height: 24px;
                    border-radius: vars.$border-radius-full;
                }
            }

            .table-header {
                padding: vars.$spacing-4;
                border-bottom: 1px solid vars.$light-gray;

                h3 {
                    margin: 0;
                    color: vars.$font-color;
                    font-size: vars.$font-size-lg;
                }
            }

            .standings-table {
                .mat-column-position {
                    width: 50px;
                    text-align: center;
                }

                .mat-column-points {
                    width: 80px;
                    text-align: center;
                    font-weight: vars.$font-weight-bold;
                }

                .mat-column-played,
                .mat-column-goalsFor,
                .mat-column-goalsAgainst,
                .mat-column-goalDiff {
                    width: 80px;
                    text-align: center;
                }
            }

            // Responsive
            @include mixins.respond-to(md) {
                .competitions-container {
                    padding: vars.$spacing-4;
                }
            }

            @include mixins.respond-to(sm) {
                .search-field {
                    width: 100%;
                }
            }
        `,
    ],
})
export class CompetenciasComponent implements OnInit {
    dataSource: StatisticsCompetence[] = [];
    displayedColumns = [
        'competition_name',
        'total_teams',
        'currentRound',
        'status',
        'actions',
    ];
    standingsColumns = [
        'position',
        'team',
        'points',
        'played',
        'goalsFor',
        'goalsAgainst',
        'goalDiff',
    ];
    totalItems = 0;
    selectedCompetition?: StatisticsCompetence;
    tableRatings: TableRating[] = [];

    filter: StatisticsFilter = {
        page: 1,
        pageSize: 10,
        search: '',
        sortBy: 'name',
        sortDirection: 'asc',
    };

    constructor(private statisticsService: StatisticsService) {}

    ngOnInit() {
        this.loadCompetitions();
    }

    loadCompetitions() {
        this.statisticsService
            .getAllCompetitionsStatistics(this.filter)
            .subscribe({
                next: (
                    response: ApiPaginationResponse<StatisticsCompetence>
                ) => {
                    this.dataSource = response.data;
                    this.totalItems = response.meta.pagination.count;
                },
                error: (error) => {
                    console.error('Error cargando competencias:', error);
                },
            });
    }

    viewTable(competition: StatisticsCompetence) {
        this.selectedCompetition = competition;
        this.loadTableRatings(competition.id);
    }

    loadTableRatings(competitionId: string) {
        this.statisticsService.getTableRating(competitionId).subscribe({
            next: (response: ApiPaginationResponse<TableRating>) => {
                this.tableRatings = response.data;
            },
            error: (error) => {
                console.error('Error cargando tabla de posiciones:', error);
            },
        });
    }

    onSearchChange(search: string) {
        this.filter.search = search;
        this.filter.page = 1;
        this.loadCompetitions();
    }

    onPageChange(event: any) {
        this.filter.page = event.pageIndex + 1;
        this.filter.pageSize = event.pageSize;
        this.loadCompetitions();
    }
}
