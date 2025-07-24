/**
 * Modelo para equipos
 */
export interface Team {
  /** ID único del equipo */
  id: string;

  /** Nombre del equipo */
  name: string;

  /** Descripción del equipo */
  description?: string;

  /** URL del logo del equipo */
  logo_url?: string;

  /** Fecha de creación */
  created_at: Date;

  /** Fecha de última actualización */
  updated_at: Date;
}
