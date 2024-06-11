import Vue from 'vue';
import Router from 'vue-router';
import Demo from "@/pages/demo/Demo.vue";
import Main from "@/pages/Main.vue";
import Runtime from "@/pages/runtime/Runtime.vue";

Vue.use(Router);
let router = new Router({
    mode: 'history',
    base: process.env.BASE_URL,
    routes: [
        {
            path: '/',
            name: 'main',
            component: Main,
            meta: {title: `Welcome to vue-web-terminal`, keepAlive: true}
        },
        {
            path: '/demo',
            name: 'demo',
            component: Demo,
            meta: {title: `vue-web-terminal`, keepAlive: true}
        },
        {
            path: '/runtime',
            name: 'runtime',
            component: Runtime,
            meta: {title: `vue-web-terminal`, keepAlive: true}
        },
    ]
})

export default router