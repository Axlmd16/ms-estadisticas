import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { StatisticsService } from '../../../../core/services/statistics/statistics.service';
import { StatisticsTeam } from '../../../../core/models/statistics';

@Component({
    selector: 'app-equipo-detalle',
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
        <div class="team-detail-container" *ngIf="!isLoading && team">
            <!-- Encabezado -->
            <mat-card class="header-card">
                <mat-card-header>
                    <img [src]="team.logo" class="team-logo" alt="logo" />
                    <mat-card-title>{{ team.name }}</mat-card-title>
                    <mat-card-subtitle
                        >Estadísticas de la temporada actual</mat-card-subtitle
                    >
                </mat-card-header>
            </mat-card>

            <!-- Estadísticas principales -->
            <div class="stats-overview">
                <mat-card class="stat-card">
                    <mat-card-content>
                        <div class="stat-value">{{ team.gamesPlayed }}</div>
                        <div class="stat-label">Partidos Jugados</div>
                    </mat-card-content>
                </mat-card>

                <mat-card class="stat-card">
                    <mat-card-content>
                        <div class="stat-value">{{ team.gamesWon }}</div>
                        <div class="stat-label">Victorias</div>
                    </mat-card-content>
                </mat-card>

                <mat-card class="stat-card">
                    <mat-card-content>
                        <div class="stat-value">{{ team.gamesTied }}</div>
                        <div class="stat-label">Empates</div>
                    </mat-card-content>
                </mat-card>

                <mat-card class="stat-card">
                    <mat-card-content>
                        <div class="stat-value">{{ team.gamesLost }}</div>
                        <div class="stat-label">Derrotas</div>
                    </mat-card-content>
                </mat-card>
            </div>

            <!-- Detalles en pestañas -->
            <mat-card class="details-card">
                <mat-tab-group>
                    <!-- Pestaña de Goles -->
                    <mat-tab label="Goles">
                        <div class="tab-content">
                            <div class="stats-grid">
                                <div class="stat-item">
                                    <div class="stat-header">Goles a Favor</div>
                                    <div class="stat-number">
                                        {{ team.goalsScored }}
                                    </div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-header">
                                        Goles en Contra
                                    </div>
                                    <div class="stat-number">
                                        {{ team.goalsAgainst }}
                                    </div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-header">
                                        Diferencia de Goles
                                    </div>
                                    <div class="stat-number">
                                        {{
                                            team.goalsScored - team.goalsAgainst
                                        }}
                                    </div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-header">
                                        Promedio por Partido
                                    </div>
                                    <div class="stat-number">
                                        {{
                                            team.goalsScored / team.gamesPlayed
                                                | number : '1.2-2'
                                        }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </mat-tab>

                    <!-- Pestaña de Rendimiento -->
                    <mat-tab label="Rendimiento">
                        <div class="tab-content">
                            <div class="stats-grid">
                                <div class="stat-item">
                                    <div class="stat-header">% Victorias</div>
                                    <div class="stat-number">
                                        {{
                                            (team.gamesWon / team.gamesPlayed) *
                                                100 | number : '1.0-0'
                                        }}%
                                    </div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-header">% Empates</div>
                                    <div class="stat-number">
                                        {{
                                            (team.gamesTied /
                                                team.gamesPlayed) *
                                                100 | number : '1.0-0'
                                        }}%
                                    </div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-header">% Derrotas</div>
                                    <div class="stat-number">
                                        {{
                                            (team.gamesLost /
                                                team.gamesPlayed) *
                                                100 | number : '1.0-0'
                                        }}%
                                    </div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-header">Efectividad</div>
                                    <div class="stat-number">
                                        {{
                                            ((team.gamesWon * 3 +
                                                team.gamesTied) /
                                                (team.gamesPlayed * 3)) *
                                                100 | number : '1.0-0'
                                        }}%
                                    </div>
                                </div>
                            </div>
                        </div>
                    </mat-tab>
                </mat-tab-group>
            </mat-card>
        </div>

        <!-- Loading spinner -->
        <div *ngIf="isLoading" class="loading-container">
            <mat-spinner></mat-spinner>
        </div>

        <!-- Error message -->
        <div *ngIf="error" class="error-container">
            <mat-card>
                <mat-card-content>
                    <mat-icon color="warn">error</mat-icon>
                    <p>{{ error }}</p>
                    <button
                        mat-raised-button
                        color="primary"
                        (click)="loadTeamStatistics(teamId)"
                    >
                        Reintentar
                    </button>
                </mat-card-content>
            </mat-card>
        </div>
    `,
    styles: [
        `
            @use '../../../../../styles/variables' as vars;
            @use '../../../../../styles/mixins' as mixins;

            .team-detail-container {
                padding: vars.$spacing-6;
                max-width: vars.$container-lg;
                margin: 0 auto;
            }

            .header-card {
                margin-bottom: vars.$spacing-6;
                @include mixins.card;

                .team-logo {
                    width: 64px;
                    height: 64px;
                    border-radius: vars.$border-radius-full;
                    margin-right: vars.$spacing-4;
                }

                mat-card-title {
                    font-size: vars.$font-size-2xl;
                    margin-bottom: vars.$spacing-2;
                }
            }

            .stats-overview {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: vars.$spacing-4;
                margin-bottom: vars.$spacing-6;
            }

            .stat-card {
                @include mixins.card;
                text-align: center;
                padding: vars.$spacing-4;

                .stat-value {
                    font-size: vars.$font-size-3xl;
                    font-weight: vars.$font-weight-bold;
                    color: vars.$primary-color;
                }

                .stat-label {
                    color: vars.$font-secondary-color;
                    font-size: vars.$font-size-sm;
                    margin-top: vars.$spacing-2;
                }
            }

            .details-card {
                @include mixins.card;

                .tab-content {
                    padding: vars.$spacing-6;
                }
            }

            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: vars.$spacing-6;
            }

            .stat-item {
                text-align: center;

                .stat-header {
                    color: vars.$font-secondary-color;
                    font-size: vars.$font-size-sm;
                    margin-bottom: vars.$spacing-2;
                }

                .stat-number {
                    font-size: vars.$font-size-2xl;
                    font-weight: vars.$font-weight-bold;
                    color: vars.$primary-color;
                }
            }

            .loading-container {
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 400px;
            }

            .error-container {
                text-align: center;
                padding: vars.$spacing-6;

                mat-icon {
                    font-size: 48px;
                    height: 48px;
                    width: 48px;
                    margin-bottom: vars.$spacing-4;
                }

                p {
                    color: vars.$error-color;
                    margin-bottom: vars.$spacing-4;
                }
            }

            // Responsive
            @include mixins.respond-to(md) {
                .team-detail-container {
                    padding: vars.$spacing-4;
                }

                .stats-grid {
                    grid-template-columns: repeat(2, 1fr);
                }
            }

            @include mixins.respond-to(sm) {
                .stats-overview {
                    grid-template-columns: repeat(2, 1fr);
                }

                .stats-grid {
                    grid-template-columns: 1fr;
                }
            }
        `,
    ],
})
export class EquipoDetalleComponent implements OnInit {
    team?: StatisticsTeam;
    isLoading = false;
    error: string | null = null;
    teamId: string = '';

    constructor(
        private route: ActivatedRoute,
        private statisticsService: StatisticsService
    ) {}

    ngOnInit() {
        this.route.params.subscribe((params) => {
            if (params['id']) {
                this.teamId = params['id'];
                this.loadTeamStatistics(this.teamId);
            }
        });
    }

    loadTeamStatistics(teamId: string) {
        this.isLoading = true;
        this.error = null;

        this.statisticsService.getTeamStatistics(teamId).subscribe({
            next: (team) => {
                this.team = team;
                this.isLoading = false;
            },
            error: (error) => {
                this.error =
                    error.message ||
                    'Error al cargar las estadísticas del equipo';
                this.isLoading = false;
            },
        });
    }
}
