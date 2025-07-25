import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';

import { StatisticsService, Team } from '../../../../core/services/statistics/statistics.service';
import { EquipoFormComponent } from './equipo-form/equipo-form.component';

@Component({
    selector: 'app-equipos',
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
        <div class="teams-container">
            <mat-card class="header-card">
                <mat-card-header>
                    <mat-card-title>Gestión de Equipos</mat-card-title>
                    <mat-card-subtitle>
                        Administra los equipos del sistema
                    </mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                    <div class="d-flex justify-content-between align-items-center">
                        <h3>Lista de Equipos</h3>
                        <button mat-raised-button color="primary" (click)="openTeamForm()">
                            <mat-icon>add</mat-icon>
                            Nuevo Equipo
                        </button>
                    </div>
                </mat-card-content>
            </mat-card>

            <mat-card class="content-card">
                <table mat-table [dataSource]="teams" class="w-100">
                    <!-- Nombre -->
                    <ng-container matColumnDef="name">
                        <th mat-header-cell *matHeaderCellDef>Nombre</th>
                        <td mat-cell *matCellDef="let team">{{ team.name }}</td>
                    </ng-container>

                    <!-- Descripción -->
                    <ng-container matColumnDef="description">
                        <th mat-header-cell *matHeaderCellDef>Descripción</th>
                        <td mat-cell *matCellDef="let team">{{ team.description || 'N/A' }}</td>
                    </ng-container>

                    <!-- Fundado -->
                    <ng-container matColumnDef="founded">
                        <th mat-header-cell *matHeaderCellDef>Fundado</th>
                        <td mat-cell *matCellDef="let team">{{ team.founded || 'N/A' }}</td>
                    </ng-container>

                    <!-- Acciones -->
                    <ng-container matColumnDef="actions">
                        <th mat-header-cell *matHeaderCellDef>Acciones</th>
                        <td mat-cell *matCellDef="let team">
                            <button mat-icon-button color="primary" (click)="editTeam(team)" title="Editar">
                                <mat-icon>edit</mat-icon>
                            </button>
                            <button mat-icon-button color="warn" (click)="deleteTeam(team)" title="Eliminar">
                                <mat-icon>delete</mat-icon>
                            </button>
                        </td>
                    </ng-container>

                    <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
                </table>

                <div *ngIf="teams.length === 0" class="text-center p-4">
                    <p>No hay equipos registrados</p>
                </div>
            </mat-card>
        </div>
    `,
    styles: [`
        .teams-container {
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
export class EquiposComponent implements OnInit {
    teams: Team[] = [];
    displayedColumns: string[] = ['name', 'description', 'founded', 'actions'];

    constructor(
        private statisticsService: StatisticsService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar
    ) {}

    ngOnInit() {
        this.loadTeams();
    }

    loadTeams() {
        this.statisticsService.getAllTeams().subscribe({
            next: (teams) => {
                this.teams = teams;
            },
            error: (error) => {
                console.error('Error cargando equipos:', error);
                this.snackBar.open('Error al cargar equipos', 'Cerrar', {
                    duration: 3000
                });
            }
        });
    }

    openTeamForm(team?: Team) {
        const dialogRef = this.dialog.open(EquipoFormComponent, {
            width: '500px',
            data: team ? { ...team } : null
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.loadTeams();
            }
        });
    }

    editTeam(team: Team) {
        this.openTeamForm(team);
    }

    deleteTeam(team: Team) {
        if (confirm(`¿Está seguro de que desea eliminar el equipo "${team.name}"?`)) {
            const teamId = team.id || team._id;
            if (teamId) {
                this.statisticsService.deleteTeam(teamId).subscribe({
                    next: () => {
                        this.loadTeams();
                        this.snackBar.open('Equipo eliminado exitosamente', 'Cerrar', {
                            duration: 3000
                        });
                    },
                    error: (error) => {
                        console.error('Error eliminando equipo:', error);
                        this.snackBar.open('Error al eliminar equipo', 'Cerrar', {
                            duration: 3000
                        });
                    }
                });
            }
        }
    }
}
