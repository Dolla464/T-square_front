import "./assets/fonts/fonts.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./index.css";
import { ensureBootstrapCssLoaded } from "./bootstrap/loadBootstrapCss.js";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { ForbiddenProvider } from "./contexts/ForbiddenContext.jsx";
// import { onCLS, onINP, onLCP } from "web-vitals";

// onCLS((metric) => {
//   console.table(metric);
// });

// onLCP((metric) => {
//   console.table(metric);
// });

// onINP((metric) => {
//   console.table(metric);
// });
// مكتبة تقوم بمراقبة الاداء
// import { scan } from "react-scan";
// scan();

void ensureBootstrapCssLoaded()
  .then(() => import("./App.jsx"))
  .then(({ default: App }) => {
    // Initialize i18n without blocking the first React render.
    void import("./i18n").catch((err) => {
      console.error("Failed to initialize i18n:", err);
    });

    createRoot(document.getElementById("root")).render(
      <AuthProvider>
        <ForbiddenProvider>
          <StrictMode>
            <HelmetProvider>
              <App />
            </HelmetProvider>
          </StrictMode>
        </ForbiddenProvider>
      </AuthProvider>,
    );
  })
  .catch((err) => {
    console.error("Failed to bootstrap application:", err);
  });
