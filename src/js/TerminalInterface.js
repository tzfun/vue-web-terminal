import historyStore from "./HistoryStore.js";

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

function rename(newName, oldName, listener) {
    unregister(oldName)
    register(newName, listener);
}

const TerminalInterface = {

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
        return TerminalInterface.post(name, 'pushMessage', options)
    },

    getHistory() {
        return historyStore
    },

    fullscreen(name) {
        return TerminalInterface.post(name, "fullscreen")
    },

    isFullscreen(name) {
        return TerminalInterface.post(name, 'isFullscreen')
    },

    dragging(name, options) {
        return TerminalInterface.post(name, 'dragging', options)
    },

    execute(name, options) {
        return TerminalInterface.post(name, 'execute', options)
    },

    focus(name, options) {
        return TerminalInterface.post(name, 'focus', options)
    },

    elementInfo(name, options) {
        return TerminalInterface.post(name, 'elementInfo', options)
    },

    textEditorOpen(name, options) {
        return TerminalInterface.post(name, 'textEditorOpen', options)
    },

    textEditorClose(name, options) {
        return TerminalInterface.post(name, 'textEditorClose', options)
    },
}

export default TerminalInterface;
const { pushMessage, fullscreen, isFullscreen, dragging, execute, focus, elementInfo, textEditorClose, textEditorOpen } = TerminalInterface;
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
