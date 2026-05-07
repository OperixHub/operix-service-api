import dotenv from 'dotenv';

dotenv.config();

const defaultOrigins = ['http://localhost:3000', 'http://localhost:5173'];
const validDeploymentModes = ['LOCAL', 'SAAS'] as const;

type DeploymentMode = typeof validDeploymentModes[number];

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
  deploymentMode: (validDeploymentModes.includes(process.env.DEPLOYMENT_MODE as DeploymentMode)
    ? process.env.DEPLOYMENT_MODE
    : 'LOCAL') as DeploymentMode,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://admin:admin@localhost:5432/operix-service',
  keycloakUrl: process.env.KEYCLOAK_URL || 'http://localhost:8080',
  // Public URL used to build browser-facing authorization URLs (e.g. OAuth redirect).
  // In Docker environments KEYCLOAK_URL is an internal hostname (keycloak:8080);
  // set KEYCLOAK_PUBLIC_URL to the host-accessible address (e.g. http://localhost:8080).
  keycloakClientAdminId: process.env.KEYCLOAK_CLIENT_ADMIN_ID || '',
  keycloakClientAdminSecret: process.env.KEYCLOAK_CLIENT_ADMIN_SECRET || '',
  keycloakPublicUrl: process.env.KEYCLOAK_PUBLIC_URL || process.env.KEYCLOAK_URL || 'http://localhost:8080',
  keycloakRealm: process.env.KEYCLOAK_REALM || 'operix-service',
  keycloakClientId: process.env.KEYCLOAK_CLIENT_ID || 'operix-service-app',
  keycloakAdminUser: process.env.KEYCLOAK_ADMIN_USER || 'admin',
  keycloakAdminPassword: process.env.KEYCLOAK_ADMIN_PASSWORD || 'admin',
  keycloakIssuer: process.env.KEYCLOAK_ISSUER || `${process.env.KEYCLOAK_URL || 'http://localhost:8080'}/realms/${process.env.KEYCLOAK_REALM || 'operix-service'}`,
  keycloakJwksUri: process.env.KEYCLOAK_JWKS_URI || `${process.env.KEYCLOAK_URL || 'http://localhost:8080'}/realms/${process.env.KEYCLOAK_REALM || 'operix-service'}/protocol/openid-connect/certs`,
};

export function isLocalDeployment() {
  return env.deploymentMode === 'LOCAL';
}
