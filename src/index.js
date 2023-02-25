import Terminal from './Terminal.vue'
import TerminalObj from './TerminalObj.js'
import JsonViewer from 'vue-json-viewer'
import TerminalFlash from "@/TerminalFlash";
import TerminalAsk from "@/TerminalAsk";

Terminal.install = function (Vue, options) {
    Vue.use(JsonViewer)
    if (options != null) {
        TerminalObj.setOptions(options)
    }
    Terminal.$api = TerminalObj
    Terminal.$Flash = TerminalFlash
    Terminal.$Ask = TerminalAsk
    Vue.component(this.name, this);
}

if (typeof window !== 'undefined' && window.Vue) {
    Terminal.install(window.Vue);
}
export default Terminal;
export const api = TerminalObj;
export const Flash = TerminalFlash;
export const Ask = TerminalAsk;
