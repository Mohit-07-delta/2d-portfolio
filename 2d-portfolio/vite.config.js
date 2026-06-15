import { defineConfig } from "vite";

export default defineConfig({
  // Base path config - set to "./" for relative path resolution
  // which makes local previews and static server deployments work out-of-the-box
  base: "./",
  server: {
    host: true,
    port: 3000
  },
  build: {
    outDir: "dist",
    assetsDir: "assets"
  }
});
