import {createRouter, createWebHistory} from "vue-router";
import {defineAsyncComponent} from "vue";

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: "/",
            name: "home",
            component: defineAsyncComponent(() => import('../pages/Home.vue')),
            meta: {
                title: 'Welcome to vue-web-terminal'
            }
        },
        {
            path: "/demo",
            name: "demo",
            component: defineAsyncComponent(() => import('../pages/Demo.vue')),
            meta: {
                title: 'Welcome to vue-web-terminal'
            }
        },
        {
            path: "/runner",
            name: "runner",
            component: defineAsyncComponent(() => import('../pages/Runner.vue')),
            meta: {
                title: 'Welcome to vue-web-terminal'
            }
        },
        {
            path: '/*',
            redirect: '/',
        }
    ]
})

router.beforeEach((to, from, next) => {
    if (to.meta.title) {
        document.title = `${to.meta.title}`;
    }
    next()
})

router.afterEach((to, from) => {

})

export default router