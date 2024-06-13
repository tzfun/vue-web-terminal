import {defaultTheme} from '@vuepress/theme-default'
import {defineUserConfig} from 'vuepress/cli'
import {viteBundler} from '@vuepress/bundler-vite'

export default defineUserConfig({
    lang: 'en-US',
    title: 'vue-web-terminal',
    head: [
        ["link", {rel: "icon", href: "/images/logo.svg"}]
    ],
    locales: {
        '/': {
            lang: 'en-US',
            title: 'vue-web-terminal',
            description: 'A lightweight and beautiful web-side command line window plugin'
        },
        '/zh/': {
            lang: 'zh-CN',
            title: 'vue-web-terminal',
            description: '一个轻量、功能强大的命令式网页仿真终端插件'
        }
    },
    theme: defaultTheme({
        logo: '/images/logo.svg',
        locales: {
            '/': {
                selectLanguageText: 'Languages',
                selectLanguageName: 'English',
                navbar:[
                    {
                        text: 'Home',
                        link: '/'
                    },
                    {
                        text: 'Open Source',
                        children: [
                            {
                                text: 'Github',
                                link: 'https://github.com/tzfun/vue-web-terminal'
                            },
                            {
                                text: 'Gitee',
                                link: 'https://gitee.com/tzfun/vue-web-terminal'
                            }
                        ]
                    }
                ]
            },
            '/zh/': {
                selectLanguageText: '选择语言',
                selectLanguageName: '中文简体',
                navbar:[
                    {
                        text: '首页',
                        link: '/zh/'
                    },
                    {
                        text: '开源',
                        children: [
                            {
                                text: 'Github',
                                link: 'https://github.com/tzfun/vue-web-terminal'
                            },
                            {
                                text: 'Gitee',
                                link: 'https://gitee.com/tzfun/vue-web-terminal'
                            }
                        ]
                    }
                ]
            },
        }
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
