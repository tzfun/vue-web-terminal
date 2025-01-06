import {defineClientConfig} from '@vuepress/client';
import NotFound from './layouts/404.vue'
// import TerminalLocalDemo from "./components/TerminalLocalDemo.vue";

export default defineClientConfig({
    async enhance({app, router, siteData}) {
        if (!__VUEPRESS_SSR__) {
            const {Codemirror} = await import('vue-codemirror')
            app.component('codemirror', Codemirror)

            const {createTerminal} = await import('vue-web-terminal')

            const terminal = createTerminal()
            app.use(terminal)

            // app.component('TerminalLocalDemo', TerminalLocalDemo)
        }
    },
    layouts: {
        NotFound
    }
});