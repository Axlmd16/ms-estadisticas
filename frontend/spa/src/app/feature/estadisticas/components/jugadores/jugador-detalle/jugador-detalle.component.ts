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

import { StatisticsService, StatisticsIndividualWithAthlete } from '../../../../../core/services/statistics/statistics.service';
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
                    <mat-card-title>{{ jugador.athlete.name }}</mat-card-title>
                    <mat-card-subtitle>
                        {{ jugador.athlete.position || 'Sin posición' }} - Estadísticas individuales del jugador
                    </mat-card-subtitle>
                </mat-card-header>
                <mat-card-actions>
                    <button mat-icon-button (click)="goBack()" class="back-button">
                        <mat-icon>arrow_back</mat-icon>
                        Volver
                    </button>
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

            <!-- Estadísticas principales - Solo datos del backend -->
            <div class="section-header">
                <h2>📊 Estadísticas Generales</h2>
                <p>Rendimiento actual del jugador</p>
            </div>
            <div class="stats-grid" *ngIf="getBackendFields().length > 0">
                <!-- Mostrar solo los campos que realmente vienen del backend -->
                <mat-card class="stat-card" *ngFor="let field of getBackendFields(); let i = index">
                    <mat-card-content>
                        <div class="stat-icon">
                            <mat-icon>{{ getIconForField(field.key) }}</mat-icon>
                        </div>
                        <div class="stat-info">
                            <div class="stat-value">{{ field.value }}</div>
                            <div class="stat-label">{{ getFieldLabel(field.key) }}</div>
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
                            <p>Este jugador aún no tiene estadísticas registradas.</p>
                        </div>
                    </mat-card-content>
                </mat-card>
            </div>

            <!-- Información detallada -->
            <mat-tab-group>
                <mat-tab label="ℹ️ Información General">
                    <div class="tab-content">
                        <mat-card>
                            <mat-card-header>
                                <mat-card-title>👤 Datos del Jugador</mat-card-title>
                            </mat-card-header>
                            <mat-card-content>
                                <div class="info-grid">
                                    <div class="info-item">
                                        <strong>Nombre:</strong>
                                        <span>{{ jugador.athlete.name }}</span>
                                    </div>
                                    <div class="info-item">
                                        <strong>Posición:</strong>
                                        <span>{{ jugador.athlete.position || 'Sin posición' }}</span>
                                    </div>
                                    <!-- Mostrar solo campos que vienen del backend (excluyendo athlete_id, id y fechas) -->
                                    <div class="info-item" *ngFor="let field of getBackendFields()">
                                        <strong>{{ getFieldLabel(field.key) }}:</strong>
                                        <span>{{ field.value }}</span>
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

            .stat-card .mat-card-content {
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
            }

            .stat-label {
                font-size: 0.9rem;
                color: #666;
                font-weight: 500;
                margin-top: 4px;
                letter-spacing: 0.5px;
            }

            /* Section Headers */
            .section-header {
                text-align: center;
                margin-bottom: 25px;
                padding: 20px;
                background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
                border-radius: 16px;
                box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
            }

            .section-header h2 {
                margin: 0 0 8px 0;
                font-size: 1.5rem;
                font-weight: 600;
                color: #333;
            }

            .section-header p {
                margin: 0;
                color: #666;
                font-size: 1rem;
                font-weight: 400;
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

            /* Tab Group Styles */
            .mat-tab-group {
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                background: white;
            }

            .tab-content {
                padding: 30px;
                background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
            }

            .tab-content .mat-card {
                border-radius: 12px;
                box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
                border: 1px solid rgba(0, 0, 0, 0.05);
                background: white;
            }

            .tab-content .mat-card-header {
                background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                border-radius: 12px 12px 0 0;
                padding: 20px;
            }

            .tab-content .mat-card-title {
                color: #333;
                font-weight: 600;
                font-size: 1.3rem;
            }

            .info-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 20px;
                padding: 20px;
            }

            .info-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 16px 20px;
                background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
                border-radius: 10px;
                border-left: 4px solid #2196f3;
                transition: all 0.3s ease;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
            }

            .info-item:hover {
                transform: translateX(5px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
            }

            .info-item strong {
                color: #333;
                font-weight: 600;
                font-size: 0.95rem;
            }

            .info-item span {
                color: #333;
                font-weight: 600;
                font-size: 1rem;
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
                margin-right: 12px;
                border-radius: 8px;
                font-weight: 500;
                transition: all 0.3s ease;
            }

            .header-card .mat-card-actions button:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            }

            /* Responsive Design */
            @media (max-width: 1200px) {
                .jugador-detail-container {
                    padding: 16px;
                }
                
                .stats-grid {
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 16px;
                }
            }

            @media (max-width: 768px) {
                .jugador-detail-container {
                    padding: 12px;
                }

                .stats-grid {
                    grid-template-columns: 1fr;
                    gap: 16px;
                }

                .info-grid {
                    grid-template-columns: 1fr;
                    gap: 12px;
                }

                .tab-content {
                    padding: 20px 16px;
                }

                .header-card .mat-card-title {
                    font-size: 1.3rem;
                }

                .stat-value {
                    font-size: 1.4rem;
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
        window.history.back();
    }
}
