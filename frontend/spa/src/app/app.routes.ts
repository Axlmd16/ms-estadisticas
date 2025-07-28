import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { MainLayout } from './layouts/main-layout/main-layout';
import { AuthLayout } from './layouts/auth-layout/auth-layout';

export const routes: Routes = [
    {
        path: '',
        component: MainLayout,
        // canActivate: [authGuard],
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            {
                path: 'dashboard',
                loadComponent: () =>
                    import('./feature/dashboard/dashboard').then(
                        (m) => m.Dashboard
                    ),
            },

            // Rutas de Deportes
            {
                path: 'deportes',
                loadComponent: () =>
                    import('./feature/deportes/deportes').then(
                        (m) => m.DeportesComponent
                    ),
            },

            // Rutas de Torneos
            {
                path: 'torneos',
                loadComponent: () =>
                    import('./feature/torneos/torneos').then(
                        (m) => m.TorneosComponent
                    ),
            },

            // Rutas de Equipos
            {
                path: 'equipos',
                loadComponent: () =>
                    import('./feature/equipos/equipos').then(
                        (m) => m.EquiposComponent
                    ),
            },
            {
                path: 'equipos/:id',
                loadComponent: () =>
                    import('./feature/equipo-detalle/equipo-detalle').then(
                        (m) => m.EquipoDetalleComponent
                    ),
            },

            // Rutas de Eventos
            {
                path: 'eventos',
                loadComponent: () =>
                    import('./feature/eventos/eventos').then(
                        (m) => m.EventosComponent
                    ),
            },
            {
                path: 'eventos/crear',
                loadComponent: () =>
                    import('./feature/eventos/eventos').then(
                        (m) => m.EventosComponent
                    ),
            },

            // Ruta de Calendario
            {
                path: 'calendario',
                loadComponent: () =>
                    import('./feature/calendario/calendario').then(
                        (m) => m.CalendarioComponent
                    ),
            },

            // Rutas de Estadísticas
            {
                path: 'estadisticas',
                children: [
                    { path: '', redirectTo: 'equipos', pathMatch: 'full' },
                    // Equipos
                    {
                        path: 'equipos',
                        loadComponent: () =>
                            import(
                                './feature/estadisticas/components/equipos/equipos.component'
                            ).then((m) => m.EquiposComponent),
                    },
                    {
                        path: 'equipos/:id',
                        loadComponent: () =>
                            import(
                                './feature/estadisticas/components/equipo-detalle/equipo-detalle.component'
                            ).then((m) => m.EquipoDetalleComponent),
                    },
                    {
                        path: 'equipos/:id/estadisticas',
                        loadComponent: () =>
                            import(
                                './feature/estadisticas/components/equipos/estadisticas-equipo/estadisticas-equipo.component'
                            ).then((m) => m.EstadisticasEquipoComponent),
                    },
                    // Temporadas
                    {
                        path: 'temporadas',
                        loadComponent: () =>
                            import(
                                './feature/estadisticas/components/temporadas/temporadas.component'
                            ).then((m) => m.TemporadasComponent),
                    },
                    {
                        path: 'temporadas/:id',
                        loadComponent: () =>
                            import(
                                './feature/estadisticas/components/temporadas/temporada-detalle/temporada-detalle.component'
                            ).then((m) => m.TemporadaDetalleComponent),
                    },
                    // Jugadores
                    {
                        path: 'jugadores',
                        loadComponent: () =>
                            import(
                                './feature/estadisticas/components/jugadores/jugadores.component'
                            ).then((m) => m.JugadoresComponent),
                    },
                    {
                        path: 'jugadores/:id',
                        loadComponent: () =>
                            import(
                                './feature/estadisticas/components/jugadores/jugador-estadisticas/jugador-estadisticas.component'
                            ).then((m) => m.JugadorDetalleComponent),
                    },
                    // {
                    //     path: 'jugadores/:id/estadisticas',
                    //     loadComponent: () =>
                    //         import(
                    //             './feature/estadisticas/components/jugadores/estadisticas-athlete/estadisticas-athlete.component'
                    //         ).then((m) => m.EstadisticasAthleteComponent),
                    // },
                    // Competencias
                    {
                        path: 'competencias',
                        loadComponent: () =>
                            import(
                                './feature/estadisticas/components/competencias/competencias.component'
                            ).then((m) => m.CompetenciasComponent),
                    },
                    {
                        path: 'competencias/:id',
                        loadComponent: () =>
                            import(
                                './feature/estadisticas/components/competencias/competencia-estadisticas/competencia-estadisticas.component'
                            ).then((m) => m.CompetenciaDetalleComponent),
                    },
                    // Tabla de Posiciones
                    {
                        path: 'tabla-posiciones',
                        loadComponent: () =>
                            import(
                                './feature/estadisticas/components/tabla-posiciones/tabla-posiciones.component'
                            ).then((m) => m.TablaPosicionesComponent),
                    },
                    // CRUD de Competiciones
                    // {
                    //     path: 'competiciones',
                    //     loadComponent: () =>
                    //         import(
                    //             './feature/estadisticas/components/competiciones/competiciones.component'
                    //         ).then((m) => m.CompeticionesComponent),
                    // },
                    // CRUD de Equipos
                    {
                        path: 'equipos-crud',
                        loadComponent: () =>
                            import(
                                './feature/estadisticas/components/equipos/equipos.component'
                            ).then((m) => m.EquiposComponent),
                    },
                    // CRUD de Atletas
                    // {
                    //     path: 'atletas',
                    //     loadComponent: () =>
                    //         import(
                    //             './feature/estadisticas/components/atletas/atletas.component'
                    //         ).then((m) => m.AtletasComponent),
                    // },
                    // // CRUD de Temporadas
                    // {
                    //     path: 'temporadas-crud',
                    //     loadComponent: () =>
                    //         import(
                    //             './feature/estadisticas/components/temporadas/temporada-crud.component'
                    //         ).then((m) => m.TemporadaCrudComponent),
                    // },
                    // // CRUD de Partidos
                    // {
                    //     path: 'partidos',
                    //     loadComponent: () =>
                    //         import(
                    //             './feature/estadisticas/components/partidos/partidos.component'
                    //         ).then((m) => m.PartidosComponent),
                    // },
                ],
            },

            // Rutas de Configuración
            {
                path: 'perfil',
                loadComponent: () =>
                    import('./feature/perfil/perfil').then(
                        (m) => m.PerfilComponent
                    ),
            },
            {
                path: 'ajustes',
                children: [
                    {
                        path: '',
                        loadComponent: () =>
                            import('./feature/ajustes/ajustes').then(
                                (m) => m.AjustesComponent
                            ),
                    },
                    {
                        path: 'categorias',
                        loadComponent: () =>
                            import(
                                './feature/ajustes/catalogs/categories.component'
                            ).then((m) => m.CategoriesComponent),
                    },
                    {
                        path: 'items',
                        loadComponent: () =>
                            import(
                                './features/ajustes/catalogs/components/items/items.component'
                            ).then((m) => m.ItemsComponent),
                    },
                ],
            },
            {
                path: 'ayuda',
                loadComponent: () =>
                    import('./feature/ayuda/ayuda').then(
                        (m) => m.AyudaComponent
                    ),
            },

            // Ruta de notificaciones
            {
                path: 'notificaciones',
                loadComponent: () =>
                    import('./feature/notificaciones/notificaciones').then(
                        (m) => m.NotificacionesComponent
                    ),
            },
        ],
    },

    // Rutas de autenticación con AuthLayout
    {
        path: '',
        component: AuthLayout,
        children: [
            {
                path: 'login',
                loadComponent: () =>
                    import('./feature/auth/login/login').then(
                        (m) => m.LoginComponent
                    ),
            },
            {
                path: 'register',
                loadComponent: () =>
                    import('./feature/auth/register/register').then(
                        (m) => m.RegisterComponent
                    ),
            },
            {
                path: 'forgot-password',
                loadComponent: () =>
                    import(
                        './feature/auth/forgot-password/forgot-password'
                    ).then((m) => m.ForgotPasswordComponent),
            },
            {
                path: 'reset-password',
                loadComponent: () =>
                    import('./feature/auth/reset-password/reset-password').then(
                        (m) => m.ResetPasswordComponent
                    ),
            },
        ],
    },

    // Wildcard route for 404 page
    { path: '**', redirectTo: 'dashboard' },
];
