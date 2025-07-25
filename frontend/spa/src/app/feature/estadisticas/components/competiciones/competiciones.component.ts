import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

import { StatisticsService } from '../../../../core/services/statistics/statistics.service';
import {
    StatisticsCompetence,
    StatisticsFilter,
} from '../../../../core/models/statistics';
import { ApiPaginationResponse } from '../../../../core/models/api-response';

@Component({
    selector: 'app-competiciones',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
    ],
    template: `
        <div class="competitions-container">
            <mat-card class="header-card">
                <mat-card-header>
                    <mat-card-title>Estadísticas de Competiciones</mat-card-title>
                    <mat-card-subtitle>
                        Gestión de estadísticas de competiciones
                    </mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                    <div class="d-flex justify-content-between align-items-center">
                        <mat-form-field appearance="outline" class="search-field">
                            <mat-label>Buscar competición</mat-label>
                            <input matInput [ngModel]="filter.search" (ngModelChange)="onSearchChange($event)" placeholder="Nombre de la competición..." />
                            <mat-icon matSuffix>search</mat-icon>
                        </mat-form-field>
                        <button mat-raised-button color="primary" (click)="openCreate()">
                            <mat-icon>add</mat-icon>
                            Nueva Competición
                        </button>
                    </div>
                </mat-card-content>
            </mat-card>

            <mat-card class="table-card">
                <mat-card-content>
                    <table mat-table [dataSource]="dataSource" matSort>
                        <!-- Nombre -->
                        <ng-container matColumnDef="name">
                            <th mat-header-cell *matHeaderCellDef mat-sort-header>Nombre</th>
                            <td mat-cell *matCellDef="let comp">{{ comp.name }}</td>
                        </ng-container>
                        <!-- Temporada -->
                        <ng-container matColumnDef="season">
                            <th mat-header-cell *matHeaderCellDef mat-sort-header>Temporada</th>
                            <td mat-cell *matCellDef="let comp">{{ comp.season }}</td>
                        </ng-container>
                        <!-- Equipos -->
                        <ng-container matColumnDef="teams">
                            <th mat-header-cell *matHeaderCellDef mat-sort-header>Equipos</th>
                            <td mat-cell *matCellDef="let comp">{{ comp.teams?.length }}</td>
                        </ng-container>
                        <!-- Acciones -->
                        <ng-container matColumnDef="actions">
                            <th mat-header-cell *matHeaderCellDef>Acciones</th>
                            <td mat-cell *matCellDef="let comp">
                                <button mat-icon-button color="primary" (click)="viewDetails(comp)">
                                    <mat-icon>visibility</mat-icon>
                                </button>
                                <button mat-icon-button color="accent" (click)="editCompetition(comp)">
                                    <mat-icon>edit</mat-icon>
                                </button>
                                <button mat-icon-button color="warn" (click)="deleteCompetition(comp)">
                                    <mat-icon>delete</mat-icon>
                                </button>
                            </td>
                        </ng-container>
                        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                        <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
                    </table>
                    <mat-paginator [length]="totalItems" [pageSize]="filter.pageSize" [pageSizeOptions]="[5, 10, 25, 100]" (page)="onPageChange($event)"></mat-paginator>
                </mat-card-content>
            </mat-card>
        </div>
        <!-- Aquí puedes agregar diálogos para crear/editar -->
    `,
    styles: [
        `
            .competitions-container {
                padding: 32px;
                max-width: 1200px;
                margin: 0 auto;
            }
            .header-card {
                margin-bottom: 32px;
            }
            .search-field {
                width: 300px;
            }
            .table-card {
                margin-top: 24px;
            }
            table {
                width: 100%;
            }
            .mat-column-actions {
                width: 120px;
                text-align: center;
            }
        `,
    ],
})
export class CompeticionesComponent implements OnInit {
    dataSource: StatisticsCompetence[] = [];
    displayedColumns = ['name', 'season', 'teams', 'actions'];
    totalItems = 0;
    filter: StatisticsFilter = {
        page: 1,
        pageSize: 10,
        search: '',
        sortBy: 'name',
        sortDirection: 'asc',
    };

    constructor(private statisticsService: StatisticsService) {}

    ngOnInit() {
        this.loadCompetitions();
    }

    loadCompetitions() {
        this.statisticsService.getAllCompetitionsStatistics(this.filter).subscribe({
            next: (response: any) => {
                console.log('Datos de competiciones recibidos del backend:', response);
                // Si la respuesta es un array directo (no paginada)
                if (Array.isArray(response)) {
                    this.dataSource = response;
                    this.totalItems = response.length;
                } else if (response && response.data && response.meta) {
                    // Si la respuesta es paginada
                    this.dataSource = response.data;
                    this.totalItems = response.meta.pagination.count;
                } else {
                    // Fallback: intentar mostrar lo que venga
                    this.dataSource = response.data || response || [];
                    this.totalItems = this.dataSource.length;
                }
            },
            error: (error) => {
                console.error('Error cargando competiciones:', error);
            },
        });
    }

    onSearchChange(search: string) {
        this.filter.search = search;
        this.filter.page = 1;
        this.loadCompetitions();
    }

    onPageChange(event: any) {
        this.filter.page = event.pageIndex + 1;
        this.filter.pageSize = event.pageSize;
        this.loadCompetitions();
    }

    viewDetails(comp: StatisticsCompetence) {
        // Implementar vista detallada de la competición
        console.log('Ver detalles de la competición:', comp);
    }

    openCreate() {
        // Implementar creación de competición
        console.log('Abrir formulario de nueva competición');
    }

    editCompetition(comp: StatisticsCompetence) {
        // Implementar edición de competición
        console.log('Editar competición:', comp);
    }

    deleteCompetition(comp: StatisticsCompetence) {
        if (confirm('¿Seguro que deseas eliminar esta competición?')) {
            this.statisticsService.deleteCompetitionStatistics(comp.id).subscribe({
                next: () => {
                    this.loadCompetitions();
                },
                error: (error) => {
                    console.error('Error eliminando competición:', error);
                },
            });
        }
    }
}
