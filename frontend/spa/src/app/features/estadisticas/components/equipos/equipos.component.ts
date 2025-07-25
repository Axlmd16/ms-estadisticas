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
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { StatisticsService } from '../../../../core/services/statistics/statistics.service';
import {
    StatisticsTeam,
    StatisticsFilter,
} from '../../../../core/models/statistics';
import { ApiPaginationResponse } from '../../../../core/models/api-response';
import { EquipoFormComponent } from './equipo-form/equipo-form.component';

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

                        <!-- Botones de acción -->
                        <div class="d-flex gap-2">
                            <button
                                mat-raised-button
                                color="primary"
                                (click)="createEquipo()"
                            >
                                <mat-icon>add</mat-icon>
                                Nuevo Equipo
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
                                        {{ team.name }}
                                    </div>
                                </td>
                            </ng-container>

                            <!-- Columna Descripción -->
                            <ng-container matColumnDef="description">
                                <th
                                    mat-header-cell
                                    *matHeaderCellDef
                                    mat-sort-header
                                >
                                    Descripción
                                </th>
                                <td mat-cell *matCellDef="let team">
                                    {{ team.description || 'Sin descripción' }}
                                </td>
                            </ng-container>

                            <!-- Columna Fundado -->
                            <ng-container matColumnDef="founded">
                                <th
                                    mat-header-cell
                                    *matHeaderCellDef
                                    mat-sort-header
                                >
                                    Fundado
                                </th>
                                <td mat-cell *matCellDef="let team">
                                    {{ (team.founded | date:'yyyy') || 'No disponible' }}
                                </td>
                            </ng-container>

                            <!-- Columna Atletas -->
                            <ng-container matColumnDef="athletes">
                                <th
                                    mat-header-cell
                                    *matHeaderCellDef
                                    mat-sort-header
                                >
                                    Atletas
                                </th>
                                <td mat-cell *matCellDef="let team">
                                    {{ team.athletes?.length || 0 }}
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
                                            team._id
                                        ]"
                                        matTooltip="Ver detalles"
                                    >
                                        <mat-icon>visibility</mat-icon>
                                    </button>
                                    <button
                                        mat-icon-button
                                        color="accent"
                                        (click)="editEquipo(team)"
                                        matTooltip="Editar"
                                    >
                                        <mat-icon>edit</mat-icon>
                                    </button>
                                    <button
                                        mat-icon-button
                                        color="warn"
                                        (click)="deleteEquipo(team)"
                                        matTooltip="Eliminar"
                                    >
                                        <mat-icon>delete</mat-icon>
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
    dataSource: any[] = [];
    displayedColumns: string[] = [
        'name',
        'description',
        'founded',
        'athletes',
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

    constructor(
        private statisticsService: StatisticsService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar
    ) {}

    ngOnInit() {
        this.loadEstadisticas();
    }

    loadEstadisticas() {
        this.isLoading = true;
        this.statisticsService.getAllTeamsStatistics(this.filter).subscribe({
            next: (response: any) => {
                console.log('Datos de equipos recibidos del backend:', response);
                // Si la respuesta es un array directo (no paginada)
                if (Array.isArray(response)) {
                    this.dataSource = response;
                    this.totalEquipos = response.length;
                } else if (response && response.data && response.meta) {
                    // Si la respuesta es paginada
                    this.dataSource = response.data;
                    this.totalEquipos = response.meta.pagination.count;
                } else {
                    // Fallback: intentar mostrar lo que venga
                    this.dataSource = response.data || response || [];
                    this.totalEquipos = this.dataSource.length;
                }
                this.calcularEstadisticasGenerales();
                this.isLoading = false;
            },
            error: (error: any) => {
                console.error('Error al cargar estadísticas:', error);
                this.isLoading = false;
                this.snackBar.open('Error al cargar los equipos', 'Cerrar', {
                    duration: 3000
                });
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

    createEquipo() {
        const dialogRef = this.dialog.open(EquipoFormComponent, {
            width: '600px',
            data: {}
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.loadEstadisticas();
                this.snackBar.open('Equipo creado exitosamente', 'Cerrar', {
                    duration: 3000
                });
            }
        });
    }

    editEquipo(equipo: StatisticsTeam) {
        const dialogRef = this.dialog.open(EquipoFormComponent, {
            width: '600px',
            data: { equipo }
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.loadEstadisticas();
                this.snackBar.open('Equipo actualizado exitosamente', 'Cerrar', {
                    duration: 3000
                });
            }
        });
    }

    deleteEquipo(equipo: StatisticsTeam) {
        if (confirm(`¿Está seguro de que desea eliminar el equipo "${equipo.name}"?`)) {
            this.statisticsService.deleteTeamStatistics(equipo.id).subscribe({
                next: () => {
                    this.loadEstadisticas();
                    this.snackBar.open('Equipo eliminado exitosamente', 'Cerrar', {
                        duration: 3000
                    });
                },
                error: (error) => {
                    this.snackBar.open('Error al eliminar el equipo', 'Cerrar', {
                        duration: 3000
                    });
                    console.error('Error:', error);
                }
            });
        }
    }
}
