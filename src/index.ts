import './css/scrollbar.css'
import './css/ansi.css'
import './css/style.css'
import 'vue-json-viewer/style.css'
import type {App} from 'vue'
import TerminalStore from "./common/store"
import TerminalApi from "./common/api"
import {configHighlight, configCodemirror, rename} from "./common/api"
import Terminal from "./Terminal.vue"
import {TerminalAsk, TerminalFlash} from "./types"

Terminal.install = (app: App): void => {
    app.component(Terminal.__name as string, Terminal)
}

export * from './types'

export {
    Terminal,
    TerminalStore,
    TerminalApi,
    TerminalAsk,
    TerminalFlash,
    configHighlight,
    configCodemirror,
    rename
}

export default Terminal
