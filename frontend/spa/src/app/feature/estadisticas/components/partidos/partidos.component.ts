import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';

import { StatisticsService, Match, Team, Season } from '../../../../core/services/statistics/statistics.service';
import { PartidoFormComponent } from './partido-form/partido-form.component';

@Component({
    selector: 'app-partidos',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatTableModule,
        MatDialogModule,
        MatSnackBarModule,
    ],
    template: `
        <div class="matches-container">
            <mat-card class="header-card">
                <mat-card-header>
                    <mat-card-title>Gestión de Partidos</mat-card-title>
                    <mat-card-subtitle>
                        Administra los partidos del sistema
                    </mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                    <div class="d-flex justify-content-between align-items-center">
                        <h3>Lista de Partidos</h3>
                        <button mat-raised-button color="primary" (click)="openMatchForm()">
                            <mat-icon>add</mat-icon>
                            Nuevo Partido
                        </button>
                    </div>
                </mat-card-content>
            </mat-card>

            <mat-card class="content-card">
                <table mat-table [dataSource]="matches" class="w-100">
                    <!-- Equipo Local -->
                    <ng-container matColumnDef="local_team">
                        <th mat-header-cell *matHeaderCellDef>Equipo Local</th>
                        <td mat-cell *matCellDef="let match">
                            {{ getTeamName(match.local_team_id) }}
                        </td>
                    </ng-container>

                    <!-- vs -->
                    <ng-container matColumnDef="vs">
                        <th mat-header-cell *matHeaderCellDef>vs</th>
                        <td mat-cell *matCellDef="let match">vs</td>
                    </ng-container>

                    <!-- Equipo Visitante -->
                    <ng-container matColumnDef="visitor_team">
                        <th mat-header-cell *matHeaderCellDef>Equipo Visitante</th>
                        <td mat-cell *matCellDef="let match">
                            {{ getTeamName(match.visitor_team_id) }}
                        </td>
                    </ng-container>

                    <!-- Temporada -->
                    <ng-container matColumnDef="season">
                        <th mat-header-cell *matHeaderCellDef>Temporada</th>
                        <td mat-cell *matCellDef="let match">
                            {{ getSeasonName(match.season_id) || 'Sin temporada' }}
                        </td>
                    </ng-container>

                    <!-- Fecha -->
                    <ng-container matColumnDef="date">
                        <th mat-header-cell *matHeaderCellDef>Fecha</th>
                        <td mat-cell *matCellDef="let match">
                            <span *ngIf="match.date; else noDate">
                                {{ match.date | date:'dd/MM/yyyy HH:mm' }}
                            </span>
                            <ng-template #noDate>Sin fecha</ng-template>
                        </td>
                    </ng-container>

                    <!-- Acciones -->
                    <ng-container matColumnDef="actions">
                        <th mat-header-cell *matHeaderCellDef>Acciones</th>
                        <td mat-cell *matCellDef="let match">
                            <button mat-icon-button color="primary" (click)="editMatch(match)" title="Editar">
                                <mat-icon>edit</mat-icon>
                            </button>
                            <button mat-icon-button color="warn" (click)="deleteMatch(match)" title="Eliminar">
                                <mat-icon>delete</mat-icon>
                            </button>
                        </td>
                    </ng-container>

                    <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
                </table>

                <div *ngIf="matches.length === 0" class="text-center p-4">
                    <p>No hay partidos registrados</p>
                </div>
            </mat-card>
        </div>
    `,
    styles: [`
        .matches-container {
            padding: 20px;
            max-width: 1200px;
            margin: 0 auto;
        }

        .header-card, .content-card {
            margin-bottom: 20px;
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

        .w-100 {
            width: 100%;
        }

        .text-center {
            text-align: center;
        }

        .p-4 {
            padding: 2rem;
        }
    `]
})
export class PartidosComponent implements OnInit {
    matches: Match[] = [];
    teams: Team[] = [];
    seasons: Season[] = [];
    displayedColumns: string[] = ['local_team', 'vs', 'visitor_team', 'season', 'date', 'actions'];

    constructor(
        private statisticsService: StatisticsService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar
    ) {}

    ngOnInit() {
        this.loadMatches();
        this.loadTeams();
        this.loadSeasons();
    }

    loadMatches() {
        this.statisticsService.getAllMatches().subscribe({
            next: (matches) => {
                this.matches = matches;
            },
            error: (error) => {
                console.error('Error cargando partidos:', error);
                this.snackBar.open('Error al cargar partidos', 'Cerrar', {
                    duration: 3000
                });
            }
        });
    }

    loadTeams() {
        this.statisticsService.getAllTeams().subscribe({
            next: (teams) => {
                this.teams = teams;
            },
            error: (error) => {
                console.error('Error cargando equipos:', error);
            }
        });
    }

    loadSeasons() {
        this.statisticsService.getAllSeasons().subscribe({
            next: (seasons) => {
                this.seasons = seasons;
            },
            error: (error) => {
                console.error('Error cargando temporadas:', error);
            }
        });
    }

    getTeamName(teamId?: string): string {
        if (!teamId) return 'Equipo no especificado';
        const team = this.teams.find(t => t.id === teamId || t._id === teamId);
        return team ? team.name : 'Equipo no encontrado';
    }

    getSeasonName(seasonId?: string): string {
        if (!seasonId) return '';
        const season = this.seasons.find(s => s.id === seasonId || s._id === seasonId);
        return season ? season.name : 'Temporada no encontrada';
    }

    openMatchForm(match?: Match) {
        const dialogRef = this.dialog.open(PartidoFormComponent, {
            width: '600px',
            data: { 
                match: match ? { ...match } : null,
                teams: this.teams,
                seasons: this.seasons
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.loadMatches();
            }
        });
    }

    editMatch(match: Match) {
        this.openMatchForm(match);
    }

    deleteMatch(match: Match) {
        const localTeam = this.getTeamName(match.local_team_id);
        const visitorTeam = this.getTeamName(match.visitor_team_id);
        
        if (confirm(`¿Está seguro de que desea eliminar el partido "${localTeam} vs ${visitorTeam}"?`)) {
            const matchId = match.id || match._id;
            if (matchId) {
                this.statisticsService.deleteMatch(matchId).subscribe({
                    next: () => {
                        this.loadMatches();
                        this.snackBar.open('Partido eliminado exitosamente', 'Cerrar', {
                            duration: 3000
                        });
                    },
                    error: (error) => {
                        console.error('Error eliminando partido:', error);
                        this.snackBar.open('Error al eliminar partido', 'Cerrar', {
                            duration: 3000
                        });
                    }
                });
            }
        }
    }
}
