import {defaultTheme} from '@vuepress/theme-default'
import {defineUserConfig} from 'vuepress/cli'
import {viteBundler} from '@vuepress/bundler-vite'
import {commentPlugin} from "vuepress-plugin-comment2";
import {mdEnhancePlugin} from "vuepress-plugin-md-enhance";

//  注意！default-theme有一个锚点 bug，每次打包时需要修改这个文件里面的第20行代码:
//  node_modules/.pnpm/@vuepress+theme-default@2.0.0-rc.35_vuepress@2.0.0-rc.13/node_modules/@vuepress/theme-default/lib/client/components/VPSidebarItems.vue
//  修改：.vp=sidebar 改为 .vp-sidebar

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
        docsRepo: "https://github.com/tzfun/vue-web-terminal",
        docsBranch: "doc",
        docsDir: "docs",
        editLink: true,
        editLinkPattern: ":repo/edit/:branch/:path",
        locales: {
            '/': {
                selectLanguageText: 'Languages',
                selectLanguageName: 'English',
                editLinkText: "Edit this page on GitHub",
                navbar: [
                    {
                        text: 'Home',
                        link: '/'
                    },
                    {
                        text: 'Document',
                        children: [
                            {text: 'Get Started', link: '/getting-started'},
                            {text: 'Theme', link: '/theme'},
                            {text: 'Attribute', link: '/attributes'},
                            {text: 'Event', link: '/events'},
                            {text: 'Slot', link: '/slots'},
                            {text: 'API', link: '/api'},
                            {text: 'Advanced Features', link: '/functions'},
                            {text: 'More', link: '/others'},
                        ]
                    },
                    {
                        text: 'About',
                        link: '/about'
                    },
                    {
                        text: 'Q&A',
                        link: '/questions'
                    },
                    {
                        text: 'Open Source',
                        children: [
                            {text: 'GitHub', link: 'https://github.com/tzfun/vue-web-terminal'},
                            {text: 'Gitee 码云', link: 'https://gitee.com/tzfun/vue-web-terminal'}
                        ]
                    }
                ],
                sidebar: [
                    {text: 'About', link: '/about'},
                    {text: 'Get Started', link: '/getting-started'},
                    {text: 'Theme', link: '/theme'},
                    {text: 'Attribute', link: '/attributes'},
                    {text: 'Event', link: '/events'},
                    {text: 'Slot', link: '/slots'},
                    {text: 'API', link: '/api'},
                    {text: 'Advanced Features', link: '/functions'},
                    {text: 'More', link: '/others'},
                    {text: 'Q&A', link: '/questions'},
                ]
            },
            '/zh/': {
                selectLanguageText: '选择语言',
                selectLanguageName: '中文简体',
                editLinkText: "在GitHub编辑此页",
                navbar: [
                    {
                        text: '首页',
                        link: '/zh/'
                    },
                    {
                        text: '开发文档',
                        children: [
                            {text: '快速上手', link: '/zh/getting-started'},
                            {text: '主题 Theme', link: '/zh/theme'},
                            {text: '属性 Attribute', link: '/zh/attributes'},
                            {text: '事件 Event', link: '/zh/events'},
                            {text: '插槽 Slot', link: '/zh/slots'},
                            {text: '接口 API', link: '/zh/api'},
                            {text: '高级功能', link: '/zh/functions'},
                            {text: '更多', link: '/zh/others'},
                        ]
                    },
                    {
                        text: '关于',
                        link: '/zh/about'
                    },
                    {
                        text: '常见问题',
                        link: '/zh/questions'
                    },
                    {
                        text: '开源',
                        children: [
                            {text: 'GitHub', link: 'https://github.com/tzfun/vue-web-terminal'},
                            {text: 'Gitee 码云', link: 'https://gitee.com/tzfun/vue-web-terminal'}
                        ]
                    }
                ],
                sidebar: [
                    {text: '关于', link: '/zh/about'},
                    {text: '快速上手', link: '/zh/getting-started'},
                    {text: '主题 Theme', link: '/zh/theme'},
                    {text: '属性 Attribute', link: '/zh/attributes'},
                    {text: '事件 Event', link: '/zh/events'},
                    {text: '插槽 Slot', link: '/zh/slots'},
                    {text: '接口 API', link: '/zh/api'},
                    {text: '高级功能', link: '/zh/functions'},
                    {text: '更多', link: '/zh/others'},
                    {text: '常见问题', link: '/zh/questions'},
                ]
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
