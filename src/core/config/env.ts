const defaultOrigins = ['http://localhost:3000', 'http://localhost:5173'];

function parseOrigins(value?: string) {
  if (!value) {
    return defaultOrigins;
  }

  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export const env = {
  appName: process.env.APP_NAME || 'operix-service',
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 3333,
  origins: parseOrigins(process.env.ORIGIN),
  databaseUrl: process.env.DATABASE_URL || 'postgresql://admin:admin@localhost:5432/operix-service',
  keycloakUrl: process.env.KEYCLOAK_URL || 'http://localhost:8080',
  keycloakRealm: process.env.KEYCLOAK_REALM || 'operix-service',
  keycloakClientId: process.env.KEYCLOAK_CLIENT_ID || 'operix-service-app',
  keycloakAdminUser: process.env.KEYCLOAK_ADMIN_USER || 'admin',
  keycloakAdminPassword: process.env.KEYCLOAK_ADMIN_PASSWORD || 'admin',
  keycloakIssuer: process.env.KEYCLOAK_ISSUER || `${process.env.KEYCLOAK_URL || 'http://localhost:8080'}/realms/${process.env.KEYCLOAK_REALM || 'operix-service'}`,
  keycloakJwksUri: process.env.KEYCLOAK_JWKS_URI || `${process.env.KEYCLOAK_URL || 'http://localhost:8080'}/realms/${process.env.KEYCLOAK_REALM || 'operix-service'}/protocol/openid-connect/certs`,
};
