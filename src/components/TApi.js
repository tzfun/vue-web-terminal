class TApi {
    constructor() {
        this.pool = {}
    }

    register(name, listener, unique = false) {
        if (this.pool[name] != null) {
            if (unique) {
                throw Error(`Unable to register an existing api: '${name}'. Please check:
                1. If you are in a development environment with a hot update, please refresh the page.
                2. If you are using it in a production environment, please check whether a Terminal or Shell with the same name exists.`)
            } else {
                this.pool[name] = {...this.pool[name], ...listener}
            }
        } else {
            this.pool[name] = listener
        }
    }

    unregister(name) {
        delete this.pool[name]
    }

    getApi(name) {
        return this.pool[name] || {}
    }
}

export default TApi