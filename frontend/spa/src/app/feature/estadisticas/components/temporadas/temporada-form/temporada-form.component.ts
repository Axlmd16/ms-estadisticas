import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

import { StatisticsService, Season, SeasonCreate, SeasonUpdate } from '../../../../../core/services/statistics/statistics.service';

@Component({
    selector: 'app-temporada-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatButtonModule,
        MatSnackBarModule,
    ],
    template: `
        <h2 mat-dialog-title>{{ isEditing ? 'Editar' : 'Crear' }} Temporada</h2>
        
        <form [formGroup]="seasonForm" (ngSubmit)="onSubmit()">
            <mat-dialog-content>
                <div class="form-container">
                    <mat-form-field appearance="outline" class="full-width">
                        <mat-label>Nombre de la Temporada</mat-label>
                        <input matInput formControlName="name" required>
                        <mat-error *ngIf="seasonForm.get('name')?.hasError('required')">
                            El nombre es requerido
                        </mat-error>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="full-width">
                        <mat-label>Descripción</mat-label>
                        <textarea matInput formControlName="description" rows="3" required></textarea>
                        <mat-error *ngIf="seasonForm.get('description')?.hasError('required')">
                            La descripción es requerida
                        </mat-error>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="full-width">
                        <mat-label>Fecha de Inicio</mat-label>
                        <input matInput [matDatepicker]="startPicker" formControlName="startDate" required>
                        <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
                        <mat-datepicker #startPicker></mat-datepicker>
                        <mat-error *ngIf="seasonForm.get('startDate')?.hasError('required')">
                            La fecha de inicio es requerida
                        </mat-error>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="full-width">
                        <mat-label>Fecha de Fin</mat-label>
                        <input matInput [matDatepicker]="endPicker" formControlName="endDate" required>
                        <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
                        <mat-datepicker #endPicker></mat-datepicker>
                        <mat-error *ngIf="seasonForm.get('endDate')?.hasError('required')">
                            La fecha de fin es requerida
                        </mat-error>
                        <mat-error *ngIf="seasonForm.get('endDate')?.hasError('dateRange')">
                            La fecha de fin debe ser posterior a la fecha de inicio
                        </mat-error>
                    </mat-form-field>
                </div>
            </mat-dialog-content>

            <mat-dialog-actions align="end">
                <button mat-button type="button" (click)="onCancel()">
                    Cancelar
                </button>
                <button mat-raised-button color="primary" type="submit" 
                        [disabled]="seasonForm.invalid || isSubmitting">
                    {{ isSubmitting ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear') }}
                </button>
            </mat-dialog-actions>
        </form>
    `,
    styles: [`
        .form-container {
            min-width: 500px;
            padding: 20px 0;
        }

        .full-width {
            width: 100%;
            margin-bottom: 16px;
        }

        mat-dialog-content {
            max-height: 60vh;
            overflow-y: auto;
        }
    `]
})
export class TemporadaFormComponent implements OnInit {
    seasonForm: FormGroup;
    isEditing = false;
    isSubmitting = false;

    constructor(
        private fb: FormBuilder,
        private statisticsService: StatisticsService,
        private snackBar: MatSnackBar,
        private dialogRef: MatDialogRef<TemporadaFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: Season | null
    ) {
        this.seasonForm = this.fb.group({
            name: ['', [Validators.required]],
            description: ['', [Validators.required]],
            startDate: ['', [Validators.required]],
            endDate: ['', [Validators.required]]
        }, { validators: this.dateRangeValidator });

        if (data) {
            this.isEditing = true;
            // Convert date strings to Date objects for the datepicker
            const formData = {
                ...data,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate)
            };
            this.seasonForm.patchValue(formData);
        }
    }

    ngOnInit() {}

    dateRangeValidator(group: FormGroup) {
        const startDate = group.get('startDate')?.value;
        const endDate = group.get('endDate')?.value;
        
        if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
            group.get('endDate')?.setErrors({ dateRange: true });
            return { dateRange: true };
        }
        
        if (group.get('endDate')?.hasError('dateRange')) {
            group.get('endDate')?.setErrors(null);
        }
        
        return null;
    }

    onSubmit() {
        if (this.seasonForm.valid) {
            this.isSubmitting = true;
            const seasonData = {
                ...this.seasonForm.value,
                startDate: this.seasonForm.value.startDate.toISOString(),
                endDate: this.seasonForm.value.endDate.toISOString()
            };

            const operation = this.isEditing
                ? this.statisticsService.updateSeason(this.data!.id || this.data!._id!, seasonData as SeasonUpdate)
                : this.statisticsService.createSeason(seasonData as SeasonCreate);

            operation.subscribe({
                next: (result) => {
                    this.snackBar.open(
                        `Temporada ${this.isEditing ? 'actualizada' : 'creada'} exitosamente`,
                        'Cerrar',
                        { duration: 3000 }
                    );
                    this.dialogRef.close(result);
                },
                error: (error) => {
                    console.error('Error al guardar temporada:', error);
                    this.snackBar.open(
                        `Error al ${this.isEditing ? 'actualizar' : 'crear'} temporada`,
                        'Cerrar',
                        { duration: 3000 }
                    );
                    this.isSubmitting = false;
                }
            });
        }
    }

    onCancel() {
        this.dialogRef.close();
    }
}
