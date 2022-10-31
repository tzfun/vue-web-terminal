import Terminal from './Terminal.vue'
import TerminalObj from './TerminalObj.js'
import JsonViewer from 'vue-json-viewer'
import TerminalFlash from "@/TerminalFlash";

Terminal.install = function (Vue, options) {
    Vue.use(JsonViewer)
    if (options != null) {
        TerminalObj.setOptions(options)
    }
    Terminal.$api = TerminalObj
    Terminal.$Flash = TerminalFlash
}

export default Terminal
