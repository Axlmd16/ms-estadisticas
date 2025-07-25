import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';

import { StatisticsService } from '../../../../core/services/statistics/statistics.service';
import {
    StatisticsIndividual,
    StatisticsFilter,
} from '../../../../core/models/statistics';
import { ApiPaginationResponse } from '../../../../core/models/api-response';
import { JugadorFormComponent } from './jugador-form/jugador-form.component';

@Component({
    selector: 'app-jugadores',
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
        MatProgressSpinnerModule,
        FormsModule,
    ],
    template: `
        <div class="jugadores-container">
            <!-- Encabezado -->
            <mat-card class="header-card">
                <mat-card-header>
                    <mat-card-title>Estadísticas de Jugadores</mat-card-title>
                    <mat-card-subtitle>
                        Visualiza y analiza el rendimiento individual
                    </mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                    <div class="d-flex justify-content-between align-items-center">
                        <!-- Filtros -->
                        <mat-form-field appearance="outline" class="search-field">
                            <mat-label>Buscar jugador</mat-label>
                            <input
                                matInput
                                [ngModel]="filter.search"
                                (ngModelChange)="onSearchChange($event)"
                                placeholder="Nombre del jugador..."
                            />
                            <mat-icon matSuffix>search</mat-icon>
                        </mat-form-field>

                        <!-- Botones de acción -->
                        <div class="d-flex gap-2">
                            <button
                                mat-raised-button
                                color="primary"
                                (click)="createJugador()"
                            >
                                <mat-icon>add</mat-icon>
                                Nuevo Jugador
                            </button>
                            <button
                                mat-raised-button
                                color="accent"
                                class="export-btn"
                            >
                                <mat-icon>download</mat-icon>
                                Exportar Datos
                            </button>
                        </div>
                    </div>
                </mat-card-content>
            </mat-card>

            <!-- Indicadores principales -->
            <div class="stats-overview d-grid">
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
                        <div class="stat-value">{{ promedioAsistencias | number:'1.1-1' }}</div>
                        <div class="stat-label">Promedio Asistencias</div>
                    </mat-card-content>
                </mat-card>
            </div>

            <!-- Tabla de estadísticas -->
            <mat-card class="table-card">
                <mat-card-content>
                    <div class="table-container" *ngIf="!isLoading">
                        <table mat-table [dataSource]="dataSource" matSort class="w-100">
                            <!-- Columna Jugador -->
                            <ng-container matColumnDef="name">
                                <th mat-header-cell *matHeaderCellDef mat-sort-header>
                                    Jugador
                                </th>
                                <td mat-cell *matCellDef="let jugador">
                                    <div class="d-flex align-items-center">
                                        <mat-icon class="player-icon">person</mat-icon>
                                        {{ jugador.player_name }}
                                    </div>
                                </td>
                            </ng-container>

                            <!-- Columna Goles -->
                            <ng-container matColumnDef="goals">
                                <th mat-header-cell *matHeaderCellDef mat-sort-header>
                                    Goles
                                </th>
                                <td mat-cell *matCellDef="let jugador">
                                    <span class="stat-badge goals">{{ jugador.goals }}</span>
                                </td>
                            </ng-container>

                            <!-- Columna Asistencias -->
                            <ng-container matColumnDef="assists">
                                <th mat-header-cell *matHeaderCellDef mat-sort-header>
                                    Asistencias
                                </th>
                                <td mat-cell *matCellDef="let jugador">
                                    <span class="stat-badge assists">{{ jugador.assists }}</span>
                                </td>
                            </ng-container>

                            <!-- Columna Minutos -->
                            <ng-container matColumnDef="minutes">
                                <th mat-header-cell *matHeaderCellDef mat-sort-header>
                                    Minutos
                                </th>
                                <td mat-cell *matCellDef="let jugador">
                                    {{ jugador.minutes_played }}
                                </td>
                            </ng-container>

                            <!-- Columna Tarjetas Amarillas -->
                            <ng-container matColumnDef="yellowCards">
                                <th mat-header-cell *matHeaderCellDef mat-sort-header>
                                    TA
                                </th>
                                <td mat-cell *matCellDef="let jugador">
                                    <span class="card yellow" *ngIf="jugador.yellow_cards > 0">
                                        {{ jugador.yellow_cards }}
                                    </span>
                                </td>
                            </ng-container>

                            <!-- Columna Tarjetas Rojas -->
                            <ng-container matColumnDef="redCards">
                                <th mat-header-cell *matHeaderCellDef mat-sort-header>
                                    TR
                                </th>
                                <td mat-cell *matCellDef="let jugador">
                                    <span class="card red" *ngIf="jugador.red_cards > 0">
                                        {{ jugador.red_cards }}
                                    </span>
                                </td>
                            </ng-container>

                            <!-- Columna Acciones -->
                            <ng-container matColumnDef="actions">
                                <th mat-header-cell *matHeaderCellDef>
                                    Acciones
                                </th>
                                <td mat-cell *matCellDef="let jugador">
                                    <button
                                        mat-icon-button
                                        color="primary"
                                        [routerLink]="['/estadisticas/jugadores', jugador.id]"
                                        matTooltip="Ver detalles"
                                    >
                                        <mat-icon>visibility</mat-icon>
                                    </button>
                                    <button
                                        mat-icon-button
                                        color="accent"
                                        (click)="editJugador(jugador)"
                                        matTooltip="Editar"
                                    >
                                        <mat-icon>edit</mat-icon>
                                    </button>
                                    <button
                                        mat-icon-button
                                        color="warn"
                                        (click)="deleteJugador(jugador)"
                                        matTooltip="Eliminar"
                                    >
                                        <mat-icon>delete</mat-icon>
                                    </button>
                                </td>
                            </ng-container>

                            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
                        </table>

                        <!-- Paginación -->
                        <mat-paginator
                            [length]="totalItems"
                            [pageSize]="filter.pageSize"
                            [pageSizeOptions]="[5, 10, 25, 50]"
                            (page)="onPageChange($event)"
                            showFirstLastButtons
                        ></mat-paginator>
                    </div>

                    <!-- Loading spinner -->
                    <div class="loading-container" *ngIf="isLoading">
                        <mat-spinner></mat-spinner>
                        <p>Cargando jugadores...</p>
                    </div>
                </mat-card-content>
            </mat-card>
        </div>
    `,
    styles: [
        `
            .jugadores-container {
                padding: 24px;
                max-width: 1200px;
                margin: 0 auto;
            }

            .header-card {
                margin-bottom: 24px;
            }

            .stats-overview {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 16px;
                margin-bottom: 24px;
            }

            .stat-card .mat-card-content {
                text-align: center;
                padding: 20px;
            }

            .stat-value {
                font-size: 2.5rem;
                font-weight: bold;
                color: #4caf50;
                margin-bottom: 8px;
            }

            .stat-label {
                font-size: 0.875rem;
                color: #757575;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .table-card {
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }

            .table-container {
                overflow-x: auto;
            }

            .w-100 {
                width: 100%;
            }

            .player-icon {
                margin-right: 8px;
                color: #4caf50;
            }

            .stat-badge {
                display: inline-block;
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 0.875rem;
                font-weight: bold;
                color: white;
                min-width: 24px;
                text-align: center;
            }

            .stat-badge.goals {
                background-color: #4caf50;
            }

            .stat-badge.assists {
                background-color: #2196f3;
            }

            .card {
                display: inline-block;
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 0.75rem;
                font-weight: bold;
                color: white;
                min-width: 20px;
                text-align: center;
            }

            .card.yellow {
                background-color: #ffc107;
            }

            .card.red {
                background-color: #f44336;
            }

            .search-field {
                min-width: 300px;
            }

            .d-flex {
                display: flex;
            }

            .justify-content-between {
                justify-content: space-between;
            }

            .align-items-center {
                align-items: center;
            }

            .gap-2 {
                gap: 8px;
            }

            .loading-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 48px;
                text-align: center;
            }

            .loading-container mat-spinner {
                margin-bottom: 16px;
            }

            /* Responsive */
            @media (max-width: 768px) {
                .jugadores-container {
                    padding: 16px;
                }

                .stats-overview {
                    grid-template-columns: 1fr;
                }

                .search-field {
                    min-width: 200px;
                }

                .d-flex {
                    flex-direction: column;
                    gap: 16px;
                }
            }
        `,
    ],
})
export class JugadoresComponent implements OnInit {
    dataSource: StatisticsIndividual[] = [];
    displayedColumns = ['name', 'goals', 'assists', 'minutes', 'yellowCards', 'redCards', 'actions'];
    totalItems = 0;
    totalJugadores = 0;
    totalGoles = 0;
    promedioAsistencias = 0;
    isLoading = false;

    filter: StatisticsFilter = {
        page: 1,
        pageSize: 10,
        search: '',
        sortBy: 'player_name',
        sortDirection: 'asc',
    };

    constructor(
        private statisticsService: StatisticsService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar
    ) {}

    ngOnInit() {
        this.loadJugadores();
    }

    loadJugadores() {
        this.isLoading = true;
        this.statisticsService.getAllPlayersStatistics(this.filter).subscribe({
            next: (response: any) => {
                console.log('Datos de jugadores recibidos del backend:', response);
                // Si la respuesta es un array directo (no paginada)
                if (Array.isArray(response)) {
                    this.dataSource = response;
                    this.totalItems = response.length;
                } else if (response && response.data && response.meta) {
                    // Si la respuesta es paginada
                    this.dataSource = response.data;
                    this.totalItems = response.meta.pagination.count;
                } else {
                    // Fallback: intentar mostrar lo que venga
                    this.dataSource = response.data || response || [];
                    this.totalItems = this.dataSource.length;
                }
                this.calculateStats();
                this.isLoading = false;
            },
            error: (error: any) => {
                console.error('Error cargando jugadores:', error);
                this.isLoading = false;
                this.snackBar.open('Error al cargar los jugadores', 'Cerrar', {
                    duration: 3000
                });
            },
        });
    }

    calculateStats() {
        this.totalJugadores = this.dataSource.length;
        this.totalGoles = this.dataSource.reduce((sum, jugador) => sum + jugador.goals, 0);
        const totalAsistencias = this.dataSource.reduce((sum, jugador) => sum + jugador.assists, 0);
        this.promedioAsistencias = this.totalJugadores > 0 ? totalAsistencias / this.totalJugadores : 0;
    }

    onSearchChange(search: string) {
        this.filter.search = search;
        this.filter.page = 1;
        this.loadJugadores();
    }

    onPageChange(event: any) {
        this.filter.page = event.pageIndex + 1;
        this.filter.pageSize = event.pageSize;
        this.loadJugadores();
    }

    createJugador() {
        const dialogRef = this.dialog.open(JugadorFormComponent, {
            width: '600px',
            data: {}
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.loadJugadores();
                this.snackBar.open('Jugador creado exitosamente', 'Cerrar', {
                    duration: 3000
                });
            }
        });
    }

    editJugador(jugador: StatisticsIndividual) {
        const dialogRef = this.dialog.open(JugadorFormComponent, {
            width: '600px',
            data: { jugador }
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.loadJugadores();
                this.snackBar.open('Jugador actualizado exitosamente', 'Cerrar', {
                    duration: 3000
                });
            }
        });
    }

    deleteJugador(jugador: StatisticsIndividual) {
        if (confirm(`¿Está seguro de que desea eliminar al jugador "${jugador.player_name}"?`)) {
            this.statisticsService.deletePlayerStatistics(jugador.id).subscribe({
                next: () => {
                    this.loadJugadores();
                    this.snackBar.open('Jugador eliminado exitosamente', 'Cerrar', {
                        duration: 3000
                    });
                },
                error: (error: any) => {
                    this.snackBar.open('Error al eliminar el jugador', 'Cerrar', {
                        duration: 3000
                    });
                    console.error('Error:', error);
                }
            });
        }
    }
}
