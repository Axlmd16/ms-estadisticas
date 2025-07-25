import { Component, OnInit } from '@angular/core';
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
import { StatisticsCompetence } from '../../../../../core/models/statistics';

@Component({
    selector: 'app-competencia-form',
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
        <div class="competencia-form">
            <h2 mat-dialog-title>
                {{ isEditMode ? 'Editar' : 'Crear' }} Estadísticas de Competencia
            </h2>

            <div mat-dialog-content>
                <form [formGroup]="competenciaForm" class="form-container">
                    <div class="form-row">
                        <mat-form-field appearance="outline" class="full-width">
                            <mat-label>Nombre de la Competencia</mat-label>
                            <input matInput formControlName="competition_name" />
                            <mat-error *ngIf="competenciaForm.get('competition_name')?.hasError('required')">
                                El nombre es requerido
                            </mat-error>
                        </mat-form-field>
                    </div>

                    <div class="form-row">
                        <mat-form-field appearance="outline" class="full-width">
                            <mat-label>ID de la Competencia</mat-label>
                            <input matInput formControlName="competition_id" />
                            <mat-error *ngIf="competenciaForm.get('competition_id')?.hasError('required')">
                                El ID de la competencia es requerido
                            </mat-error>
                        </mat-form-field>
                    </div>

                    <div class="form-row">
                        <mat-form-field appearance="outline" class="half-width">
                            <mat-label>Total de Equipos</mat-label>
                            <input matInput type="number" formControlName="total_teams" />
                        </mat-form-field>

                        <mat-form-field appearance="outline" class="half-width">
                            <mat-label>Total de Partidos</mat-label>
                            <input matInput type="number" formControlName="total_matches" />
                        </mat-form-field>
                    </div>

                    <div class="form-row">
                        <mat-form-field appearance="outline" class="half-width">
                            <mat-label>Total de Goles</mat-label>
                            <input matInput type="number" formControlName="total_goals" />
                        </mat-form-field>

                        <mat-form-field appearance="outline" class="half-width">
                            <mat-label>Promedio de Goles por Partido</mat-label>
                            <input matInput type="number" step="0.01" formControlName="average_goals_per_match" />
                        </mat-form-field>
                    </div>

                    <div class="form-row">
                        <mat-form-field appearance="outline" class="half-width">
                            <mat-label>Total de Tarjetas Amarillas</mat-label>
                            <input matInput type="number" formControlName="total_yellow_cards" />
                        </mat-form-field>

                        <mat-form-field appearance="outline" class="half-width">
                            <mat-label>Total de Tarjetas Rojas</mat-label>
                            <input matInput type="number" formControlName="total_red_cards" />
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
                    [disabled]="!competenciaForm.valid || isLoading"
                >
                    <mat-spinner diameter="20" *ngIf="isLoading"></mat-spinner>
                    {{ isEditMode ? 'Actualizar' : 'Crear' }}
                </button>
            </div>
        </div>
    `,
    styles: [
        `
            .competencia-form {
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
export class CompetenciaFormComponent implements OnInit {
    competenciaForm: FormGroup;
    isLoading = false;
    isEditMode = false;

    constructor(
        private fb: FormBuilder,
        private statisticsService: StatisticsService,
        private snackBar: MatSnackBar,
        public dialogRef: MatDialogRef<CompetenciaFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { competencia?: StatisticsCompetence }
    ) {
        this.competenciaForm = this.createForm();
        this.isEditMode = !!data?.competencia;
    }

    ngOnInit() {
        if (this.isEditMode && this.data.competencia) {
            this.loadCompetenciaData();
        }
    }

    private createForm(): FormGroup {
        return this.fb.group({
            competition_name: ['', [Validators.required]],
            competition_id: ['', [Validators.required]],
            total_teams: [0, [Validators.min(0)]],
            total_matches: [0, [Validators.min(0)]],
            total_goals: [0, [Validators.min(0)]],
            average_goals_per_match: [0, [Validators.min(0)]],
            total_yellow_cards: [0, [Validators.min(0)]],
            total_red_cards: [0, [Validators.min(0)]],
        });
    }

    private loadCompetenciaData() {
        if (this.data.competencia) {
            this.competenciaForm.patchValue({
                competition_name: this.data.competencia.competition_name,
                competition_id: this.data.competencia.competition_id,
                total_teams: this.data.competencia.total_teams,
                total_matches: this.data.competencia.total_matches,
                total_goals: this.data.competencia.total_goals,
                average_goals_per_match: this.data.competencia.average_goals_per_match,
                total_yellow_cards: this.data.competencia.total_yellow_cards,
                total_red_cards: this.data.competencia.total_red_cards,
            });
        }
    }

    onSave() {
        if (this.competenciaForm.valid) {
            this.isLoading = true;
            const competenciaData: StatisticsCompetence = {
                ...this.competenciaForm.value,
                id: this.isEditMode ? this.data.competencia!.id : '',
                created_at: this.isEditMode ? this.data.competencia!.created_at : new Date(),
                updated_at: new Date(),
            };

            const operation = this.isEditMode
                ? this.statisticsService.updateCompetitionStatistics(competenciaData.id, competenciaData)
                : this.statisticsService.createCompetitionStatistics(competenciaData);

            operation.subscribe({
                next: (result) => {
                    this.isLoading = false;
                    this.snackBar.open(
                        `Estadísticas de competencia ${this.isEditMode ? 'actualizadas' : 'creadas'} exitosamente`,
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
