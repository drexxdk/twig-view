import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig(({ command }) => ({
  root: path.resolve(rootDir, "demo"),
  plugins: [react()],
  resolve: {
    alias: {
      "twig-view": path.resolve(rootDir, "src/index.ts"),
    },
  },
  base: command === "build" ? "/twig-view/" : "/",
  build: {
    outDir: path.resolve(rootDir, "demo/dist"),
    emptyOutDir: true,
  },
}));
