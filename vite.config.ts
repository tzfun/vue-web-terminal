import { defineConfig } from "vite";
import { resolve } from "path";
import vue from "@vitejs/plugin-vue";
import dts from "vite-plugin-dts";

const name = "vue-web-terminal";
// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: resolve(__dirname, "lib"),
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name,
      formats: ["es", "cjs"],
      fileName: name,
    },
  },
  plugins: [vue(), dts()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
