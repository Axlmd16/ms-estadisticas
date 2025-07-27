import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

import { StatisticsService, Athlete, AthleteCreate, AthleteUpdate, Team } from '../../../../../core/services/statistics/statistics.service';

@Component({
    selector: 'app-atleta-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatSnackBarModule,
    ],
    template: `
        <h2 mat-dialog-title>{{ isEditing ? 'Editar' : 'Crear' }} Atleta</h2>
        
        <form [formGroup]="athleteForm" (ngSubmit)="onSubmit()">
            <mat-dialog-content>
                <div class="form-container">
                    <mat-form-field appearance="outline" class="full-width">
                        <mat-label>Nombre del Atleta</mat-label>
                        <input matInput formControlName="name" required>
                        <mat-error *ngIf="athleteForm.get('name')?.hasError('required')">
                            El nombre es requerido
                        </mat-error>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="full-width">
                        <mat-label>Posición</mat-label>
                        <input matInput formControlName="position">
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="full-width">
                        <mat-label>Equipo</mat-label>
                        <mat-select formControlName="team_id">
                            <mat-option value="">Sin equipo</mat-option>
                            <mat-option *ngFor="let team of teams" [value]="team.id || team._id">
                                {{ team.name }}
                            </mat-option>
                        </mat-select>
                    </mat-form-field>
                </div>
            </mat-dialog-content>

            <mat-dialog-actions align="end">
                <button mat-button type="button" (click)="onCancel()">
                    Cancelar
                </button>
                <button mat-raised-button color="primary" type="submit" 
                        [disabled]="athleteForm.invalid || isSubmitting">
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
export class AtletaFormComponent implements OnInit {
    athleteForm: FormGroup;
    isEditing = false;
    isSubmitting = false;
    teams: Team[] = [];

    constructor(
        private fb: FormBuilder,
        private statisticsService: StatisticsService,
        private snackBar: MatSnackBar,
        private dialogRef: MatDialogRef<AtletaFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { athlete: Athlete | null, teams: Team[] }
    ) {
        this.teams = data.teams || [];
        
        this.athleteForm = this.fb.group({
            name: ['', [Validators.required]],
            position: [''],
            team_id: ['']
        });

        if (data.athlete) {
            this.isEditing = true;
            this.athleteForm.patchValue(data.athlete);
        }
    }

    ngOnInit() {}

    onSubmit() {
        if (this.athleteForm.valid) {
            this.isSubmitting = true;
            const athleteData = this.athleteForm.value;

            // Convert empty strings to null for optional fields
            if (!athleteData.position) athleteData.position = null;
            if (!athleteData.team_id) athleteData.team_id = null;

            const operation = this.isEditing
                ? this.statisticsService.updateAthlete(this.data.athlete!.id || this.data.athlete!._id!, athleteData as AthleteUpdate)
                : this.statisticsService.createAthlete(athleteData as AthleteCreate);

            operation.subscribe({
                next: (result) => {
                    this.snackBar.open(
                        `Atleta ${this.isEditing ? 'actualizado' : 'creado'} exitosamente`,
                        'Cerrar',
                        { duration: 3000 }
                    );
                    this.dialogRef.close(result);
                },
                error: (error) => {
                    console.error('Error al guardar atleta:', error);
                    this.snackBar.open(
                        `Error al ${this.isEditing ? 'actualizar' : 'crear'} atleta`,
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
