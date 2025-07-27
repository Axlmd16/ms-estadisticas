import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';

import { StatisticsService, Season } from '../../../../core/services/statistics/statistics.service';
import { TemporadaFormComponent } from './temporada-form/temporada-form.component';

@Component({
    selector: 'app-temporada-crud',
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
        <div class="seasons-container">
            <mat-card class="header-card">
                <mat-card-header>
                    <mat-card-title>Gestión de Temporadas</mat-card-title>
                    <mat-card-subtitle>
                        Administra las temporadas del sistema
                    </mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                    <div class="d-flex justify-content-between align-items-center">
                        <h3>Lista de Temporadas</h3>
                        <button mat-raised-button color="primary" (click)="openSeasonForm()">
                            <mat-icon>add</mat-icon>
                            Nueva Temporada
                        </button>
                    </div>
                </mat-card-content>
            </mat-card>

            <mat-card class="content-card">
                <table mat-table [dataSource]="seasons" class="w-100">
                    <!-- Nombre -->
                    <ng-container matColumnDef="name">
                        <th mat-header-cell *matHeaderCellDef>Nombre</th>
                        <td mat-cell *matCellDef="let season">{{ season.name }}</td>
                    </ng-container>

                    <!-- Descripción -->
                    <ng-container matColumnDef="description">
                        <th mat-header-cell *matHeaderCellDef>Descripción</th>
                        <td mat-cell *matCellDef="let season">{{ season.description }}</td>
                    </ng-container>

                    <!-- Fecha Inicio -->
                    <ng-container matColumnDef="startDate">
                        <th mat-header-cell *matHeaderCellDef>Fecha Inicio</th>
                        <td mat-cell *matCellDef="let season">
                            {{ season.startDate | date:'dd/MM/yyyy' }}
                        </td>
                    </ng-container>

                    <!-- Fecha Fin -->
                    <ng-container matColumnDef="endDate">
                        <th mat-header-cell *matHeaderCellDef>Fecha Fin</th>
                        <td mat-cell *matCellDef="let season">
                            {{ season.endDate | date:'dd/MM/yyyy' }}
                        </td>
                    </ng-container>

                    <!-- Acciones -->
                    <ng-container matColumnDef="actions">
                        <th mat-header-cell *matHeaderCellDef>Acciones</th>
                        <td mat-cell *matCellDef="let season">
                            <button mat-icon-button color="primary" (click)="editSeason(season)" title="Editar">
                                <mat-icon>edit</mat-icon>
                            </button>
                            <button mat-icon-button color="warn" (click)="deleteSeason(season)" title="Eliminar">
                                <mat-icon>delete</mat-icon>
                            </button>
                        </td>
                    </ng-container>

                    <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
                </table>

                <div *ngIf="seasons.length === 0" class="text-center p-4">
                    <p>No hay temporadas registradas</p>
                </div>
            </mat-card>
        </div>
    `,
    styles: [`
        .seasons-container {
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
export class TemporadaCrudComponent implements OnInit {
    seasons: Season[] = [];
    displayedColumns: string[] = ['name', 'description', 'startDate', 'endDate', 'actions'];

    constructor(
        private statisticsService: StatisticsService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar
    ) {}

    ngOnInit() {
        this.loadSeasons();
    }

    loadSeasons() {
        this.statisticsService.getAllSeasons().subscribe({
            next: (seasons) => {
                this.seasons = seasons;
            },
            error: (error) => {
                console.error('Error cargando temporadas:', error);
                this.snackBar.open('Error al cargar temporadas', 'Cerrar', {
                    duration: 3000
                });
            }
        });
    }

    openSeasonForm(season?: Season) {
        const dialogRef = this.dialog.open(TemporadaFormComponent, {
            width: '600px',
            data: season ? { ...season } : null
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.loadSeasons();
            }
        });
    }

    editSeason(season: Season) {
        this.openSeasonForm(season);
    }

    deleteSeason(season: Season) {
        if (confirm(`¿Está seguro de que desea eliminar la temporada "${season.name}"?`)) {
            const seasonId = season.id || season._id;
            if (seasonId) {
                this.statisticsService.deleteSeason(seasonId).subscribe({
                    next: () => {
                        this.loadSeasons();
                        this.snackBar.open('Temporada eliminada exitosamente', 'Cerrar', {
                            duration: 3000
                        });
                    },
                    error: (error) => {
                        console.error('Error eliminando temporada:', error);
                        this.snackBar.open('Error al eliminar temporada', 'Cerrar', {
                            duration: 3000
                        });
                    }
                });
            }
        }
    }
}
