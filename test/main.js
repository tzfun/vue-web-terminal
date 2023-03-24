import App from './App.vue'
import Terminal from '../src/index.js'
import {createApp} from "vue";

createApp(App).use(Terminal).mount('#app')
