import Terminal from './Terminal.vue'
import TerminalObj from './TerminalObj.js'
import JsonViewer from 'vue-json-viewer'
import TerminalFlash from "@/TerminalFlash";

Terminal.install = (app, options) => {
    app.use(JsonViewer)
    let confHljs = false
    let confCodemirror = false
    if (options != null) {
        TerminalObj.setOptions(options)
        if (options.highlight) {
            confHljs = true
        }
        if (options.codemirror) {
            confCodemirror = true
        }
    }
    if (!confHljs) {
        // eslint-disable-next-line vue/multi-word-component-names
        app.component("highlightjs", {
            template: `<div></div>`
        })
    }
    if(!confCodemirror) {
        // eslint-disable-next-line vue/multi-word-component-names
        app.component("codemirror", {
            template: `<div></div>`
        })
    }
}

Terminal.$api = TerminalObj
Terminal.$Flash = TerminalFlash

export default Terminal
