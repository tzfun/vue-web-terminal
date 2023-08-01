import type {App} from 'vue';
import JsonViewer from 'vue-json-viewer'
// @ts-ignore
import Terminal from "~/Terminal.vue";
import TerminalStore from "~/common/store"
import TerminalApi from "~/common/interface.ts"
import {TerminalAsk, TerminalFlash} from "~/types"

const install = (app: App): void => {
    app.use(JsonViewer)
    app.component('terminal', Terminal)
}

if (window && (window as any).Vue) {
    install((window as any).Vue);
}

export {
    Terminal,
    TerminalStore,
    TerminalApi,
    TerminalAsk,
    TerminalFlash
}

export default {
    install
}