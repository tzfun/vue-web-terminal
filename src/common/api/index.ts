import {TerminalApiData, TerminalApiImpl} from "~/common/api/api.ts";
import {Options, TerminalApiListenerFunc} from "~/types";

const data: TerminalApiData = {
    pool: {},
    options: {
        highlight: null,
        codemirror: null
    }
}

function register(name: string, listener: TerminalApiListenerFunc) {
    if (data.pool[name]) {
        throw Error(`Unable to register an existing terminal: ${name}`)
    }
    data.pool[name] = listener
}

function unregister(name: string) {
    delete data.pool[name]
}

function rename(newName: string, oldName: string, listener: TerminalApiListenerFunc) {
    unregister(oldName)
    register(newName, listener);
}

function configHighlight(config: any) {
    data.options.highlight = config
}

function configCodemirror(config: any) {
    data.options.codemirror = config
}

function getOptions(): Options {
    return data.options as Options
}

export {
    register,
    unregister,
    rename,
    configHighlight,
    configCodemirror,
    getOptions
}

export default new TerminalApiImpl(data)
