import {defineClientConfig} from '@vuepress/client';
import NotFound from './layouts/404.vue'

export default defineClientConfig({
    async enhance({app, router, siteData}) {
        if (!__VUEPRESS_SSR__) {
        }
    },
    layouts: {
        NotFound
    }
});