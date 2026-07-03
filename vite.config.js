import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import basicSsl from "@vitejs/plugin-basic-ssl";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), basicSsl()],
  server: {
    host: true,
    https: true,
    port: 5173,
    proxy: {
      "/api/beatify-proxy": {
        target: "https://firebasestorage.googleapis.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/beatify-proxy/, ""),
      },
    },
  },
  preview: {
    host: true,
    https: true,
    port: 4173,
    proxy: {
      "/api/beatify-proxy": {
        target: "https://firebasestorage.googleapis.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/beatify-proxy/, ""),
      },
    },
  },
});
