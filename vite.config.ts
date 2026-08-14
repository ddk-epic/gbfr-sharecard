import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Project page under a subpath — absolute-root asset URLs would 404 (SPEC §1).
export default defineConfig({
  base: "/gbfr-sharecard/",
  plugins: [react(), tailwindcss()],
  // Root-relative so no node path helpers (and no @types/node) are needed.
  // Vitest reads this config, so tests resolve @/ without extra setup.
  resolve: {
    alias: { "@": "/src" },
  },
});
