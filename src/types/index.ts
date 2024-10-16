export type TerminalMessageClass = 'success' | 'error' | 'info' | 'warning' | 'system'

export type TerminalMessageType = 'cmdLine' | 'normal' | 'json' | 'code' | 'table' | 'html' | 'ansi'

export type TerminalCursorStyle = 'block' | 'underline' | 'bar' | 'none'

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
    width: number | string
    height: number | string
    zIndex?: string
    init?: Position
    pinned?: boolean
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

export type MessageGroup = {
    fold: boolean,
    logs: Message[],
    tag?: string
}

export type Message = {
    type?: TerminalMessageType
    content: string | number | object | MessageContentTable | Array<any>
    class?: TerminalMessageClass
    tag?: string,
    depth?: number
}

export type AskConfig = {
    isPassword: boolean
    question: string,
    autoReview: boolean
    callback?: (value: string) => void
}

export type InputTipItem = {
    content: string,
    description?: string,
    command?: Command
}

export type CharWidth = {
    en?: number,
    cn?: number
}

export type TerminalElementInfo = {
    pos: Position,
    screenWidth: number,
    screenHeight: number,
    clientWidth: number,
    clientHeight: number,
    charWidth: CharWidth
}

export type CommandSortHandlerFunc = (a: any, b: any) => number

export type InputFilterFunc = (str1: string, str2: string, event: InputEvent) => string | null

export type CommandFormatterFunc = (cmd: string) => string

export type TerminalApiListenerFunc = (type: string, options?: any) => any | void

export type SuccessFunc = (message?: Message | Array<Message> | string | TerminalFlash | TerminalAsk) => void

export type FailedFunc = (message: string) => void

export type PushMessageBeforeFunc = (message: Message, name: String) => void

/**
 * 提示选择处理函数
 *
 * @param command       当前用户输入的完整命令行
 * @param cursorIndex   当前光标所处位置
 * @param item          用户选择提示项
 * @param callback      填充结束后需调用此函数返回新的命令行
 */
export type InputTipsSelectHandlerFunc = (command: string, cursorIndex: number, item: InputTipItem, callback: (cmd: string) => void) => void

/**
 * 用户自定义命令搜索提示实现
 *
 * @param command       当前用户输入的完整命令行
 * @param cursorIndex   当前光标所处位置
 * @param commandStore  命令集合
 * @param callback      搜索结束回调，回调格式为一个数组
 */
export type InputTipsSearchHandlerFunc = (command: string, cursorIndex: number, commandStore: Command[], callback: (tips: InputTipItem[], openTips?: boolean) => void) => void

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

//  每个terminal实例最多保存100条记录
const MAX_STORE_SIZE = 100
const DEFAULT_STORAGE_KEY = 'terminal'

export class TerminalStore {
    storageKey: string = DEFAULT_STORAGE_KEY
    dataMap: Object

    constructor(key?: string) {
        if (key) {
            this.storageKey = key
        }
        let dataMapStr = window.localStorage.getItem(this.storageKey)
        if (dataMapStr) {
            this.dataMap = JSON.parse(dataMapStr)
        } else {
            this.dataMap = {}
        }
    }

    push(name: string, cmd: string) {
        let data = this.getData(name)
        if (data.cmdLog == null) {
            data.cmdLog = []
        }
        if (data.cmdLog.length === 0 || data.cmdLog[data.cmdLog.length - 1] !== cmd) {
            data.cmdLog.push(cmd)

            if (data.cmdLog.length > MAX_STORE_SIZE) {
                data.cmdLog.splice(0, data.cmdLog.length - MAX_STORE_SIZE)
            }
        }

        data.cmdIdx = data.cmdLog.length
        this.store()
    }

    store() {
        window.localStorage.setItem(this.storageKey, JSON.stringify(this.dataMap))
    }

    getData(name: string): CmdHistory {
        let data = this.dataMap[name]
        if (data == null) {
            data = {}
            this.dataMap[name] = data
        }
        return data
    }

    getLog(name: string) {
        let data = this.getData(name)
        if (!data.cmdLog) {
            data.cmdLog = []
        }
        return data.cmdLog
    }

    clear(name: string) {
        let data = this.getData(name)
        data.cmdLog = []
        data.cmdIdx = 0
        this.store()
    }

    clearAll() {
        this.dataMap = {}
        this.store()
    }

    getIdx(name: string) {
        let data = this.getData(name)
        return data.cmdIdx | 0
    }

    setIdx(name: string, idx: number) {
        this.getData(name).cmdIdx = idx
    }
}

export interface TerminalApiData {
    pool: {
        [key: string]: TerminalApiListenerFunc
    },
    options?: Options
}

export class TerminalApi {

    data: TerminalApiData

    constructor(data: TerminalApiData) {
        this.data = data
    }

    post(name: string = 'terminal', event: string, options?: any) {
        let listener: TerminalApiListenerFunc = this.data.pool[name]
        if (listener != null) {
            return listener(event, options)
        }
    }

    pushMessage(name: string, options: Message | Array<Message> | string) {
        return this.post(name, 'pushMessage', options)
    }

    appendMessage(name: string, options: string) {
        return this.post(name, 'appendMessage', options)
    }

    fullscreen(name: string) {
        return this.post(name, "fullscreen")
    }

    isFullscreen(name: string) {
        return this.post(name, 'isFullscreen')
    }

    dragging(name: string, options: Position) {
        return this.post(name, 'dragging', options)
    }

    execute(name: string, options: string) {
        return this.post(name, 'execute', options)
    }

    focus(name: string, options: boolean) {
        return this.post(name, 'focus', options)
    }

    elementInfo(name: string) {
        return this.post(name, 'elementInfo')
    }

    textEditorOpen(name: string, options?: EditorSetting) {
        return this.post(name, 'textEditorOpen', options)
    }

    textEditorClose(name: string, options?: any): string | any {
        return this.post(name, 'textEditorClose', options)
    }

    clearLog(name: string, options?: any): any {
        return this.post(name, 'clearLog', options)
    }

    getCommand(name: string, options?: any): string {
        return this.post(name, 'getCommand', options)
    }

    setCommand(name: string, options?: any): string | any {
        return this.post(name, 'setCommand', options)
    }

    switchAllFoldState(name: string, options: boolean): any {
        return this.post(name, 'switchAllFoldState', options)
    }
}

export interface EditorSetting {
    content: string,
    onClose: Function
}
