import '~/css/scrollbar.css'
import '~/css/ansi.css'
import '~/css/style.css'
import 'vue-json-viewer/style.css'
import type {App} from 'vue'
// @ts-ignore
import Terminal from "~/Terminal.vue"
import TerminalStore from "~/common/store"
import TerminalApi from "~/common/interface.ts"
import {TerminalAsk, TerminalFlash} from "~/types"

const install = (app: App): void => {
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
