import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { StatisticsService, StatisticsIndividualWithAthlete } from '../../../../../core/services/statistics/statistics.service';

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
                    <mat-card-title>{{ jugador.athlete.name }}</mat-card-title>
                    <mat-card-subtitle>
                        {{ jugador.athlete.position || 'Sin posición' }} - Estadísticas individuales del jugador
                    </mat-card-subtitle>
                </mat-card-header>
                <mat-card-actions>
                    <button mat-raised-button (click)="goBack()" class="back-button">
                        <mat-icon>arrow_back</mat-icon>
                        Volver
                    </button>
                </mat-card-actions>
            </mat-card>

            <!-- Resumen rápido de estadísticas -->
            <div class="quick-stats">
                <mat-card class="quick-stat-card">
                    <mat-card-content>
                        <mat-icon>sports_soccer</mat-icon>
                        <div class="quick-stat-info">
                            <div class="quick-stat-value">{{ getFieldValue('goal') }}</div>
                            <div class="quick-stat-label">Goles</div>
                        </div>
                    </mat-card-content>
                </mat-card>
                <mat-card class="quick-stat-card">
                    <mat-card-content>
                        <mat-icon>assistant</mat-icon>
                        <div class="quick-stat-info">
                            <div class="quick-stat-value">{{ getFieldValue('assists') }}</div>
                            <div class="quick-stat-label">Asistencias</div>
                        </div>
                    </mat-card-content>
                </mat-card>
                <mat-card class="quick-stat-card">
                    <mat-card-content>
                        <mat-icon>timer</mat-icon>
                        <div class="quick-stat-info">
                            <div class="quick-stat-value">{{ getFieldValue('time_played') }}</div>
                            <div class="quick-stat-label">Min. Jugados</div>
                        </div>
                    </mat-card-content>
                </mat-card>
                <mat-card class="quick-stat-card">
                    <mat-card-content>
                        <mat-icon>warning</mat-icon>
                        <div class="quick-stat-info">
                            <div class="quick-stat-value">{{ getFieldValue('yellow_card') }}</div>
                            <div class="quick-stat-label">T. Amarillas</div>
                        </div>
                    </mat-card-content>
                </mat-card>
            </div>

            <!-- Información detallada con pestañas -->
            <mat-tab-group class="player-tabs">
                <mat-tab label="👤 Información Personal">
                    <div class="tab-content">
                        <div class="tab-cards-grid">
                            <mat-card class="info-card">
                                <mat-card-header>
                                    <mat-card-title>Datos Básicos</mat-card-title>
                                </mat-card-header>
                                <mat-card-content>
                                    <div class="info-grid">
                                        <div class="info-item">
                                            <mat-icon>person</mat-icon>
                                            <div class="info-details">
                                                <strong>Nombre Completo</strong>
                                                <span>{{ jugador.athlete.name }}</span>
                                            </div>
                                        </div>
                                        <div class="info-item">
                                            <mat-icon>sports_soccer</mat-icon>
                                            <div class="info-details">
                                                <strong>Posición</strong>
                                                <span>{{ jugador.athlete.position || 'Sin posición asignada' }}</span>
                                            </div>
                                        </div>
                                        <div class="info-item" *ngIf="jugador.athlete.team_id">
                                            <mat-icon>group</mat-icon>
                                            <div class="info-details">
                                                <strong>ID del Equipo</strong>
                                                <span>{{ jugador.athlete.team_id }}</span>
                                            </div>
                                        </div>
                                        <div class="info-item">
                                            <mat-icon>badge</mat-icon>
                                            <div class="info-details">
                                                <strong>ID del Jugador</strong>
                                                <span>{{ jugador.athlete.id || jugadorId }}</span>
                                            </div>
                                        </div>
                                    </div>
                                </mat-card-content>
                            </mat-card>
                        </div>
                    </div>
                </mat-tab>

                <mat-tab label="📊 Estadísticas Completas">
                    <div class="tab-content">
                        <div class="tab-cards-grid">
                            <!-- Estadísticas Ofensivas -->
                            <mat-card class="stats-category-card">
                                <mat-card-header>
                                    <mat-card-title>⚽ Estadísticas Ofensivas</mat-card-title>
                                </mat-card-header>
                                <mat-card-content>
                                    <div class="stats-list">
                                        <div class="stat-row">
                                            <mat-icon>sports_soccer</mat-icon>
                                            <span class="stat-name">Goles</span>
                                            <span class="stat-value">{{ getFieldValue('goal') }}</span>
                                        </div>
                                        <div class="stat-row">
                                            <mat-icon>assistant</mat-icon>
                                            <span class="stat-name">Asistencias</span>
                                            <span class="stat-value">{{ getFieldValue('assists') }}</span>
                                        </div>
                                        <div class="stat-row">
                                            <mat-icon>sports_soccer</mat-icon>
                                            <span class="stat-name">Tiros</span>
                                            <span class="stat-value">{{ getFieldValue('shots') }}</span>
                                        </div>
                                    </div>
                                </mat-card-content>
                            </mat-card>

                            <!-- Estadísticas Defensivas -->
                            <mat-card class="stats-category-card">
                                <mat-card-header>
                                    <mat-card-title>🛡️ Estadísticas Defensivas</mat-card-title>
                                </mat-card-header>
                                <mat-card-content>
                                    <div class="stats-list">
                                        <div class="stat-row">
                                            <mat-icon>sports_kabaddi</mat-icon>
                                            <span class="stat-name">Entradas</span>
                                            <span class="stat-value">{{ getFieldValue('tackles') }}</span>
                                        </div>
                                        <div class="stat-row">
                                            <mat-icon>sports_volleyball</mat-icon>
                                            <span class="stat-name">Atajadas</span>
                                            <span class="stat-value">{{ getFieldValue('saves') }}</span>
                                        </div>
                                        <div class="stat-row">
                                            <mat-icon>swap_horiz</mat-icon>
                                            <span class="stat-name">Pases</span>
                                            <span class="stat-value">{{ getFieldValue('passes') }}</span>
                                        </div>
                                    </div>
                                </mat-card-content>
                            </mat-card>

                            <!-- Disciplina -->
                            <mat-card class="stats-category-card">
                                <mat-card-header>
                                    <mat-card-title>⚠️ Disciplina</mat-card-title>
                                </mat-card-header>
                                <mat-card-content>
                                    <div class="stats-list">
                                        <div class="stat-row">
                                            <mat-icon class="yellow-card">warning</mat-icon>
                                            <span class="stat-name">Tarjetas Amarillas</span>
                                            <span class="stat-value">{{ getFieldValue('yellow_card') }}</span>
                                        </div>
                                        <div class="stat-row">
                                            <mat-icon class="red-card">error</mat-icon>
                                            <span class="stat-name">Tarjetas Rojas</span>
                                            <span class="stat-value">{{ getFieldValue('red_card') }}</span>
                                        </div>
                                    </div>
                                </mat-card-content>
                            </mat-card>

                            <!-- Tiempo de Juego -->
                            <mat-card class="stats-category-card">
                                <mat-card-header>
                                    <mat-card-title>⏱️ Tiempo de Juego</mat-card-title>
                                </mat-card-header>
                                <mat-card-content>
                                    <div class="stats-list">
                                        <div class="stat-row">
                                            <mat-icon>timer</mat-icon>
                                            <span class="stat-name">Minutos Jugados</span>
                                            <span class="stat-value">{{ getFieldValue('time_played') }}</span>
                                        </div>
                                    </div>
                                </mat-card-content>
                            </mat-card>
                        </div>
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
                padding: 20px;
                max-width: 1400px;
                margin: 0 auto;
                background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                min-height: 100vh;
            }

            .header-card {
                margin-bottom: 30px;
                border-radius: 16px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }

            .header-card .mat-card-header {
                padding: 24px;
            }

            .header-card .mat-card-title {
                color: white;
                font-size: 1.6rem;
                font-weight: 600;
            }

            .header-card .mat-card-subtitle {
                color: rgba(255, 255, 255, 0.8);
                font-size: 1rem;
            }

            .player-avatar {
                background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                width: 60px;
                height: 60px;
                box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
            }

            /* Quick Stats Row */
            .quick-stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 16px;
                margin-bottom: 30px;
            }

            .quick-stat-card {
                border-radius: 12px;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
                transition: all 0.3s ease;
                border: 1px solid rgba(33, 150, 243, 0.1);
            }

            .quick-stat-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
            }

            .quick-stat-card .mat-card-content {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 16px !important;
            }

            .quick-stat-card mat-icon {
                background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
                color: #2196f3;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
            }

            .quick-stat-info {
                flex: 1;
            }

            .quick-stat-value {
                font-size: 1.4rem;
                font-weight: 700;
                color: #333;
                line-height: 1.2;
            }

            .quick-stat-label {
                font-size: 0.8rem;
                color: #666;
                font-weight: 500;
                margin-top: 2px;
            }

            /* Player Tabs */
            .player-tabs {
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                background: white;
            }

            .tab-content {
                padding: 24px;
                background: #f8f9fa;
                min-height: 400px;
            }

            .tab-cards-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 20px;
            }

            /* Info Cards */
            .info-card {
                border-radius: 12px;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
                background: white;
                border: 1px solid rgba(0, 0, 0, 0.05);
            }

            .info-card .mat-card-header {
                background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
                color: white;
                padding: 16px;
            }

            .info-card .mat-card-title {
                color: white !important;
                font-weight: 600;
                font-size: 1.1rem;
            }

            .info-grid {
                display: flex;
                flex-direction: column;
                gap: 16px;
                padding: 20px;
            }

            .info-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px;
                background: #f8f9fa;
                border-radius: 8px;
                border-left: 4px solid #2196f3;
            }

            .info-item mat-icon {
                color: #2196f3;
                font-size: 20px;
            }

            .info-details {
                flex: 1;
            }

            .info-details strong {
                display: block;
                color: #333;
                font-weight: 600;
                font-size: 0.9rem;
                margin-bottom: 2px;
            }

            .info-details span {
                color: #666;
                font-size: 1rem;
            }

            /* Stats Category Cards */
            .stats-category-card {
                border-radius: 12px;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
                background: white;
                border: 1px solid rgba(0, 0, 0, 0.05);
            }

            .stats-category-card .mat-card-header {
                background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                padding: 16px;
                border-bottom: 1px solid #dee2e6;
            }

            .stats-category-card .mat-card-title {
                color: #333 !important;
                font-weight: 600;
                font-size: 1.1rem;
            }

            .stats-list {
                display: flex;
                flex-direction: column;
                gap: 12px;
                padding: 16px;
            }

            .stat-row {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 8px 12px;
                background: #f8f9fa;
                border-radius: 8px;
                transition: all 0.3s ease;
            }

            .stat-row:hover {
                background: #e3f2fd;
                transform: translateX(4px);
            }

            .stat-row mat-icon {
                color: #2196f3;
                font-size: 18px;
                width: 18px;
                height: 18px;
            }

            .stat-row mat-icon.yellow-card {
                color: #ff9800;
            }

            .stat-row mat-icon.red-card {
                color: #f44336;
            }

            .stat-name {
                flex: 1;
                color: #333;
                font-weight: 500;
                font-size: 0.9rem;
            }

            .stat-value {
                color: #2196f3;
                font-weight: 700;
                font-size: 1.1rem;
                min-width: 40px;
                text-align: right;
            }

            /* Loading and Error States */
            .loading-container,
            .error-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 400px;
                text-align: center;
                background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                border-radius: 16px;
                margin: 20px;
            }

            .loading-container p {
                color: #666;
                font-size: 1.1rem;
                margin-top: 20px;
                font-weight: 500;
            }

            .error-content {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 20px;
                padding: 40px;
                background: white;
                border-radius: 16px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            }

            .error-content h3 {
                color: #f44336;
                font-size: 1.5rem;
                margin: 0;
            }

            .error-content p {
                color: #666;
                font-size: 1rem;
                margin: 0;
            }

            /* Button Styles */
            .header-card .mat-card-actions {
                padding: 20px 24px;
                background: rgba(255, 255, 255, 0.1);
            }

            .header-card .mat-card-actions button {
                display: inline-flex !important;
                align-items: center !important;
                gap: 8px !important;
                margin-right: 12px;
                border-radius: 8px;
                font-weight: 500;
                transition: all 0.3s ease;
                padding: 8px 16px !important;
                background: rgba(255, 255, 255, 0.2) !important;
                color: white !important;
                border: 1px solid rgba(255, 255, 255, 0.3) !important;
                min-height: 36px !important;
            }

            .header-card .mat-card-actions button mat-icon {
                font-size: 18px !important;
                width: 18px !important;
                height: 18px !important;
                margin: 0 !important;
            }

            .header-card .mat-card-actions button:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                background: rgba(255, 255, 255, 0.3) !important;
            }

            /* Responsive Design */
            @media (max-width: 1200px) {
                .jugador-detail-container {
                    padding: 16px;
                }
                
                .quick-stats {
                    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                    gap: 12px;
                }

                .tab-cards-grid {
                    grid-template-columns: 1fr;
                    gap: 16px;
                }
            }

            @media (max-width: 768px) {
                .jugador-detail-container {
                    padding: 12px;
                }

                .quick-stats {
                    grid-template-columns: repeat(2, 1fr);
                    gap: 12px;
                }

                .tab-content {
                    padding: 16px;
                }

                .header-card .mat-card-title {
                    font-size: 1.3rem;
                }

                .quick-stat-value {
                    font-size: 1.2rem;
                }

                .action-buttons {
                    gap: 8px;
                }

                .action-button {
                    padding: 10px 16px;
                    font-size: 0.9rem;
                }

                .dynamic-fields {
                    grid-template-columns: 1fr;
                    gap: 8px;
                }
            }

            @media (max-width: 480px) {
                .header-card .mat-card-actions {
                    flex-direction: column;
                    gap: 8px;
                }

                .header-card .mat-card-actions button {
                    width: 100%;
                    margin-right: 0;
                    margin-bottom: 8px;
                }

                .quick-stats {
                    grid-template-columns: 1fr;
                }

                .quick-stat-card .mat-card-content {
                    padding: 12px !important;
                }
            }
        `,
    ],
})
export class JugadorDetalleComponent implements OnInit {
    jugador?: StatisticsIndividualWithAthlete;
    isLoading = false;
    error: string | null = null;
    jugadorId: string = '';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private statisticsService: StatisticsService
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

        this.statisticsService.getAthleteStatistics(jugadorId).subscribe({
            next: (jugador) => {
                this.jugador = jugador;
                this.isLoading = false;
                console.log('📊 BACKEND DATA RECEIVED:');
                console.log('👤 Athlete info:', jugador.athlete);
                console.log('� Statistics fields from backend (excluding athlete id):');
                Object.keys(jugador).forEach(key => {
                    if (key !== 'athlete_id') { // Excluir el ID del jugador
                        console.log(`  ${key}: ${(jugador as any)[key]}`);
                    }
                });
                console.log('🎯 Available backend fields:', Object.keys(jugador).filter(key => key !== 'athlete_id'));
            },
            error: (error) => {
                this.error = error.message || 'Error al cargar las estadísticas del jugador';
                this.isLoading = false;
                console.error('❌ Error loading athlete statistics:', error);
            },
        });
    }

    // Método para obtener solo los campos que vienen del backend (excluyendo athlete_id, id y fechas)
    getBackendFields(): { key: string, value: any }[] {
        if (!this.jugador) return [];
        
        return Object.keys(this.jugador)
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
                value: (this.jugador as any)[key] || 0
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

    goBack() {
        this.router.navigate(['/estadisticas/jugadores']);
    }

    // Método para obtener valor de un campo específico
    getFieldValue(fieldKey: string): any {
        if (!this.jugador) return 0;
        return (this.jugador as any)[fieldKey] || 0;
    }
}
