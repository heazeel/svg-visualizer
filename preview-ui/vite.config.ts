import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import path from "path";

export default defineConfig({
  plugins: [solidPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    port: 3000,
  },
  build: {
    target: "esnext",
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        entryFileNames: "assets/main.js",
        assetFileNames: `assets/[name].[ext]`,
      },
    },
  },
});
