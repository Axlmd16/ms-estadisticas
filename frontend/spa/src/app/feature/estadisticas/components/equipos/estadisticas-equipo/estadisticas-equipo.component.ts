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
        <div style="padding: 20px; font-family: Arial;">
            <h1>DEBUGGING - Estadísticas de Equipo</h1>
            
            <div style="background: #f0f0f0; padding: 10px; margin: 10px 0;">
                <h3>Estado del Componente:</h3>
                <p><strong>Team ID:</strong> {{ teamId }}</p>
                <p><strong>Is Loading:</strong> {{ isLoading }}</p>
                <p><strong>Error:</strong> {{ error }}</p>
                <p><strong>Team Statistics exists:</strong> {{ !!teamStatistics }}</p>
            </div>

            <div *ngIf="isLoading" style="background: yellow; padding: 10px;">
                <h3>CARGANDO...</h3>
            </div>

            <div *ngIf="error" style="background: red; color: white; padding: 10px;">
                <h3>ERROR:</h3>
                <p>{{ error }}</p>
                <button (click)="loadTeamStatistics()">Reintentar</button>
            </div>

            <div *ngIf="teamStatistics" style="background: lightgreen; padding: 10px;">
                <h3>DATOS RECIBIDOS:</h3>
                <p><strong>Statistics ID:</strong> {{ teamStatistics._id }}</p>
                <p><strong>Description:</strong> {{ teamStatistics.description }}</p>
                <p><strong>Games Played:</strong> {{ teamStatistics.games_played }}</p>
                <p><strong>Matches Won:</strong> {{ teamStatistics.matches_won }}</p>
                <p><strong>Matches Lost:</strong> {{ teamStatistics.matches_lost }}</p>
                <p><strong>Matches Drawn:</strong> {{ teamStatistics.matches_drawn }}</p>
                <p><strong>Points:</strong> {{ teamStatistics.points }}</p>
                <p><strong>Value:</strong> {{ teamStatistics.value }}</p>
                <p><strong>ID Team:</strong> {{ teamStatistics.id_team }}</p>
                <p><strong>Date Generation:</strong> {{ teamStatistics.date_generation }}</p>
                
                <h4>TEAM INFO:</h4>
                <div *ngIf="teamStatistics.team" style="background: lightblue; padding: 10px;">
                    <p><strong>Team ID:</strong> {{ teamStatistics.team._id }}</p>
                    <p><strong>Team Name:</strong> {{ teamStatistics.team.name }}</p>
                    <p><strong>Team Description:</strong> {{ teamStatistics.team.description }}</p>
                    <p><strong>Team Founded:</strong> {{ teamStatistics.team.founded }}</p>
                    <p><strong>Team Athletes:</strong> {{ teamStatistics.team.athletes?.length || 0 }}</p>
                </div>
                
                <div *ngIf="!teamStatistics.team" style="background: orange; padding: 10px;">
                    <p>⚠️ NO HAY INFORMACIÓN DEL EQUIPO</p>
                </div>

                <h4>RAW JSON:</h4>
                <pre>{{ teamStatistics | json }}</pre>
            </div>

            <div *ngIf="!teamStatistics && !isLoading && !error" style="background: gray; padding: 10px;">
                <h3>NO HAY DATOS - INICIANDO CARGA...</h3>
                <button (click)="loadTeamStatistics()">Cargar Manualmente</button>
            </div>
        </div>
    `,
    styles: [
        `
            /* Estilos básicos para debugging */
            .debug-container {
                padding: 20px;
                font-family: Arial, sans-serif;
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
                console.log('🎯 Raw team object:', statistics.team);
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
                    hasTeamName: !!this.teamStatistics?.team?.name
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
}
