import Terminal from './components/terminal/Terminal.vue'
import TerminalApi from './components/terminal/TerminalApi.js'
import JsonViewer from 'vue-json-viewer'
import TerminalFlash from "@/components/terminal/TerminalFlash.js";
import TerminalAsk from "@/components/terminal/TerminalAsk.js";
import Shell from "@/components/shell/Shell.vue";

Terminal.install = function (Vue, options) {
    Vue.use(JsonViewer)
    if (options != null) {
        TerminalApi.setOptions(options)
    }
}

Terminal.getApi = function (name) {
    return TerminalApi.getApi(name)
}

export {
    Terminal, TerminalFlash, TerminalAsk, Shell
}
