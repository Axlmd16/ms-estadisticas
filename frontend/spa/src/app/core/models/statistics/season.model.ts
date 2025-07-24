/**
 * Modelo para temporadas
 */
export interface Season {
    /** ID único de la temporada */
    id: string;

    /** Nombre de la temporada */
    name: string;

    /** Fecha de inicio de la temporada */
    start_date: Date;

    /** Fecha de fin de la temporada */
    end_date: Date;

    /** Estado de la temporada (activa/inactiva) */
    status: 'active' | 'inactive';

    /** Fecha de creación */
    created_at: Date;

    /** Fecha de última actualización */
    updated_at: Date;
}
