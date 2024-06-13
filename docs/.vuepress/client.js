import {defineClientConfig} from '@vuepress/client';

export default defineClientConfig({
    async enhance({app, router, siteData}) {
        if (!__VUEPRESS_SSR__) {
        }
    },
});