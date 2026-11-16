import { useMsal } from "@azure/msal-react";

export function useMicrosoftLogout() {
  const { instance, accounts } = useMsal();

  const signOut = async () => {
    const account = instance.getActiveAccount() ?? accounts[0] ?? null;

    try {
      await instance.logoutRedirect({
        account: account ?? undefined,
        postLogoutRedirectUri: `${window.location.origin}/login`,
      });
    } catch (error) {
      console.error("Microsoft logout failed:", error);
    }
  };

  return signOut;
}
