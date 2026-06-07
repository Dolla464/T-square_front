import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/css/bootstrap.rtl.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { onCLS, onINP, onLCP } from "web-vitals";

onCLS((metric) => {
  console.table(metric);
});

onLCP((metric) => {
  console.table(metric);
});

onINP((metric) => {
  console.table(metric);
});
// مكتبة تقوم بمراقبة الاداء
// import { scan } from "react-scan";
// scan();


// Initialize i18n asynchronously to avoid blocking initial render
import("./i18n")
  .then(() => {
    createRoot(document.getElementById("root")).render(
      <AuthProvider>

        <StrictMode>
          <HelmetProvider>
            <App />
          </HelmetProvider>
        </StrictMode>
      </AuthProvider>,
    );
  })
  .catch((err) => {
    console.error("Failed to initialize i18n:", err);
    // Fallback: render app anyway
    createRoot(document.getElementById("root")).render(
      <AuthProvider>

        <StrictMode>
          <HelmetProvider>
            <App />
          </HelmetProvider>
        </StrictMode>
      </AuthProvider>,
    );
  });
