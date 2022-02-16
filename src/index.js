import Terminal from './Terminal.vue'
import TerminalObj from './TerminalObj.js'
import JsonViewer from 'vue-json-viewer'
import Highlight from './Highlight.js'

let terminal = {}
terminal.install = function (Vue) {
    Vue.use(Highlight)
    Vue.use(JsonViewer)
    Vue.prototype.$terminal = TerminalObj
    Vue.component(Terminal.name, Terminal)
}
export default terminal
