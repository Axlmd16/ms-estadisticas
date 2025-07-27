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
import { StatisticsIndividual } from '../../../../../core/models/statistics';
import { JugadorFormComponent } from '../jugador-form/jugador-form.component';

@Component({
    selector: 'app-jugador-detalle',
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
        <div class="jugador-detail-container" *ngIf="!isLoading && jugador">
            <!-- Encabezado -->
            <mat-card class="header-card">
                <mat-card-header>
                    <div mat-card-avatar class="player-avatar">
                        <mat-icon>person</mat-icon>
                    </div>
                    <mat-card-title>{{ jugador.player_name }}</mat-card-title>
                    <mat-card-subtitle>
                        Estadísticas individuales del jugador
                    </mat-card-subtitle>
                </mat-card-header>
                <mat-card-actions>
                    <button mat-raised-button color="primary" (click)="editJugador()">
                        <mat-icon>edit</mat-icon>
                        Editar
                    </button>
                    <button mat-raised-button color="warn" (click)="deleteJugador()">
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
                            <div class="stat-value">{{ jugador.goals }}</div>
                            <div class="stat-label">Goles</div>
                        </div>
                    </mat-card-content>
                </mat-card>

                <mat-card class="stat-card">
                    <mat-card-content>
                        <div class="stat-icon">
                            <mat-icon>assistant</mat-icon>
                        </div>
                        <div class="stat-info">
                            <div class="stat-value">{{ jugador.assists }}</div>
                            <div class="stat-label">Asistencias</div>
                        </div>
                    </mat-card-content>
                </mat-card>

                <mat-card class="stat-card">
                    <mat-card-content>
                        <div class="stat-icon">
                            <mat-icon>timer</mat-icon>
                        </div>
                        <div class="stat-info">
                            <div class="stat-value">{{ jugador.minutes_played }}</div>
                            <div class="stat-label">Minutos Jugados</div>
                        </div>
                    </mat-card-content>
                </mat-card>

                <mat-card class="stat-card">
                    <mat-card-content>
                        <div class="stat-icon">
                            <mat-icon>warning</mat-icon>
                        </div>
                        <div class="stat-info">
                            <div class="stat-value">{{ jugador.yellow_cards }}</div>
                            <div class="stat-label">Tarjetas Amarillas</div>
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
                                <mat-card-title>Datos del Jugador</mat-card-title>
                            </mat-card-header>
                            <mat-card-content>
                                <div class="info-grid">
                                    <div class="info-item">
                                        <strong>Nombre:</strong>
                                        <span>{{ jugador.player_name }}</span>
                                    </div>
                                    <div class="info-item">
                                        <strong>ID del Jugador:</strong>
                                        <span>{{ jugador.player_id }}</span>
                                    </div>
                                    <div class="info-item">
                                        <strong>Goles:</strong>
                                        <span>{{ jugador.goals }}</span>
                                    </div>
                                    <div class="info-item">
                                        <strong>Asistencias:</strong>
                                        <span>{{ jugador.assists }}</span>
                                    </div>
                                    <div class="info-item">
                                        <strong>Minutos Jugados:</strong>
                                        <span>{{ jugador.minutes_played }}</span>
                                    </div>
                                    <div class="info-item">
                                        <strong>Tarjetas Amarillas:</strong>
                                        <span>{{ jugador.yellow_cards }}</span>
                                    </div>
                                    <div class="info-item">
                                        <strong>Tarjetas Rojas:</strong>
                                        <span>{{ jugador.red_cards }}</span>
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
                                        <div class="metric-value">{{ jugador.goals }}</div>
                                        <div class="metric-label">Goles</div>
                                    </div>
                                    <div class="metric-item">
                                        <div class="metric-value">{{ jugador.assists }}</div>
                                        <div class="metric-label">Asistencias</div>
                                    </div>
                                    <div class="metric-item">
                                        <div class="metric-value">{{ getGoalsPerMinute() | number:'1.3-3' }}</div>
                                        <div class="metric-label">Goles por Minuto</div>
                                    </div>
                                    <div class="metric-item">
                                        <div class="metric-value">{{ getContribution() }}</div>
                                        <div class="metric-label">Contribución Total</div>
                                    </div>
                                </div>
                            </mat-card-content>
                        </mat-card>
                    </div>
                </mat-tab>

                <mat-tab label="Disciplina">
                    <div class="tab-content">
                        <mat-card>
                            <mat-card-header>
                                <mat-card-title>Registro Disciplinario</mat-card-title>
                            </mat-card-header>
                            <mat-card-content>
                                <div class="discipline-grid">
                                    <div class="discipline-item yellow">
                                        <div class="card-icon">
                                            <mat-icon>warning</mat-icon>
                                        </div>
                                        <div class="card-count">{{ jugador.yellow_cards }}</div>
                                        <div class="card-label">Tarjetas Amarillas</div>
                                    </div>
                                    <div class="discipline-item red">
                                        <div class="card-icon">
                                            <mat-icon>error</mat-icon>
                                        </div>
                                        <div class="card-count">{{ jugador.red_cards }}</div>
                                        <div class="card-label">Tarjetas Rojas</div>
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
            <p>Cargando información del jugador...</p>
        </div>

        <!-- Error message -->
        <div class="error-container" *ngIf="error">
            <mat-card>
                <mat-card-content>
                    <div class="error-content">
                        <mat-icon color="warn">error</mat-icon>
                        <h3>Error al cargar la información</h3>
                        <p>{{ error }}</p>
                        <button mat-raised-button color="primary" (click)="loadJugadorStatistics(jugadorId)">
                            Reintentar
                        </button>
                    </div>
                </mat-card-content>
            </mat-card>
        </div>
    `,
    styles: [
        `
            .jugador-detail-container {
                padding: 24px;
                max-width: 1200px;
                margin: 0 auto;
            }

            .header-card {
                margin-bottom: 24px;
            }

            .player-avatar {
                background-color: #4caf50;
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
                background-color: #e8f5e8;
                border-radius: 50%;
                width: 48px;
                height: 48px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #4caf50;
            }

            .stat-value {
                font-size: 2rem;
                font-weight: bold;
                color: #4caf50;
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
                color: #4caf50;
            }

            .metric-label {
                font-size: 1rem;
                color: #757575;
                margin-top: 8px;
            }

            .discipline-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 24px;
                text-align: center;
            }

            .discipline-item {
                padding: 24px;
                border-radius: 8px;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 8px;
            }

            .discipline-item.yellow {
                background-color: #fff8e1;
                border: 2px solid #ffc107;
            }

            .discipline-item.red {
                background-color: #ffebee;
                border: 2px solid #f44336;
            }

            .card-icon {
                width: 48px;
                height: 48px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .discipline-item.yellow .card-icon {
                background-color: #ffc107;
                color: white;
            }

            .discipline-item.red .card-icon {
                background-color: #f44336;
                color: white;
            }

            .card-count {
                font-size: 2rem;
                font-weight: bold;
            }

            .discipline-item.yellow .card-count {
                color: #ffc107;
            }

            .discipline-item.red .card-count {
                color: #f44336;
            }

            .card-label {
                font-size: 1rem;
                color: #757575;
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
                .jugador-detail-container {
                    padding: 16px;
                }

                .stats-grid {
                    grid-template-columns: 1fr;
                }

                .info-grid {
                    grid-template-columns: 1fr;
                }

                .discipline-grid {
                    grid-template-columns: 1fr;
                }
            }
        `,
    ],
})
export class JugadorDetalleComponent implements OnInit {
    jugador?: StatisticsIndividual;
    isLoading = false;
    error: string | null = null;
    jugadorId: string = '';

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
                this.jugadorId = params['id'];
                this.loadJugadorStatistics(this.jugadorId);
            }
        });
    }

    loadJugadorStatistics(jugadorId: string) {
        this.isLoading = true;
        this.error = null;

        this.statisticsService.getPlayerStatistics(jugadorId).subscribe({
            next: (jugador) => {
                this.jugador = jugador;
                this.isLoading = false;
            },
            error: (error) => {
                this.error = error.message || 'Error al cargar las estadísticas del jugador';
                this.isLoading = false;
            },
        });
    }

    editJugador() {
        const dialogRef = this.dialog.open(JugadorFormComponent, {
            width: '600px',
            data: { jugador: this.jugador },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.loadJugadorStatistics(this.jugadorId);
            }
        });
    }

    deleteJugador() {
        if (confirm('¿Está seguro de que desea eliminar este jugador?')) {
            this.statisticsService.deletePlayerStatistics(this.jugadorId).subscribe({
                next: () => {
                    this.snackBar.open('Jugador eliminado exitosamente', 'Cerrar', {
                        duration: 3000,
                    });
                    this.router.navigate(['/estadisticas/jugadores']);
                },
                error: (error) => {
                    this.snackBar.open('Error al eliminar el jugador', 'Cerrar', {
                        duration: 3000,
                    });
                    console.error('Error:', error);
                },
            });
        }
    }

    getGoalsPerMinute(): number {
        if (!this.jugador || this.jugador.minutes_played === 0) {
            return 0;
        }
        return this.jugador.goals / this.jugador.minutes_played;
    }

    getContribution(): number {
        if (!this.jugador) {
            return 0;
        }
        return this.jugador.goals + this.jugador.assists;
    }
}
