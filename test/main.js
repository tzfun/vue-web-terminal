import Vue from 'vue'
import App from './App.vue'
import Terminal from '../src/index.js'
// import {configTheme} from "@/js/TerminalApi";

Vue.use(Terminal)
//  这行代码是一个错误示例
// configTheme("custom", "s")

Vue.config.productionTip = false

new Vue({
    render: h => h(App),
}).$mount('#app')
