class TApi {
    constructor() {
        this.pool = {}
    }

    register(name, listener) {
        if (this.pool[name] != null) {
            this.pool[name] = {...this.pool[name], ...listener}
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