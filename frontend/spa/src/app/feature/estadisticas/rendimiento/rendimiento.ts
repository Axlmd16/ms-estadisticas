import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { FormsModule } from '@angular/forms';

interface RendimientoJugador {
    nombre: string;
    posicion: string;
    partidos: number;
    minutos: number;
    puntuacion: number;
    tendencia: 'subida' | 'bajada' | 'estable';
    rendimiento: number[];
}

interface RendimientoEquipo {
    nombre: string;
    deporte: string;
    partidos: number;
    victorias: number;
    derrotas: number;
    empates: number;
    puntuacion: number;
    tendencia: 'subida' | 'bajada' | 'estable';
    rendimiento: number[];
}

@Component({
    selector: 'app-rendimiento',
    standalone: true,
    imports: [
        CommonModule,
        MatIconModule,
        MatCardModule,
        MatSelectModule,
        MatButtonModule,
        MatTabsModule,
        FormsModule
    ],
    templateUrl: './rendimiento.html',
    styleUrl: './rendimiento.scss'
})
export class RendimientoComponent {
    filtroEquipo: string = 'todos';
    filtroPeriodo: string = 'temporada';

    // Datos de ejemplo para rendimiento de jugadores
    jugadores: RendimientoJugador[] = [
        {
            nombre: 'Alex Rivera',
            posicion: 'Delantero',
            partidos: 12,
            minutos: 980,
            puntuacion: 8.5,
            tendencia: 'subida',
            rendimiento: [7.2, 7.5, 8.0, 7.8, 8.3, 8.5, 8.4, 8.6, 8.7, 8.9, 8.5, 8.8]
        },
        {
            nombre: 'María González',
            posicion: 'Centrocampista',
            partidos: 10,
            minutos: 850,
            puntuacion: 7.8,
            tendencia: 'estable',
            rendimiento: [7.5, 7.8, 7.7, 7.9, 7.6, 7.8, 7.7, 7.9, 8.0, 7.8]
        },
        {
            nombre: 'Carlos Rodríguez',
            posicion: 'Defensa',
            partidos: 11,
            minutos: 990,
            puntuacion: 7.2,
            tendencia: 'bajada',
            rendimiento: [7.8, 7.6, 7.5, 7.4, 7.3, 7.0, 7.2, 7.1, 7.0, 6.8, 6.7]
        },
        {
            nombre: 'Ana Martínez',
            posicion: 'Portera',
            partidos: 12,
            minutos: 1080,
            puntuacion: 8.2,
            tendencia: 'subida',
            rendimiento: [7.5, 7.8, 8.0, 8.1, 8.0, 8.2, 8.3, 8.1, 8.4, 8.5, 8.6, 8.7]
        }
    ];

    // Datos de ejemplo para rendimiento de equipos
    equipos: RendimientoEquipo[] = [
        {
            nombre: 'Halcones FC',
            deporte: 'Fútbol',
            partidos: 15,
            victorias: 10,
            derrotas: 3,
            empates: 2,
            puntuacion: 8.3,
            tendencia: 'subida',
            rendimiento: [7.5, 7.8, 8.0, 8.1, 8.0, 8.2, 8.3, 8.1, 8.4, 8.5, 8.6, 8.7, 8.5, 8.6, 8.8]
        },
        {
            nombre: 'Tigres Basket',
            deporte: 'Baloncesto',
            partidos: 12,
            victorias: 8,
            derrotas: 4,
            empates: 0,
            puntuacion: 7.9,
            tendencia: 'estable',
            rendimiento: [7.8, 7.9, 7.7, 8.0, 7.8, 7.9, 8.1, 7.9, 7.8, 8.0, 7.9, 7.8]
        },
        {
            nombre: 'Delfines Natación',
            deporte: 'Natación',
            partidos: 8,
            victorias: 5,
            derrotas: 3,
            empates: 0,
            puntuacion: 8.1,
            tendencia: 'bajada',
            rendimiento: [8.5, 8.4, 8.3, 8.2, 8.0, 7.9, 7.8, 7.7]
        }
    ];

    // Lista de filtros disponibles
    filtrosEquipos = [
        { valor: 'todos', nombre: 'Todos los equipos' },
        { valor: 'halcones', nombre: 'Halcones FC' },
        { valor: 'tigres', nombre: 'Tigres Basket' },
        { valor: 'delfines', nombre: 'Delfines Natación' }
    ];

    filtrosPeriodo = [
        { valor: 'temporada', nombre: 'Temporada actual' },
        { valor: 'mes', nombre: 'Último mes' },
        { valor: 'semana', nombre: 'Última semana' }
    ];

    obtenerRendimientoPromedio(jugador: RendimientoJugador): number {
        const sum = jugador.rendimiento.reduce((a, b) => a + b, 0);
        return sum / jugador.rendimiento.length;
    }

    obtenerIconoTendencia(tendencia: string): string {
        switch(tendencia) {
            case 'subida': return 'trending_up';
            case 'bajada': return 'trending_down';
            default: return 'trending_flat';
        }
    }

    obtenerClaseTendencia(tendencia: string): string {
        switch(tendencia) {
            case 'subida': return 'tendencia-positiva';
            case 'bajada': return 'tendencia-negativa';
            default: return 'tendencia-estable';
        }
    }

    obtenerProgresoEquipo(equipo: RendimientoEquipo): number {
        return (equipo.victorias / equipo.partidos) * 100;
    }
}
