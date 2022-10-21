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
            throw Error("Unable to register a listener with the same name: " + name)
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
        post(name, 'pushMessage', options)
    }

    let updateContext = function (name, context) {
        post(name, 'updateContext', context)
    }

    let getHistory = function () {
        return historyStore
    }

    let fullscreen = function (name) {
        post(name, "fullscreen")
    }

    let isFullscreen = function (name) {
        return post(name, 'isFullscreen')
    }

    let dragging = function (name, options) {
        post(name, 'dragging', options)
    }

    return {
        setOptions: setOptions,
        getOptions: getOptions,
        post: post,
        register: register,
        unregister: unregister,
        pushMessage: pushMessage,
        updateContext: updateContext,
        getHistory: getHistory,
        fullscreen: fullscreen,
        isFullscreen: isFullscreen,
        dragging: dragging
    }
}

export default instance
