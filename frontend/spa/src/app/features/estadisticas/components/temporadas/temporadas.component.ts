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
    StatisticsSeason,
    StatisticsFilter,
} from '../../../../core/models/statistics';
import { ApiPaginationResponse } from '../../../../core/models/api-response';
import { TemporadaFormComponent } from './temporada-form/temporada-form.component';

@Component({
    selector: 'app-temporadas',
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
        <div class="temporadas-container">
            <!-- Encabezado -->
            <mat-card class="header-card">
                <mat-card-header>
                    <mat-card-title>Estadísticas de Temporadas</mat-card-title>
                    <mat-card-subtitle>
                        Visualiza y analiza el rendimiento por temporada
                    </mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                    <div class="d-flex justify-content-between align-items-center">
                        <!-- Filtros -->
                        <mat-form-field appearance="outline" class="search-field">
                            <mat-label>Buscar temporada</mat-label>
                            <input
                                matInput
                                [ngModel]="filter.search"
                                (ngModelChange)="onSearchChange($event)"
                                placeholder="Nombre de la temporada..."
                            />
                            <mat-icon matSuffix>search</mat-icon>
                        </mat-form-field>

                        <!-- Botones de acción -->
                        <div class="d-flex gap-2">
                            <button
                                mat-raised-button
                                color="primary"
                                (click)="createTemporada()"
                            >
                                <mat-icon>add</mat-icon>
                                Nueva Temporada
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
                        <div class="stat-value">{{ totalTemporadas }}</div>
                        <div class="stat-label">Total Temporadas</div>
                    </mat-card-content>
                </mat-card>

                <mat-card class="stat-card">
                    <mat-card-content>
                        <div class="stat-value">{{ totalPartidos }}</div>
                        <div class="stat-label">Total Partidos</div>
                    </mat-card-content>
                </mat-card>

                <mat-card class="stat-card">
                    <mat-card-content>
                        <div class="stat-value">{{ promedioGoles | number:'1.2-2' }}</div>
                        <div class="stat-label">Promedio Goles</div>
                    </mat-card-content>
                </mat-card>
            </div>

            <!-- Tabla de estadísticas -->
            <mat-card class="table-card">
                <mat-card-content>
                    <div class="table-container" *ngIf="!isLoading">
                        <table mat-table [dataSource]="dataSource" matSort class="w-100">
                            <!-- Columna Temporada -->
                            <ng-container matColumnDef="name">
                                <th mat-header-cell *matHeaderCellDef mat-sort-header>
                                    Temporada
                                </th>
                                <td mat-cell *matCellDef="let temporada">
                                    <div class="d-flex align-items-center">
                                        <mat-icon class="season-icon">calendar_month</mat-icon>
                                        {{ temporada.season?.name || 'N/A' }}
                                    </div>
                                </td>
                            </ng-container>

                            <!-- Columna Total Partidos -->
                            <ng-container matColumnDef="totalGames">
                                <th mat-header-cell *matHeaderCellDef mat-sort-header>
                                    Total Partidos
                                </th>
                                <td mat-cell *matCellDef="let temporada">
                                    {{ temporada.total_matches }}
                                </td>
                            </ng-container>

                            <!-- Columna Total Goles -->
                            <ng-container matColumnDef="totalGoals">
                                <th mat-header-cell *matHeaderCellDef mat-sort-header>
                                    Total Goles
                                </th>
                                <td mat-cell *matCellDef="let temporada">
                                    {{ temporada.total_goals }}
                                </td>
                            </ng-container>

                            <!-- Columna Promedio Goles -->
                            <ng-container matColumnDef="avgGoalsPerGame">
                                <th mat-header-cell *matHeaderCellDef mat-sort-header>
                                    Promedio Goles
                                </th>
                                <td mat-cell *matCellDef="let temporada">
                                    {{ temporada.goals_per_match | number:'1.2-2' }}
                                </td>
                            </ng-container>

                            <!-- Columna Fechas -->
                            <ng-container matColumnDef="dates">
                                <th mat-header-cell *matHeaderCellDef>
                                    Periodo
                                </th>
                                <td mat-cell *matCellDef="let temporada">
                                    <div class="date-info">
                                        <div>{{ temporada.season.start_date | date:'shortDate' }}</div>
                                        <div class="text-muted">{{ temporada.season.end_date | date:'shortDate' }}</div>
                                    </div>
                                </td>
                            </ng-container>

                            <!-- Columna Acciones -->
                            <ng-container matColumnDef="actions">
                                <th mat-header-cell *matHeaderCellDef>
                                    Acciones
                                </th>
                                <td mat-cell *matCellDef="let temporada">
                                    <button
                                        mat-icon-button
                                        color="primary"
                                        [routerLink]="['/estadisticas/temporadas', temporada.id]"
                                        matTooltip="Ver detalles"
                                    >
                                        <mat-icon>visibility</mat-icon>
                                    </button>
                                    <button
                                        mat-icon-button
                                        color="accent"
                                        (click)="editTemporada(temporada)"
                                        matTooltip="Editar"
                                    >
                                        <mat-icon>edit</mat-icon>
                                    </button>
                                    <button
                                        mat-icon-button
                                        color="warn"
                                        (click)="deleteTemporada(temporada)"
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
                        <p>Cargando temporadas...</p>
                    </div>
                </mat-card-content>
            </mat-card>
        </div>
    `,
    styles: [
        `
            .temporadas-container {
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
                color: #2196f3;
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

            .season-icon {
                margin-right: 8px;
                color: #2196f3;
            }

            .date-info {
                font-size: 0.875rem;
            }

            .text-muted {
                color: #757575;
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
                .temporadas-container {
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
export class TemporadasComponent implements OnInit {
    dataSource: StatisticsSeason[] = [];
    displayedColumns = ['name', 'totalGames', 'totalGoals', 'avgGoalsPerGame', 'dates', 'actions'];
    totalItems = 0;
    totalTemporadas = 0;
    totalPartidos = 0;
    promedioGoles = 0;
    isLoading = false;

    filter: StatisticsFilter = {
        page: 1,
        pageSize: 10,
        search: '',
        sortBy: 'name',
        sortDirection: 'asc',
    };

    constructor(
        private statisticsService: StatisticsService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar
    ) {}

    ngOnInit() {
        this.loadTemporadas();
    }

    loadTemporadas() {
        this.isLoading = true;
        this.statisticsService.getAllSeasonsStatistics(this.filter).subscribe({
            next: (response: any) => {
                console.log('Datos de temporadas recibidos del backend:', response);
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
                console.error('Error cargando temporadas:', error);
                this.isLoading = false;
                this.snackBar.open('Error al cargar las temporadas', 'Cerrar', {
                    duration: 3000
                });
            },
        });
    }

    calculateStats() {
        this.totalTemporadas = this.dataSource.length;
        this.totalPartidos = this.dataSource.reduce((sum, temporada) => sum + temporada.total_matches, 0);
        const totalGoles = this.dataSource.reduce((sum, temporada) => sum + temporada.total_goals, 0);
        this.promedioGoles = this.totalPartidos > 0 ? totalGoles / this.totalPartidos : 0;
    }

    onSearchChange(search: string) {
        this.filter.search = search;
        this.filter.page = 1;
        this.loadTemporadas();
    }

    onPageChange(event: any) {
        this.filter.page = event.pageIndex + 1;
        this.filter.pageSize = event.pageSize;
        this.loadTemporadas();
    }

    createTemporada() {
        const dialogRef = this.dialog.open(TemporadaFormComponent, {
            width: '600px',
            data: {}
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.loadTemporadas();
                this.snackBar.open('Temporada creada exitosamente', 'Cerrar', {
                    duration: 3000
                });
            }
        });
    }

    editTemporada(temporada: StatisticsSeason) {
        const dialogRef = this.dialog.open(TemporadaFormComponent, {
            width: '600px',
            data: { temporada }
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.loadTemporadas();
                this.snackBar.open('Temporada actualizada exitosamente', 'Cerrar', {
                    duration: 3000
                });
            }
        });
    }

    deleteTemporada(temporada: StatisticsSeason) {
        const nombreTemporada = temporada.season?.name || 'esta temporada';
        if (confirm(`¿Está seguro de que desea eliminar "${nombreTemporada}"?`)) {
            this.statisticsService.deleteSeasonStatistics(temporada.id).subscribe({
                next: () => {
                    this.loadTemporadas();
                    this.snackBar.open('Temporada eliminada exitosamente', 'Cerrar', {
                        duration: 3000
                    });
                },
                error: (error) => {
                    this.snackBar.open('Error al eliminar la temporada', 'Cerrar', {
                        duration: 3000
                    });
                    console.error('Error:', error);
                }
            });
        }
    }
}
