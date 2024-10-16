// @ts-ignore
import App from './App.vue'
import {createApp} from "vue";
import {Terminal, configTheme} from '~/index'

const app = createApp(App)
app.use(Terminal)

//  这行代码是一个错误示例
// configTheme("custom", "s")

app.mount('#app')