import Terminal from './Terminal.vue'
import TerminalObj from './TerminalObj.js'
import JsonViewer from 'vue-json-viewer'

let terminal = {}
terminal.install = function (Vue, options) {
    Vue.use(JsonViewer)
    if (options != null) {
        Vue.prototype.$terminalOptions = options
    } else {
        Vue.prototype.$terminalOptions = {}
    }
    Vue.prototype.$terminal = TerminalObj
    Vue.component(Terminal.name, Terminal)
}
export default terminal
