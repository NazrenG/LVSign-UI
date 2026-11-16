import { InteractionRequiredAuthError } from "@azure/msal-browser";
import { msalInstance } from "./msalInstance";
import { loginRequest } from "./msalConfig";

/**
 * Sends an API request with a Microsoft Entra ID access token.
 *
 * Does not modify the original RequestInit object.
 * Does not automatically redirect the browser.
 */
export async function authenticatedFetch(input, init = {}) {
  await msalInstance.initialize();
  const account =
    msalInstance.getActiveAccount() ?? msalInstance.getAllAccounts()[0];

  if (!account) {
    throw new Error("Authentication required.");
  }

  let tokenResult;

  try {
    tokenResult = await msalInstance.acquireTokenSilent({
      ...loginRequest,
      account,
    });
  } catch (error) {
    if (error instanceof InteractionRequiredAuthError) {
      window.dispatchEvent(new Event("lvsign:session-expired"));

      const sessionError = new Error(
        "Your Microsoft session requires reauthentication.",
      );

      sessionError.code = "SESSION_EXPIRED";

      throw sessionError;
    }

    throw error;
  }

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${tokenResult.accessToken}`);

  return fetch(input, {
    ...init,
    headers,
  });
}
