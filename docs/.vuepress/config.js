import {defaultTheme} from '@vuepress/theme-default'
import {defineUserConfig} from 'vuepress/cli'
import {viteBundler} from '@vuepress/bundler-vite'

export default defineUserConfig({
    lang: 'en-US',

    title: 'vue-web-terminal',
    description: 'A lightweight and beautiful web-side command line window plugin',

    locales: {
        '/': {
            lang: 'English',
            title: 'vue-web-terminal',
            description: 'A lightweight and beautiful web-side command line window plugin',
        },
        '/zh/': {
            lang: '简体中文',
            title: 'vue-web-terminal',
            description: '一个轻量、功能强大、拓展性高的命令式网页仿真终端插件',
        },
    },

    theme: defaultTheme({
        logo: '/images/logo.svg',
        navbar: ['/', '/get-started'],
    }),

    bundler: viteBundler({
        viteOptions: {
            resolve: {
                alias: {
                    // 'vue': _resolve('vue/dist/vue.esm-bundler.js'),
                }
            }
        }
    }),

    plugins: []
})
