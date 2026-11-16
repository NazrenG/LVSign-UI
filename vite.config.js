import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
  rollupOptions: {
    input: {
      main: resolve(import.meta.dirname, "index.html"),
      redirect: resolve(import.meta.dirname, "redirect.html"),
    },
  },
}
});
