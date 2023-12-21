const pool = {};
let options = {};

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

function configHighlight(config) {
    options.highlight = config
}

function configCodemirror(config) {
    options.codemirror = config
}

function getOptions() {
    return options
}

function setOptions(op) {
    options = {...op}
}

const TerminalApi = {

    post(name = 'terminal', event, options) {
        let listener = pool[name]
        if (listener != null) {
            return listener(event, options)
        }
    },

    pushMessage(name, options) {
        return TerminalApi.post(name, 'pushMessage', options)
    },

    fullscreen(name) {
        return TerminalApi.post(name, "fullscreen")
    },

    isFullscreen(name) {
        return TerminalApi.post(name, 'isFullscreen')
    },

    dragging(name, options) {
        return TerminalApi.post(name, 'dragging', options)
    },

    execute(name, options) {
        return TerminalApi.post(name, 'execute', options)
    },

    focus(name, options) {
        return TerminalApi.post(name, 'focus', options)
    },

    elementInfo(name, options) {
        return TerminalApi.post(name, 'elementInfo', options)
    },

    textEditorOpen(name, options) {
        return TerminalApi.post(name, 'textEditorOpen', options)
    },

    textEditorClose(name, options) {
        return TerminalApi.post(name, 'textEditorClose', options)
    },

    clearLog(name, options) {
        return TerminalApi.post(name, 'clearLog', options)
    }
}

export default TerminalApi;
const {
    pushMessage,
    fullscreen,
    isFullscreen,
    dragging,
    execute,
    focus,
    elementInfo,
    textEditorClose,
    textEditorOpen,
    clearLog
} = TerminalApi;
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
    textEditorOpen,
    clearLog,
    configHighlight,
    configCodemirror,
    getOptions,
    setOptions
}
