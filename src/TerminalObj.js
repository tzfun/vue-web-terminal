const instance = new TerminalObj()

function TerminalObj() {
    let pool = {}

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
            listener(event, options)
        }
    }

    let pushMessage = function (name, options) {
        post(name, 'pushMessage', options)
    }

    let updateContext = function (name, context) {
        post(name, 'updateContext', context)
    }

    return {
        post: post,
        register: register,
        unregister: unregister,
        pushMessage: pushMessage,
        updateContext: updateContext
    }
}

export default instance