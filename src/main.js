import { createApp } from 'vue'
import App from './App.vue'
import router from "./router/index.js";
import Terminal from 'vue-web-terminal'
import './style.css'

const app = createApp(App)

app.use(router)
app.use(Terminal)
app.mount('#app')

