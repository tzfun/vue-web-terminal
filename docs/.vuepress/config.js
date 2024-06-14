import {defaultTheme} from '@vuepress/theme-default'
import {defineUserConfig} from 'vuepress/cli'
import {viteBundler} from '@vuepress/bundler-vite'
import {commentPlugin} from "vuepress-plugin-comment2";
import {mdEnhancePlugin} from "vuepress-plugin-md-enhance";

export default defineUserConfig({
    lang: 'en-US',
    title: 'vue-web-terminal',
    head: [
        ["link", {rel: "icon", href: "/images/logo.svg"}]
    ],
    pluginVersion: {
        vue2: "2.2.4",
        vue3: "3.2.6"
    },
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
                navbar: [
                    {
                        text: 'Home',
                        link: '/'
                    },
                    {
                        text: 'About',
                        link: '/zh/about'
                    },
                    {
                        text: 'Open Source',
                        children: [
                            {text: 'Github', link: 'https://github.com/tzfun/vue-web-terminal'},
                            {text: 'Gitee', link: 'https://gitee.com/tzfun/vue-web-terminal'}
                        ]
                    }
                ],
                sidebar: {
                    '/get-started': [
                        {
                            title: 'xxx',
                            collapsable: false,
                            children: [
                                {title: 'items01', path: '/dev_manage/'},
                                {title: 'items02', path: '/dev_manage/aaa'}
                            ]
                        }
                    ]
                }
            },
            '/zh/': {
                selectLanguageText: '选择语言',
                selectLanguageName: '中文简体',
                navbar: [
                    {
                        text: '首页',
                        link: '/zh/'
                    },
                    {
                        text: '开发文档',
                        children: [
                            {text: '快速上手', link: '/zh/getting-started'},
                            {text: '主题', link: '/zh/theme'},
                            {text: '属性', link: '/zh/attributes'},
                            {text: '事件', link: '/zh/events'},
                        ]
                    },
                    {
                        text: '关于',
                        link: '/zh/about'
                    },
                    {
                        text: '开源',
                        children: [
                            {text: 'Github', link: 'https://github.com/tzfun/vue-web-terminal'},
                            {text: 'Gitee', link: 'https://gitee.com/tzfun/vue-web-terminal'}
                        ]
                    }
                ],

                sidebar: {
                    '/zh/get-started': [
                        {
                            text: 'get-started',
                            prefix: '/zh/get-started',
                            children: [
                                {text: 'items01', link: '/dev_manage/'},
                                {text: 'items02', path: '/dev_manage/aaa'}
                            ]
                        }
                    ]
                }
            },
        },
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
    plugins: [
        //  https://giscus.app/zh-CN
        commentPlugin({
            provider: "Giscus",
            comment: true,
            repo: "tzfun/vue-web-terminal",
            repoId: "R_kgDOG2MIVw",
            category: "Announcements",
            categoryId: "DIC_kwDOG2MIV84CgDvf",
        }),
        mdEnhancePlugin({
            //  启用代码块分组
            codetabs: true,
            //  提示容器
            //  https://theme-hope.vuejs.press/zh/guide/markdown/stylize/hint.html
            hint:true
        }),
    ]
})
