import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { StatisticsService } from '../../../../core/services/statistics/statistics.service';
import {
    StatisticsTeam,
    StatisticsFilter,
} from '../../../../core/models/statistics';
import { ApiPaginationResponse } from '../../../../core/models/api-response';

@Component({
    selector: 'app-equipos',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatInputModule,
        MatFormFieldModule,
        MatProgressSpinnerModule,
        FormsModule,
        ReactiveFormsModule,
    ],
    template: `
        <div class="statistics-container">
            <!-- Encabezado -->
            <mat-card class="header-card">
                <mat-card-header>
                    <mat-card-title>Estadísticas de Equipos</mat-card-title>
                    <mat-card-subtitle>
                        Visualiza y analiza el rendimiento de los equipos
                    </mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                    <div
                        class="d-flex justify-content-between align-items-center"
                    >
                        <!-- Filtros -->
                        <mat-form-field
                            appearance="outline"
                            class="search-field"
                        >
                            <mat-label>Buscar equipo</mat-label>
                            <input
                                matInput
                                [ngModel]="filter.search"
                                (ngModelChange)="onSearchChange($event)"
                                placeholder="Nombre del equipo..."
                            />
                            <mat-icon matSuffix>search</mat-icon>
                        </mat-form-field>

                        <!-- Botón para exportar -->
                        <button
                            mat-raised-button
                            color="primary"
                            class="export-btn"
                        >
                            <mat-icon>download</mat-icon>
                            Exportar Datos
                        </button>
                    </div>
                </mat-card-content>
            </mat-card>

            <!-- Indicadores principales -->
            <div class="stats-overview d-grid">
                <mat-card class="stat-card">
                    <mat-card-content>
                        <div class="stat-value">{{ totalEquipos }}</div>
                        <div class="stat-label">Total Equipos</div>
                    </mat-card-content>
                </mat-card>

                <mat-card class="stat-card">
                    <mat-card-content>
                        <div class="stat-value">
                            {{ promedioGoles | number : '1.1-1' }}
                        </div>
                        <div class="stat-label">Promedio de Goles</div>
                    </mat-card-content>
                </mat-card>

                <mat-card class="stat-card">
                    <mat-card-content>
                        <div class="stat-value">{{ victoriasPorcentaje }}%</div>
                        <div class="stat-label">% Victorias</div>
                    </mat-card-content>
                </mat-card>
            </div>

            <!-- Tabla de estadísticas -->
            <mat-card class="table-card">
                <mat-card-content>
                    <div class="table-container">
                        <table
                            mat-table
                            [dataSource]="dataSource"
                            matSort
                            class="w-100"
                        >
                            <!-- Columna Equipo -->
                            <ng-container matColumnDef="name">
                                <th
                                    mat-header-cell
                                    *matHeaderCellDef
                                    mat-sort-header
                                >
                                    Equipo
                                </th>
                                <td mat-cell *matCellDef="let team">
                                    <div class="d-flex align-items-center">
                                        <img
                                            [src]="team.logo"
                                            class="team-logo"
                                            alt="logo"
                                        />
                                        {{ team.name }}
                                    </div>
                                </td>
                            </ng-container>

                            <!-- Columna PJ -->
                            <ng-container matColumnDef="gamesPlayed">
                                <th
                                    mat-header-cell
                                    *matHeaderCellDef
                                    mat-sort-header
                                >
                                    PJ
                                </th>
                                <td mat-cell *matCellDef="let team">
                                    {{ team.gamesPlayed }}
                                </td>
                            </ng-container>

                            <!-- Columna PG -->
                            <ng-container matColumnDef="gamesWon">
                                <th
                                    mat-header-cell
                                    *matHeaderCellDef
                                    mat-sort-header
                                >
                                    PG
                                </th>
                                <td mat-cell *matCellDef="let team">
                                    {{ team.gamesWon }}
                                </td>
                            </ng-container>

                            <!-- Columna PE -->
                            <ng-container matColumnDef="gamesTied">
                                <th
                                    mat-header-cell
                                    *matHeaderCellDef
                                    mat-sort-header
                                >
                                    PE
                                </th>
                                <td mat-cell *matCellDef="let team">
                                    {{ team.gamesTied }}
                                </td>
                            </ng-container>

                            <!-- Columna PP -->
                            <ng-container matColumnDef="gamesLost">
                                <th
                                    mat-header-cell
                                    *matHeaderCellDef
                                    mat-sort-header
                                >
                                    PP
                                </th>
                                <td mat-cell *matCellDef="let team">
                                    {{ team.gamesLost }}
                                </td>
                            </ng-container>

                            <!-- Columna GF -->
                            <ng-container matColumnDef="goalsScored">
                                <th
                                    mat-header-cell
                                    *matHeaderCellDef
                                    mat-sort-header
                                >
                                    GF
                                </th>
                                <td mat-cell *matCellDef="let team">
                                    {{ team.goalsScored }}
                                </td>
                            </ng-container>

                            <!-- Columna GC -->
                            <ng-container matColumnDef="goalsAgainst">
                                <th
                                    mat-header-cell
                                    *matHeaderCellDef
                                    mat-sort-header
                                >
                                    GC
                                </th>
                                <td mat-cell *matCellDef="let team">
                                    {{ team.goalsAgainst }}
                                </td>
                            </ng-container>

                            <!-- Columna DG -->
                            <ng-container matColumnDef="goalDifference">
                                <th
                                    mat-header-cell
                                    *matHeaderCellDef
                                    mat-sort-header
                                >
                                    DG
                                </th>
                                <td mat-cell *matCellDef="let team">
                                    {{ team.goalsScored - team.goalsAgainst }}
                                </td>
                            </ng-container>

                            <!-- Columna Acciones -->
                            <ng-container matColumnDef="actions">
                                <th mat-header-cell *matHeaderCellDef>
                                    Acciones
                                </th>
                                <td mat-cell *matCellDef="let team">
                                    <button
                                        mat-icon-button
                                        color="primary"
                                        [routerLink]="[
                                            '/estadisticas/equipos',
                                            team.id
                                        ]"
                                    >
                                        <mat-icon>visibility</mat-icon>
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

                        <!-- Loading spinner -->
                        <div *ngIf="isLoading" class="loading-shade">
                            <mat-spinner></mat-spinner>
                        </div>

                        <!-- Mensaje sin resultados -->
                        <div
                            *ngIf="
                                !isLoading &&
                                (!dataSource || dataSource.length === 0)
                            "
                            class="no-data"
                        >
                            No se encontraron estadísticas de equipos
                        </div>

                        <!-- Paginador -->
                        <mat-paginator
                            [length]="totalEquipos"
                            [pageSize]="filter.pageSize"
                            [pageSizeOptions]="[5, 10, 25, 100]"
                            (page)="onPageChange($event)"
                        >
                        </mat-paginator>
                    </div>
                </mat-card-content>
            </mat-card>
        </div>
    `,
    styles: [
        `
            @use '../../../../../styles/variables' as vars;
            @use '../../../../../styles/mixins' as mixins;

            .statistics-container {
                padding: vars.$spacing-6;
                max-width: vars.$container-lg;
                margin: 0 auto;
            }

            .header-card {
                margin-bottom: vars.$spacing-6;
                @include mixins.card;
            }

            .search-field {
                width: 300px;
            }

            .stats-overview {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: vars.$spacing-4;
                margin-bottom: vars.$spacing-6;
            }

            .stat-card {
                @include mixins.card;
                text-align: center;
                padding: vars.$spacing-4;
            }

            .stat-value {
                font-size: vars.$font-size-2xl;
                font-weight: vars.$font-weight-bold;
                color: vars.$primary-color;
                margin-bottom: vars.$spacing-2;
            }

            .stat-label {
                color: vars.$font-secondary-color;
                font-size: vars.$font-size-sm;
            }

            .table-card {
                @include mixins.card;
            }

            .table-container {
                position: relative;
                min-height: 200px;
            }

            .team-logo {
                width: 30px;
                height: 30px;
                margin-right: vars.$spacing-2;
                border-radius: vars.$border-radius-full;
            }

            .loading-shade {
                position: absolute;
                top: 0;
                left: 0;
                bottom: 0;
                right: 0;
                background: rgba(0, 0, 0, 0.15);
                z-index: 1;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .no-data {
                padding: vars.$spacing-8;
                text-align: center;
                color: vars.$font-muted;
            }

            // Responsive
            @include mixins.respond-to(md) {
                .statistics-container {
                    padding: vars.$spacing-4;
                }
            }

            @include mixins.respond-to(sm) {
                .search-field {
                    width: 100%;
                }

                .stats-overview {
                    grid-template-columns: 1fr;
                }
            }
        `,
    ],
})
export class EquiposComponent implements OnInit {
    dataSource: StatisticsTeam[] = [];
    displayedColumns: string[] = [
        'name',
        'gamesPlayed',
        'gamesWon',
        'gamesTied',
        'gamesLost',
        'goalsScored',
        'goalsAgainst',
        'goalDifference',
        'actions',
    ];
    isLoading = false;
    totalEquipos = 0;
    promedioGoles = 0;
    victoriasPorcentaje = 0;

    filter: StatisticsFilter = {
        page: 1,
        pageSize: 10,
        search: '',
        sortBy: 'name',
        sortDirection: 'asc',
    };

    constructor(private statisticsService: StatisticsService) {}

    ngOnInit() {
        this.loadEstadisticas();
    }

    loadEstadisticas() {
        this.isLoading = true;
        this.statisticsService.getAllTeamsStatistics(this.filter).subscribe({
            next: (response: ApiPaginationResponse<StatisticsTeam>) => {
                this.dataSource = response.data;
                this.totalEquipos = response.meta.pagination.count;
                this.calcularEstadisticasGenerales();
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error al cargar estadísticas:', error);
                this.isLoading = false;
            },
        });
    }

    onSearchChange(search: string) {
        this.filter.search = search;
        this.filter.page = 1; // Reset a la primera página
        this.loadEstadisticas();
    }

    onPageChange(event: any) {
        this.filter.page = event.pageIndex + 1;
        this.filter.pageSize = event.pageSize;
        this.loadEstadisticas();
    }

    private calcularEstadisticasGenerales() {
        if (this.dataSource.length === 0) return;

        // Calcular promedio de goles
        const totalGoles = this.dataSource.reduce(
            (sum, team) => sum + team.goalsScored,
            0
        );
        this.promedioGoles = totalGoles / this.dataSource.length;

        // Calcular porcentaje de victorias
        const totalPartidos = this.dataSource.reduce(
            (sum, team) => sum + team.gamesPlayed,
            0
        );
        const totalVictorias = this.dataSource.reduce(
            (sum, team) => sum + team.gamesWon,
            0
        );
        this.victoriasPorcentaje = Math.round(
            (totalVictorias / totalPartidos) * 100
        );
    }
}
