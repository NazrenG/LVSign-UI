
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MsalProvider } from "@azure/msal-react";

import { App } from "@/app/App";
import { msalInstance } from "@/features/auth/msalInstance";
import { CurrentUserProvider } from "@/features/auth/CurrentUserProvider";
import { Toaster } from "sonner";
import "@/styles/index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <MsalProvider instance={msalInstance}>
      <CurrentUserProvider>
        <App /> 
      </CurrentUserProvider>
     
    </MsalProvider>

    <Toaster
      position="top-right"
      richColors
      closeButton
    />
  </StrictMode>,
);
