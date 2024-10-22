import {defaultTheme} from '@vuepress/theme-default'
import {defineUserConfig} from 'vuepress/cli'
import {viteBundler} from '@vuepress/bundler-vite'
import {commentPlugin} from "@vuepress/plugin-comment";
import {mdEnhancePlugin} from "vuepress-plugin-md-enhance";
import {searchPlugin} from "@vuepress/plugin-search";
import {registerComponentsPlugin} from "@vuepress/plugin-register-components";
import {getDirname, path} from "@vuepress/utils";

const __dirname = getDirname(import.meta.url)

//  注意！default-theme有一个锚点 bug，每次打包时需要修改这个文件里面的第20行代码:
//  node_modules/.pnpm/@vuepress+theme-default@2.0.0-rc.35_vuepress@2.0.0-rc.13/node_modules/@vuepress/theme-default/lib/client/components/VPSidebarItems.vue
//  修改：.vp=sidebar 改为 .vp-sidebar

export default defineUserConfig({
    base: '/vue-web-terminal/',
    lang: 'en-US',
    title: 'vue-web-terminal',
    dest: "dist",
    head: [
        [
            "link",
            {
                rel: "icon",
                href: "/vue-web-terminal/images/vue-web-terminal-mini.png"
            }
        ],
        [
            "script",
            {
                async: true,
                src: "/vue-web-terminal/js/umami.js",
                "data-website-id": "d9491188-3d26-4f58-8239-276be8ffef7a",
                "data-host-url": "https://cloud.umami.is",
                "data-domains": "tzfun.github.io"
            }
        ]
    ],
    pluginVersion: {
        vue2: "2.3.2",
        vue3: "3.3.2"
    },
    locales: {
        '/': {
            lang: 'en-US',
            title: 'vue-web-terminal',
            description: 'A powerful web-side command line window plugin'
        },
        '/zh/': {
            lang: 'zh-CN',
            title: 'vue-web-terminal',
            description: '一个功能强大的命令式网页仿真终端插件'
        }
    },
    theme: defaultTheme({
        logo: '/images/vue-web-terminal.png',
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
                            {text: 'Logs', link: '/logs'},
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
                            {text: 'Logs', link: '/logs'}
                        ]
                    },
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
                            {text: '更新日志', link: '/zh/logs'},
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
                            {text: '更新日志', link: '/zh/logs'},
                        ]
                    },
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
            },
            css: {
                preprocessorOptions: {
                    scss: {
                        quietDeps: true,
                    }
                }
            }
        }
    }),
    markdown: {
        importCode: {
            handleImportPath: (str) => str.replace(/@src/, __dirname)
        }
    },
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
            hint: true
        }),
        searchPlugin({
            locales: {
                '/': {
                    placeholder: 'Search',
                },
                '/zh/': {
                    placeholder: '搜索',
                },
            },
        }),
        registerComponentsPlugin({
            components: {
                TerminalLocalDemo: path.resolve(__dirname, './components/TerminalLocalDemo.vue')
            }
        })
    ]
})
