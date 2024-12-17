import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";

export default defineConfig({
  plugins: [solidPlugin()],
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
