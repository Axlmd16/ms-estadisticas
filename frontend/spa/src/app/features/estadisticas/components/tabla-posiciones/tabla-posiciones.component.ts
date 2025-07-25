import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';

import { StatisticsService } from '../../../../core/services/statistics/statistics.service';
import {
    StatisticsCompetence,
    TableRating,
    StatisticsFilter,
} from '../../../../core/models/statistics';
import { ApiPaginationResponse } from '../../../../core/models/api-response';

@Component({
    selector: 'app-tabla-posiciones',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatTableModule,
        MatPaginatorModule,
        MatFormFieldModule,
        MatSelectModule,
        MatProgressSpinnerModule,
        FormsModule,
    ],
    template: `
        <div class="tabla-posiciones-container">
            <!-- Encabezado -->
            <mat-card class="header-card">
                <mat-card-header>
                    <mat-card-title>Tabla de Posiciones</mat-card-title>
                    <mat-card-subtitle>
                        Consulta las posiciones de los equipos en cada competencia
                    </mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                    <div class="d-flex justify-content-between align-items-center">
                        <!-- Selector de competencia -->
                        <mat-form-field appearance="outline" class="competition-selector">
                            <mat-label>Seleccionar Competencia</mat-label>
                            <mat-select
                                [ngModel]="selectedCompetitionId"
                                (ngModelChange)="onCompetitionChange($event)"
                            >
                                <mat-option value="">-- Seleccionar --</mat-option>
                                <mat-option
                                    *ngFor="let competition of competencias"
                                    [value]="competition.id"
                                >
                                    {{ competition.competition_name }}
                                </mat-option>
                            </mat-select>
                        </mat-form-field>

                        <!-- Botón para actualizar -->
                        <button
                            mat-raised-button
                            color="primary"
                            (click)="refreshTable()"
                            [disabled]="!selectedCompetitionId || isLoading"
                        >
                            <mat-icon>refresh</mat-icon>
                            Actualizar
                        </button>
                    </div>
                </mat-card-content>
            </mat-card>

            <!-- Información de la competencia seleccionada -->
            <mat-card class="info-card" *ngIf="selectedCompetition">
                <mat-card-content>
                    <div class="competition-info">
                        <div class="competition-header">
                            <mat-icon class="competition-icon">emoji_events</mat-icon>
                            <div>
                                <h3>{{ selectedCompetition.competition_name }}</h3>
                                <p class="competition-details">
                                    {{ selectedCompetition.total_teams }} equipos • 
                                    {{ selectedCompetition.total_matches }} partidos • 
                                    {{ selectedCompetition.total_goals }} goles
                                </p>
                            </div>
                        </div>
                    </div>
                </mat-card-content>
            </mat-card>

            <!-- Tabla de posiciones -->
            <mat-card class="table-card" *ngIf="selectedCompetitionId">
                <mat-card-header>
                    <mat-card-title>Posiciones Actuales</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                    <div class="table-container" *ngIf="!isLoading">
                        <div *ngIf="tableRatings.length > 0; else noTableData">
                            <table mat-table [dataSource]="tableRatings" class="standings-table">
                                <!-- Columna Posición -->
                                <ng-container matColumnDef="position">
                                    <th mat-header-cell *matHeaderCellDef class="position-column">Pos.</th>
                                    <td mat-cell *matCellDef="let element" class="position-cell">
                                        <div class="position-number" [ngClass]="getPositionClass(element.position)">
                                            {{ element.position }}
                                        </div>
                                    </td>
                                </ng-container>

                                <!-- Columna Equipo -->
                                <ng-container matColumnDef="team">
                                    <th mat-header-cell *matHeaderCellDef class="team-column">Equipo</th>
                                    <td mat-cell *matCellDef="let element" class="team-cell">
                                        <div class="team-info">
                                            <img
                                                [src]="element.team?.logo || '/assets/default-team.png'"
                                                class="team-logo"
                                                alt="logo"
                                                (error)="onImageError($event)"
                                            />
                                            <span>{{ element.team?.name || 'N/A' }}</span>
                                        </div>
                                    </td>
                                </ng-container>

                                <!-- Columna Puntos -->
                                <ng-container matColumnDef="points">
                                    <th mat-header-cell *matHeaderCellDef class="points-column">Pts</th>
                                    <td mat-cell *matCellDef="let element" class="points-cell">
                                        <span class="points-value">{{ element.points }}</span>
                                    </td>
                                </ng-container>

                                <!-- Columna Partidos Jugados -->
                                <ng-container matColumnDef="played">
                                    <th mat-header-cell *matHeaderCellDef>PJ</th>
                                    <td mat-cell *matCellDef="let element">{{ element.matches_played }}</td>
                                </ng-container>

                                <!-- Columna Partidos Ganados -->
                                <ng-container matColumnDef="won">
                                    <th mat-header-cell *matHeaderCellDef>PG</th>
                                    <td mat-cell *matCellDef="let element" class="won-cell">{{ element.matches_won }}</td>
                                </ng-container>

                                <!-- Columna Partidos Empatados -->
                                <ng-container matColumnDef="drawn">
                                    <th mat-header-cell *matHeaderCellDef>PE</th>
                                    <td mat-cell *matCellDef="let element" class="drawn-cell">{{ element.matches_drawn }}</td>
                                </ng-container>

                                <!-- Columna Partidos Perdidos -->
                                <ng-container matColumnDef="lost">
                                    <th mat-header-cell *matHeaderCellDef>PP</th>
                                    <td mat-cell *matCellDef="let element" class="lost-cell">{{ element.matches_lost }}</td>
                                </ng-container>

                                <!-- Columna Goles a Favor -->
                                <ng-container matColumnDef="goalsFor">
                                    <th mat-header-cell *matHeaderCellDef>GF</th>
                                    <td mat-cell *matCellDef="let element" class="goals-for-cell">{{ element.goals_for }}</td>
                                </ng-container>

                                <!-- Columna Goles en Contra -->
                                <ng-container matColumnDef="goalsAgainst">
                                    <th mat-header-cell *matHeaderCellDef>GC</th>
                                    <td mat-cell *matCellDef="let element" class="goals-against-cell">{{ element.goals_against }}</td>
                                </ng-container>

                                <!-- Columna Diferencia de Goles -->
                                <ng-container matColumnDef="goalDiff">
                                    <th mat-header-cell *matHeaderCellDef>DG</th>
                                    <td mat-cell *matCellDef="let element" class="goal-diff-cell">
                                        <span [ngClass]="getGoalDiffClass((element.goals_for || 0) - (element.goals_against || 0))">
                                            {{ (element.goals_for || 0) - (element.goals_against || 0) >= 0 ? '+' : '' }}{{ (element.goals_for || 0) - (element.goals_against || 0) }}
                                        </span>
                                    </td>
                                </ng-container>

                                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                                <tr mat-row *matRowDef="let row; columns: displayedColumns;" [ngClass]="getRowClass(row)"></tr>
                            </table>
                        </div>

                        <ng-template #noTableData>
                            <div class="no-data">
                                <mat-icon>table_view</mat-icon>
                                <h3>No hay datos disponibles</h3>
                                <p>Selecciona una competencia para ver la tabla de posiciones</p>
                            </div>
                        </ng-template>
                    </div>

                    <!-- Loading spinner -->
                    <div class="loading-container" *ngIf="isLoading">
                        <mat-spinner></mat-spinner>
                        <p>Cargando tabla de posiciones...</p>
                    </div>
                </mat-card-content>
            </mat-card>

            <!-- Leyenda -->
            <mat-card class="legend-card" *ngIf="tableRatings.length > 0">
                <mat-card-header>
                    <mat-card-title>Leyenda</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                    <div class="legend-grid">
                        <div class="legend-item">
                            <div class="legend-color champion"></div>
                            <span>Campeón</span>
                        </div>
                        <div class="legend-item">
                            <div class="legend-color qualification"></div>
                            <span>Clasificación</span>
                        </div>
                        <div class="legend-item">
                            <div class="legend-color relegation"></div>
                            <span>Descenso</span>
                        </div>
                    </div>
                </mat-card-content>
            </mat-card>
        </div>
    `,
    styles: [
        `
            .tabla-posiciones-container {
                padding: 24px;
                max-width: 1200px;
                margin: 0 auto;
            }

            .header-card, .info-card, .table-card, .legend-card {
                margin-bottom: 24px;
            }

            .competition-selector {
                min-width: 300px;
            }

            .competition-info {
                padding: 16px 0;
            }

            .competition-header {
                display: flex;
                align-items: center;
                gap: 16px;
            }

            .competition-icon {
                font-size: 48px;
                width: 48px;
                height: 48px;
                color: #ff9800;
            }

            .competition-details {
                margin: 0;
                color: #757575;
                font-size: 0.875rem;
            }

            .table-container {
                overflow-x: auto;
            }

            .standings-table {
                width: 100%;
            }

            .position-column {
                width: 60px;
                text-align: center;
            }

            .team-column {
                min-width: 200px;
            }

            .points-column {
                width: 80px;
                text-align: center;
            }

            .position-cell, .points-cell {
                text-align: center;
            }

            .position-number {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                font-weight: bold;
                color: white;
            }

            .position-number.champion {
                background-color: #ffd700;
                color: #333;
            }

            .position-number.qualification {
                background-color: #4caf50;
            }

            .position-number.relegation {
                background-color: #f44336;
            }

            .position-number.neutral {
                background-color: #757575;
            }

            .team-info {
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .team-logo {
                width: 32px;
                height: 32px;
                border-radius: 4px;
                object-fit: cover;
            }

            .points-value {
                font-weight: bold;
                font-size: 1.1rem;
                color: #1976d2;
            }

            .won-cell {
                color: #4caf50;
                font-weight: 500;
            }

            .drawn-cell {
                color: #ff9800;
                font-weight: 500;
            }

            .lost-cell {
                color: #f44336;
                font-weight: 500;
            }

            .goals-for-cell {
                color: #4caf50;
                font-weight: 500;
            }

            .goals-against-cell {
                color: #f44336;
                font-weight: 500;
            }

            .goal-diff-positive {
                color: #4caf50;
                font-weight: bold;
            }

            .goal-diff-negative {
                color: #f44336;
                font-weight: bold;
            }

            .goal-diff-neutral {
                color: #757575;
                font-weight: bold;
            }

            .row-champion {
                background-color: #fff8e1;
                border-left: 4px solid #ffd700;
            }

            .row-qualification {
                background-color: #e8f5e8;
                border-left: 4px solid #4caf50;
            }

            .row-relegation {
                background-color: #ffebee;
                border-left: 4px solid #f44336;
            }

            .no-data {
                text-align: center;
                padding: 48px;
                color: #757575;
            }

            .no-data mat-icon {
                font-size: 64px;
                width: 64px;
                height: 64px;
                margin-bottom: 16px;
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

            .legend-grid {
                display: flex;
                gap: 24px;
                flex-wrap: wrap;
            }

            .legend-item {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 0.875rem;
            }

            .legend-color {
                width: 16px;
                height: 16px;
                border-radius: 2px;
            }

            .legend-color.champion {
                background-color: #ffd700;
            }

            .legend-color.qualification {
                background-color: #4caf50;
            }

            .legend-color.relegation {
                background-color: #f44336;
            }

            .d-flex {
                display: flex;
            }

            .justify-content-between {
                justify-content: space-between;
            }

            .align-items-center {
                align-items: center;
            }

            /* Responsive */
            @media (max-width: 768px) {
                .tabla-posiciones-container {
                    padding: 16px;
                }

                .competition-selector {
                    min-width: 200px;
                }

                .d-flex {
                    flex-direction: column;
                    gap: 16px;
                }

                .legend-grid {
                    justify-content: center;
                }
            }
        `,
    ],
})
export class TablaPosicionesComponent implements OnInit {
    competencias: StatisticsCompetence[] = [];
    tableRatings: TableRating[] = [];
    selectedCompetitionId: string = '';
    selectedCompetition?: StatisticsCompetence;
    isLoading = false;

    displayedColumns = [
        'position',
        'team',
        'points',
        'played',
        'won',
        'drawn',
        'lost',
        'goalsFor',
        'goalsAgainst',
        'goalDiff'
    ];

    constructor(private statisticsService: StatisticsService) {}

    ngOnInit() {
        this.loadCompetencias();
    }

    loadCompetencias() {
        const filter: StatisticsFilter = {
            page: 1,
            pageSize: 100, // Cargar todas las competencias
        };

        this.statisticsService.getAllCompetitionsStatistics(filter).subscribe({
            next: (response: any) => {
                console.log('Datos de competencias recibidos del backend:', response);
                // Si la respuesta es un array directo (no paginada)
                if (Array.isArray(response)) {
                    this.competencias = response;
                } else if (response && response.data) {
                    // Si la respuesta es paginada
                    this.competencias = response.data;
                } else {
                    // Fallback
                    this.competencias = response || [];
                }
            },
            error: (error: any) => {
                console.error('Error cargando competencias:', error);
            },
        });
    }

    onCompetitionChange(competitionId: string) {
        this.selectedCompetitionId = competitionId;
        this.selectedCompetition = this.competencias.find(c => c.id === competitionId);
        
        if (competitionId) {
            this.loadTableRating();
        } else {
            this.tableRatings = [];
        }
    }

    loadTableRating() {
        if (!this.selectedCompetitionId) return;

        this.isLoading = true;
        this.statisticsService.getTableRating(this.selectedCompetitionId).subscribe({
            next: (response: any) => {
                console.log('Datos de tabla de posiciones recibidos del backend:', response);
                // Si la respuesta es un array directo (no paginada)
                if (Array.isArray(response)) {
                    this.tableRatings = response.sort((a, b) => (a.position || 0) - (b.position || 0));
                } else if (response && response.data) {
                    // Si la respuesta es paginada
                    this.tableRatings = response.data.sort((a: any, b: any) => (a.position || 0) - (b.position || 0));
                } else {
                    // Fallback
                    this.tableRatings = [];
                }
                this.isLoading = false;
            },
            error: (error: any) => {
                console.error('Error cargando tabla de posiciones:', error);
                this.tableRatings = [];
                this.isLoading = false;
            },
        });
    }

    refreshTable() {
        this.loadTableRating();
    }

    getPositionClass(position: number): string {
        if (position === 1) return 'champion';
        if (position <= 4) return 'qualification';
        if (position >= this.tableRatings.length - 2) return 'relegation';
        return 'neutral';
    }

    getRowClass(row: TableRating): string {
        const position = row.position || 0;
        if (position === 1) return 'row-champion';
        if (position <= 4) return 'row-qualification';
        if (position >= this.tableRatings.length - 2) return 'row-relegation';
        return '';
    }

    getGoalDiffClass(goalDiff: number): string {
        if (goalDiff > 0) return 'goal-diff-positive';
        if (goalDiff < 0) return 'goal-diff-negative';
        return 'goal-diff-neutral';
    }

    onImageError(event: any) {
        if (event.target) {
            event.target.src = '/assets/default-team.png';
        }
    }
}
