import historyStore from "./HistoryStore.js";

const instance = new TerminalObj()

function TerminalObj() {
    let pool = {}
    let options = {}

    let setOptions = function (ops) {
        options = ops
    }

    let getOptions = function () {
        return options
    }

    let register = function (name, listener) {
        if (pool[name] != null) {
            throw Error(`Unable to register an existing terminal: ${name}`)
        }
        pool[name] = listener
    }

    let unregister = function (name) {
        delete pool[name]
    }

    let post = function (name = 'terminal', event, options) {
        let listener = pool[name]
        if (listener != null) {
            return listener(event, options)
        }
    }

    let pushMessage = function (name, options) {
        return post(name, 'pushMessage', options)
    }

    let updateContext = function (name, context) {
        return post(name, 'updateContext', context)
    }

    let getHistory = function () {
        return historyStore
    }

    let fullscreen = function (name) {
        return post(name, "fullscreen")
    }

    let isFullscreen = function (name) {
        return post(name, 'isFullscreen')
    }

    let dragging = function (name, options) {
        return post(name, 'dragging', options)
    }

    let execute = function (name, options) {
        return post(name, 'execute', options)
    }

    let getPosition = function (name) {
        return post(name, 'getPosition')
    }

    let focus = function (name) {
        return post(name, 'focus')
    }

    let elementInfo = function (name) {
        return post(name, 'elementInfo')
    }

    let textEditorOpen = function (name, options) {
        return post(name, 'textEditorOpen', options)
    }

    let textEditorClose = function (name) {
        return post(name, 'textEditorClose')
    }

    return {
        setOptions,
        getOptions,
        post,
        register,
        unregister,
        pushMessage,
        updateContext,
        getHistory,
        fullscreen,
        isFullscreen,
        dragging,
        execute,
        getPosition,
        focus,
        elementInfo,
        textEditorOpen,
        textEditorClose
    }
}

export default instance
