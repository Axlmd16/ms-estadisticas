import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { StatisticsService } from '../../../../../core/services/statistics/statistics.service';
import { StatisticsSeason } from '../../../../../core/models/statistics';
import { TemporadaFormComponent } from '../temporada-form/temporada-form.component';

@Component({
    selector: 'app-temporada-detalle',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatIconModule,
        MatButtonModule,
        MatTabsModule,
        MatProgressSpinnerModule,
    ],
    template: `
        <div class="temporada-detail-container" *ngIf="!isLoading && temporada">
            <!-- Encabezado -->
            <mat-card class="header-card">
                <mat-card-header>
                    <div mat-card-avatar class="season-avatar">
                        <mat-icon>calendar_month</mat-icon>
                    </div>
                    <mat-card-title>{{ temporada.season.name || 'Temporada' }}</mat-card-title>
                    <mat-card-subtitle>
                        Estadísticas detalladas de la temporada
                    </mat-card-subtitle>
                </mat-card-header>
                <mat-card-actions>
                    <button mat-raised-button color="primary" (click)="editTemporada()">
                        <mat-icon>edit</mat-icon>
                        Editar
                    </button>
                    <button mat-raised-button color="warn" (click)="deleteTemporada()">
                        <mat-icon>delete</mat-icon>
                        Eliminar
                    </button>
                </mat-card-actions>
            </mat-card>

            <!-- Estadísticas principales -->
            <div class="stats-grid">
                <mat-card class="stat-card">
                    <mat-card-content>
                        <div class="stat-icon">
                            <mat-icon>sports_soccer</mat-icon>
                        </div>
                        <div class="stat-info">
                            <div class="stat-value">{{ temporada.total_matches }}</div>
                            <div class="stat-label">Total de Partidos</div>
                        </div>
                    </mat-card-content>
                </mat-card>

                <mat-card class="stat-card">
                    <mat-card-content>
                        <div class="stat-icon">
                            <mat-icon>sports_score</mat-icon>
                        </div>
                        <div class="stat-info">
                            <div class="stat-value">{{ temporada.total_goals }}</div>
                            <div class="stat-label">Total de Goles</div>
                        </div>
                    </mat-card-content>
                </mat-card>

                <mat-card class="stat-card">
                    <mat-card-content>
                        <div class="stat-icon">
                            <mat-icon>trending_up</mat-icon>
                        </div>
                        <div class="stat-info">
                            <div class="stat-value">{{ temporada.goals_per_match | number:'1.2-2' }}</div>
                            <div class="stat-label">Promedio Goles/Partido</div>
                        </div>
                    </mat-card-content>
                </mat-card>
            </div>

            <!-- Información detallada -->
            <mat-tab-group>
                <mat-tab label="Información General">
                    <div class="tab-content">
                        <mat-card>
                            <mat-card-header>
                                <mat-card-title>Datos de la Temporada</mat-card-title>
                            </mat-card-header>
                            <mat-card-content>
                                <div class="info-grid">
                                    <div class="info-item">
                                        <strong>Nombre:</strong>
                                        <span>{{ temporada.season.name || 'N/A' }}</span>
                                    </div>
                                    <div class="info-item">
                                        <strong>Fecha de Inicio:</strong>
                                        <span>{{ temporada.season.start_date | date:'medium' }}</span>
                                    </div>
                                    <div class="info-item">
                                        <strong>Fecha de Fin:</strong>
                                        <span>{{ temporada.season.end_date | date:'medium' }}</span>
                                    </div>
                                    <div class="info-item">
                                        <strong>Mayor Victoria:</strong>
                                        <span>{{ temporada.biggest_win || 'N/A' }}</span>
                                    </div>
                                    <div class="info-item">
                                        <strong>Mayor Derrota:</strong>
                                        <span>{{ temporada.biggest_loss || 'N/A' }}</span>
                                    </div>
                                </div>
                            </mat-card-content>
                        </mat-card>
                    </div>
                </mat-tab>

                <mat-tab label="Estadísticas">
                    <div class="tab-content">
                        <mat-card>
                            <mat-card-header>
                                <mat-card-title>Métricas de Rendimiento</mat-card-title>
                            </mat-card-header>
                            <mat-card-content>
                                <div class="metrics-grid">
                                    <div class="metric-item">
                                        <div class="metric-value">{{ temporada.total_matches }}</div>
                                        <div class="metric-label">Partidos Totales</div>
                                    </div>
                                    <div class="metric-item">
                                        <div class="metric-value">{{ temporada.total_goals }}</div>
                                        <div class="metric-label">Goles Totales</div>
                                    </div>
                                    <div class="metric-item">
                                        <div class="metric-value">{{ temporada.goals_per_match | number:'1.2-2' }}</div>
                                        <div class="metric-label">Goles por Partido</div>
                                    </div>
                                </div>
                            </mat-card-content>
                        </mat-card>
                    </div>
                </mat-tab>
            </mat-tab-group>
        </div>

        <!-- Loading spinner -->
        <div class="loading-container" *ngIf="isLoading">
            <mat-spinner></mat-spinner>
            <p>Cargando información de la temporada...</p>
        </div>

        <!-- Error message -->
        <div class="error-container" *ngIf="error">
            <mat-card>
                <mat-card-content>
                    <div class="error-content">
                        <mat-icon color="warn">error</mat-icon>
                        <h3>Error al cargar la información</h3>
                        <p>{{ error }}</p>
                        <button mat-raised-button color="primary" (click)="loadTemporadaStatistics(temporadaId)">
                            Reintentar
                        </button>
                    </div>
                </mat-card-content>
            </mat-card>
        </div>
    `,
    styles: [
        `
            .temporada-detail-container {
                padding: 24px;
                max-width: 1200px;
                margin: 0 auto;
            }

            .header-card {
                margin-bottom: 24px;
            }

            .season-avatar {
                background-color: #2196f3;
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 16px;
                margin-bottom: 24px;
            }

            .stat-card .mat-card-content {
                display: flex;
                align-items: center;
                gap: 16px;
            }

            .stat-icon {
                background-color: #e3f2fd;
                border-radius: 50%;
                width: 48px;
                height: 48px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #1976d2;
            }

            .stat-value {
                font-size: 2rem;
                font-weight: bold;
                color: #1976d2;
            }

            .stat-label {
                font-size: 0.875rem;
                color: #757575;
            }

            .tab-content {
                padding: 24px 0;
            }

            .info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 16px;
            }

            .info-item {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid #e0e0e0;
            }

            .metrics-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 24px;
                text-align: center;
            }

            .metric-item {
                padding: 16px;
                border-radius: 8px;
                background-color: #f5f5f5;
            }

            .metric-value {
                font-size: 2.5rem;
                font-weight: bold;
                color: #2196f3;
            }

            .metric-label {
                font-size: 1rem;
                color: #757575;
                margin-top: 8px;
            }

            .loading-container,
            .error-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 300px;
                text-align: center;
            }

            .error-content {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 16px;
            }

            /* Responsive */
            @media (max-width: 768px) {
                .temporada-detail-container {
                    padding: 16px;
                }

                .stats-grid {
                    grid-template-columns: 1fr;
                }

                .info-grid {
                    grid-template-columns: 1fr;
                }
            }
        `,
    ],
})
export class TemporadaDetalleComponent implements OnInit {
    temporada?: StatisticsSeason;
    isLoading = false;
    error: string | null = null;
    temporadaId: string = '';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private statisticsService: StatisticsService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar
    ) {}

    ngOnInit() {
        this.route.params.subscribe((params) => {
            if (params['id']) {
                this.temporadaId = params['id'];
                this.loadTemporadaStatistics(this.temporadaId);
            }
        });
    }

    loadTemporadaStatistics(temporadaId: string) {
        this.isLoading = true;
        this.error = null;

        this.statisticsService.getSeasonStatistics(temporadaId).subscribe({
            next: (temporada) => {
                this.temporada = temporada;
                this.isLoading = false;
            },
            error: (error) => {
                this.error = error.message || 'Error al cargar las estadísticas de la temporada';
                this.isLoading = false;
            },
        });
    }

    editTemporada() {
        const dialogRef = this.dialog.open(TemporadaFormComponent, {
            width: '600px',
            data: { temporada: this.temporada },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.loadTemporadaStatistics(this.temporadaId);
            }
        });
    }

    deleteTemporada() {
        if (confirm('¿Está seguro de que desea eliminar esta temporada?')) {
            this.statisticsService.deleteSeasonStatistics(this.temporadaId).subscribe({
                next: () => {
                    this.snackBar.open('Temporada eliminada exitosamente', 'Cerrar', {
                        duration: 3000,
                    });
                    this.router.navigate(['/estadisticas/temporadas']);
                },
                error: (error) => {
                    this.snackBar.open('Error al eliminar la temporada', 'Cerrar', {
                        duration: 3000,
                    });
                    console.error('Error:', error);
                },
            });
        }
    }
}
