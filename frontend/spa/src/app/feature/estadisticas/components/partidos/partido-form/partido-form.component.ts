import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

import { StatisticsService, Match, MatchCreate, MatchUpdate, Team, Season } from '../../../../../core/services/statistics/statistics.service';

@Component({
    selector: 'app-partido-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatInputModule,
        MatButtonModule,
        MatSnackBarModule,
    ],
    template: `
        <h2 mat-dialog-title>{{ isEditing ? 'Editar' : 'Crear' }} Partido</h2>
        
        <form [formGroup]="matchForm" (ngSubmit)="onSubmit()">
            <mat-dialog-content>
                <div class="form-container">
                    <mat-form-field appearance="outline" class="full-width">
                        <mat-label>Equipo Local</mat-label>
                        <mat-select formControlName="local_team_id" required>
                            <mat-option *ngFor="let team of teams" [value]="team.id || team._id">
                                {{ team.name }}
                            </mat-option>
                        </mat-select>
                        <mat-error *ngIf="matchForm.get('local_team_id')?.hasError('required')">
                            El equipo local es requerido
                        </mat-error>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="full-width">
                        <mat-label>Equipo Visitante</mat-label>
                        <mat-select formControlName="visitor_team_id" required>
                            <mat-option *ngFor="let team of teams" [value]="team.id || team._id">
                                {{ team.name }}
                            </mat-option>
                        </mat-select>
                        <mat-error *ngIf="matchForm.get('visitor_team_id')?.hasError('required')">
                            El equipo visitante es requerido
                        </mat-error>
                        <mat-error *ngIf="matchForm.get('visitor_team_id')?.hasError('sameTeam')">
                            El equipo visitante debe ser diferente al equipo local
                        </mat-error>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="full-width">
                        <mat-label>Temporada</mat-label>
                        <mat-select formControlName="season_id">
                            <mat-option value="">Sin temporada</mat-option>
                            <mat-option *ngFor="let season of seasons" [value]="season.id || season._id">
                                {{ season.name }}
                            </mat-option>
                        </mat-select>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="full-width">
                        <mat-label>Fecha y Hora del Partido</mat-label>
                        <input matInput [matDatepicker]="datePicker" formControlName="date">
                        <mat-datepicker-toggle matSuffix [for]="datePicker"></mat-datepicker-toggle>
                        <mat-datepicker #datePicker></mat-datepicker>
                    </mat-form-field>
                </div>
            </mat-dialog-content>

            <mat-dialog-actions align="end">
                <button mat-button type="button" (click)="onCancel()">
                    Cancelar
                </button>
                <button mat-raised-button color="primary" type="submit" 
                        [disabled]="matchForm.invalid || isSubmitting">
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
export class PartidoFormComponent implements OnInit {
    matchForm: FormGroup;
    isEditing = false;
    isSubmitting = false;
    teams: Team[] = [];
    seasons: Season[] = [];

    constructor(
        private fb: FormBuilder,
        private statisticsService: StatisticsService,
        private snackBar: MatSnackBar,
        private dialogRef: MatDialogRef<PartidoFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { 
            match: Match | null, 
            teams: Team[], 
            seasons: Season[] 
        }
    ) {
        this.teams = data.teams || [];
        this.seasons = data.seasons || [];
        
        this.matchForm = this.fb.group({
            local_team_id: ['', [Validators.required]],
            visitor_team_id: ['', [Validators.required]],
            season_id: [''],
            date: ['']
        }, { validators: this.sameTeamValidator });

        if (data.match) {
            this.isEditing = true;
            // Convert date string to Date object for the datepicker
            const formData = {
                ...data.match,
                date: data.match.date ? new Date(data.match.date) : ''
            };
            this.matchForm.patchValue(formData);
        }
    }

    ngOnInit() {}

    sameTeamValidator(group: FormGroup) {
        const localTeam = group.get('local_team_id')?.value;
        const visitorTeam = group.get('visitor_team_id')?.value;
        
        if (localTeam && visitorTeam && localTeam === visitorTeam) {
            group.get('visitor_team_id')?.setErrors({ sameTeam: true });
            return { sameTeam: true };
        }
        
        if (group.get('visitor_team_id')?.hasError('sameTeam')) {
            const errors = group.get('visitor_team_id')?.errors;
            if (errors) {
                delete errors['sameTeam'];
                const hasOtherErrors = Object.keys(errors).length > 0;
                group.get('visitor_team_id')?.setErrors(hasOtherErrors ? errors : null);
            }
        }
        
        return null;
    }

    onSubmit() {
        if (this.matchForm.valid) {
            this.isSubmitting = true;
            const matchData = {
                ...this.matchForm.value
            };

            // Convert date to ISO string if exists
            if (matchData.date) {
                matchData.date = matchData.date.toISOString();
            } else {
                matchData.date = null;
            }

            // Convert empty strings to null for optional fields
            if (!matchData.season_id) matchData.season_id = null;

            const operation = this.isEditing
                ? this.statisticsService.updateMatch(this.data.match!.id || this.data.match!._id!, matchData as MatchUpdate)
                : this.statisticsService.createMatch(matchData as MatchCreate);

            operation.subscribe({
                next: (result) => {
                    this.snackBar.open(
                        `Partido ${this.isEditing ? 'actualizado' : 'creado'} exitosamente`,
                        'Cerrar',
                        { duration: 3000 }
                    );
                    this.dialogRef.close(result);
                },
                error: (error) => {
                    console.error('Error al guardar partido:', error);
                    this.snackBar.open(
                        `Error al ${this.isEditing ? 'actualizar' : 'crear'} partido`,
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
