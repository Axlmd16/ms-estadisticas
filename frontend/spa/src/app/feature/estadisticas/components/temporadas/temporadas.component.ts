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
    StatisticsSeason,
    StatisticsFilter,
} from '../../../../core/models/statistics';
import { ApiPaginationResponse } from '../../../../core/models/api-response';

@Component({
    selector: 'app-temporadas',
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
        <div class="seasons-container">
            <mat-card class="header-card">
                <mat-card-header>
                    <mat-card-title>Estadísticas por Temporada</mat-card-title>
                    <mat-card-subtitle>
                        Analiza el rendimiento por temporada
                    </mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                    <div
                        class="d-flex justify-content-between align-items-center"
                    >
                        <mat-form-field
                            appearance="outline"
                            class="search-field"
                        >
                            <mat-label>Buscar temporada</mat-label>
                            <input
                                matInput
                                [ngModel]="filter.search"
                                (ngModelChange)="onSearchChange($event)"
                                placeholder="Nombre de la temporada..."
                            />
                            <mat-icon matSuffix>search</mat-icon>
                        </mat-form-field>

                        <button mat-raised-button color="primary">
                            <mat-icon>download</mat-icon>
                            Exportar Datos
                        </button>
                    </div>
                </mat-card-content>
            </mat-card>

            <mat-card class="table-card">
                <mat-card-content>
                    <table mat-table [dataSource]="dataSource" matSort>
                        <!-- Temporada -->
                        <ng-container matColumnDef="name">
                            <th
                                mat-header-cell
                                *matHeaderCellDef
                                mat-sort-header
                            >
                                Temporada
                            </th>
                            <td mat-cell *matCellDef="let season">
                                {{ season.name }}
                            </td>
                        </ng-container>

                        <!-- Total Partidos -->
                        <ng-container matColumnDef="totalGames">
                            <th
                                mat-header-cell
                                *matHeaderCellDef
                                mat-sort-header
                            >
                                Total Partidos
                            </th>
                            <td mat-cell *matCellDef="let season">
                                {{ season.totalGames }}
                            </td>
                        </ng-container>

                        <!-- Total Goles -->
                        <ng-container matColumnDef="totalGoals">
                            <th
                                mat-header-cell
                                *matHeaderCellDef
                                mat-sort-header
                            >
                                Total Goles
                            </th>
                            <td mat-cell *matCellDef="let season">
                                {{ season.totalGoals }}
                            </td>
                        </ng-container>

                        <!-- Promedio Goles -->
                        <ng-container matColumnDef="avgGoalsPerGame">
                            <th
                                mat-header-cell
                                *matHeaderCellDef
                                mat-sort-header
                            >
                                Promedio Goles
                            </th>
                            <td mat-cell *matCellDef="let season">
                                {{ season.avgGoalsPerGame | number : '1.2-2' }}
                            </td>
                        </ng-container>

                        <!-- Fechas -->
                        <ng-container matColumnDef="dates">
                            <th mat-header-cell *matHeaderCellDef>Fechas</th>
                            <td mat-cell *matCellDef="let season">
                                {{ season.startDate | date }} -
                                {{ season.endDate | date }}
                            </td>
                        </ng-container>

                        <!-- Acciones -->
                        <ng-container matColumnDef="actions">
                            <th mat-header-cell *matHeaderCellDef>Acciones</th>
                            <td mat-cell *matCellDef="let season">
                                <button
                                    mat-icon-button
                                    color="primary"
                                    (click)="viewDetails(season)"
                                >
                                    <mat-icon>visibility</mat-icon>
                                </button>
                            </td>
                        </ng-container>

                        <tr
                            mat-header-row
                            *matHeaderRowDef="displayedColumns"
                        ></tr>
                        <tr
                            mat-row
                            *matRowDef="let row; columns: displayedColumns"
                        ></tr>
                    </table>

                    <mat-paginator
                        [length]="totalItems"
                        [pageSize]="filter.pageSize"
                        [pageSizeOptions]="[5, 10, 25, 100]"
                        (page)="onPageChange($event)"
                    >
                    </mat-paginator>
                </mat-card-content>
            </mat-card>
        </div>
    `,
    styles: [
        `
            @use '../../../../../styles/variables' as vars;
            @use '../../../../../styles/mixins' as mixins;

            .seasons-container {
                padding: vars.$spacing-6;
                max-width: vars.$container-lg;
                margin: 0 auto;
            }

            .header-card {
                margin-bottom: vars.$spacing-6;
                @include mixins.card;
            }

            .search-field {
                width: 300px;
            }

            .table-card {
                @include mixins.card;
            }

            table {
                width: 100%;
            }

            .mat-column-actions {
                width: 80px;
                text-align: center;
            }

            // Responsive
            @include mixins.respond-to(md) {
                .seasons-container {
                    padding: vars.$spacing-4;
                }
            }

            @include mixins.respond-to(sm) {
                .search-field {
                    width: 100%;
                }
            }
        `,
    ],
})
export class TemporadasComponent implements OnInit {
    dataSource: StatisticsSeason[] = [];
    displayedColumns = [
        'name',
        'totalGames',
        'totalGoals',
        'avgGoalsPerGame',
        'dates',
        'actions',
    ];
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
        this.loadSeasons();
    }

    loadSeasons() {
        this.statisticsService.getAllSeasonsStatistics(this.filter).subscribe({
            next: (response: ApiPaginationResponse<StatisticsSeason>) => {
                this.dataSource = response.data;
                this.totalItems = response.meta.pagination.count;
            },
            error: (error) => {
                console.error('Error cargando temporadas:', error);
            },
        });
    }

    onSearchChange(search: string) {
        this.filter.search = search;
        this.filter.page = 1;
        this.loadSeasons();
    }

    onPageChange(event: any) {
        this.filter.page = event.pageIndex + 1;
        this.filter.pageSize = event.pageSize;
        this.loadSeasons();
    }

    viewDetails(season: StatisticsSeason) {
        // Implementar vista detallada de temporada
        console.log('Ver detalles de temporada:', season);
    }
}
