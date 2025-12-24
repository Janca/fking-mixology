import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import VueDevTools from "vite-plugin-vue-devtools";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), VueDevTools()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // @ts-ignore
        api: "modern-compiler",
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (
              id.includes("vue") ||
              id.includes("pinia") ||
              id.includes("router")
            ) {
              return "vendor-vue";
            }
            if (id.includes("dexie")) {
              return "vendor-db";
            }
            if (
              id.includes("canvas-confetti") ||
              id.includes("convert-units")
            ) {
              return "vendor-utils";
            }
            return "vendor";
          }
          if (id.includes("cocktails_full.json")) {
            return "cocktail-data";
          }
        },
      },
    },
  },
});
