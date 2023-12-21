import Terminal from './Terminal.vue'
import TerminalApi, {rename, setOptions, configCodemirror, configHighlight} from './js/TerminalApi.js'
import JsonViewer from 'vue-json-viewer'
import TerminalFlash from "@/js/TerminalFlash";
import TerminalAsk from "@/js/TerminalAsk";
import TerminalStore from "@/js/TerminalStore";

Terminal.install = function (Vue, options) {
    Vue.use(JsonViewer)
    if (options != null) {
        setOptions(options)
    }
    //  兼容老版本
    Terminal.$api = TerminalApi
    Terminal.$Flash = TerminalFlash
    Terminal.$Ask = TerminalAsk
    Vue.component(this.name, this);
}

export {
    Terminal,
    TerminalStore,
    TerminalApi,
    TerminalAsk,
    TerminalFlash,
    configCodemirror,
    configHighlight,
    rename
}

export default Terminal;

//  兼容老版本
export const api = TerminalApi;
export const Flash = TerminalFlash;
export const Ask = TerminalAsk;
