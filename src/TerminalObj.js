import historyStore from "./HistoryStore.js";

// const instance = new TerminalObj()
const pool = {}; let options = {};

function register(name, listener) {
    if (pool[name] != null) {
        throw Error(`Unable to register an existing terminal: ${name}`)
    }
    pool[name] = listener
}

function unregister(name) {
    delete pool[name]
}

const TerminalProxy = {

    setOptions(ops) {
        options = ops
    },

    getOptions() {
        return options
    },

    post(name = 'terminal', event, options) {
        let listener = pool[name]
        if (listener != null) {
            return listener(event, options)
        }
    },

    pushMessage(name, options) {
        return TerminalProxy.post(name, 'pushMessage', options)
    },

    getHistory() {
        return historyStore
    },

    fullscreen(name) {
        return TerminalProxy.post(name, "fullscreen")
    },

    isFullscreen(name) {
        return TerminalProxy.post(name, 'isFullscreen')
    },

    dragging(name, options) {
        return TerminalProxy.post(name, 'dragging', options)
    },

    execute(name, options) {
        return TerminalProxy.post(name, 'execute', options)
    },

    focus(name) {
        return TerminalProxy.post(name, 'focus')
    },

    elementInfo(name) {
        return TerminalProxy.post(name, 'elementInfo')
    },

    textEditorOpen(name, options) {
        return TerminalProxy.post(name, 'textEditorOpen', options)
    },

    textEditorClose(name) {
        return TerminalProxy.post(name, 'textEditorClose')
    },
}

export default TerminalProxy;
const { pushMessage, fullscreen, isFullscreen, dragging, execute, focus, elementInfo, textEditorClose, textEditorOpen } = TerminalProxy;
export {
    register,
    unregister,
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
