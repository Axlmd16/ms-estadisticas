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
import { StatisticsCompetence, StatisticsFilter } from '../../../../../core/models/statistics';
import type { TableRatingWithTeams, TableRatingPosition } from '../../../../../core/services/statistics/statistics.service';
import { CompetenciaFormComponent } from '../competencia-form/competencia-form.component';
import { ApiPaginationResponse } from '../../../../../core/models/api-response';
import type { CompetitionWithTeams } from '../../../../../core/services/statistics/statistics.service';

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
        <div class="competencia-detail-container" *ngIf="competenciaCompleta">
            <!-- Encabezado -->
            <mat-card class="header-card">
                <mat-card-header>
                    <div mat-card-avatar class="competition-avatar">
                        <mat-icon>emoji_events</mat-icon>
                    </div>
                    <mat-card-title>{{ competenciaCompleta.name || competencia?.description || 'Competencia' }}</mat-card-title>
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
                            <div class="stat-value">{{ competenciaCompleta.teams?.length || 0 }}</div>
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
                            <div class="stat-value">{{ competencia?.total_parties || 0 }}</div>
                            <div class="stat-label">Total Partidos</div>
                        </div>
                    </mat-card-content>
                </mat-card>

                <mat-card class="stat-card">
                    <mat-card-content>
                        <div class="stat-icon">
                            <mat-icon>sports_score</mat-icon>
                        </div>
                        <div class="stat-info">
                            <div class="stat-value">{{ competencia?.matches_completed || 0 }}</div>
                            <div class="stat-label">Partidos Completados</div>
                        </div>
                    </mat-card-content>
                </mat-card>

                <mat-card class="stat-card">
                    <mat-card-content>
                        <div class="stat-icon">
                            <mat-icon>trending_up</mat-icon>
                        </div>
                        <div class="stat-info">
                            <div class="stat-value">{{ (competencia?.average_score || 0) | number:'1.2-2' }}</div>
                            <div class="stat-label">Promedio de Puntos</div>
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
                                        <span>{{ competenciaCompleta.name || competencia?.description || 'N/A' }}</span>
                                    </div>
                                    <div class="info-item">
                                        <strong>ID de Competencia:</strong>
                                        <span>{{ competenciaCompleta.id || competencia?.id_competition || competenciaId }}</span>
                                    </div>
                                    <div class="info-item">
                                        <strong>Fecha de Inicio:</strong>
                                        <span>{{ competenciaCompleta.start_date | date:'medium' }}</span>
                                    </div>
                                    <div class="info-item">
                                        <strong>Fecha de Fin:</strong>
                                        <span>{{ competenciaCompleta.end_date | date:'medium' }}</span>
                                    </div>
                                    <div class="info-item">
                                        <strong>Total de Equipos:</strong>
                                        <span>{{ competenciaCompleta.teams?.length || 0 }}</span>
                                    </div>
                                    <div class="info-item" *ngIf="competencia?.total_parties">
                                        <strong>Total de Partidos:</strong>
                                        <span>{{ competencia?.total_parties }}</span>
                                    </div>
                                    <div class="info-item" *ngIf="competencia?.matches_completed">
                                        <strong>Partidos Completados:</strong>
                                        <span>{{ competencia?.matches_completed }}</span>
                                    </div>
                                    <div class="info-item" *ngIf="competencia?.average_score">
                                        <strong>Promedio de Puntos:</strong>
                                        <span>{{ competencia?.average_score | number:'1.2-2' }}</span>
                                    </div>
                                    <div class="info-item" *ngIf="competencia?.record_score">
                                        <strong>Puntuación Récord:</strong>
                                        <span>{{ competencia?.record_score }}</span>
                                    </div>
                                    <div class="info-item" *ngIf="competencia?.date_generation">
                                        <strong>Última Actualización:</strong>
                                        <span>{{ competencia?.date_generation | date:'medium' }}</span>
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
                                <div *ngIf="competencia; else noStatsAvailable">
                                    <div class="metrics-grid">
                                        <div class="metric-item">
                                            <div class="metric-value">{{ competenciaCompleta.teams?.length || 0 }}</div>
                                            <div class="metric-label">Equipos Participantes</div>
                                        </div>
                                        <div class="metric-item">
                                            <div class="metric-value">{{ competencia.total_parties || 0 }}</div>
                                            <div class="metric-label">Total de Partidos</div>
                                        </div>
                                        <div class="metric-item">
                                            <div class="metric-value">{{ competencia.matches_completed || 0 }}</div>
                                            <div class="metric-label">Partidos Completados</div>
                                        </div>
                                        <div class="metric-item">
                                            <div class="metric-value">{{ (competencia.average_score || 0) | number:'1.2-2' }}</div>
                                            <div class="metric-label">Promedio de Puntos</div>
                                        </div>
                                        <div class="metric-item" *ngIf="competencia.record_score">
                                            <div class="metric-value">{{ competencia.record_score }}</div>
                                            <div class="metric-label">Puntuación Récord</div>
                                        </div>
                                    </div>
                                </div>
                                <ng-template #noStatsAvailable>
                                    <div class="no-data">
                                        <mat-icon>analytics</mat-icon>
                                        <h3>Estadísticas no disponibles</h3>
                                        <p>Las estadísticas de esta competencia aún no están disponibles.</p>
                                        <p>Se mostrarán una vez que se registren partidos y resultados.</p>
                                    </div>
                                </ng-template>
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
                                <div class="no-data">
                                    <mat-icon>gavel</mat-icon>
                                    <h3>Datos disciplinarios no disponibles</h3>
                                    <p>Los datos de tarjetas aún no están implementados en este modelo de estadísticas.</p>
                                    <p>Esta funcionalidad será agregada en futuras versiones.</p>
                                </div>
                            </mat-card-content>
                        </mat-card>
                    </div>
                </mat-tab>

                <mat-tab label="Equipos">
                    <div class="tab-content">
                        <mat-card>
                            <mat-card-header>
                                <mat-card-title>Equipos Participantes</mat-card-title>
                                <mat-card-subtitle>{{ competenciaCompleta.teams?.length || 0 }} equipos registrados</mat-card-subtitle>
                            </mat-card-header>
                            <mat-card-content>
                                <div *ngIf="competenciaCompleta.teams && competenciaCompleta.teams.length > 0; else noTeams">
                                    <div class="teams-grid">
                                        <mat-card *ngFor="let team of competenciaCompleta.teams" class="team-card">
                                            <mat-card-header>
                                                <div mat-card-avatar class="team-avatar">
                                                    <mat-icon>groups</mat-icon>
                                                </div>
                                                <mat-card-title>{{ team.name }}</mat-card-title>
                                                <mat-card-subtitle *ngIf="team.description">{{ team.description }}</mat-card-subtitle>
                                            </mat-card-header>
                                            <mat-card-content>
                                                <div class="team-info" *ngIf="team.founded">
                                                    <mat-icon>event</mat-icon>
                                                    <span>Fundado en {{ team.founded }}</span>
                                                </div>
                                            </mat-card-content>
                                            <mat-card-actions>
                                                <button mat-raised-button color="primary" (click)="viewTeamStatistics(team._id || team.id || '')">
                                                    <mat-icon>visibility</mat-icon>
                                                    Ver Estadísticas
                                                </button>
                                            </mat-card-actions>
                                        </mat-card>
                                    </div>
                                </div>
                                <ng-template #noTeams>
                                    <div class="no-data">
                                        <mat-icon>groups_off</mat-icon>
                                        <p>No hay equipos registrados en esta competencia</p>
                                    </div>
                                </ng-template>
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
                                    <table mat-table [dataSource]="tableRatings" class="standings-table better-standings-table">
                                        <ng-container matColumnDef="position">
                                            <th mat-header-cell *matHeaderCellDef class="standings-header">Pos.</th>
                                            <td mat-cell *matCellDef="let element" class="standings-pos">
                                                <ng-container [ngSwitch]="element.position">
                                                    <span *ngSwitchCase="1" class="medal gold">🥇</span>
                                                    <span *ngSwitchCase="2" class="medal silver">🥈</span>
                                                    <span *ngSwitchCase="3" class="medal bronze">🥉</span>
                                                </ng-container>
                                                {{ element.position }}
                                            </td>
                                        </ng-container>

                                        <ng-container matColumnDef="team">
                                            <th mat-header-cell *matHeaderCellDef class="standings-header">Equipo</th>
                                            <td mat-cell *matCellDef="let element" class="standings-team">
                                                <span class="team-name">{{ element.team?.name || 'N/A' }}</span>
                                            </td>
                                        </ng-container>

                                        <ng-container matColumnDef="points">
                                            <th mat-header-cell *matHeaderCellDef class="standings-header">Pts</th>
                                            <td mat-cell *matCellDef="let element" class="standings-points">{{ element.points_total ?? 0 }}</td>
                                        </ng-container>

                                        <tr mat-header-row *matHeaderRowDef="['position', 'team', 'points']" class="standings-header-row"></tr>
                                        <tr mat-row *matRowDef="let row; columns: ['position', 'team', 'points'];" class="standings-row"></tr>
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
                background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                min-height: 100vh;
                border-radius: 12px;
            }

            .header-card {
                margin-bottom: 32px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border-radius: 16px;
                box-shadow: 0 8px 32px rgba(102, 126, 234, 0.25);
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

            .competition-avatar {
                background: rgba(255, 255, 255, 0.2);
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                backdrop-filter: blur(10px);
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

            .stat-card:nth-child(1) .stat-icon {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }

            .stat-card:nth-child(2) .stat-icon {
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                color: white;
            }

            .stat-card:nth-child(3) .stat-icon {
                background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                color: white;
            }

            .stat-card:nth-child(4) .stat-icon {
                background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
                color: white;
            }

            .stat-icon {
                border-radius: 50%;
                width: 56px;
                height: 56px;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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

            .tab-content {
                padding: 24px 0;
            }

            .tab-content .mat-card {
                border-radius: 16px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                border: none;
                background: white;
            }

            .tab-content .mat-card-header {
                background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                border-bottom: 1px solid #dee2e6;
                border-radius: 16px 16px 0 0;
            }

            .tab-content .mat-card-title {
                color: #2c3e50 !important;
                font-weight: 600 !important;
                font-size: 1.4rem !important;
            }

            .tab-content .mat-card-subtitle {
                color: #6c757d !important;
                font-size: 0.95rem !important;
            }

            .tab-content .mat-card-content {
                padding: 24px !important;
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

            .metrics-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
                gap: 24px;
                text-align: center;
            }

            .metric-item {
                padding: 24px 20px;
                border-radius: 16px;
                background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
                border: 1px solid #dee2e6;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                transition: all 0.3s ease;
            }

            .metric-item:hover {
                transform: translateY(-4px);
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
            }

            .metric-value {
                font-size: 2.8rem;
                font-weight: 700;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                margin-bottom: 8px;
            }

            .metric-label {
                font-size: 1rem;
                color: #6c757d;
                margin-top: 8px;
                font-weight: 500;
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
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 4px 16px rgba(67, 103, 255, 0.08);
                background: #fff;
            }

            .better-standings-table th.standings-header {
                background: #667eea;
                color: #fff;
                font-weight: 700;
                font-size: 1.1rem;
                border: none;
                padding: 14px 0;
                text-align: center;
                vertical-align: middle;
            }

            .better-standings-table td {
                font-size: 1.05rem;
                border-bottom: 1px solid #e9ecef;
                padding: 12px 0;
                text-align: center;
                background: #fff;
            }

            .better-standings-table tr.standings-row:nth-child(even) td {
                background: #f8f9fa;
            }

            .standings-pos {
                font-weight: bold;
                color: #2c3e50;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
            }

            .medal {
                font-size: 1.2em;
                margin-right: 2px;
            }
            .medal.gold {
                color: #FFD700;
            }
            .medal.silver {
                color: #C0C0C0;
            }
            .medal.bronze {
                color: #CD7F32;
            }

            .standings-team .team-name {
                font-weight: 600;
                color: #3b3b3b;
                font-size: 1.08rem;
            }

            .standings-points {
                font-weight: 700;
                color: #4facfe;
                font-size: 1.15rem;
            }

            .standings-header-row {
                border-radius: 16px 16px 0 0;
            }

            .standings-row:hover td {
                background: #e3e9f7 !important;
                transition: background 0.2s;
            }

            .teams-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                gap: 20px;
                margin-top: 24px;
            }

            .team-card {
                transition: transform 0.3s ease, box-shadow 0.3s ease;
                border-radius: 16px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                border: none;
                background: white;
                overflow: hidden;
            }

            .team-card:hover {
                transform: translateY(-6px);
                box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
            }

            .team-card .mat-card-header {
                background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                padding: 20px !important;
                border-bottom: 1px solid #dee2e6;
            }

            .team-card .mat-card-content {
                padding: 16px 20px !important;
            }

            .team-avatar {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
                color: white !important;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 48px !important;
                height: 48px !important;
                border-radius: 50% !important;
            }

            .team-card .mat-card-title {
                font-size: 1.2rem !important;
                font-weight: 600 !important;
                color: #2c3e50 !important;
                margin: 0 !important;
            }

            .team-card .mat-card-subtitle {
                color: #6c757d !important;
                font-size: 0.9rem !important;
                margin-top: 4px !important;
            }

            .team-info {
                display: flex;
                align-items: center;
                gap: 8px;
                color: #757575;
                font-size: 0.875rem;
            }

            .team-info mat-icon {
                font-size: 16px;
                width: 16px;
                height: 16px;
            }

            .no-data {
                text-align: center;
                padding: 48px 24px;
                color: #6c757d;
                background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                border-radius: 16px;
                border: 2px dashed #dee2e6;
                margin: 16px 0;
            }

            .no-data mat-icon {
                font-size: 64px;
                width: 64px;
                height: 64px;
                margin-bottom: 20px;
                opacity: 0.6;
                color: #adb5bd;
            }

            .no-data h3 {
                margin: 16px 0 12px 0;
                color: #495057;
                font-weight: 600;
                font-size: 1.4rem;
            }

            .no-data p {
                margin: 8px 0;
                line-height: 1.6;
                font-size: 1rem;
                color: #6c757d;
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

                .teams-grid {
                    grid-template-columns: 1fr;
                }
            }
        `,
    ],
})
export class CompetenciaDetalleComponent implements OnInit {
    competencia?: StatisticsCompetence;
    competenciaCompleta?: CompetitionWithTeams;
    tableRatings: TableRatingPosition[] = [];
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
                this.loadCompetenciaCompleta(this.competenciaId);
                this.loadTableRating(); // Llama automáticamente para ver logs y datos
            }
        });
    }

    loadCompetenciaCompleta(competenciaId: string) {
        this.isLoading = true;
        this.error = null;

        this.statisticsService.getCompetitionWithTeams(competenciaId).subscribe({
            next: (competenciaCompleta) => {
                this.competenciaCompleta = competenciaCompleta;
                this.isLoading = false;
            },
            error: (error) => {
                this.error = error.message || 'Error al cargar la información de la competencia';
                this.isLoading = false;
                console.error('Error al cargar información completa de competencia:', error);
            },
        });
    }

    loadCompetenciaStatistics(competenciaId: string) {
        console.log('🔍 Iniciando carga de estadísticas para competencia ID:', competenciaId);
        
        // Usar el nuevo endpoint que busca por ID de competencia
        this.statisticsService.getCompetitionStatisticsByCompetitionId(competenciaId).subscribe({
            next: (competencia: any) => {
                console.log('✅ Estadísticas de competencia cargadas exitosamente:', competencia);
                console.log('📊 Estructura real de los datos recibidos:');
                console.log('- ID:', competencia?._id);
                console.log('- Description:', competencia?.description);
                console.log('- ID Competition:', competencia?.id_competition);
                console.log('- Date Generation:', competencia?.date_generation);
                console.log('- Value:', competencia?.value);
                console.log('- Average Score:', competencia?.average_score);
                console.log('- Matches Completed:', competencia?.matches_completed);
                console.log('- Record Score:', competencia?.record_score);
                console.log('- Total Parties:', competencia?.total_parties);
                console.log('📋 Objeto completo:', competencia);
                
                this.competencia = competencia;
            },
            error: (error) => {
                console.error('❌ Error al cargar estadísticas de competencia:', error);
                console.log('🔧 Status:', error?.status);
                console.log('🔧 Message:', error?.message);
                console.log('🔧 Error completo:', error);
                
                // No mostramos error ya que las estadísticas pueden no estar disponibles
                // La información básica se mostrará desde competenciaCompleta
            },
        });
    }

    loadTableRating() {
        if (this.competenciaId) {
            this.isLoading = true;
            console.log('[FRONT] Solicitando info de tabla de posiciones al backend para competenciaId:', this.competenciaId);
            this.statisticsService.getTableRatingWithTeams(this.competenciaId).subscribe({
                next: (response: TableRatingWithTeams) => {
                    console.log('[BACKEND] Info de backend sobre tabla de posiciones:', response);
                    if (response && Array.isArray(response.positions) && response.positions.length > 0) {
                        // Ordenar por el campo position que ya viene del backend
                        this.tableRatings = response.positions.slice().sort((a, b) => (a.position ?? 999) - (b.position ?? 999));
                    } else {
                        this.tableRatings = [];
                    }
                    this.isLoading = false;
                },
                error: (error) => {
                    this.error = 'Error cargando tabla de posiciones';
                    this.isLoading = false;
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
            this.statisticsService.deleteCompetition(this.competenciaId).subscribe({
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

    viewTeamStatistics(teamId: string) {
        if (teamId) {
            this.router.navigate(['/estadisticas/equipos', teamId, 'estadisticas']);
        }
    }
}
