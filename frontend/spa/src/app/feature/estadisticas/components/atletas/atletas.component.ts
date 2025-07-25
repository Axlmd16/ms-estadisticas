import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';

import { StatisticsService, Athlete, Team } from '../../../../core/services/statistics/statistics.service';
import { AtletaFormComponent } from './atleta-form/atleta-form.component';

@Component({
    selector: 'app-atletas',
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
        <div class="athletes-container">
            <mat-card class="header-card">
                <mat-card-header>
                    <mat-card-title>Gestión de Atletas</mat-card-title>
                    <mat-card-subtitle>
                        Administra los atletas del sistema
                    </mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                    <div class="d-flex justify-content-between align-items-center">
                        <h3>Lista de Atletas</h3>
                        <button mat-raised-button color="primary" (click)="openAthleteForm()">
                            <mat-icon>add</mat-icon>
                            Nuevo Atleta
                        </button>
                    </div>
                </mat-card-content>
            </mat-card>

            <mat-card class="content-card">
                <table mat-table [dataSource]="athletes" class="w-100">
                    <!-- Nombre -->
                    <ng-container matColumnDef="name">
                        <th mat-header-cell *matHeaderCellDef>Nombre</th>
                        <td mat-cell *matCellDef="let athlete">{{ athlete.name }}</td>
                    </ng-container>

                    <!-- Posición -->
                    <ng-container matColumnDef="position">
                        <th mat-header-cell *matHeaderCellDef>Posición</th>
                        <td mat-cell *matCellDef="let athlete">{{ athlete.position || 'N/A' }}</td>
                    </ng-container>

                    <!-- Equipo -->
                    <ng-container matColumnDef="team">
                        <th mat-header-cell *matHeaderCellDef>Equipo</th>
                        <td mat-cell *matCellDef="let athlete">
                            {{ getTeamName(athlete.team_id) || 'Sin equipo' }}
                        </td>
                    </ng-container>

                    <!-- Acciones -->
                    <ng-container matColumnDef="actions">
                        <th mat-header-cell *matHeaderCellDef>Acciones</th>
                        <td mat-cell *matCellDef="let athlete">
                            <button mat-icon-button color="primary" (click)="editAthlete(athlete)" title="Editar">
                                <mat-icon>edit</mat-icon>
                            </button>
                            <button mat-icon-button color="warn" (click)="deleteAthlete(athlete)" title="Eliminar">
                                <mat-icon>delete</mat-icon>
                            </button>
                        </td>
                    </ng-container>

                    <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
                </table>

                <div *ngIf="athletes.length === 0" class="text-center p-4">
                    <p>No hay atletas registrados</p>
                </div>
            </mat-card>
        </div>
    `,
    styles: [`
        .athletes-container {
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
export class AtletasComponent implements OnInit {
    athletes: Athlete[] = [];
    teams: Team[] = [];
    displayedColumns: string[] = ['name', 'position', 'team', 'actions'];

    constructor(
        private statisticsService: StatisticsService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar
    ) {}

    ngOnInit() {
        this.loadAthletes();
        this.loadTeams();
    }

    loadAthletes() {
        this.statisticsService.getAllAthletes().subscribe({
            next: (athletes) => {
                this.athletes = athletes;
            },
            error: (error) => {
                console.error('Error cargando atletas:', error);
                this.snackBar.open('Error al cargar atletas', 'Cerrar', {
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

    getTeamName(teamId?: string): string {
        if (!teamId) return '';
        const team = this.teams.find(t => t.id === teamId || t._id === teamId);
        return team ? team.name : 'Equipo no encontrado';
    }

    openAthleteForm(athlete?: Athlete) {
        const dialogRef = this.dialog.open(AtletaFormComponent, {
            width: '500px',
            data: { 
                athlete: athlete ? { ...athlete } : null,
                teams: this.teams
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.loadAthletes();
            }
        });
    }

    editAthlete(athlete: Athlete) {
        this.openAthleteForm(athlete);
    }

    deleteAthlete(athlete: Athlete) {
        if (confirm(`¿Está seguro de que desea eliminar al atleta "${athlete.name}"?`)) {
            const athleteId = athlete.id || athlete._id;
            if (athleteId) {
                this.statisticsService.deleteAthlete(athleteId).subscribe({
                    next: () => {
                        this.loadAthletes();
                        this.snackBar.open('Atleta eliminado exitosamente', 'Cerrar', {
                            duration: 3000
                        });
                    },
                    error: (error) => {
                        console.error('Error eliminando atleta:', error);
                        this.snackBar.open('Error al eliminar atleta', 'Cerrar', {
                            duration: 3000
                        });
                    }
                });
            }
        }
    }
}
