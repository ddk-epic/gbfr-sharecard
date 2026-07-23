import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Project page under a subpath — absolute-root asset URLs would 404 (SPEC §1).
export default defineConfig({
  base: "/gbfr-sharecard/",
  plugins: [react()],
});
