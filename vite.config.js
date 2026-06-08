import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/",
  build: {
    rollupOptions: {
      output: {
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",

        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("bootstrap")) return "bootstrap-vendor";
            if (id.includes("react-router")) return "router-vendor";
            return "vendor";
          }
        },
      },
    },
  },
});
