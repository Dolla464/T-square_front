import "./assets/fonts/fonts.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./index.css";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { ForbiddenProvider } from "./contexts/ForbiddenContext.jsx";
import { renderApp } from "./bootstrap/renderApp.js";

void renderApp({
  createRoot,
  getRootElement: () => document.getElementById("root"),
  renderTree: (App) => (
    <AuthProvider>
      <ForbiddenProvider>
        <StrictMode>
          <HelmetProvider>
            <App />
          </HelmetProvider>
        </StrictMode>
      </ForbiddenProvider>
    </AuthProvider>
  ),
}).catch((err) => {
  console.error("Failed to bootstrap application:", err);
});
