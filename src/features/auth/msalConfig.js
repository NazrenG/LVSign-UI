import { BrowserCacheLocation } from "@azure/msal-browser";

export const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_AZURE_TENANT_ID}`,
    redirectUri: `${window.location.origin}/redirect.html`,
    postLogoutRedirectUri: `${window.location.origin}/login`,
  },
  cache: {
    cacheLocation: BrowserCacheLocation.SessionStorage,
  },
};

export const loginRequest = {
  scopes: [import.meta.env.VITE_AZURE_API_SCOPE],
};
