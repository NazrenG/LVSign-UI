import { createContext, useContext, useEffect, useState } from "react";
import { InteractionStatus } from "@azure/msal-browser";
import { useMsal } from "@azure/msal-react";
import { authenticatedFetch } from "./authenticatedFetch";

const CurrentUserContext = createContext(null);

export function CurrentUserProvider({ children }) {
  const { instance, accounts, inProgress } = useMsal();

  const account = instance.getActiveAccount() ?? accounts[0] ?? null;
  const accountId = account?.homeAccountId ?? null;

  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (inProgress !== InteractionStatus.None) {
      return;
    }

    if (!account) {
      setCurrentUser(null);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;

    async function loadCurrentUser() {
      setLoading(true);
      setCurrentUser(null);
      setError(null);

      try {
        const response = await authenticatedFetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/auth/me`,
        );

        if (!response.ok) {
          const error = new Error(
            `Current user request failed: ${response.status}`,
          );

          error.status = response.status;

          throw error;
        }
        
        const user = await response.json();

        if (!cancelled) {
          setCurrentUser(user);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadCurrentUser();

    return () => {
      cancelled = true;
    };
  }, [accountId, inProgress]);

  return (
    <CurrentUserContext.Provider value={{ currentUser, loading, error }}>
      {children}
    </CurrentUserContext.Provider>
  );
}

export function useCurrentUser() {
  const context = useContext(CurrentUserContext);

  if (context === null) {
    throw new Error("useCurrentUser must be used within CurrentUserProvider.");
  }

  return context;
}
