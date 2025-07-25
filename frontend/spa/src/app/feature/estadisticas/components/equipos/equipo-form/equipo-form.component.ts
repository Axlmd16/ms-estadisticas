import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

import { StatisticsService, Team, TeamCreate, TeamUpdate } from '../../../../../core/services/statistics/statistics.service';

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
        MatSnackBarModule,
    ],
    template: `
        <h2 mat-dialog-title>{{ isEditing ? 'Editar' : 'Crear' }} Equipo</h2>
        
        <form [formGroup]="teamForm" (ngSubmit)="onSubmit()">
            <mat-dialog-content>
                <div class="form-container">
                    <mat-form-field appearance="outline" class="full-width">
                        <mat-label>Nombre del Equipo</mat-label>
                        <input matInput formControlName="name" required>
                        <mat-error *ngIf="teamForm.get('name')?.hasError('required')">
                            El nombre es requerido
                        </mat-error>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="full-width">
                        <mat-label>Descripción</mat-label>
                        <textarea matInput formControlName="description" rows="3"></textarea>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="full-width">
                        <mat-label>Año de Fundación</mat-label>
                        <input matInput type="number" formControlName="founded" min="1800" max="2024">
                        <mat-error *ngIf="teamForm.get('founded')?.hasError('min')">
                            El año debe ser mayor a 1800
                        </mat-error>
                        <mat-error *ngIf="teamForm.get('founded')?.hasError('max')">
                            El año no puede ser mayor al actual
                        </mat-error>
                    </mat-form-field>
                </div>
            </mat-dialog-content>

            <mat-dialog-actions align="end">
                <button mat-button type="button" (click)="onCancel()">
                    Cancelar
                </button>
                <button mat-raised-button color="primary" type="submit" 
                        [disabled]="teamForm.invalid || isSubmitting">
                    {{ isSubmitting ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear') }}
                </button>
            </mat-dialog-actions>
        </form>
    `,
    styles: [`
        .form-container {
            min-width: 400px;
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
export class EquipoFormComponent implements OnInit {
    teamForm: FormGroup;
    isEditing = false;
    isSubmitting = false;

    constructor(
        private fb: FormBuilder,
        private statisticsService: StatisticsService,
        private snackBar: MatSnackBar,
        private dialogRef: MatDialogRef<EquipoFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: Team | null
    ) {
        this.teamForm = this.fb.group({
            name: ['', [Validators.required]],
            description: [''],
            founded: ['', [Validators.min(1800), Validators.max(new Date().getFullYear())]]
        });

        if (data) {
            this.isEditing = true;
            this.teamForm.patchValue(data);
        }
    }

    ngOnInit() {}

    onSubmit() {
        if (this.teamForm.valid) {
            this.isSubmitting = true;
            const teamData = this.teamForm.value;

            // Convert empty strings to null for optional fields
            if (!teamData.description) teamData.description = null;
            if (!teamData.founded) teamData.founded = null;

            const operation = this.isEditing
                ? this.statisticsService.updateTeam(this.data!.id || this.data!._id!, teamData as TeamUpdate)
                : this.statisticsService.createTeam(teamData as TeamCreate);

            operation.subscribe({
                next: (result) => {
                    this.snackBar.open(
                        `Equipo ${this.isEditing ? 'actualizado' : 'creado'} exitosamente`,
                        'Cerrar',
                        { duration: 3000 }
                    );
                    this.dialogRef.close(result);
                },
                error: (error) => {
                    console.error('Error al guardar equipo:', error);
                    this.snackBar.open(
                        `Error al ${this.isEditing ? 'actualizar' : 'crear'} equipo`,
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
