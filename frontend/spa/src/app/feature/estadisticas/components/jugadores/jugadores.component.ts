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
import { FormsModule } from '@angular/forms';

import { StatisticsService } from '../../../../core/services/statistics/statistics.service';
import {
    StatisticsIndividual,
    StatisticsFilter,
} from '../../../../core/models/statistics';
import { ApiPaginationResponse } from '../../../../core/models/api-response';

@Component({
    selector: 'app-jugadores',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
    ],
    template: `
        <div class="players-container">
            <mat-card class="header-card">
                <mat-card-header>
                    <mat-card-title>Estadísticas de Jugadores</mat-card-title>
                    <mat-card-subtitle>
                        Rendimiento individual de jugadores
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
                            <mat-label>Buscar jugador</mat-label>
                            <input
                                matInput
                                [ngModel]="filter.search"
                                (ngModelChange)="onSearchChange($event)"
                                placeholder="Nombre del jugador..."
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

            <!-- Indicadores generales -->
            <div class="stats-overview">
                <mat-card class="stat-card">
                    <mat-card-content>
                        <div class="stat-value">{{ totalJugadores }}</div>
                        <div class="stat-label">Total Jugadores</div>
                    </mat-card-content>
                </mat-card>

                <mat-card class="stat-card">
                    <mat-card-content>
                        <div class="stat-value">{{ totalGoles }}</div>
                        <div class="stat-label">Total Goles</div>
                    </mat-card-content>
                </mat-card>

                <mat-card class="stat-card">
                    <mat-card-content>
                        <div class="stat-value">
                            {{ promedioAsistencias | number : '1.1-1' }}
                        </div>
                        <div class="stat-label">Promedio Asistencias</div>
                    </mat-card-content>
                </mat-card>
            </div>

            <mat-card class="table-card">
                <mat-card-content>
                    <table mat-table [dataSource]="dataSource" matSort>
                        <!-- Jugador -->
                        <ng-container matColumnDef="name">
                            <th
                                mat-header-cell
                                *matHeaderCellDef
                                mat-sort-header
                            >
                                Jugador
                            </th>
                            <td mat-cell *matCellDef="let player">
                                {{ player.name }}
                            </td>
                        </ng-container>

                        <!-- Partidos Jugados -->
                        <ng-container matColumnDef="gamesPlayed">
                            <th
                                mat-header-cell
                                *matHeaderCellDef
                                mat-sort-header
                            >
                                PJ
                            </th>
                            <td mat-cell *matCellDef="let player">
                                {{ player.gamesPlayed }}
                            </td>
                        </ng-container>

                        <!-- Goles -->
                        <ng-container matColumnDef="goals">
                            <th
                                mat-header-cell
                                *matHeaderCellDef
                                mat-sort-header
                            >
                                Goles
                            </th>
                            <td mat-cell *matCellDef="let player">
                                {{ player.goals }}
                            </td>
                        </ng-container>

                        <!-- Asistencias -->
                        <ng-container matColumnDef="assists">
                            <th
                                mat-header-cell
                                *matHeaderCellDef
                                mat-sort-header
                            >
                                Asistencias
                            </th>
                            <td mat-cell *matCellDef="let player">
                                {{ player.assists }}
                            </td>
                        </ng-container>

                        <!-- Tarjetas Amarillas -->
                        <ng-container matColumnDef="yellowCards">
                            <th
                                mat-header-cell
                                *matHeaderCellDef
                                mat-sort-header
                            >
                                TA
                            </th>
                            <td mat-cell *matCellDef="let player">
                                {{ player.yellowCards }}
                            </td>
                        </ng-container>

                        <!-- Tarjetas Rojas -->
                        <ng-container matColumnDef="redCards">
                            <th
                                mat-header-cell
                                *matHeaderCellDef
                                mat-sort-header
                            >
                                TR
                            </th>
                            <td mat-cell *matCellDef="let player">
                                {{ player.redCards }}
                            </td>
                        </ng-container>

                        <!-- Acciones -->
                        <ng-container matColumnDef="actions">
                            <th mat-header-cell *matHeaderCellDef>Acciones</th>
                            <td mat-cell *matCellDef="let player">
                                <button
                                    mat-icon-button
                                    color="primary"
                                    (click)="viewDetails(player)"
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

                    <mat-paginator
                        [length]="totalItems"
                        [pageSize]="filter.pageSize"
                        [pageSizeOptions]="[5, 10, 25, 100]"
                        (page)="onPageChange($event)"
                    >
                    </mat-paginator>
                </mat-card-content>
            </mat-card>
        </div>
    `,
    styles: [
        `
            @use '../../../../../styles/variables' as vars;
            @use '../../../../../styles/mixins' as mixins;

            .players-container {
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

                .stat-value {
                    font-size: vars.$font-size-2xl;
                    font-weight: vars.$font-weight-bold;
                    color: vars.$primary-color;
                }

                .stat-label {
                    color: vars.$font-secondary-color;
                    font-size: vars.$font-size-sm;
                    margin-top: vars.$spacing-2;
                }
            }

            .table-card {
                @include mixins.card;
            }

            table {
                width: 100%;
            }

            .mat-column-actions {
                width: 80px;
                text-align: center;
            }

            // Responsive
            @include mixins.respond-to(md) {
                .players-container {
                    padding: vars.$spacing-4;
                }
            }

            @include mixins.respond-to(sm) {
                .search-field {
                    width: 100%;
                }

                .stats-overview {
                    grid-template-columns: repeat(2, 1fr);
                }
            }
        `,
    ],
})
export class JugadoresComponent implements OnInit {
    dataSource: StatisticsIndividual[] = [];
    displayedColumns = [
        'name',
        'gamesPlayed',
        'goals',
        'assists',
        'yellowCards',
        'redCards',
        'actions',
    ];
    totalItems = 0;
    totalJugadores = 0;
    totalGoles = 0;
    promedioAsistencias = 0;

    filter: StatisticsFilter = {
        page: 1,
        pageSize: 10,
        search: '',
        sortBy: 'name',
        sortDirection: 'asc',
    };

    constructor(private statisticsService: StatisticsService) {}

    ngOnInit() {
        this.loadPlayers();
    }

    loadPlayers() {
        this.statisticsService.getAllPlayersStatistics(this.filter).subscribe({
            next: (response: ApiPaginationResponse<StatisticsIndividual>) => {
                this.dataSource = response.data;
                this.totalItems = response.meta.pagination.count;
                this.calculateStats();
            },
            error: (error) => {
                console.error('Error cargando jugadores:', error);
            },
        });
    }

    calculateStats() {
        this.totalJugadores = this.totalItems;
        this.totalGoles = this.dataSource.reduce(
            (sum, player) => sum + player.goals,
            0
        );
        const totalAsistencias = this.dataSource.reduce(
            (sum, player) => sum + player.assists,
            0
        );
        this.promedioAsistencias = this.totalJugadores
            ? totalAsistencias / this.totalJugadores
            : 0;
    }

    onSearchChange(search: string) {
        this.filter.search = search;
        this.filter.page = 1;
        this.loadPlayers();
    }

    onPageChange(event: any) {
        this.filter.page = event.pageIndex + 1;
        this.filter.pageSize = event.pageSize;
        this.loadPlayers();
    }

    viewDetails(player: StatisticsIndividual) {
        // Implementar vista detallada del jugador
        console.log('Ver detalles del jugador:', player);
    }
}
