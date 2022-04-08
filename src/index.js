import Terminal from './Terminal.vue'
import TerminalObj from './TerminalObj.js'
import JsonViewer from 'vue-json-viewer'

let terminal = {}
terminal.install = function (Vue, options) {
    Vue.use(JsonViewer)
    if (options != null) {
        TerminalObj.setOptions(options)
    }
    Vue.component(Terminal.name, Terminal)
}
export default terminal
