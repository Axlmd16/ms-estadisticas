/**
 * Configuración centralizada de endpoints de la API
 * Los endpoints están configurados para funcionar con Kong API Gateway
 */
export const API_ENDPOINTS = {
    // URL base apunta a Kong API Gateway
    BASE_URL: 'http://localhost:8012',

    CATALOG: {
        CATEGORIES: '/catalog/categories/',
        ITEMS: '/catalog/items/',
    },

    AUTH: {
        LOGIN: '/auth/login',
        LOGOUT: '/auth/logout',
        REFRESH: '/auth/refresh',
    },

    COMPETENCIES: {
        BASE: '/competencies',
    },

    STATISTICS: {
        BASE: '/api/v1/statistics',
        TEAMS: '/api/v1/statistics/team',
        SEASONS: '/api/v1/statistics/seasons',
        PLAYERS: '/api/v1/statistics/players',
        COMPETITIONS: '/api/v1/statistics/competition',
    },
} as const;

/**
 * Helper para construir URLs completas
 */
export class ApiUrlBuilder {
    static buildUrl(endpoint: string): string {
        // Asegurar que no hay barras dobles
        const cleanEndpoint = endpoint.startsWith('/')
            ? endpoint
            : `/${endpoint}`;
        const baseUrl = API_ENDPOINTS.BASE_URL.endsWith('/')
            ? API_ENDPOINTS.BASE_URL.slice(0, -1)
            : API_ENDPOINTS.BASE_URL;

        return `${baseUrl}${cleanEndpoint}`;
    }

    static getCategoriesUrl(): string {
        return this.buildUrl(API_ENDPOINTS.CATALOG.CATEGORIES);
    }

    static getItemsUrl(): string {
        return this.buildUrl(API_ENDPOINTS.CATALOG.ITEMS);
    }

    static getStatisticsBaseUrl(): string {
        return this.buildUrl(API_ENDPOINTS.STATISTICS.BASE);
    }

    static getStatisticsTeamsUrl(): string {
        return this.buildUrl(API_ENDPOINTS.STATISTICS.TEAMS);
    }

    static getStatisticsSeasonsUrl(): string {
        return this.buildUrl(API_ENDPOINTS.STATISTICS.SEASONS);
    }

    static getStatisticsPlayersUrl(): string {
        return this.buildUrl(API_ENDPOINTS.STATISTICS.PLAYERS);
    }

    static getStatisticsCompetitionsUrl(): string {
        return this.buildUrl(API_ENDPOINTS.STATISTICS.COMPETITIONS);
    }
}
