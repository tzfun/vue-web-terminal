import { defineConfig } from "vite";
import { resolve } from "path";
import vue from "@vitejs/plugin-vue";

const name = "vue-web-terminal";
// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: resolve(__dirname, "lib"),
    sourcemap: "inline",
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name,
      formats: ["es", "umd", "cjs"],
      fileName: name,
    },
    rollupOptions: {
      output: {
        exports: "named",
      },
    },
  },
  plugins: [vue()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@@": resolve(__dirname, "./demo/src"),
    },
  },
});
