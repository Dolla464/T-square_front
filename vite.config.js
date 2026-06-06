import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/",
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react-bootstrap") || id.includes("bootstrap")) {
              return "bootstrap-vendor";
            }
            if (id.includes("react-router-dom") || id.includes("react-router") || id.includes("react-helmet")) {
              return "router-vendor";
            }
            return "vendor";
          }
        }
      }
    }
  }
});
