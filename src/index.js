import TerminalComponent from './Terminal.vue'
import TerminalInterface from './js/TerminalInterface.js'
import JsonViewer from 'vue-json-viewer'
import TerminalFlash from "@/js/TerminalFlash";
import TerminalAsk from "@/js/TerminalAsk";

export const Terminal = TerminalComponent;

Terminal.install = function (Vue, options) {
    Vue.use(JsonViewer)
    if (options != null) {
        TerminalInterface.setOptions(options)
    }
    Terminal.$api = TerminalInterface
    Terminal.$Flash = TerminalFlash
    Terminal.$Ask = TerminalAsk
    Vue.component(this.name, this);
}

if (typeof window !== 'undefined' && window.Vue) {
    Terminal.install(window.Vue);
}

export default Terminal;
export const api = TerminalInterface;
export const Flash = TerminalFlash;
export const Ask = TerminalAsk;
