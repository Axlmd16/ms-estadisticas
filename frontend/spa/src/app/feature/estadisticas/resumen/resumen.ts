import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-resumen',
    standalone: true,
    imports: [CommonModule, MatIconModule, MatCardModule, RouterModule],
    templateUrl: './resumen.html',
    styleUrl: './resumen.scss'
})
export class ResumenComponent {
    estadisticasGenerales = {
        torneos: {
            total: 12,
            activos: 8,
            proximos: 2,
            finalizados: 2,
            porcentaje: 67
        },
        equipos: {
            total: 48,
            activos: 42,
            inactivos: 6,
            porcentaje: 88
        },
        partidos: {
            total: 520,
            jugados: 320,
            pendientes: 200,
            porcentaje: 62
        },
        deportes: {
            total: 8,
            porcentajeCobertura: 95
        }
    };

    deportesStats = [
        { nombre: 'Fútbol', partidos: 120, equipos: 16, torneos: 3, porcentaje: 30 },
        { nombre: 'Baloncesto', partidos: 85, equipos: 12, torneos: 2, porcentaje: 22 },
        { nombre: 'Tenis', partidos: 45, equipos: 8, torneos: 1, porcentaje: 12 },
        { nombre: 'Voleibol', partidos: 30, equipos: 6, torneos: 1, porcentaje: 10 },
        { nombre: 'Natación', partidos: 25, equipos: 5, torneos: 1, porcentaje: 8 },
        { nombre: 'Otros', partidos: 15, equipos: 3, torneos: 4, porcentaje: 18 }
    ];

    actividadReciente = [
        { tipo: 'partido', titulo: 'Partido finalizado', descripcion: 'Equipo A 3 - 1 Equipo B', fecha: 'Hace 2 horas', icono: 'sports_soccer', color: '#1e88e5' },
        { tipo: 'torneo', titulo: 'Nuevo torneo creado', descripcion: 'Copa de Verano 2025', fecha: 'Hace 5 horas', icono: 'emoji_events', color: '#ff9800' },
        { tipo: 'equipo', titulo: 'Equipo registrado', descripcion: 'Los Tigres se unieron a la plataforma', fecha: 'Hace 1 día', icono: 'groups', color: '#4caf50' },
        { tipo: 'partido', titulo: 'Partido programado', descripcion: 'Equipo C vs Equipo D - 15/07/2025', fecha: 'Hace 1 día', icono: 'event', color: '#e53935' },
        { tipo: 'jugador', titulo: 'Jugador transferido', descripcion: 'Alex Rivera transferido al Equipo F', fecha: 'Hace 2 días', icono: 'person', color: '#9c27b0' }
    ];

    proximosEventos = [
        { tipo: 'partido', titulo: 'Equipo A vs Equipo B', fecha: '05/07/2025', hora: '16:00', lugar: 'Estadio Central', deporte: 'Fútbol', icono: 'sports_soccer' },
        { tipo: 'partido', titulo: 'Equipo C vs Equipo D', fecha: '08/07/2025', hora: '20:00', lugar: 'Polideportivo Norte', deporte: 'Baloncesto', icono: 'sports_basketball' },
        { tipo: 'torneo', titulo: 'Inicio de Copa de Verano', fecha: '10/07/2025', hora: '09:00', lugar: 'Complejo Deportivo', deporte: 'Varios', icono: 'emoji_events' },
        { tipo: 'entrenamiento', titulo: 'Entrenamiento Regional', fecha: '12/07/2025', hora: '15:00', lugar: 'Centro de Alto Rendimiento', deporte: 'Atletismo', icono: 'directions_run' }
    ];
}
