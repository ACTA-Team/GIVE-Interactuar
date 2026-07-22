// Server-only module: no "use client" directive, and must not be imported
// from any file that has one. Also imported directly by scripts/test-graph.ts
// via tsx (outside Next's bundler), so it must not depend on `server-only`.
import { ConfidentialClientApplication } from '@azure/msal-node';
import { Client } from '@microsoft/microsoft-graph-client';
import type { AuthenticationProvider } from '@microsoft/microsoft-graph-client';

const GRAPH_SCOPE = 'https://graph.microsoft.com/.default';

function getMsalConfig() {
  const tenantId = process.env.MS_TENANT_ID;
  const clientId = process.env.MS_CLIENT_ID;
  const clientSecret = process.env.MS_CLIENT_SECRET;

  if (!tenantId || !clientId || !clientSecret) {
    throw new Error(
      'Missing MS_TENANT_ID, MS_CLIENT_ID or MS_CLIENT_SECRET env vars',
    );
  }

  return {
    auth: {
      authority: `https://login.microsoftonline.com/${tenantId}`,
      clientId,
      clientSecret,
    },
  };
}

let msalApp: ConfidentialClientApplication | null = null;
let cachedToken: { value: string; expiresAt: number } | null = null;

function getMsalApp(): ConfidentialClientApplication {
  if (!msalApp) {
    msalApp = new ConfidentialClientApplication(getMsalConfig());
  }
  return msalApp;
}

// Refresh a bit before real expiry to avoid using a token that expires mid-request.
const EXPIRY_SAFETY_MARGIN_MS = 60_000;

async function getAccessToken(): Promise<string> {
  if (
    cachedToken &&
    cachedToken.expiresAt - EXPIRY_SAFETY_MARGIN_MS > Date.now()
  ) {
    return cachedToken.value;
  }

  const result = await getMsalApp().acquireTokenByClientCredential({
    scopes: [GRAPH_SCOPE],
  });

  if (!result?.accessToken) {
    throw new Error('Failed to acquire Microsoft Graph access token');
  }

  cachedToken = {
    value: result.accessToken,
    expiresAt: result.expiresOn
      ? result.expiresOn.getTime()
      : Date.now() + 60_000,
  };

  return cachedToken.value;
}

const authProvider: AuthenticationProvider = {
  getAccessToken,
};

let graphClient: Client | null = null;

export function getGraphClient(): Client {
  if (!graphClient) {
    graphClient = Client.initWithMiddleware({ authProvider });
  }
  return graphClient;
}
