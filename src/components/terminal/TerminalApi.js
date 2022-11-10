const instance = new TerminalApi()

function TerminalApi() {
    const refs = {}
    const pool = {}
    let options = {}

    let setOptions = function (ops) {
        options = ops
    }

    let getOptions = function () {
        return options
    }

    let register = function (name, listener) {
        if (pool[name] != null) {
            // throw Error(`Unable to register an existing terminal: ${name}`)
            pool[name] = {...pool[name], ...listener}
        } else {
            pool[name] = listener
        }
    }

    let unregister = function (name) {
        delete pool[name]
    }

    let getApi = function (name) {
        return pool[name] || {}
    }

    let setRef = function (name, refName, ref) {
        if (refs[name] == null) {
            refs[name] = {}
        }
        refs[name][refName] = ref
    }

    let ref = function (name, refName) {
        return refs[name] && refs[name][refName]
    }

    return {
        setOptions, getOptions, register, unregister, getApi, setRef, ref
    }
}

export default instance
