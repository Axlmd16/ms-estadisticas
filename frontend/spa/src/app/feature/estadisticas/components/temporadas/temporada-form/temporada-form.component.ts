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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Inject } from '@angular/core';

import { StatisticsService } from '../../../../../core/services/statistics/statistics.service';
import { StatisticsSeason } from '../../../../../core/models/statistics';

@Component({
    selector: 'app-temporada-form',
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
        MatDatepickerModule,
        MatNativeDateModule,
    ],
    template: `
        <div class="temporada-form">
            <h2 mat-dialog-title>
                {{ isEditMode ? 'Editar' : 'Crear' }} Estadísticas de Temporada
            </h2>

            <div mat-dialog-content>
                <form [formGroup]="temporadaForm" class="form-container">
                    <div class="form-row">
                        <mat-form-field appearance="outline" class="full-width">
                            <mat-label>Nombre de la Temporada</mat-label>
                            <input matInput formControlName="seasonName" />
                            <mat-error *ngIf="temporadaForm.get('seasonName')?.hasError('required')">
                                El nombre es requerido
                            </mat-error>
                        </mat-form-field>
                    </div>

                    <div class="form-row">
                        <mat-form-field appearance="outline" class="half-width">
                            <mat-label>Total de Partidos</mat-label>
                            <input matInput type="number" formControlName="total_matches" />
                        </mat-form-field>

                        <mat-form-field appearance="outline" class="half-width">
                            <mat-label>Total de Goles</mat-label>
                            <input matInput type="number" formControlName="total_goals" />
                        </mat-form-field>
                    </div>

                    <div class="form-row">
                        <mat-form-field appearance="outline" class="full-width">
                            <mat-label>Promedio de Goles por Partido</mat-label>
                            <input matInput type="number" step="0.01" formControlName="goals_per_match" />
                        </mat-form-field>
                    </div>

                    <div class="form-row">
                        <mat-form-field appearance="outline" class="half-width">
                            <mat-label>Mayor Victoria</mat-label>
                            <input matInput formControlName="biggest_win" />
                        </mat-form-field>

                        <mat-form-field appearance="outline" class="half-width">
                            <mat-label>Mayor Derrota</mat-label>
                            <input matInput formControlName="biggest_loss" />
                        </mat-form-field>
                    </div>

                    <div class="form-row">
                        <mat-form-field appearance="outline" class="half-width">
                            <mat-label>Fecha de Inicio</mat-label>
                            <input matInput [matDatepicker]="startPicker" formControlName="startDate">
                            <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
                            <mat-datepicker #startPicker></mat-datepicker>
                        </mat-form-field>

                        <mat-form-field appearance="outline" class="half-width">
                            <mat-label>Fecha de Fin</mat-label>
                            <input matInput [matDatepicker]="endPicker" formControlName="endDate">
                            <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
                            <mat-datepicker #endPicker></mat-datepicker>
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
                    [disabled]="!temporadaForm.valid || isLoading"
                >
                    <mat-spinner diameter="20" *ngIf="isLoading"></mat-spinner>
                    {{ isEditMode ? 'Actualizar' : 'Crear' }}
                </button>
            </div>
        </div>
    `,
    styles: [
        `
            .temporada-form {
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
export class TemporadaFormComponent implements OnInit {
    temporadaForm: FormGroup;
    isLoading = false;
    isEditMode = false;

    constructor(
        private fb: FormBuilder,
        private statisticsService: StatisticsService,
        private snackBar: MatSnackBar,
        public dialogRef: MatDialogRef<TemporadaFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { temporada?: StatisticsSeason }
    ) {
        this.temporadaForm = this.createForm();
        this.isEditMode = !!data?.temporada;
    }

    ngOnInit() {
        if (this.isEditMode && this.data.temporada) {
            this.loadTemporadaData();
        }
    }

    private createForm(): FormGroup {
        return this.fb.group({
            seasonName: ['', [Validators.required]],
            total_matches: [0, [Validators.min(0)]],
            total_goals: [0, [Validators.min(0)]],
            goals_per_match: [0, [Validators.min(0)]],
            biggest_win: [''],
            biggest_loss: [''],
            startDate: [''],
            endDate: [''],
        });
    }

    private loadTemporadaData() {
        if (this.data.temporada) {
            this.temporadaForm.patchValue({
                seasonName: this.data.temporada.season?.name || '',
                total_matches: this.data.temporada.total_matches,
                total_goals: this.data.temporada.total_goals,
                goals_per_match: this.data.temporada.goals_per_match,
                biggest_win: this.data.temporada.biggest_win,
                biggest_loss: this.data.temporada.biggest_loss,
                startDate: this.data.temporada.season?.start_date ? new Date(this.data.temporada.season.start_date) : '',
                endDate: this.data.temporada.season?.end_date ? new Date(this.data.temporada.season.end_date) : '',
            });
        }
    }

    onSave() {
        if (this.temporadaForm.valid) {
            this.isLoading = true;
            const temporadaData: StatisticsSeason = {
                ...this.temporadaForm.value,
                id: this.isEditMode ? this.data.temporada!.id : '',
                season: {
                    id: this.isEditMode ? this.data.temporada!.season?.id || '' : '',
                    name: this.temporadaForm.value.seasonName,
                    start_date: this.temporadaForm.value.startDate,
                    end_date: this.temporadaForm.value.endDate,
                },
                created_at: this.isEditMode ? this.data.temporada!.created_at : new Date(),
                updated_at: new Date(),
            };

            const operation = this.isEditMode
                ? this.statisticsService.updateSeasonStatistics(temporadaData.id, temporadaData)
                : this.statisticsService.createSeasonStatistics(temporadaData);

            operation.subscribe({
                next: (result) => {
                    this.isLoading = false;
                    this.snackBar.open(
                        `Estadísticas de temporada ${this.isEditMode ? 'actualizadas' : 'creadas'} exitosamente`,
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
