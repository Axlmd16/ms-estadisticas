import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { StatisticsService } from '../../../../../core/services/statistics/statistics.service';
import { StatisticsCompetence, TableRating, StatisticsFilter } from '../../../../../core/models/statistics';
import { CompetenciaFormComponent } from '../competencia-form/competencia-form.component';
import { ApiPaginationResponse } from '../../../../../core/models/api-response';

@Component({
    selector: 'app-competencia-detalle',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatIconModule,
        MatButtonModule,
        MatTabsModule,
        MatProgressSpinnerModule,
        MatTableModule,
    ],
    template: `
        <div class="competencia-detail-container" *ngIf="!isLoading && competencia">
            <!-- Encabezado -->
            <mat-card class="header-card">
                <mat-card-header>
                    <div mat-card-avatar class="competition-avatar">
                        <mat-icon>emoji_events</mat-icon>
                    </div>
                    <mat-card-title>{{ competencia.competition_name }}</mat-card-title>
                    <mat-card-subtitle>
                        Estadísticas detalladas de la competencia
                    </mat-card-subtitle>
                </mat-card-header>
                <mat-card-actions>
                    <button mat-raised-button color="primary" (click)="editCompetencia()">
                        <mat-icon>edit</mat-icon>
                        Editar
                    </button>
                    <button mat-raised-button color="warn" (click)="deleteCompetencia()">
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
                            <mat-icon>groups</mat-icon>
                        </div>
                        <div class="stat-info">
                            <div class="stat-value">{{ competencia.total_teams }}</div>
                            <div class="stat-label">Equipos</div>
                        </div>
                    </mat-card-content>
                </mat-card>

                <mat-card class="stat-card">
                    <mat-card-content>
                        <div class="stat-icon">
                            <mat-icon>sports_soccer</mat-icon>
                        </div>
                        <div class="stat-info">
                            <div class="stat-value">{{ competencia.total_matches }}</div>
                            <div class="stat-label">Partidos</div>
                        </div>
                    </mat-card-content>
                </mat-card>

                <mat-card class="stat-card">
                    <mat-card-content>
                        <div class="stat-icon">
                            <mat-icon>sports_score</mat-icon>
                        </div>
                        <div class="stat-info">
                            <div class="stat-value">{{ competencia.total_goals }}</div>
                            <div class="stat-label">Goles</div>
                        </div>
                    </mat-card-content>
                </mat-card>

                <mat-card class="stat-card">
                    <mat-card-content>
                        <div class="stat-icon">
                            <mat-icon>trending_up</mat-icon>
                        </div>
                        <div class="stat-info">
                            <div class="stat-value">{{ competencia.average_goals_per_match | number:'1.2-2' }}</div>
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
                                <mat-card-title>Datos de la Competencia</mat-card-title>
                            </mat-card-header>
                            <mat-card-content>
                                <div class="info-grid">
                                    <div class="info-item">
                                        <strong>Nombre:</strong>
                                        <span>{{ competencia.competition_name }}</span>
                                    </div>
                                    <div class="info-item">
                                        <strong>ID de Competencia:</strong>
                                        <span>{{ competencia.competition_id }}</span>
                                    </div>
                                    <div class="info-item">
                                        <strong>Total de Equipos:</strong>
                                        <span>{{ competencia.total_teams }}</span>
                                    </div>
                                    <div class="info-item">
                                        <strong>Total de Partidos:</strong>
                                        <span>{{ competencia.total_matches }}</span>
                                    </div>
                                    <div class="info-item">
                                        <strong>Total de Goles:</strong>
                                        <span>{{ competencia.total_goals }}</span>
                                    </div>
                                    <div class="info-item">
                                        <strong>Promedio de Goles:</strong>
                                        <span>{{ competencia.average_goals_per_match | number:'1.2-2' }}</span>
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
                                        <div class="metric-value">{{ competencia.total_teams }}</div>
                                        <div class="metric-label">Equipos Participantes</div>
                                    </div>
                                    <div class="metric-item">
                                        <div class="metric-value">{{ competencia.total_matches }}</div>
                                        <div class="metric-label">Partidos Jugados</div>
                                    </div>
                                    <div class="metric-item">
                                        <div class="metric-value">{{ competencia.total_goals }}</div>
                                        <div class="metric-label">Total de Goles</div>
                                    </div>
                                    <div class="metric-item">
                                        <div class="metric-value">{{ competencia.average_goals_per_match | number:'1.2-2' }}</div>
                                        <div class="metric-label">Goles por Partido</div>
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
                                <mat-card-title>Estadísticas Disciplinarias</mat-card-title>
                            </mat-card-header>
                            <mat-card-content>
                                <div class="discipline-grid">
                                    <div class="discipline-item yellow">
                                        <div class="card-icon">
                                            <mat-icon>warning</mat-icon>
                                        </div>
                                        <div class="card-count">{{ competencia.total_yellow_cards }}</div>
                                        <div class="card-label">Tarjetas Amarillas</div>
                                    </div>
                                    <div class="discipline-item red">
                                        <div class="card-icon">
                                            <mat-icon>error</mat-icon>
                                        </div>
                                        <div class="card-count">{{ competencia.total_red_cards }}</div>
                                        <div class="card-label">Tarjetas Rojas</div>
                                    </div>
                                </div>
                            </mat-card-content>
                        </mat-card>
                    </div>
                </mat-tab>

                <mat-tab label="Tabla de Posiciones" (click)="loadTableRating()">
                    <div class="tab-content">
                        <mat-card>
                            <mat-card-header>
                                <mat-card-title>Tabla de Posiciones</mat-card-title>
                            </mat-card-header>
                            <mat-card-content>
                                <div *ngIf="tableRatings.length > 0; else noTable">
                                    <table mat-table [dataSource]="tableRatings" class="standings-table">
                                        <ng-container matColumnDef="position">
                                            <th mat-header-cell *matHeaderCellDef>Pos.</th>
                                            <td mat-cell *matCellDef="let element">{{ element.position }}</td>
                                        </ng-container>

                                        <ng-container matColumnDef="team">
                                            <th mat-header-cell *matHeaderCellDef>Equipo</th>
                                            <td mat-cell *matCellDef="let element">{{ element.team?.name || 'N/A' }}</td>
                                        </ng-container>

                                        <ng-container matColumnDef="points">
                                            <th mat-header-cell *matHeaderCellDef>Pts</th>
                                            <td mat-cell *matCellDef="let element">{{ element.points }}</td>
                                        </ng-container>

                                        <ng-container matColumnDef="played">
                                            <th mat-header-cell *matHeaderCellDef>PJ</th>
                                            <td mat-cell *matCellDef="let element">{{ element.matches_played }}</td>
                                        </ng-container>

                                        <ng-container matColumnDef="won">
                                            <th mat-header-cell *matHeaderCellDef>PG</th>
                                            <td mat-cell *matCellDef="let element">{{ element.matches_won }}</td>
                                        </ng-container>

                                        <ng-container matColumnDef="drawn">
                                            <th mat-header-cell *matHeaderCellDef>PE</th>
                                            <td mat-cell *matCellDef="let element">{{ element.matches_drawn }}</td>
                                        </ng-container>

                                        <ng-container matColumnDef="lost">
                                            <th mat-header-cell *matHeaderCellDef>PP</th>
                                            <td mat-cell *matCellDef="let element">{{ element.matches_lost }}</td>
                                        </ng-container>

                                        <ng-container matColumnDef="goalsFor">
                                            <th mat-header-cell *matHeaderCellDef>GF</th>
                                            <td mat-cell *matCellDef="let element">{{ element.goals_for }}</td>
                                        </ng-container>

                                        <ng-container matColumnDef="goalsAgainst">
                                            <th mat-header-cell *matHeaderCellDef>GC</th>
                                            <td mat-cell *matCellDef="let element">{{ element.goals_against }}</td>
                                        </ng-container>

                                        <ng-container matColumnDef="goalDiff">
                                            <th mat-header-cell *matHeaderCellDef>DG</th>
                                            <td mat-cell *matCellDef="let element">{{ (element.goals_for || 0) - (element.goals_against || 0) }}</td>
                                        </ng-container>

                                        <tr mat-header-row *matHeaderRowDef="standingsColumns"></tr>
                                        <tr mat-row *matRowDef="let row; columns: standingsColumns;"></tr>
                                    </table>
                                </div>
                                <ng-template #noTable>
                                    <div class="no-data">
                                        <mat-icon>table_view</mat-icon>
                                        <p>No hay datos de tabla de posiciones disponibles</p>
                                    </div>
                                </ng-template>
                            </mat-card-content>
                        </mat-card>
                    </div>
                </mat-tab>
            </mat-tab-group>
        </div>

        <!-- Loading spinner -->
        <div class="loading-container" *ngIf="isLoading">
            <mat-spinner></mat-spinner>
            <p>Cargando información de la competencia...</p>
        </div>

        <!-- Error message -->
        <div class="error-container" *ngIf="error">
            <mat-card>
                <mat-card-content>
                    <div class="error-content">
                        <mat-icon color="warn">error</mat-icon>
                        <h3>Error al cargar la información</h3>
                        <p>{{ error }}</p>
                        <button mat-raised-button color="primary" (click)="loadCompetenciaStatistics(competenciaId)">
                            Reintentar
                        </button>
                    </div>
                </mat-card-content>
            </mat-card>
        </div>
    `,
    styles: [
        `
            .competencia-detail-container {
                padding: 24px;
                max-width: 1200px;
                margin: 0 auto;
            }

            .header-card {
                margin-bottom: 24px;
            }

            .competition-avatar {
                background-color: #ff9800;
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
                background-color: #fff3e0;
                border-radius: 50%;
                width: 48px;
                height: 48px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #ff9800;
            }

            .stat-value {
                font-size: 2rem;
                font-weight: bold;
                color: #ff9800;
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
                color: #ff9800;
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

            .standings-table {
                width: 100%;
                margin-top: 16px;
            }

            .no-data {
                text-align: center;
                padding: 48px;
                color: #757575;
            }

            .no-data mat-icon {
                font-size: 48px;
                width: 48px;
                height: 48px;
                margin-bottom: 16px;
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
                .competencia-detail-container {
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
export class CompetenciaDetalleComponent implements OnInit {
    competencia?: StatisticsCompetence;
    tableRatings: TableRating[] = [];
    isLoading = false;
    error: string | null = null;
    competenciaId: string = '';
    standingsColumns = ['position', 'team', 'points', 'played', 'won', 'drawn', 'lost', 'goalsFor', 'goalsAgainst', 'goalDiff'];

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
                this.competenciaId = params['id'];
                this.loadCompetenciaStatistics(this.competenciaId);
            }
        });
    }

    loadCompetenciaStatistics(competenciaId: string) {
        this.isLoading = true;
        this.error = null;

        this.statisticsService.getCompetitionStatistics(competenciaId).subscribe({
            next: (competencia) => {
                this.competencia = competencia;
                this.isLoading = false;
            },
            error: (error) => {
                this.error = error.message || 'Error al cargar las estadísticas de la competencia';
                this.isLoading = false;
            },
        });
    }

    loadTableRating() {
        if (this.competenciaId && this.tableRatings.length === 0) {
            this.statisticsService.getTableRating(this.competenciaId).subscribe({
                next: (response: ApiPaginationResponse<TableRating>) => {
                    this.tableRatings = response.data;
                },
                error: (error) => {
                    console.error('Error cargando tabla de posiciones:', error);
                },
            });
        }
    }

    editCompetencia() {
        const dialogRef = this.dialog.open(CompetenciaFormComponent, {
            width: '600px',
            data: { competencia: this.competencia },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.loadCompetenciaStatistics(this.competenciaId);
            }
        });
    }

    deleteCompetencia() {
        if (confirm('¿Está seguro de que desea eliminar esta competencia?')) {
            this.statisticsService.deleteCompetitionStatistics(this.competenciaId).subscribe({
                next: () => {
                    this.snackBar.open('Competencia eliminada exitosamente', 'Cerrar', {
                        duration: 3000,
                    });
                    this.router.navigate(['/estadisticas/competencias']);
                },
                error: (error) => {
                    this.snackBar.open('Error al eliminar la competencia', 'Cerrar', {
                        duration: 3000,
                    });
                    console.error('Error:', error);
                },
            });
        }
    }
}
