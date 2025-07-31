export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000',  // Kong API Gateway URL
  // Fallback direct to microservice if Kong is not working
  directApiUrl: 'http://localhost:8011/api/v1',  // Direct to ms-auth-service
};
