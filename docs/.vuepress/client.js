import {defineClientConfig} from '@vuepress/client';
import NotFound from './layouts/404.vue'
import TerminalLocalDemo from "./layouts/TerminalLocalDemo.vue";

export default defineClientConfig({
    async enhance({app, router, siteData}) {
        if (!__VUEPRESS_SSR__) {
            const {Codemirror} = await import('vue-codemirror')
            app.component('codemirror', Codemirror)

            const Terminal = await import('vue-web-terminal')
            app.use(Terminal)
        }
    },
    layouts: {
        NotFound,
        TerminalLocalDemo
    }
});