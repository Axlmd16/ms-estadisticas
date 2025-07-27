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
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';

import { StatisticsService } from '../../../../core/services/statistics/statistics.service';
import {
    StatisticsCompetence,
    StatisticsFilter,
    TableRating,
} from '../../../../core/models/statistics';
import { ApiPaginationResponse } from '../../../../core/models/api-response';
import { CompetenciaFormComponent } from './competencia-form/competencia-form.component';

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
        MatProgressSpinnerModule,
        MatTabsModule,
        FormsModule,
    ],
    template: `
        <div class="competencias-container">
            <!-- Encabezado -->
            <mat-card class="header-card">
                <mat-card-header>
                    <mat-card-title>Estadísticas de Competencias</mat-card-title>
                    <mat-card-subtitle>
                        Visualiza y analiza el rendimiento de las competencias
                    </mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                    <div class="d-flex justify-content-between align-items-center">
                        <!-- Filtros -->
                        <mat-form-field appearance="outline" class="search-field">
                            <mat-label>Buscar competencia</mat-label>
                            <input
                                matInput
                                [ngModel]="filter.search"
                                (ngModelChange)="onSearchChange($event)"
                                placeholder="Nombre de la competencia..."
                            />
                            <mat-icon matSuffix>search</mat-icon>
                        </mat-form-field>

                        <!-- Botones de acción -->
                        <div class="d-flex gap-2">
                            <button
                                mat-raised-button
                                color="primary"
                                (click)="createCompetencia()"
                            >
                                <mat-icon>add</mat-icon>
                                Nueva Competencia
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
                        <div class="stat-value">{{ totalCompetencias }}</div>
                        <div class="stat-label">Total Competencias</div>
                    </mat-card-content>
                </mat-card>

                <mat-card class="stat-card">
                    <mat-card-content>
                        <div class="stat-value">{{ totalEquipos }}</div>
                        <div class="stat-label">Total Equipos</div>
                    </mat-card-content>
                </mat-card>

                <mat-card class="stat-card">
                    <mat-card-content>
                        <div class="stat-value">{{ promedioGoles | number:'1.2-2' }}</div>
                        <div class="stat-label">Promedio Goles/Partido</div>
                    </mat-card-content>
                </mat-card>
            </div>

            <!-- Pestañas de contenido -->
            <mat-tab-group>
                <mat-tab label="Competencias">
                    <div class="tab-content">
                        <mat-card class="table-card">
                            <mat-card-content>
                                <div class="table-container" *ngIf="!isLoading">
                                    <table mat-table [dataSource]="dataSource" matSort class="w-100">
                                        <!-- Columna Competencia -->
                                        <ng-container matColumnDef="name">
                                            <th mat-header-cell *matHeaderCellDef mat-sort-header>
                                                Competencia
                                            </th>
                                            <td mat-cell *matCellDef="let competencia">
                                                <div class="d-flex align-items-center">
                                                    <mat-icon class="competition-icon">emoji_events</mat-icon>
                                                    {{ competencia.name || competencia.competition_name }}
                                                </div>
                                            </td>
                                        </ng-container>

                                        <!-- Columna Equipos -->
                                        <ng-container matColumnDef="teams">
                                            <th mat-header-cell *matHeaderCellDef mat-sort-header>
                                                Equipos
                                            </th>
                                            <td mat-cell *matCellDef="let competencia">
                                                <span class="team-count">{{ competencia.id_team?.length || competencia.total_teams || 0 }}</span>
                                            </td>
                                        </ng-container>

                                        <!-- Columna Fecha Inicio -->
                                        <ng-container matColumnDef="startDate">
                                            <th mat-header-cell *matHeaderCellDef mat-sort-header>
                                                Fecha Inicio
                                            </th>
                                            <td mat-cell *matCellDef="let competencia">
                                                {{ competencia.start_date | date:'shortDate' }}
                                            </td>
                                        </ng-container>

                                        <!-- Columna Fecha Fin -->
                                        <ng-container matColumnDef="endDate">
                                            <th mat-header-cell *matHeaderCellDef mat-sort-header>
                                                Fecha Fin
                                            </th>
                                            <td mat-cell *matCellDef="let competencia">
                                                {{ competencia.end_date | date:'shortDate' }}
                                            </td>
                                        </ng-container>

                                        <!-- Columna Acciones -->
                                        <ng-container matColumnDef="actions">
                                            <th mat-header-cell *matHeaderCellDef>
                                                Acciones
                                            </th>
                                            <td mat-cell *matCellDef="let competencia">
                                                <button
                                                    mat-icon-button
                                                    color="primary"
                                                    [routerLink]="['/estadisticas/competencias', competencia._id || competencia.id]"
                                                    matTooltip="Ver detalles"
                                                >
                                                    <mat-icon>visibility</mat-icon>
                                                </button>
                                                <button
                                                    mat-icon-button
                                                    color="accent"
                                                    (click)="editCompetencia(competencia)"
                                                    matTooltip="Editar"
                                                >
                                                    <mat-icon>edit</mat-icon>
                                                </button>
                                                <button
                                                    mat-icon-button
                                                    color="warn"
                                                    (click)="deleteCompetencia(competencia)"
                                                    matTooltip="Eliminar"
                                                >
                                                    <mat-icon>delete</mat-icon>
                                                </button>
                                                <button
                                                    mat-icon-button
                                                    color="primary"
                                                    (click)="viewTableRating(competencia)"
                                                    matTooltip="Ver tabla de posiciones"
                                                >
                                                    <mat-icon>table_view</mat-icon>
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
                                    <p>Cargando competencias...</p>
                                </div>
                            </mat-card-content>
                        </mat-card>
                    </div>
                </mat-tab>

                <mat-tab label="Tabla de Posiciones" *ngIf="selectedCompetencia">
                    <div class="tab-content">
                        <mat-card>
                            <mat-card-header>
                                <mat-card-title>{{ selectedCompetencia.name || selectedCompetencia.competition_name }}</mat-card-title>
                                <mat-card-subtitle>Tabla de posiciones actual</mat-card-subtitle>
                            </mat-card-header>
                            <mat-card-content>
                                <div *ngIf="tableRatings.length > 0; else noTableData">
                                    <table mat-table [dataSource]="tableRatings" class="standings-table">
                                        <ng-container matColumnDef="position">
                                            <th mat-header-cell *matHeaderCellDef>Pos.</th>
                                            <td mat-cell *matCellDef="let element">{{ element.position }}</td>
                                        </ng-container>

                                        <ng-container matColumnDef="team">
                                            <th mat-header-cell *matHeaderCellDef>Equipo</th>
                                            <td mat-cell *matCellDef="let element">{{ element.team?.name || 'N/A' }}</td>
                                        </ng-container>

                                        <ng-container matColumnDef="points">
                                            <th mat-header-cell *matHeaderCellDef>Pts</th>
                                            <td mat-cell *matCellDef="let element">{{ element.points }}</td>
                                        </ng-container>

                                        <ng-container matColumnDef="played">
                                            <th mat-header-cell *matHeaderCellDef>PJ</th>
                                            <td mat-cell *matCellDef="let element">{{ element.matches_played }}</td>
                                        </ng-container>

                                        <ng-container matColumnDef="won">
                                            <th mat-header-cell *matHeaderCellDef>PG</th>
                                            <td mat-cell *matCellDef="let element">{{ element.matches_won }}</td>
                                        </ng-container>

                                        <ng-container matColumnDef="drawn">
                                            <th mat-header-cell *matHeaderCellDef>PE</th>
                                            <td mat-cell *matCellDef="let element">{{ element.matches_drawn }}</td>
                                        </ng-container>

                                        <ng-container matColumnDef="lost">
                                            <th mat-header-cell *matHeaderCellDef>PP</th>
                                            <td mat-cell *matCellDef="let element">{{ element.matches_lost }}</td>
                                        </ng-container>

                                        <ng-container matColumnDef="goalsFor">
                                            <th mat-header-cell *matHeaderCellDef>GF</th>
                                            <td mat-cell *matCellDef="let element">{{ element.goals_for }}</td>
                                        </ng-container>

                                        <ng-container matColumnDef="goalsAgainst">
                                            <th mat-header-cell *matHeaderCellDef>GC</th>
                                            <td mat-cell *matCellDef="let element">{{ element.goals_against }}</td>
                                        </ng-container>

                                        <ng-container matColumnDef="goalDiff">
                                            <th mat-header-cell *matHeaderCellDef>DG</th>
                                            <td mat-cell *matCellDef="let element">
                                                {{ (element.goals_for || 0) - (element.goals_against || 0) }}
                                            </td>
                                        </ng-container>

                                        <tr mat-header-row *matHeaderRowDef="standingsColumns"></tr>
                                        <tr mat-row *matRowDef="let row; columns: standingsColumns;"></tr>
                                    </table>
                                </div>
                                <ng-template #noTableData>
                                    <div class="no-data">
                                        <mat-icon>table_view</mat-icon>
                                        <p>No hay datos de tabla de posiciones disponibles</p>
                                    </div>
                                </ng-template>
                            </mat-card-content>
                        </mat-card>
                    </div>
                </mat-tab>
            </mat-tab-group>
        </div>
    `,
    styles: [
        `
            .competencias-container {
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
                color: #ff9800;
                margin-bottom: 8px;
            }

            .stat-label {
                font-size: 0.875rem;
                color: #757575;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .tab-content {
                padding-top: 24px;
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

            .competition-icon {
                margin-right: 8px;
                color: #ff9800;
            }

            .team-count {
                display: inline-block;
                background-color: #e3f2fd;
                color: #1976d2;
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 0.875rem;
                font-weight: bold;
                min-width: 24px;
                text-align: center;
            }

            .standings-table {
                width: 100%;
                margin-top: 16px;
            }

            .no-data {
                text-align: center;
                padding: 48px;
                color: #757575;
            }

            .no-data mat-icon {
                font-size: 48px;
                width: 48px;
                height: 48px;
                margin-bottom: 16px;
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
                .competencias-container {
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
export class CompetenciasComponent implements OnInit {
    dataSource: any[] = [];
    displayedColumns = ['name', 'teams', 'startDate', 'endDate', 'actions'];
    standingsColumns = ['position', 'team', 'points', 'played', 'won', 'drawn', 'lost', 'goalsFor', 'goalsAgainst', 'goalDiff'];
    
    totalItems = 0;
    totalCompetencias = 0;
    totalEquipos = 0;
    promedioGoles = 0;
    isLoading = false;
    
    selectedCompetencia?: any;
    tableRatings: TableRating[] = [];

    filter: StatisticsFilter = {
        page: 1,
        pageSize: 10,
        search: '',
        sortBy: 'competition_name',
        sortDirection: 'asc',
    };

    constructor(
        private statisticsService: StatisticsService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar
    ) {}

    ngOnInit() {
        this.loadCompetencias();
    }

    loadCompetencias() {
        this.isLoading = true;
        this.statisticsService.getAllCompetitionsStatistics(this.filter).subscribe({
            next: (response: any) => {
                console.log('Datos de competencias recibidos del backend:', response);
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
                console.error('Error cargando competencias:', error);
                this.isLoading = false;
                this.snackBar.open('Error al cargar las competencias', 'Cerrar', {
                    duration: 3000
                });
            },
        });
    }

    calculateStats() {
        this.totalCompetencias = this.dataSource.length;
        this.totalEquipos = this.dataSource.reduce((sum, comp) => sum + (comp.id_team?.length || comp.total_teams || 0), 0);
        const totalPartidos = this.dataSource.reduce((sum, comp) => sum + (comp.total_matches || 0), 0);
        const totalGoles = this.dataSource.reduce((sum, comp) => sum + (comp.total_goals || 0), 0);
        this.promedioGoles = totalPartidos > 0 ? totalGoles / totalPartidos : 0;
    }

    onSearchChange(search: string) {
        this.filter.search = search;
        this.filter.page = 1;
        this.loadCompetencias();
    }

    onPageChange(event: any) {
        this.filter.page = event.pageIndex + 1;
        this.filter.pageSize = event.pageSize;
        this.loadCompetencias();
    }

    createCompetencia() {
        const dialogRef = this.dialog.open(CompetenciaFormComponent, {
            width: '600px',
            data: {}
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.loadCompetencias();
                this.snackBar.open('Competencia creada exitosamente', 'Cerrar', {
                    duration: 3000
                });
            }
        });
    }

    editCompetencia(competencia: any) {
        const dialogRef = this.dialog.open(CompetenciaFormComponent, {
            width: '600px',
            data: { competencia }
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.loadCompetencias();
                this.snackBar.open('Competencia actualizada exitosamente', 'Cerrar', {
                    duration: 3000
                });
            }
        });
    }

    deleteCompetencia(competencia: any) {
        if (confirm(`¿Está seguro de que desea eliminar la competencia "${competencia.name || competencia.competition_name}"?`)) {
            this.statisticsService.deleteCompetition(competencia._id || competencia.id).subscribe({
                next: () => {
                    this.loadCompetencias();
                    this.snackBar.open('Competencia eliminada exitosamente', 'Cerrar', {
                        duration: 3000
                    });
                },
                error: (error: any) => {
                    this.snackBar.open('Error al eliminar la competencia', 'Cerrar', {
                        duration: 3000
                    });
                    console.error('Error:', error);
                }
            });
        }
    }

    viewTableRating(competencia: any) {
        this.selectedCompetencia = competencia;
        this.statisticsService.getTableRating(competencia._id || competencia.id).subscribe({
            next: (response: any) => {
                console.log('Datos de tabla de posiciones recibidos del backend:', response);
                // Si la respuesta es un array directo (no paginada)
                if (Array.isArray(response)) {
                    this.tableRatings = response;
                } else if (response && response.data) {
                    // Si la respuesta es paginada
                    this.tableRatings = response.data;
                } else {
                    // Fallback
                    this.tableRatings = [];
                }
            },
            error: (error: any) => {
                console.error('Error cargando tabla de posiciones:', error);
                this.snackBar.open('Error al cargar la tabla de posiciones', 'Cerrar', {
                    duration: 3000
                });
            }
        });
    }
}
