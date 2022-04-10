import Terminal from './Terminal.vue'
import TerminalObj from './TerminalObj.js'
import JsonViewer from 'vue-json-viewer'

Terminal.install = function (Vue, options) {
    Vue.use(JsonViewer)
    if (options != null) {
        TerminalObj.setOptions(options)
    }
    Terminal.$api = TerminalObj
}

export default Terminal
