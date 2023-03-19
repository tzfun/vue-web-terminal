import Vue from 'vue'
import App from './App.vue'
import Terminal from '../src/index.js'

Vue.use(Terminal)
Vue.config.productionTip = false

new Vue({
    render: h => h(App),
}).$mount('#app')
