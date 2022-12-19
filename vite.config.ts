import { defineConfig } from "vite"
import { resolve } from "path"
import vue from "@vitejs/plugin-vue"

const name = "vue-web-terminal"
// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: resolve(__dirname, "lib"),
    sourcemap: "inline",
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name,
      fileName: (format) => `${name}.${format}.js`,
    },
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      external: ["vue"],
      output: {
        // 在 UMD 构建模式下为外部化的依赖提供一个全局变量
        globals: {
          vue: "Vue",
        },
      },
    },
  },
  optimizeDeps: {
    disabled: false
  },
  plugins: [vue()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@@": resolve(__dirname, "./demo/src"),
    },
  },
})
