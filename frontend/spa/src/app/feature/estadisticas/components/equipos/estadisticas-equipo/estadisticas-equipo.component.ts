import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';

import { StatisticsService, TeamStatisticsWithInfo } from '../../../../../core/services/statistics/statistics.service';

@Component({
    selector: 'app-estadisticas-equipo',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatIconModule,
        MatButtonModule,
        MatProgressSpinnerModule,
    ],
    template: `
        <div class="team-statistics-container" *ngIf="teamStatistics && !isLoading">
            <!-- Encabezado -->
            <mat-card class="header-card">
                <mat-card-header>
                    <div mat-card-avatar class="team-avatar">
                        <mat-icon>groups</mat-icon>
                    </div>
                    <mat-card-title>{{ teamStatistics.team.name }}</mat-card-title>
                    <mat-card-subtitle>
                        Estadísticas detalladas del equipo
                    </mat-card-subtitle>
                </mat-card-header>
                <mat-card-actions>
                    <button mat-raised-button color="primary" (click)="goBack()">
                        <mat-icon>arrow_back</mat-icon>
                        Volver
                    </button>
                </mat-card-actions>
            </mat-card>

            <!-- Información del equipo -->
            <mat-card class="info-card">
                <mat-card-header>
                    <mat-card-title>Información del Equipo</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                    <div class="info-grid">
                        <div class="info-item">
                            <strong>Nombre:</strong>
                            <span>{{ teamStatistics.team.name }}</span>
                        </div>
                        <div class="info-item" *ngIf="teamStatistics.team.description">
                            <strong>Descripción:</strong>
                            <span>{{ teamStatistics.team.description }}</span>
                        </div>
                        <div class="info-item" *ngIf="teamStatistics.team.founded">
                            <strong>Fundado en:</strong>
                            <span>{{ teamStatistics.team.founded }}</span>
                        </div>
                        <div class="info-item">
                            <strong>ID:</strong>
                            <span>{{ teamStatistics.team._id || teamStatistics.team.id }}</span>
                        </div>
                    </div>
                </mat-card-content>
            </mat-card>

            <!-- Estadísticas principales -->
            <div class="stats-grid">
                <mat-card class="stat-card">
                    <mat-card-content>
                        <div class="stat-icon games">
                            <mat-icon>sports_soccer</mat-icon>
                        </div>
                        <div class="stat-info">
                            <div class="stat-value">{{ teamStatistics.games_played || 0 }}</div>
                            <div class="stat-label">Partidos Jugados</div>
                        </div>
                    </mat-card-content>
                </mat-card>

                <mat-card class="stat-card">
                    <mat-card-content>
                        <div class="stat-icon wins">
                            <mat-icon>emoji_events</mat-icon>
                        </div>
                        <div class="stat-info">
                            <div class="stat-value">{{ teamStatistics.matches_won || 0 }}</div>
                            <div class="stat-label">Partidos Ganados</div>
                        </div>
                    </mat-card-content>
                </mat-card>

                <mat-card class="stat-card">
                    <mat-card-content>
                        <div class="stat-icon draws">
                            <mat-icon>handshake</mat-icon>
                        </div>
                        <div class="stat-info">
                            <div class="stat-value">{{ teamStatistics.matches_drawn || 0 }}</div>
                            <div class="stat-label">Partidos Empatados</div>
                        </div>
                    </mat-card-content>
                </mat-card>

                <mat-card class="stat-card">
                    <mat-card-content>
                        <div class="stat-icon losses">
                            <mat-icon>cancel</mat-icon>
                        </div>
                        <div class="stat-info">
                            <div class="stat-value">{{ teamStatistics.matches_lost || 0 }}</div>
                            <div class="stat-label">Partidos Perdidos</div>
                        </div>
                    </mat-card-content>
                </mat-card>

                <mat-card class="stat-card">
                    <mat-card-content>
                        <div class="stat-icon points">
                            <mat-icon>star</mat-icon>
                        </div>
                        <div class="stat-info">
                            <div class="stat-value">{{ teamStatistics.points || 0 }}</div>
                            <div class="stat-label">Puntos</div>
                        </div>
                    </mat-card-content>
                </mat-card>

                <mat-card class="stat-card" *ngIf="teamStatistics.value">
                    <mat-card-content>
                        <div class="stat-icon value">
                            <mat-icon>assessment</mat-icon>
                        </div>
                        <div class="stat-info">
                            <div class="stat-value">{{ teamStatistics.value }}</div>
                            <div class="stat-label">Valor</div>
                        </div>
                    </mat-card-content>
                </mat-card>
            </div>

            <!-- Información adicional -->
            <mat-card class="additional-info-card" *ngIf="teamStatistics.description || teamStatistics.date_generation">
                <mat-card-header>
                    <mat-card-title>Información Adicional</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                    <div class="info-grid">
                        <div class="info-item" *ngIf="teamStatistics.description">
                            <strong>Descripción:</strong>
                            <span>{{ teamStatistics.description }}</span>
                        </div>
                        <div class="info-item" *ngIf="teamStatistics.date_generation">
                            <strong>Fecha de Generación:</strong>
                            <span>{{ teamStatistics.date_generation | date:'medium' }}</span>
                        </div>
                    </div>
                </mat-card-content>
            </mat-card>
        </div>

        <!-- Loading spinner -->
        <div class="loading-container" *ngIf="isLoading">
            <mat-spinner></mat-spinner>
            <p>Cargando estadísticas del equipo...</p>
        </div>

        <!-- Error message -->
        <div class="error-container" *ngIf="error">
            <mat-card>
                <mat-card-content>
                    <div class="error-content">
                        <mat-icon color="warn">error</mat-icon>
                        <h3>Error al cargar las estadísticas</h3>
                        <p>{{ error }}</p>
                        <button mat-raised-button color="primary" (click)="loadTeamStatistics()">
                            Reintentar
                        </button>
                        <button mat-button (click)="goBack()">
                            Volver
                        </button>
                    </div>
                </mat-card-content>
            </mat-card>
        </div>
    `,
    styles: [
        `
            .team-statistics-container {
                padding: 24px;
                max-width: 1200px;
                margin: 0 auto;
                background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                min-height: 100vh;
                border-radius: 12px;
            }

            .header-card {
                margin-bottom: 32px;
                background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                color: white;
                border-radius: 16px;
                box-shadow: 0 8px 32px rgba(79, 172, 254, 0.25);
            }

            .header-card .mat-card-title {
                color: white;
                font-size: 2rem;
                font-weight: 600;
            }

            .header-card .mat-card-subtitle {
                color: rgba(255, 255, 255, 0.8);
                font-size: 1.1rem;
            }

            .team-avatar {
                background: rgba(255, 255, 255, 0.2);
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                backdrop-filter: blur(10px);
            }

            .info-card, .additional-info-card {
                margin-bottom: 32px;
                border-radius: 16px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                border: none;
                background: white;
            }

            .info-card .mat-card-header, .additional-info-card .mat-card-header {
                background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                border-bottom: 1px solid #dee2e6;
                border-radius: 16px 16px 0 0;
            }

            .info-card .mat-card-title, .additional-info-card .mat-card-title {
                color: #2c3e50 !important;
                font-weight: 600 !important;
                font-size: 1.4rem !important;
            }

            .info-grid {
                display: grid;
                grid-template-columns: 1fr;
                gap: 12px;
            }

            .info-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 16px 20px;
                background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                border-radius: 12px;
                border: 1px solid #dee2e6;
                transition: all 0.3s ease;
            }

            .info-item:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }

            .info-item strong {
                color: #2c3e50;
                font-weight: 600;
                font-size: 0.95rem;
            }

            .info-item span {
                color: #495057;
                font-weight: 500;
                text-align: right;
            }

            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                gap: 20px;
                margin-bottom: 32px;
            }

            .stat-card {
                border-radius: 16px;
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
                border: none;
                background: white;
                transition: transform 0.3s ease, box-shadow 0.3s ease;
            }

            .stat-card:hover {
                transform: translateY(-4px);
                box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
            }

            .stat-card .mat-card-content {
                display: flex;
                align-items: center;
                gap: 16px;
                padding: 20px !important;
            }

            .stat-icon {
                border-radius: 50%;
                width: 56px;
                height: 56px;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                color: white;
            }

            .stat-icon.games {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }

            .stat-icon.wins {
                background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
            }

            .stat-icon.draws {
                background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
                color: #333;
            }

            .stat-icon.losses {
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            }

            .stat-icon.points {
                background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            }

            .stat-icon.value {
                background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
                color: #333;
            }

            .stat-value {
                font-size: 2.2rem;
                font-weight: 700;
                color: #2c3e50;
                margin-bottom: 4px;
            }

            .stat-label {
                font-size: 0.9rem;
                color: #718096;
                font-weight: 500;
            }

            .loading-container,
            .error-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 400px;
                text-align: center;
                background: rgba(255, 255, 255, 0.9);
                border-radius: 16px;
                margin: 20px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            }

            .loading-container p {
                margin-top: 16px;
                color: #6c757d;
                font-size: 1.1rem;
            }

            .error-content {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 20px;
                padding: 20px;
            }

            .error-content mat-icon {
                font-size: 64px;
                width: 64px;
                height: 64px;
                color: #dc3545;
            }

            .error-content h3 {
                color: #dc3545;
                margin: 0;
                font-size: 1.5rem;
                font-weight: 600;
            }

            .error-content p {
                color: #6c757d;
                margin: 0;
                font-size: 1rem;
                line-height: 1.5;
            }

            /* Responsive */
            @media (max-width: 768px) {
                .team-statistics-container {
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
export class EstadisticasEquipoComponent implements OnInit {
    teamStatistics?: TeamStatisticsWithInfo;
    isLoading = false;
    error: string | null = null;
    teamId: string = '';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private statisticsService: StatisticsService,
        private snackBar: MatSnackBar
    ) {}

    ngOnInit() {
        this.route.params.subscribe((params) => {
            if (params['id']) {
                this.teamId = params['id'];
                this.loadTeamStatistics();
            }
        });
    }

    loadTeamStatistics() {
        this.isLoading = true;
        this.error = null;

        this.statisticsService.getTeamStatisticsWithInfo(this.teamId).subscribe({
            next: (statistics) => {
                this.teamStatistics = statistics;
                this.isLoading = false;
            },
            error: (error) => {
                this.error = error.message || 'Error al cargar las estadísticas del equipo';
                this.isLoading = false;
                console.error('Error al cargar estadísticas del equipo:', error);
            },
        });
    }

    goBack() {
        this.router.navigate(['/estadisticas/competencias']);
    }
}
