import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: "/",
  build: {
    minify: "esbuild",
    sourcemap: false,
    // terserOptions: {
    //   compress: {
    //     drop_console: mode === "production",
    //     drop_debugger: true,
    //   },
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
  },
  preview: {
    port: 4173,
    strictPort: true,
  },
}));
