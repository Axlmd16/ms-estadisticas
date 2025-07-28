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
                <div class="header-actions">
                    <button mat-raised-button (click)="goBack()" class="back-button">
                        <span class="button-content">
                            <mat-icon>arrow_back</mat-icon>
                            <span class="button-text">Volver a Atletas</span>
                        </span>
                    </button>
                </div>
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

                <!-- Estadísticas principales - Solo datos del backend -->
                <div class="stats-grid">
                    <!-- Mostrar solo los campos que realmente vienen del backend -->
                    <mat-card class="stat-card" *ngFor="let field of getBackendFields(); let i = index">
                        <mat-card-content>
                            <div class="stat-content">
                                <mat-icon class="stat-icon">{{ getIconForField(field.key) }}</mat-icon>
                                <div class="stat-info">
                                    <div class="stat-value">{{ field.value }}</div>
                                    <div class="stat-label">{{ getFieldLabel(field.key) }}</div>
                                </div>
                            </div>
                        </mat-card-content>
                    </mat-card>
                </div>

                <!-- Mensaje cuando no hay estadísticas -->
                <div class="no-stats-message" *ngIf="getBackendFields().length === 0">
                    <mat-card>
                        <mat-card-content>
                            <div class="no-stats-content">
                                <mat-icon>info</mat-icon>
                                <h3>Sin estadísticas disponibles</h3>
                                <p>Este atleta aún no tiene estadísticas registradas.</p>
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
                border-radius: 12px;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
                background: white;
            }

            .header-actions {
                display: flex;
                justify-content: flex-start;
                align-items: center;
                padding: 16px;
            }

            .back-button {
                background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%) !important;
                color: white !important;
                border: none !important;
                border-radius: 8px !important;
                transition: all 0.3s ease !important;
                padding: 0 !important;
                min-width: auto !important;
                height: auto !important;
                line-height: normal !important;
            }

            .back-button:hover {
                background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%) !important;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3) !important;
            }

            .button-content {
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                gap: 8px !important;
                padding: 12px 20px !important;
                font-size: 14px !important;
                font-weight: 500 !important;
                white-space: nowrap !important;
            }

            .button-content mat-icon {
                font-size: 18px !important;
                width: 18px !important;
                height: 18px !important;
                margin: 0 !important;
                padding: 0 !important;
                line-height: 1 !important;
            }

            .button-text {
                display: inline-block !important;
                margin: 0 !important;
                padding: 0 !important;
                line-height: 1 !important;
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
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }

            .stat-card {
                border-radius: 16px;
                transition: all 0.3s ease;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                border: 1px solid rgba(255, 255, 255, 0.2);
                background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
                overflow: hidden;
                position: relative;
            }

            .stat-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
            }

            .stat-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 4px;
                background: linear-gradient(90deg, #2196f3, #1976d2);
            }

            .stat-content {
                display: flex;
                align-items: center;
                gap: 20px;
                padding: 24px;
                position: relative;
            }

            .stat-icon {
                background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
                border-radius: 50%;
                width: 56px;
                height: 56px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #2196f3;
                box-shadow: 0 4px 12px rgba(33, 150, 243, 0.2);
                transition: all 0.3s ease;
            }

            .stat-card:hover .stat-icon {
                transform: scale(1.1);
                box-shadow: 0 6px 16px rgba(33, 150, 243, 0.3);
            }

            .stat-info {
                flex: 1;
            }

            .stat-value {
                font-size: 1.6rem;
                font-weight: 700;
                color: #333;
                line-height: 1.2;
                margin-bottom: 4px;
            }

            .stat-label {
                font-size: 0.9rem;
                color: #666;
                font-weight: 500;
                letter-spacing: 0.5px;
            }

            /* No Stats Message */
            .no-stats-message {
                margin-bottom: 30px;
            }

            .no-stats-message .mat-card {
                border-radius: 16px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
                border: 1px solid #ffc107;
            }

            .no-stats-content {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 16px;
                padding: 40px;
                text-align: center;
            }

            .no-stats-content mat-icon {
                font-size: 48px;
                width: 48px;
                height: 48px;
                color: #ff9800;
            }

            .no-stats-content h3 {
                margin: 0;
                color: #e65100;
                font-size: 1.5rem;
                font-weight: 600;
            }

            .no-stats-content p {
                margin: 0;
                color: #bf5f00;
                font-size: 1rem;
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
            @media (max-width: 1200px) {
                .athlete-stats-container {
                    padding: 16px;
                }
                
                .stats-grid {
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 16px;
                }
            }

            @media (max-width: 768px) {
                .athlete-stats-container {
                    padding: 12px;
                }

                .stats-grid {
                    grid-template-columns: 1fr;
                    gap: 16px;
                }

                .athlete-name {
                    font-size: 1.5rem;
                }

                .stat-value {
                    font-size: 1.4rem;
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

    // Método para obtener solo los campos que vienen del backend (excluyendo athlete_id, id y fechas)
    getBackendFields(): { key: string, value: any }[] {
        if (!this.athleteStatistics) return [];
        
        return Object.keys(this.athleteStatistics)
            .filter(key => 
                key !== 'athlete_id' && 
                key !== 'athlete' && 
                key !== 'id' && 
                !key.includes('date') && 
                !key.includes('created') && 
                !key.includes('updated')
            ) // Excluir IDs, athlete y fechas
            .map(key => ({
                key: key,
                value: (this.athleteStatistics as any)[key] || 0
            }));
    }

    // Método para obtener el ícono apropiado para cada campo
    getIconForField(fieldKey: string): string {
        const iconMap: { [key: string]: string } = {
            'goal': 'sports_soccer',
            'assists': 'assistant',
            'time_played': 'timer',
            'yellow_card': 'warning',
            'red_card': 'error',
            'shots': 'sports_soccer',
            'passes': 'swap_horiz',
            'tackles': 'sports_kabaddi',
            'saves': 'sports_volleyball'
        };
        return iconMap[fieldKey] || 'bar_chart';
    }

    // Método para obtener la etiqueta en español para cada campo
    getFieldLabel(fieldKey: string): string {
        const labelMap: { [key: string]: string } = {
            'goal': 'Goles',
            'assists': 'Asistencias',
            'time_played': 'Minutos Jugados',
            'yellow_card': 'Tarjetas Amarillas',
            'red_card': 'Tarjetas Rojas',
            'shots': 'Tiros',
            'passes': 'Pases',
            'tackles': 'Entradas',
            'saves': 'Atajadas'
        };
        return labelMap[fieldKey] || fieldKey.replace('_', ' ').toUpperCase();
    }
}
