import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';

import { StatisticsService, StatisticsIndividualWithAthlete } from '../../../../../core/services/statistics/statistics.service';

@Component({
    selector: 'app-estadisticas-athlete',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatSnackBarModule,
        MatChipsModule,
        MatDividerModule
    ],
    template: `
        <div class="athlete-stats-container">
            <!-- Header con botón de regreso -->
            <mat-card class="header-card">
                <mat-card-content>
                    <div class="header-actions">
                        <button mat-button (click)="goBack()" class="back-button">
                            <mat-icon>arrow_back</mat-icon>
                            Volver a Atletas
                        </button>
                    </div>
                </mat-card-content>
            </mat-card>

            <!-- Loading -->
            <div class="loading-container" *ngIf="isLoading">
                <mat-spinner></mat-spinner>
                <p>Cargando estadísticas del atleta...</p>
            </div>

            <!-- Contenido principal -->
            <div *ngIf="!isLoading && athleteStatistics">
                <!-- Información del atleta -->
                <mat-card class="athlete-info-card">
                    <mat-card-content>
                        <div class="athlete-header">
                            <div class="athlete-basic-info">
                                <h2 class="athlete-name">
                                    <mat-icon class="player-icon">person</mat-icon>
                                    {{ athleteStatistics.athlete.name }}
                                </h2>
                                <div class="athlete-details">
                                    <mat-chip-set>
                                        <mat-chip *ngIf="athleteStatistics?.athlete?.position">
                                            <mat-icon matChipAvatar>sports_soccer</mat-icon>
                                            {{ athleteStatistics.athlete.position }}
                                        </mat-chip>
                                        <mat-chip *ngIf="athleteStatistics?.athlete?.team_id">
                                            <mat-icon matChipAvatar>group</mat-icon>
                                            Equipo: {{ athleteStatistics.athlete.team_id }}
                                        </mat-chip>
                                    </mat-chip-set>
                                </div>
                            </div>
                        </div>
                    </mat-card-content>
                </mat-card>

                <!-- Estadísticas principales -->
                <div class="stats-grid">
                    <!-- Goles -->
                    <mat-card class="stat-card goals-card">
                        <mat-card-content>
                            <div class="stat-content">
                                <mat-icon class="stat-icon">sports_soccer</mat-icon>
                                <div class="stat-info">
                                    <div class="stat-value">{{ athleteStatistics.goals }}</div>
                                    <div class="stat-label">Goles</div>
                                </div>
                            </div>
                        </mat-card-content>
                    </mat-card>

                    <!-- Asistencias -->
                    <mat-card class="stat-card assists-card">
                        <mat-card-content>
                            <div class="stat-content">
                                <mat-icon class="stat-icon">assist</mat-icon>
                                <div class="stat-info">
                                    <div class="stat-value">{{ athleteStatistics.assists }}</div>
                                    <div class="stat-label">Asistencias</div>
                                </div>
                            </div>
                        </mat-card-content>
                    </mat-card>

                    <!-- Minutos jugados -->
                    <mat-card class="stat-card minutes-card">
                        <mat-card-content>
                            <div class="stat-content">
                                <mat-icon class="stat-icon">schedule</mat-icon>
                                <div class="stat-info">
                                    <div class="stat-value">{{ athleteStatistics.minutes_played }}</div>
                                    <div class="stat-label">Minutos</div>
                                </div>
                            </div>
                        </mat-card-content>
                    </mat-card>

                    <!-- Tarjetas amarillas -->
                    <mat-card class="stat-card yellow-card">
                        <mat-card-content>
                            <div class="stat-content">
                                <mat-icon class="stat-icon yellow">warning</mat-icon>
                                <div class="stat-info">
                                    <div class="stat-value">{{ athleteStatistics.yellow_cards }}</div>
                                    <div class="stat-label">Tarjetas Amarillas</div>
                                </div>
                            </div>
                        </mat-card-content>
                    </mat-card>

                    <!-- Tarjetas rojas -->
                    <mat-card class="stat-card red-card">
                        <mat-card-content>
                            <div class="stat-content">
                                <mat-icon class="stat-icon red">block</mat-icon>
                                <div class="stat-info">
                                    <div class="stat-value">{{ athleteStatistics.red_cards }}</div>
                                    <div class="stat-label">Tarjetas Rojas</div>
                                </div>
                            </div>
                        </mat-card-content>
                    </mat-card>

                    <!-- Partidos jugados -->
                    <mat-card class="stat-card matches-card">
                        <mat-card-content>
                            <div class="stat-content">
                                <mat-icon class="stat-icon">sports</mat-icon>
                                <div class="stat-info">
                                    <div class="stat-value">{{ athleteStatistics.matches_played }}</div>
                                    <div class="stat-label">Partidos</div>
                                </div>
                            </div>
                        </mat-card-content>
                    </mat-card>
                </div>

                <!-- Información adicional -->
                <mat-card class="additional-info-card">
                    <mat-card-content>
                        <h3>Información Adicional</h3>
                        <mat-divider></mat-divider>
                        <div class="info-grid">
                            <div class="info-item">
                                <strong>ID del Atleta:</strong>
                                <span>{{ athleteStatistics.athlete.id || athleteStatistics.athlete._id }}</span>
                            </div>
                            <div class="info-item">
                                <strong>Posición:</strong>
                                <span>{{ athleteStatistics?.athlete?.position || 'No especificada' }}</span>
                            </div>
                            <div class="info-item">
                                <strong>Equipo:</strong>
                                <span>{{ athleteStatistics?.athlete?.team_id || 'No asignado' }}</span>
                            </div>
                        </div>
                    </mat-card-content>
                </mat-card>
            </div>

            <!-- Error state -->
            <div class="error-container" *ngIf="!isLoading && !athleteStatistics">
                <mat-card class="error-card">
                    <mat-card-content>
                        <div class="error-content">
                            <mat-icon class="error-icon">error</mat-icon>
                            <h3>Error al cargar estadísticas</h3>
                            <p>No se pudieron cargar las estadísticas de este atleta.</p>
                            <button mat-raised-button color="primary" (click)="loadAthleteStatistics()">
                                Intentar nuevamente
                            </button>
                        </div>
                    </mat-card-content>
                </mat-card>
            </div>
        </div>
    `,
    styles: [
        `
            .athlete-stats-container {
                padding: 24px;
                max-width: 1200px;
                margin: 0 auto;
            }

            .header-card {
                margin-bottom: 24px;
            }

            .header-actions {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .back-button {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .athlete-info-card {
                margin-bottom: 24px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }

            .athlete-header {
                display: flex;
                align-items: center;
                gap: 24px;
            }

            .athlete-name {
                display: flex;
                align-items: center;
                gap: 12px;
                margin: 0 0 16px 0;
                font-size: 2rem;
                font-weight: 300;
            }

            .player-icon {
                font-size: 2rem;
                width: 2rem;
                height: 2rem;
            }

            .athlete-details {
                margin-top: 16px;
            }

            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 16px;
                margin-bottom: 24px;
            }

            .stat-card {
                transition: transform 0.2s ease, box-shadow 0.2s ease;
            }

            .stat-card:hover {
                transform: translateY(-4px);
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
            }

            .stat-content {
                display: flex;
                align-items: center;
                gap: 16px;
                padding: 8px;
            }

            .stat-icon {
                font-size: 2.5rem;
                width: 2.5rem;
                height: 2.5rem;
                opacity: 0.8;
            }

            .stat-info {
                flex: 1;
            }

            .stat-value {
                font-size: 2.5rem;
                font-weight: bold;
                line-height: 1;
                margin-bottom: 4px;
            }

            .stat-label {
                font-size: 0.875rem;
                color: #757575;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            /* Colores específicos para cada tipo de estadística */
            .goals-card .stat-icon {
                color: #4caf50;
            }

            .goals-card .stat-value {
                color: #4caf50;
            }

            .assists-card .stat-icon {
                color: #2196f3;
            }

            .assists-card .stat-value {
                color: #2196f3;
            }

            .minutes-card .stat-icon {
                color: #ff9800;
            }

            .minutes-card .stat-value {
                color: #ff9800;
            }

            .yellow-card .stat-icon.yellow {
                color: #ffc107;
            }

            .yellow-card .stat-value {
                color: #ffc107;
            }

            .red-card .stat-icon.red {
                color: #f44336;
            }

            .red-card .stat-value {
                color: #f44336;
            }

            .matches-card .stat-icon {
                color: #9c27b0;
            }

            .matches-card .stat-value {
                color: #9c27b0;
            }

            .additional-info-card {
                margin-bottom: 24px;
            }

            .info-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 16px;
                margin-top: 16px;
            }

            .info-item {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }

            .info-item strong {
                color: #666;
                font-size: 0.875rem;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .info-item span {
                font-size: 1.1rem;
                color: #333;
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

            .error-container {
                display: flex;
                justify-content: center;
                padding: 48px;
            }

            .error-card {
                max-width: 400px;
                width: 100%;
            }

            .error-content {
                text-align: center;
            }

            .error-icon {
                font-size: 4rem;
                width: 4rem;
                height: 4rem;
                color: #f44336;
                margin-bottom: 16px;
            }

            /* Responsive */
            @media (max-width: 768px) {
                .athlete-stats-container {
                    padding: 16px;
                }

                .stats-grid {
                    grid-template-columns: 1fr;
                }

                .athlete-name {
                    font-size: 1.5rem;
                }

                .stat-value {
                    font-size: 2rem;
                }

                .info-grid {
                    grid-template-columns: 1fr;
                }
            }
        `,
    ],
})
export class EstadisticasAthleteComponent implements OnInit {
    athleteStatistics: StatisticsIndividualWithAthlete | null = null;
    isLoading = false;
    athleteId: string | null = null;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private statisticsService: StatisticsService,
        private snackBar: MatSnackBar
    ) {}

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            this.athleteId = params.get('id');
            if (this.athleteId) {
                this.loadAthleteStatistics();
            } else {
                this.snackBar.open('ID de atleta no válido', 'Cerrar', {
                    duration: 3000
                });
                this.goBack();
            }
        });
    }

    loadAthleteStatistics() {
        if (!this.athleteId) return;

        this.isLoading = true;
        this.statisticsService.getAthleteStatistics(this.athleteId).subscribe({
            next: (statistics) => {
                console.log('Estadísticas del atleta recibidas:', statistics);
                this.athleteStatistics = statistics;
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error cargando estadísticas del atleta:', error);
                this.isLoading = false;
                this.snackBar.open('Error al cargar las estadísticas del atleta', 'Cerrar', {
                    duration: 3000
                });
            }
        });
    }

    goBack() {
        this.router.navigate(['/estadisticas/jugadores']);
    }
}
