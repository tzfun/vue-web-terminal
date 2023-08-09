import store from "./store";
import {Options} from "~/types";
import type {TerminalApiListenerFunc} from "~/types";

const pool = {};
let options = {};

function register(name: string, listener: TerminalApiListenerFunc) {
    if (pool[name]) {
        throw Error(`Unable to register an existing terminal: ${name}`)
    }
    pool[name] = listener
}

function unregister(name: string) {
    delete pool[name]
}

function rename(newName: string, oldName: string, listener: TerminalApiListenerFunc) {
    unregister(oldName)
    register(newName, listener);
}

const TerminalInterface = {

    setOptions(ops: Options) {
        options = ops
    },

    getOptions(): Options {
        return options as Options
    },

    post(name: string = 'terminal', event: string, options?: any) {
        let listener = pool[name]
        if (listener != null) {
            return listener(event, options)
        }
    },

    pushMessage(name: string, options?: any) {
        return TerminalInterface.post(name, 'pushMessage', options)
    },

    getHistory() {
        return store
    },

    fullscreen(name: string) {
        return TerminalInterface.post(name, "fullscreen")
    },

    isFullscreen(name: string) {
        return TerminalInterface.post(name, 'isFullscreen')
    },

    dragging(name: string, options?: any) {
        return TerminalInterface.post(name, 'dragging', options)
    },

    execute(name: string, options?: any) {
        return TerminalInterface.post(name, 'execute', options)
    },

    focus(name: string, options?: any) {
        return TerminalInterface.post(name, 'focus', options)
    },

    elementInfo(name: string, options?: any) {
        return TerminalInterface.post(name, 'elementInfo', options)
    },

    textEditorOpen(name: string, options?: any) {
        return TerminalInterface.post(name, 'textEditorOpen', options)
    },

    textEditorClose(name: string, options?: any) {
        return TerminalInterface.post(name, 'textEditorClose', options)
    },
}

export default TerminalInterface;
const {
    pushMessage,
    fullscreen,
    isFullscreen,
    dragging,
    execute,
    focus,
    elementInfo,
    textEditorClose,
    textEditorOpen
} = TerminalInterface;
export {
    register,
    unregister,
    rename,
    pushMessage,
    fullscreen,
    isFullscreen,
    dragging,
    execute,
    focus,
    elementInfo,
    textEditorClose,
    textEditorOpen
}