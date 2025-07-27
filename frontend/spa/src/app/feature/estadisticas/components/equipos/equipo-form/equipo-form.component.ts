import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Inject } from '@angular/core';

import { StatisticsService } from '../../../../../core/services/statistics/statistics.service';
import { StatisticsTeam } from '../../../../../core/models/statistics';

@Component({
    selector: 'app-equipo-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatSnackBarModule,
    ],
    template: `
        <div class="equipo-form">
            <h2 mat-dialog-title>
                {{ isEditMode ? 'Editar' : 'Crear' }} Estadísticas de Equipo
            </h2>

            <div mat-dialog-content>
                <form [formGroup]="equipoForm" class="form-container">
                    <div class="form-row">
                        <mat-form-field appearance="outline" class="full-width">
                            <mat-label>Nombre del Equipo</mat-label>
                            <input matInput formControlName="name" />
                            <mat-error *ngIf="equipoForm.get('name')?.hasError('required')">
                                El nombre es requerido
                            </mat-error>
                        </mat-form-field>
                    </div>

                    <div class="form-row">
                        <mat-form-field appearance="outline" class="half-width">
                            <mat-label>Partidos Jugados</mat-label>
                            <input matInput type="number" formControlName="gamesPlayed" />
                        </mat-form-field>

                        <mat-form-field appearance="outline" class="half-width">
                            <mat-label>Partidos Ganados</mat-label>
                            <input matInput type="number" formControlName="gamesWon" />
                        </mat-form-field>
                    </div>

                    <div class="form-row">
                        <mat-form-field appearance="outline" class="half-width">
                            <mat-label>Partidos Empatados</mat-label>
                            <input matInput type="number" formControlName="gamesTied" />
                        </mat-form-field>

                        <mat-form-field appearance="outline" class="half-width">
                            <mat-label>Partidos Perdidos</mat-label>
                            <input matInput type="number" formControlName="gamesLost" />
                        </mat-form-field>
                    </div>

                    <div class="form-row">
                        <mat-form-field appearance="outline" class="half-width">
                            <mat-label>Goles Anotados</mat-label>
                            <input matInput type="number" formControlName="goalsScored" />
                        </mat-form-field>

                        <mat-form-field appearance="outline" class="half-width">
                            <mat-label>Goles Recibidos</mat-label>
                            <input matInput type="number" formControlName="goalsAgainst" />
                        </mat-form-field>
                    </div>

                    <div class="form-row">
                        <mat-form-field appearance="outline" class="full-width">
                            <mat-label>ID de Temporada</mat-label>
                            <input matInput formControlName="seasonId" />
                        </mat-form-field>
                    </div>

                    <div class="form-row">
                        <mat-form-field appearance="outline" class="full-width">
                            <mat-label>URL del Logo</mat-label>
                            <input matInput formControlName="logo" />
                        </mat-form-field>
                    </div>
                </form>
            </div>

            <div mat-dialog-actions align="end">
                <button mat-button (click)="onCancel()" [disabled]="isLoading">
                    Cancelar
                </button>
                <button
                    mat-raised-button
                    color="primary"
                    (click)="onSave()"
                    [disabled]="!equipoForm.valid || isLoading"
                >
                    <mat-spinner diameter="20" *ngIf="isLoading"></mat-spinner>
                    {{ isEditMode ? 'Actualizar' : 'Crear' }}
                </button>
            </div>
        </div>
    `,
    styles: [
        `
            .equipo-form {
                width: 500px;
                max-width: 90vw;
            }

            .form-container {
                display: flex;
                flex-direction: column;
                gap: 16px;
                margin: 16px 0;
            }

            .form-row {
                display: flex;
                gap: 16px;
            }

            .full-width {
                flex: 1;
            }

            .half-width {
                flex: 0.5;
            }

            mat-spinner {
                margin-right: 8px;
            }
        `,
    ],
})
export class EquipoFormComponent implements OnInit {
    equipoForm: FormGroup;
    isLoading = false;
    isEditMode = false;

    constructor(
        private fb: FormBuilder,
        private statisticsService: StatisticsService,
        private snackBar: MatSnackBar,
        public dialogRef: MatDialogRef<EquipoFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { equipo?: StatisticsTeam }
    ) {
        this.equipoForm = this.createForm();
        this.isEditMode = !!data?.equipo;
    }

    ngOnInit() {
        if (this.isEditMode && this.data.equipo) {
            this.loadEquipoData();
        }
    }

    private createForm(): FormGroup {
        return this.fb.group({
            name: ['', [Validators.required]],
            gamesPlayed: [0, [Validators.min(0)]],
            gamesWon: [0, [Validators.min(0)]],
            gamesTied: [0, [Validators.min(0)]],
            gamesLost: [0, [Validators.min(0)]],
            goalsScored: [0, [Validators.min(0)]],
            goalsAgainst: [0, [Validators.min(0)]],
            seasonId: [''],
            logo: [''],
        });
    }

    private loadEquipoData() {
        if (this.data.equipo) {
            this.equipoForm.patchValue({
                name: this.data.equipo.name,
                gamesPlayed: this.data.equipo.gamesPlayed,
                gamesWon: this.data.equipo.gamesWon,
                gamesTied: this.data.equipo.gamesTied,
                gamesLost: this.data.equipo.gamesLost,
                goalsScored: this.data.equipo.goalsScored,
                goalsAgainst: this.data.equipo.goalsAgainst,
                seasonId: this.data.equipo.seasonId,
                logo: this.data.equipo.logo,
            });
        }
    }

    onSave() {
        if (this.equipoForm.valid) {
            this.isLoading = true;
            const equipoData: StatisticsTeam = {
                ...this.equipoForm.value,
                id: this.isEditMode ? this.data.equipo!.id : '',
                teamId: this.isEditMode ? this.data.equipo!.teamId : '',
                createdAt: this.isEditMode ? this.data.equipo!.createdAt : new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            const operation = this.isEditMode
                ? this.statisticsService.updateTeamStatistics(equipoData.id, equipoData)
                : this.statisticsService.createTeamStatistics(equipoData);

            operation.subscribe({
                next: (result) => {
                    this.isLoading = false;
                    this.snackBar.open(
                        `Estadísticas de equipo ${this.isEditMode ? 'actualizadas' : 'creadas'} exitosamente`,
                        'Cerrar',
                        { duration: 3000 }
                    );
                    this.dialogRef.close(result);
                },
                error: (error) => {
                    this.isLoading = false;
                    this.snackBar.open(
                        `Error al ${this.isEditMode ? 'actualizar' : 'crear'} las estadísticas`,
                        'Cerrar',
                        { duration: 3000 }
                    );
                    console.error('Error:', error);
                },
            });
        }
    }

    onCancel() {
        this.dialogRef.close();
    }
}
