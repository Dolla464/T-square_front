import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

function buildApiOrigin(mode) {
  const env = loadEnv(mode, process.cwd(), "");

  if (!env.VITE_API_URL) {
    return null;
  }

  try {
    return new URL(env.VITE_API_URL, "http://localhost").origin;
  } catch {
    return null;
  }
}

function buildConnectSrc(mode) {
  const sources = new Set([
    "'self'",
    "https:",
    "http://localhost:*",
    "http://127.0.0.1:*",
    "ws:",
    "wss:",
  ]);

  const apiOrigin = buildApiOrigin(mode);
  if (apiOrigin) {
    sources.add(apiOrigin);
  }

  const env = loadEnv(mode, process.cwd(), "");
  if (env.VITE_DEV_API_PROXY) {
    try {
      sources.add(new URL(env.VITE_DEV_API_PROXY).origin);
    } catch {
      // ignore invalid VITE_DEV_API_PROXY
    }
  }

  if (env.VITE_REVERB_HOST) {
    const scheme = env.VITE_REVERB_SCHEME === "https" ? "wss" : "ws";
    const port = env.VITE_REVERB_PORT ? `:${env.VITE_REVERB_PORT}` : "";
    sources.add(`${scheme}://${env.VITE_REVERB_HOST}${port}`);
  }

  return [...sources].join(" ");
}

function buildImgSrc(mode) {
  const env = loadEnv(mode, process.cwd(), "");
  const sources = new Set(["http://localhost:*", "http://127.0.0.1:*"]);

  const apiOrigin = buildApiOrigin(mode);
  if (apiOrigin) {
    sources.add(apiOrigin);
  }

  if (env.VITE_DEV_API_PROXY) {
    try {
      sources.add(new URL(env.VITE_DEV_API_PROXY).origin);
    } catch {
      // ignore invalid VITE_DEV_API_PROXY
    }
  }

  return [...sources].join(" ");
}

function injectCsp(mode) {
  const connectSrc = buildConnectSrc(mode);
  const imgSrc = buildImgSrc(mode);

  return {
    name: "inject-csp",
    transformIndexHtml(html) {
      return html
        .replace("__CSP_CONNECT_SRC__", connectSrc)
        .replace("__CSP_IMG_SRC__", imgSrc);
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const devApiProxy = env.VITE_DEV_API_PROXY || "http://t-square-lms.test";

  return {
  plugins: [react(), injectCsp(mode)],
  base: "/",
  build: {
    sourcemap: false,
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: mode === "production",
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react-bootstrap") || id.includes("bootstrap")) {
              return "bootstrap-vendor";
            }
            if (
              id.includes("react-router-dom") ||
              id.includes("react-router") ||
              id.includes("react-helmet")
            ) {
              return "router-vendor";
            }
            if (id.includes("i18next") || id.includes("react-i18next")) {
              return "i18n-vendor";
            }
            if (id.includes("sweetalert2") || id.includes("react-hot-toast")) {
              return "ui-vendor";
            }
            return "vendor";
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      "/api": {
        target: devApiProxy,
        changeOrigin: true,
        secure: false,
      },
      "/sanctum": {
        target: devApiProxy,
        changeOrigin: true,
        secure: false,
      },
      "/storage": {
        target: devApiProxy,
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    port: 4173,
    strictPort: true,
    headers: {
      "X-Frame-Options": "SAMEORIGIN",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    },
  },
  };
});
