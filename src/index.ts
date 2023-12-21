import './css/scrollbar.css'
import './css/ansi.css'
import './css/style.css'
import 'vue-json-viewer/style.css'
import type {App} from 'vue'
import TerminalStore from "./common/store"
import TerminalApi, {setOptions} from "./common/api"
import {configHighlight, configCodemirror, rename} from "./common/api"
import Terminal from "./Terminal.vue"
import {Options, TerminalAsk, TerminalFlash} from "./types"

Terminal.install = (app: App, options: Options): void => {
    setOptions(options)
    //  兼容老版本
    Terminal.$api = TerminalApi
    Terminal.$Flash = TerminalFlash
    Terminal.$Ask = TerminalAsk
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

//  兼容老版本
export const api = TerminalApi
export const Flash = TerminalFlash
export const Ask = TerminalAsk
