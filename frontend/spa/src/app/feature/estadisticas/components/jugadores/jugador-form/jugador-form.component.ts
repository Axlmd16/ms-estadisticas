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
import { StatisticsIndividual } from '../../../../../core/models/statistics';

@Component({
    selector: 'app-jugador-form',
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
        <div class="jugador-form">
            <h2 mat-dialog-title>
                {{ isEditMode ? 'Editar' : 'Crear' }} Estadísticas de Jugador
            </h2>

            <div mat-dialog-content>
                <form [formGroup]="jugadorForm" class="form-container">
                    <div class="form-row">
                        <mat-form-field appearance="outline" class="full-width">
                            <mat-label>Nombre del Jugador</mat-label>
                            <input matInput formControlName="player_name" />
                            <mat-error *ngIf="jugadorForm.get('player_name')?.hasError('required')">
                                El nombre es requerido
                            </mat-error>
                        </mat-form-field>
                    </div>

                    <div class="form-row">
                        <mat-form-field appearance="outline" class="full-width">
                            <mat-label>ID del Jugador</mat-label>
                            <input matInput formControlName="player_id" />
                            <mat-error *ngIf="jugadorForm.get('player_id')?.hasError('required')">
                                El ID del jugador es requerido
                            </mat-error>
                        </mat-form-field>
                    </div>

                    <div class="form-row">
                        <mat-form-field appearance="outline" class="half-width">
                            <mat-label>Goles</mat-label>
                            <input matInput type="number" formControlName="goals" />
                        </mat-form-field>

                        <mat-form-field appearance="outline" class="half-width">
                            <mat-label>Asistencias</mat-label>
                            <input matInput type="number" formControlName="assists" />
                        </mat-form-field>
                    </div>

                    <div class="form-row">
                        <mat-form-field appearance="outline" class="half-width">
                            <mat-label>Tarjetas Amarillas</mat-label>
                            <input matInput type="number" formControlName="yellow_cards" />
                        </mat-form-field>

                        <mat-form-field appearance="outline" class="half-width">
                            <mat-label>Tarjetas Rojas</mat-label>
                            <input matInput type="number" formControlName="red_cards" />
                        </mat-form-field>
                    </div>

                    <div class="form-row">
                        <mat-form-field appearance="outline" class="full-width">
                            <mat-label>Minutos Jugados</mat-label>
                            <input matInput type="number" formControlName="minutes_played" />
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
                    [disabled]="!jugadorForm.valid || isLoading"
                >
                    <mat-spinner diameter="20" *ngIf="isLoading"></mat-spinner>
                    {{ isEditMode ? 'Actualizar' : 'Crear' }}
                </button>
            </div>
        </div>
    `,
    styles: [
        `
            .jugador-form {
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
export class JugadorFormComponent implements OnInit {
    jugadorForm: FormGroup;
    isLoading = false;
    isEditMode = false;

    constructor(
        private fb: FormBuilder,
        private statisticsService: StatisticsService,
        private snackBar: MatSnackBar,
        public dialogRef: MatDialogRef<JugadorFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { jugador?: StatisticsIndividual }
    ) {
        this.jugadorForm = this.createForm();
        this.isEditMode = !!data?.jugador;
    }

    ngOnInit() {
        if (this.isEditMode && this.data.jugador) {
            this.loadJugadorData();
        }
    }

    private createForm(): FormGroup {
        return this.fb.group({
            player_name: ['', [Validators.required]],
            player_id: ['', [Validators.required]],
            goals: [0, [Validators.min(0)]],
            assists: [0, [Validators.min(0)]],
            yellow_cards: [0, [Validators.min(0)]],
            red_cards: [0, [Validators.min(0)]],
            minutes_played: [0, [Validators.min(0)]],
        });
    }

    private loadJugadorData() {
        if (this.data.jugador) {
            this.jugadorForm.patchValue({
                player_name: this.data.jugador.player_name,
                player_id: this.data.jugador.player_id,
                goals: this.data.jugador.goals,
                assists: this.data.jugador.assists,
                yellow_cards: this.data.jugador.yellow_cards,
                red_cards: this.data.jugador.red_cards,
                minutes_played: this.data.jugador.minutes_played,
            });
        }
    }

    onSave() {
        if (this.jugadorForm.valid) {
            this.isLoading = true;
            const jugadorData: StatisticsIndividual = {
                ...this.jugadorForm.value,
                id: this.isEditMode ? this.data.jugador!.id : '',
                created_at: this.isEditMode ? this.data.jugador!.created_at : new Date(),
                updated_at: new Date(),
            };

            const operation = this.isEditMode
                ? this.statisticsService.updatePlayerStatistics(jugadorData.id, jugadorData)
                : this.statisticsService.createPlayerStatistics(jugadorData);

            operation.subscribe({
                next: (result) => {
                    this.isLoading = false;
                    this.snackBar.open(
                        `Estadísticas de jugador ${this.isEditMode ? 'actualizadas' : 'creadas'} exitosamente`,
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
