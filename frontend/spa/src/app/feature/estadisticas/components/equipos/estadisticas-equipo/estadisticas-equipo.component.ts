import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';

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
        MatSnackBarModule,
        MatChipsModule,
        MatDividerModule,
        MatTabsModule,
    ],
    template: `
        <div class="team-stats-container">
            <!-- Header Section -->
            <div class="header-section">
                <button mat-icon-button (click)="goBack()" class="back-button">
                    <mat-icon>arrow_back</mat-icon>
                </button>
                <div class="header-content">
                    <div class="team-avatar">
                        <mat-icon>groups</mat-icon>
                    </div>
                    <div class="team-title" *ngIf="hasTeam">
                        <h1>{{ teamStatistics!.team!.name }}</h1>
                        <p class="team-description">{{ teamStatistics!.team!.description || 'Sin descripción' }}</p>
                        <mat-chip-set>
                            <mat-chip>
                                <mat-icon matChipAvatar>calendar_today</mat-icon>
                                Fundado {{ teamStatistics!.team!.founded || 'N/A' }}
                            </mat-chip>
                            <mat-chip>
                                <mat-icon matChipAvatar>person</mat-icon>
                                {{ athletesCount }} Atletas
                            </mat-chip>
                        </mat-chip-set>
                    </div>
                </div>
            </div>

            <!-- Loading State -->
            <div class="loading-container" *ngIf="isLoading">
                <mat-card class="loading-card">
                    <mat-card-content>
                        <div class="loading-content">
                            <mat-spinner diameter="50"></mat-spinner>
                            <h3>Cargando estadísticas del equipo...</h3>
                            <p>Por favor espera un momento</p>
                        </div>
                    </mat-card-content>
                </mat-card>
            </div>

            <!-- Error State -->
            <div class="error-container" *ngIf="error && !isLoading">
                <mat-card class="error-card">
                    <mat-card-content>
                        <div class="error-content">
                            <mat-icon class="error-icon">error_outline</mat-icon>
                            <h3>Error al cargar datos</h3>
                            <p>{{ error }}</p>
                            <button mat-raised-button color="primary" (click)="loadTeamStatistics()">
                                <mat-icon>refresh</mat-icon>
                                Reintentar
                            </button>
                        </div>
                    </mat-card-content>
                </mat-card>
            </div>

            <!-- Main Content -->
            <div class="main-content" *ngIf="teamStatistics && !isLoading && !error">
                
                <!-- Statistics Overview -->
                <mat-card class="stats-overview-card">
                    <mat-card-header>
                        <mat-icon mat-card-avatar>analytics</mat-icon>
                        <mat-card-title>Estadísticas Generales</mat-card-title>
                        <mat-card-subtitle>Resumen del rendimiento del equipo</mat-card-subtitle>
                    </mat-card-header>
                    <mat-card-content>
                        <div class="stats-grid">
                            <div class="stat-item">
                                <div class="stat-icon">
                                    <mat-icon>sports_soccer</mat-icon>
                                </div>
                                <div class="stat-content">
                                    <span class="stat-value">{{ teamStatistics.games_played || 0 }}</span>
                                    <span class="stat-label">Partidos Jugados</span>
                                </div>
                            </div>
                            
                            <div class="stat-item">
                                <div class="stat-icon victory">
                                    <mat-icon>emoji_events</mat-icon>
                                </div>
                                <div class="stat-content">
                                    <span class="stat-value">{{ teamStatistics.matches_won || 0 }}</span>
                                    <span class="stat-label">Victorias</span>
                                </div>
                            </div>
                            
                            <div class="stat-item">
                                <div class="stat-icon draw">
                                    <mat-icon>timeline</mat-icon>
                                </div>
                                <div class="stat-content">
                                    <span class="stat-value">{{ teamStatistics.matches_drawn || 0 }}</span>
                                    <span class="stat-label">Empates</span>
                                </div>
                            </div>
                            
                            <div class="stat-item">
                                <div class="stat-icon defeat">
                                    <mat-icon>trending_down</mat-icon>
                                </div>
                                <div class="stat-content">
                                    <span class="stat-value">{{ teamStatistics.matches_lost || 0 }}</span>
                                    <span class="stat-label">Derrotas</span>
                                </div>
                            </div>
                            
                            <div class="stat-item">
                                <div class="stat-icon points">
                                    <mat-icon>stars</mat-icon>
                                </div>
                                <div class="stat-content">
                                    <span class="stat-value">{{ teamStatistics.points || 0 }}</span>
                                    <span class="stat-label">Puntos</span>
                                </div>
                            </div>
                            
                            <div class="stat-item" *ngIf="teamStatistics.value">
                                <div class="stat-icon value">
                                    <mat-icon>assessment</mat-icon>
                                </div>
                                <div class="stat-content">
                                    <span class="stat-value">{{ teamStatistics.value }}</span>
                                    <span class="stat-label">Valoración</span>
                                </div>
                            </div>
                        </div>
                    </mat-card-content>
                </mat-card>

                <!-- Team Details and Athletes Tabs -->
                <mat-card class="details-card">
                    <mat-tab-group mat-stretch-tabs class="team-tabs">
                        <!-- Team Information Tab -->
                        <mat-tab>
                            <ng-template mat-tab-label>
                                <mat-icon>info</mat-icon>
                                Información del Equipo
                            </ng-template>
                            <div class="tab-content">
                                <div class="team-info-grid" *ngIf="hasTeam">
                                    <div class="info-card">
                                        <mat-icon>badge</mat-icon>
                                        <div class="info-content">
                                            <h4>ID del Equipo</h4>
                                            <p>{{ teamStatistics!.team!._id }}</p>
                                        </div>
                                    </div>
                                    
                                    <div class="info-card">
                                        <mat-icon>description</mat-icon>
                                        <div class="info-content">
                                            <h4>Descripción</h4>
                                            <p>{{ teamStatistics!.team!.description || 'Sin descripción disponible' }}</p>
                                        </div>
                                    </div>
                                    
                                    <div class="info-card">
                                        <mat-icon>event</mat-icon>
                                        <div class="info-content">
                                            <h4>Año de Fundación</h4>
                                            <p>{{ teamStatistics!.team!.founded || 'No especificado' }}</p>
                                        </div>
                                    </div>
                                    
                                    <div class="info-card">
                                        <mat-icon>schedule</mat-icon>
                                        <div class="info-content">
                                            <h4>Última Actualización</h4>
                                            <p>{{ teamStatistics?.date_generation ? (teamStatistics.date_generation | date:'medium') : 'No disponible' }}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </mat-tab>

                        <!-- Athletes Tab -->
                        <mat-tab>
                            <ng-template mat-tab-label>
                                <mat-icon>people</mat-icon>
                                Atletas ({{ athletesCount }})
                            </ng-template>
                            <div class="tab-content">
                                <!-- Athletes List -->
                                <div class="athletes-container" *ngIf="hasAthletes; else noAthletes">
                                    <div class="athletes-header">
                                        <h3>
                                            <mat-icon>people</mat-icon>
                                            Plantilla del Equipo
                                        </h3>
                                        <p>{{ athletesCount }} atletas registrados</p>
                                    </div>
                                    
                                    <div class="athletes-grid">
                                        <mat-card class="athlete-card" *ngFor="let athlete of teamStatistics!.athletes; trackBy: trackByAthleteId" (click)="viewAthleteStatistics(athlete._id || athlete.id || '')">
                                            <mat-card-content>
                                                <div class="athlete-avatar">
                                                    <mat-icon>person</mat-icon>
                                                </div>
                                                <div class="athlete-info">
                                                    <h4 class="athlete-name">{{ athlete.name }}</h4>
                                                    <div class="athlete-details">
                                                        <mat-chip class="position-chip">
                                                            <mat-icon matChipAvatar>sports</mat-icon>
                                                            {{ athlete.position || 'Sin posición' }}
                                                        </mat-chip>
                                                    </div>
                                                    <div class="athlete-id">
                                                        <small>ID: {{ athlete._id || athlete.id }}</small>
                                                    </div>
                                                </div>
                                                <div class="view-stats-icon">
                                                    <mat-icon>visibility</mat-icon>
                                                </div>
                                            </mat-card-content>
                                        </mat-card>
                                    </div>
                                </div>
                                
                                <!-- No Athletes State -->
                                <ng-template #noAthletes>
                                    <div class="no-athletes">
                                        <mat-icon class="no-athletes-icon">person_off</mat-icon>
                                        <h3>No hay atletas registrados</h3>
                                        <p>Este equipo aún no tiene atletas asignados.</p>
                                    </div>
                                </ng-template>
                            </div>
                        </mat-tab>
                    </mat-tab-group>
                </mat-card>
            </div>
        </div>
    `,
    styles: [
        `
            /* Container Principal */
            .team-stats-container {
                min-height: 100vh;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                padding: 20px;
                font-family: 'Roboto', sans-serif;
            }

            /* Header Section */
            .header-section {
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(10px);
                border-radius: 20px;
                padding: 30px;
                margin-bottom: 30px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                position: relative;
                overflow: hidden;
            }

            .header-section::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 4px;
                background: linear-gradient(90deg, #667eea, #764ba2, #f093fb);
            }

            .back-button {
                position: absolute;
                top: 20px;
                left: 20px;
                background: rgba(102, 126, 234, 0.1);
                color: #667eea;
                z-index: 10;
            }

            .back-button:hover {
                background: rgba(102, 126, 234, 0.2);
                transform: translateX(-2px);
                transition: all 0.3s ease;
            }

            .header-content {
                display: flex;
                align-items: center;
                gap: 30px;
                margin-left: 60px;
            }

            .team-avatar {
                width: 80px;
                height: 80px;
                background: linear-gradient(135deg, #667eea, #764ba2);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
            }

            .team-avatar mat-icon {
                font-size: 40px;
                color: white;
            }

            .team-title h1 {
                margin: 0 0 8px 0;
                font-size: 2.5rem;
                font-weight: 700;
                background: linear-gradient(135deg, #667eea, #764ba2);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }

            .team-description {
                margin: 0 0 20px 0;
                color: #666;
                font-size: 1.1rem;
            }

            mat-chip-set {
                gap: 12px;
            }

            mat-chip {
                background: rgba(102, 126, 234, 0.1);
                color: #667eea;
                font-weight: 500;
            }

            /* Loading State */
            .loading-container, .error-container {
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 300px;
            }

            .loading-card, .error-card {
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(10px);
                border-radius: 20px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                max-width: 400px;
                width: 100%;
            }

            .loading-content, .error-content {
                text-align: center;
                padding: 40px 20px;
            }

            .loading-content h3, .error-content h3 {
                margin: 20px 0 10px 0;
                color: #333;
            }

            .error-icon {
                font-size: 60px;
                color: #f44336;
                margin-bottom: 20px;
            }

            /* Main Content */
            .main-content {
                display: flex;
                flex-direction: column;
                gap: 30px;
            }

            /* Statistics Overview Card */
            .stats-overview-card {
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(10px);
                border-radius: 20px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                overflow: hidden;
            }

            .stats-overview-card mat-card-header {
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                padding: 30px;
            }

            .stats-overview-card mat-card-header mat-icon {
                background: rgba(255, 255, 255, 0.2);
                border-radius: 50%;
                padding: 10px;
                font-size: 24px;
            }

            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 25px;
                padding: 30px;
            }

            .stat-item {
                display: flex;
                align-items: center;
                gap: 20px;
                padding: 25px;
                background: rgba(102, 126, 234, 0.05);
                border-radius: 15px;
                transition: all 0.3s ease;
                border: 2px solid transparent;
            }

            .stat-item:hover {
                transform: translateY(-5px);
                box-shadow: 0 10px 25px rgba(102, 126, 234, 0.15);
                border-color: rgba(102, 126, 234, 0.2);
            }

            .stat-icon {
                width: 50px;
                height: 50px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                flex-shrink: 0;
            }

            .stat-icon.victory {
                background: linear-gradient(135deg, #4caf50, #8bc34a);
            }

            .stat-icon.draw {
                background: linear-gradient(135deg, #ff9800, #ffc107);
            }

            .stat-icon.defeat {
                background: linear-gradient(135deg, #f44336, #e57373);
            }

            .stat-icon.points {
                background: linear-gradient(135deg, #9c27b0, #e91e63);
            }

            .stat-icon.value {
                background: linear-gradient(135deg, #00bcd4, #4fc3f7);
            }

            .stat-content {
                display: flex;
                flex-direction: column;
            }

            .stat-value {
                font-size: 2rem;
                font-weight: 700;
                color: #333;
                line-height: 1;
            }

            .stat-label {
                font-size: 0.9rem;
                color: #666;
                margin-top: 4px;
            }

            /* Details Card */
            .details-card {
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(10px);
                border-radius: 20px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                overflow: hidden;
            }

            .team-tabs {
                background: transparent;
            }

            .tab-content {
                padding: 30px;
            }

            /* Team Info Grid */
            .team-info-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 25px;
            }

            .info-card {
                display: flex;
                align-items: center;
                gap: 20px;
                padding: 25px;
                background: rgba(102, 126, 234, 0.05);
                border-radius: 15px;
                transition: all 0.3s ease;
                border-left: 4px solid #667eea;
            }

            .info-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(102, 126, 234, 0.1);
            }

            .info-card mat-icon {
                color: #667eea;
                font-size: 28px;
            }

            .info-content h4 {
                margin: 0 0 8px 0;
                color: #333;
                font-weight: 600;
            }

            .info-content p {
                margin: 0;
                color: #666;
                font-size: 0.95rem;
            }

            /* Athletes Section */
            .athletes-header {
                text-align: center;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 2px solid rgba(102, 126, 234, 0.1);
            }

            .athletes-header h3 {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                margin: 0 0 10px 0;
                color: #333;
                font-size: 1.8rem;
            }

            .athletes-header p {
                margin: 0;
                color: #666;
                font-size: 1.1rem;
            }

            .athletes-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                gap: 25px;
            }

            .athlete-card {
                transition: all 0.3s ease;
                border-radius: 15px;
                overflow: hidden;
                border: 2px solid transparent;
                cursor: pointer;
            }

            .athlete-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 12px 30px rgba(102, 126, 234, 0.15);
                border-color: rgba(102, 126, 234, 0.2);
            }

            .athlete-card mat-card-content {
                padding: 25px !important;
                display: flex;
                align-items: center;
                gap: 20px;
                position: relative;
            }

            .athlete-avatar {
                width: 60px;
                height: 60px;
                background: linear-gradient(135deg, #667eea, #764ba2);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
            }

            .athlete-avatar mat-icon {
                color: white;
                font-size: 30px;
            }

            .athlete-info {
                flex: 1;
            }

            .athlete-name {
                margin: 0 0 12px 0;
                color: #333;
                font-size: 1.2rem;
                font-weight: 600;
            }

            .athlete-details {
                margin-bottom: 8px;
            }

            .position-chip {
                background: rgba(102, 126, 234, 0.1);
                color: #667eea;
                font-size: 0.85rem;
            }

            .athlete-id {
                color: #999;
                font-size: 0.8rem;
            }

            .view-stats-icon {
                position: absolute;
                top: 50%;
                right: 20px;
                transform: translateY(-50%);
                opacity: 0;
                transition: opacity 0.3s ease;
                color: #667eea;
            }

            .athlete-card:hover .view-stats-icon {
                opacity: 1;
            }

            /* No Athletes State */
            .no-athletes {
                text-align: center;
                padding: 60px 20px;
                color: #666;
            }

            .no-athletes-icon {
                font-size: 80px;
                color: #ccc;
                margin-bottom: 20px;
            }

            .no-athletes h3 {
                margin: 0 0 10px 0;
                color: #999;
            }

            .no-athletes p {
                margin: 0;
                color: #bbb;
            }

            /* Responsive Design */
            @media (max-width: 768px) {
                .team-stats-container {
                    padding: 15px;
                }

                .header-content {
                    flex-direction: column;
                    text-align: center;
                    margin-left: 0;
                    gap: 20px;
                }

                .back-button {
                    position: static;
                    margin-bottom: 20px;
                }

                .team-title h1 {
                    font-size: 2rem;
                }

                .stats-grid {
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 15px;
                    padding: 20px;
                }

                .stat-item {
                    flex-direction: column;
                    text-align: center;
                    gap: 15px;
                    padding: 20px;
                }

                .team-info-grid {
                    grid-template-columns: 1fr;
                }

                .athletes-grid {
                    grid-template-columns: 1fr;
                }
            }

            /* Animations */
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .team-stats-container > * {
                animation: fadeInUp 0.6s ease forwards;
            }

            .team-stats-container > *:nth-child(2) {
                animation-delay: 0.1s;
            }

            .team-stats-container > *:nth-child(3) {
                animation-delay: 0.2s;
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

    // Getter methods para mejor tipado en el template
    get hasTeam(): boolean {
        return !!(this.teamStatistics?.team);
    }

    get hasAthletes(): boolean {
        return !!(this.teamStatistics?.athletes && this.teamStatistics.athletes.length > 0);
    }

    get athletesCount(): number {
        return this.teamStatistics?.athletes?.length || 0;
    }

    ngOnInit() {
        this.route.params.subscribe((params) => {
            if (params['id']) {
                this.teamId = params['id'];
                this.loadTeamStatistics();
            }
        });
    }

    loadTeamStatistics() {
        console.log('🔍 Loading team statistics for team ID:', this.teamId);
        console.log('🌐 API URL will be:', `/api/v1/statistics/team/by-team/${this.teamId}`);
        console.log('📝 Initial component state:', {
            teamStatistics: this.teamStatistics,
            isLoading: this.isLoading,
            error: this.error
        });
        
        this.isLoading = true;
        this.error = null;
        this.teamStatistics = undefined; // Clear previous data

        this.statisticsService.getTeamStatisticsWithInfo(this.teamId).subscribe({
            next: (statistics) => {
                console.log('✅ Team statistics loaded successfully:', statistics);
                console.log('� FULL BACKEND RESPONSE:', JSON.stringify(statistics, null, 2));
                console.log('�📊 Statistics data:', {
                    _id: statistics._id,
                    description: statistics.description,
                    date_generation: statistics.date_generation,
                    value: statistics.value,
                    games_played: statistics.games_played,
                    matches_drawn: statistics.matches_drawn,
                    matches_lost: statistics.matches_lost,
                    matches_won: statistics.matches_won,
                    points: statistics.points,
                    id_team: statistics.id_team
                });
                console.log('👥 Team data:', {
                    _id: statistics.team?._id,
                    name: statistics.team?.name,
                    description: statistics.team?.description,
                    founded: statistics.team?.founded,
                    athletes_count: statistics.team?.athletes?.length || 0,
                    full_team_object: statistics.team
                });
                console.log('�‍♂️ Athletes data:', {
                    athletes_count: statistics.athletes?.length || 0,
                    has_athletes: !!statistics.athletes,
                    athletes_list: statistics.athletes
                });
                console.log('�🎯 Raw team object:', statistics.team);
                console.log('🎯 Raw athletes array:', statistics.athletes);
                console.log('🎯 Team name specifically:', statistics.team?.name);
                console.log('🎯 Is team object truthy?', !!statistics.team);
                console.log('🎯 Type of team object:', typeof statistics.team);
                this.teamStatistics = statistics;
                this.isLoading = false;
                
                // Log final del estado del componente
                console.log('🎯 Component state after assignment:', {
                    teamStatistics: this.teamStatistics,
                    isLoading: this.isLoading,
                    error: this.error,
                    teamName: this.teamStatistics?.team?.name,
                    hasTeam: !!this.teamStatistics?.team,
                    hasTeamName: !!this.teamStatistics?.team?.name,
                    athletesCount: this.teamStatistics?.athletes?.length || 0,
                    hasAthletes: !!(this.teamStatistics?.athletes && this.teamStatistics.athletes.length > 0)
                });
            },
            error: (error) => {
                console.error('❌ Error loading team statistics:', error);
                console.error('🔍 Error details:', {
                    message: error.message,
                    status: error.status,
                    teamId: this.teamId
                });
                this.error = error.message || 'Error al cargar las estadísticas del equipo';
                this.isLoading = false;
                this.snackBar.open(
                    `Error al cargar estadísticas del equipo: ${error.message || 'Error desconocido'}`,
                    'Cerrar',
                    { duration: 5000 }
                );
            },
        });
    }

    goBack() {
        this.router.navigate(['/estadisticas/competencias']);
    }

    viewAthleteStatistics(athleteId: string) {
        console.log('🏃‍♂️ Navigating to athlete statistics for ID:', athleteId);
        this.router.navigate(['/estadisticas/jugadores', athleteId]);
    }

    trackByAthleteId(index: number, athlete: any): string {
        return athlete._id || athlete.id || index.toString();
    }
}
