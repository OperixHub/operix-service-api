#!/usr/bin/env node
/**
 * generate-realm.js
 *
 * Faz duas coisas:
 *   1. Gera config/realm-export.json a partir do template com as credenciais do .env
 *   2. Se o Keycloak estiver rodando, sincroniza o Google IdP via Admin API
 *      (necessário quando o volume já existe e o realm não é reimportado)
 *
 * Uso:
 *   node scripts/generate-realm.js
 *   bun run realm:generate
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

config({ path: resolve(root, '.env') });

const TEMPLATE_PATH = resolve(root, 'config', 'realm-export.template.json');
const OUTPUT_PATH   = resolve(root, 'config', 'realm-export.json');

// ── 1. Substituição de placeholders ──────────────────────────────────────────

const substitutions = {
  '{{GOOGLE_CLIENT_ID}}':     process.env.GOOGLE_CLIENT_ID,
  '{{GOOGLE_CLIENT_SECRET}}': process.env.GOOGLE_CLIENT_SECRET,
};

const missing = Object.entries(substitutions)
  .filter(([, value]) => !value)
  .map(([placeholder]) => placeholder.replace(/[{}]/g, ''));

if (missing.length > 0) {
  console.error('❌ Variáveis de ambiente ausentes no .env:');
  missing.forEach(v => console.error(`   ${v}`));
  process.exit(1);
}

let template = readFileSync(TEMPLATE_PATH, 'utf-8');
for (const [placeholder, value] of Object.entries(substitutions)) {
  template = template.replaceAll(placeholder, value);
}

try {
  JSON.parse(template);
} catch (err) {
  console.error('❌ O JSON gerado é inválido:', err.message);
  process.exit(1);
}

writeFileSync(OUTPUT_PATH, template, 'utf-8');
console.log('✅ config/realm-export.json gerado com sucesso.');

// ── 2. Sincronização com Keycloak (se estiver acessível) ─────────────────────

const KEYCLOAK_URL      = process.env.KEYCLOAK_PUBLIC_URL || process.env.KEYCLOAK_URL || 'http://localhost:8080';
const KEYCLOAK_REALM    = process.env.KEYCLOAK_REALM    || 'operix-service';
const ADMIN_USER        = process.env.KEYCLOAK_ADMIN_USER     || 'admin';
const ADMIN_PASSWORD    = process.env.KEYCLOAK_ADMIN_PASSWORD || 'admin';

async function getAdminToken() {
  const res = await fetch(`${KEYCLOAK_URL}/realms/master/protocol/openid-connect/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: 'admin-cli',
      grant_type: 'password',
      username: ADMIN_USER,
      password: ADMIN_PASSWORD,
    }),
  });
  if (!res.ok) throw new Error(`Auth falhou: ${res.status}`);
  const data = await res.json();
  return data.access_token;
}

async function syncGoogleIdP(token) {
  const baseUrl = `${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/identity-provider/instances`;

  // Verifica se já existe
  const listRes = await fetch(`${baseUrl}/google`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const idpPayload = {
    alias: 'google',
    displayName: 'Google',
    providerId: 'google',
    enabled: true,
    trustEmail: true,
    storeToken: false,
    addReadTokenRoleOnCreate: false,
    authenticateByDefault: false,
    linkOnly: false,
    firstBrokerLoginFlowAlias: 'first broker login',
    config: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      defaultScope: 'openid profile email',
      syncMode: 'IMPORT',
    },
  };

  if (listRes.ok) {
    // Atualiza
    const updateRes = await fetch(`${baseUrl}/google`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(idpPayload),
    });
    if (!updateRes.ok) {
      const err = await updateRes.text();
      throw new Error(`Falha ao atualizar Google IdP: ${updateRes.status} - ${err}`);
    }
    console.log('🔄 Google IdP atualizado no Keycloak.');
  } else if (listRes.status === 404) {
    // Cria
    const createRes = await fetch(baseUrl, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(idpPayload),
    });
    if (!createRes.ok) {
      const err = await createRes.text();
      throw new Error(`Falha ao criar Google IdP: ${createRes.status} - ${err}`);
    }
    console.log('✅ Google IdP criado no Keycloak.');
  } else {
    throw new Error(`Resposta inesperada ao verificar IdP: ${listRes.status}`);
  }
}

(async () => {
  try {
    const token = await getAdminToken();
    await syncGoogleIdP(token);
  } catch (err) {
    // Keycloak pode não estar rodando ainda — não é erro fatal na geração do arquivo
    if (err.cause?.code === 'ECONNREFUSED' || err.message.includes('fetch failed')) {
      console.log('ℹ️  Keycloak não acessível — sincronização adiada para após o start dos containers.');
    } else {
      console.warn('⚠️  Não foi possível sincronizar o IdP com o Keycloak:', err.message);
    }
  }
})();
