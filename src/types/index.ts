export interface EditorConfig {
    open: boolean
    focus: boolean
    value: string
    onClose: null | Function
    onFocus?: Function
    onBlur?: Function
}

export type Position = {
    x: number
    y: number
}

export type DragConfig = {
    width: number
    height: string
    zIndex?: string
    init?: Position
    pinned?: boolean
}

export type SearchResult = {
    show: boolean
    defaultBoxRect: null
    item?: Command
}

export type ScreenType = {
    xs?: boolean
    sm?: boolean
    md?: boolean
    lg?: boolean
    xl?: boolean
}

export type Command = {
    key: string
    title?: string
    group?: string
    usage?: string
    description?: string
    example?: Array<CommandExample>
}

export type CommandExample = {
    cmd: string
    des?: string
}

export type CmdHistory = {
    cmdLog: string[],
    cmdIdx: number
}

export type Options = {
    highlight: object
    codemirror: object
}

export type MessageContentTable = {
    head: string[],
    rows: string[][]
}

export type Message = {
    type?: 'normal' | 'json' | 'code' | 'table' | 'html' | 'ansi' | 'cmdLine'
    content: string | number | object | MessageContentTable | Array<any>
    class?: 'success' | 'error' | 'info' | 'warning' | 'system'
    tag?: string,
    depth?: number
}

export type AskConfig = {
    isPassword: boolean
    question: string,
    autoReview: boolean
    callback?: (value: string) => void
}

export type CommandStoreSortFunc = (a: any, b: any) => number

export type InputFilterFunc = (str1: string, str2: string, event: InputEvent) => string | null

export type CommandFormatterFunc = (cmd: string) => string

export type TabKeyHandlerFunc = (event: Event) => undefined

export type SearchHandlerCallbackFunc = (cmd: Command) => void

export type SearchHandlerFunc = (commands: Command[], key: string, callback: SearchHandlerCallbackFunc) => void

export type TerminalApiListenerFunc = (type: string, options?: any) => any | void

export type SuccessFunc = (message?: Message | Array<Message> | string | TerminalFlash | TerminalAsk) => void

export type FailedFunc = (message: string) => void

class TerminalCallback {

    onFinishListener: Function

    finish() {
        if (this.onFinishListener != null) {
            this.onFinishListener()
        }
    }

    onFinish(callback: Function) {
        this.onFinishListener = callback
    }
}

export class TerminalAsk extends TerminalCallback {
    handler: Function

    ask(options: AskConfig) {
        if (this.handler != null) {
            this.handler(options)
        }
    }

    onAsk(callback: (config: AskConfig) => void) {
        this.handler = callback
    }
}

export class TerminalFlash extends TerminalCallback {
    handler: Function

    flush(msg: string) {
        if (this.handler != null) {
            this.handler(msg)
        }
    }

    onFlush(callback: (msg: string) => void) {
        this.handler = callback
    }
}

export interface TerminalStore {
    push: (name: string, cmd: string) => void
    getLog: (name: string) => string[]
    clear: (name: string) => void
    clearAll: () => void
}