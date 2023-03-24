import TerminalComponent from './Terminal.vue'
import JsonViewer from 'vue-json-viewer'
import TerminalFlash from "@/js/TerminalFlash";
import TerminalAsk from "@/js/TerminalAsk";
import TerminalInterface from "./js/TerminalInterface.js";

export const Terminal = TerminalComponent;

Terminal.install = function (app, options) {
    app.use(JsonViewer)
    let confHljs = false
    let confCodemirror = false
    if (options != null) {
        TerminalInterface.setOptions(options)
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

    Terminal.$api = TerminalInterface
    Terminal.$Flash = TerminalFlash
    Terminal.$Ask = TerminalAsk
    app.component(this.name, this);
}

if (typeof window !== 'undefined' && window.Vue) {
    Terminal.install(window.Vue);
}

export default Terminal;
export const api = TerminalInterface;
export const Flash = TerminalFlash;
export const Ask = TerminalAsk;
