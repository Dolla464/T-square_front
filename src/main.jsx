import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./index.css";
import App from "./App.jsx";

// Initialize i18n asynchronously to avoid blocking initial render
import("./i18n")
  .then(() => {
    createRoot(document.getElementById("root")).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  })
  .catch((err) => {
    console.error("Failed to initialize i18n:", err);
    // Fallback: render app anyway
    createRoot(document.getElementById("root")).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  });
