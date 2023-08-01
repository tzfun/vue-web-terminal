import {resolve} from 'path'
import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'

import {visualizer} from 'rollup-plugin-visualizer'

const pathSrc = resolve(__dirname, 'src')

// https://vitejs.dev/config/
export default defineConfig({
    server: {},
    plugins: [
        vue(),
        //  包体分析
        visualizer({
            filename: 'stats.html',
            open: false
        })
    ],
    resolve: {
        alias: {
            '~/': `${pathSrc}/`,
        }
    },
    css: {
        preprocessorOptions: {
            scss: {},
        },
    },
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            //  暴露的全局变量
            name: 'Terminal',
        },
        outDir: 'lib',
        rollupOptions: {
            //  不打包的依赖
            //  https://rollupjs.org/configuration-options/
            external: ['vue'],
            output: {
                //  https://rollupjs.org/configuration-options/#output-format
                format: 'es',
                //  https://rollupjs.org/configuration-options/#output-exports
                exports: 'named',
                //  在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
                //  https://rollupjs.org/configuration-options/#output-globals
                globals: {
                    vue: 'Vue'
                }
            }
        },
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true
            },
            format: {
                // 删除注释
                comments: false
            }
        },
        commonjsOptions: {
            esmExternals: true
        }
    }
})