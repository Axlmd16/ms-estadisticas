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

import { StatisticsService, CompetitionCreate, Competition } from '../../../../../core/services/statistics/statistics.service';

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
                {{ isEditMode ? 'Editar' : 'Crear' }} Competición
            </h2>

            <div mat-dialog-content>
                <form [formGroup]="competenciaForm" class="form-container">
                    <div class="form-row">
                        <mat-form-field appearance="outline" class="full-width">
                            <mat-label>Nombre de la Competición</mat-label>
                            <input matInput formControlName="name" />
                            <mat-error *ngIf="competenciaForm.get('name')?.hasError('required')">
                                El nombre es requerido
                            </mat-error>
                        </mat-form-field>
                    </div>

                    <div class="form-row">
                        <mat-form-field appearance="outline" class="half-width">
                            <mat-label>Fecha de Inicio</mat-label>
                            <input matInput type="date" formControlName="start_date" />
                        </mat-form-field>

                        <mat-form-field appearance="outline" class="half-width">
                            <mat-label>Fecha de Fin</mat-label>
                            <input matInput type="date" formControlName="end_date" />
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
        @Inject(MAT_DIALOG_DATA) public data: { competencia?: Competition }
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
            name: ['', [Validators.required]],
            start_date: [''],
            end_date: [''],
        });
    }

    private loadCompetenciaData() {
        if (this.data.competencia) {
            this.competenciaForm.patchValue({
                name: this.data.competencia.name,
                start_date: this.data.competencia.start_date ? 
                    new Date(this.data.competencia.start_date).toISOString().split('T')[0] : '',
                end_date: this.data.competencia.end_date ? 
                    new Date(this.data.competencia.end_date).toISOString().split('T')[0] : '',
            });
        }
    }

    onSave() {
        if (this.competenciaForm.valid) {
            this.isLoading = true;
            const competenciaData: CompetitionCreate = {
                name: this.competenciaForm.value.name,
                start_date: this.competenciaForm.value.start_date || undefined,
                end_date: this.competenciaForm.value.end_date || undefined,
            };

            const operation = this.isEditMode
                ? this.statisticsService.updateCompetition(this.data.competencia!.id || this.data.competencia!._id!, competenciaData)
                : this.statisticsService.createCompetition(competenciaData);

            operation.subscribe({
                next: (result) => {
                    this.isLoading = false;
                    this.snackBar.open(
                        `Competición ${this.isEditMode ? 'actualizada' : 'creada'} exitosamente`,
                        'Cerrar',
                        { duration: 3000 }
                    );
                    this.dialogRef.close(result);
                },
                error: (error) => {
                    this.isLoading = false;
                    this.snackBar.open(
                        `Error al ${this.isEditMode ? 'actualizar' : 'crear'} la competición`,
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
