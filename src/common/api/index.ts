import {Options, TerminalApi, TerminalApiData, TerminalApiListenerFunc} from "~/types";

const data: TerminalApiData = {
    pool: {},
    options: {
        highlight: null,
        codemirror: null,
        themes: {}
    }
}

export function register(name: string, listener: TerminalApiListenerFunc) {
    if (data.pool[name]) {
        throw Error(`Unable to register an existing terminal: ${name}`)
    }
    data.pool[name] = listener
}

export function unregister(name: string) {
    delete data.pool[name]
}

export function rename(newName: string, oldName: string, listener: TerminalApiListenerFunc) {
    unregister(oldName)
    register(newName, listener);
}

export function configHighlight(config: any) {
    data.options.highlight = config
}

export function configCodemirror(config: any) {
    data.options.codemirror = config
}

export function configTheme(theme: string, css: string) {
    let res = css.match(/^.*\{(.*)}\s*$/s)
    if (!res || res.length != 2) {
        throw new Error(`Incorrect theme style format, correct format example:
:root {
    --t-main-background-color: #191b24;
    --t-main-font-color: #fff;
    ...
}
        `)
    }
    let themes = data.options.themes
    if (!themes) {
        data.options.themes = themes = {}
    }
    themes[theme] = css
}

export function getOptions(): Options {
    return data.options as Options
}

export function setOptions(op: Options) {
    data.options = {...op}
}

export default new TerminalApi(data)
