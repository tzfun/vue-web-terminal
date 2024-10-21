const pool = {};
let options = {
    highlight: null,
    codemirror: null,
    themes: {}
};

export function register(name, listener) {
    if (pool[name] != null) {
        throw Error(`Unable to register an existing terminal: ${name}`)
    }
    pool[name] = listener
}

export function unregister(name) {
    delete pool[name]
}

export function rename(newName, oldName, listener) {
    unregister(oldName)
    register(newName, listener);
}

export function configHighlight(config) {
    options.highlight = config
}

export function configCodemirror(config) {
    options.codemirror = config
}

export function getOptions() {
    return options
}

export function setOptions(op) {
    options = {...op}
}

export function configTheme(theme, css) {
    let res = css.match(/^.*\{(.*)}\s*$/s)
    if (!res || res.length !== 2) {
        throw new Error(`Incorrect theme style format, correct format example:
:root {
    --t-main-background-color: #191b24;
    --t-main-font-color: #fff;
    ...
}
        `)
    }
    let themes = options.themes
    if (!themes) {
        options.themes = themes = {}
    }
    themes[theme] = css
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
    },

    getCommand(name, options) {
        return TerminalApi.post(name, 'getCommand', options)
    },

    setCommand(name, options) {
        return TerminalApi.post(name, 'setCommand', options)
    },

    switchAllFoldState(name, options) {
        return TerminalApi.post(name, 'switchAllFoldState', options)
    }
}

export default TerminalApi;
