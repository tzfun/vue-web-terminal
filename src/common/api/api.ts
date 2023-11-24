import type {TerminalApiListenerFunc} from "~/types";
import {EditorSetting, Message, Options, Position, TerminalApi} from "~/types";

export interface TerminalSetting {
    post: (name: string, eventName: string, options?: any) => any
}

export interface TerminalApiData {
    pool: {
        [key: string]: TerminalApiListenerFunc
    },
    options?: Options
}

export class TerminalApiImpl implements TerminalApi, TerminalSetting {

    data: TerminalApiData

    constructor(data: TerminalApiData) {
        this.data = data
    }

    post(name: string = 'terminal', event: string, options?: any) {
        console.debug(`Api receive event '${event}' from terminal '${name}' and attach options ${options}`)
        let listener:TerminalApiListenerFunc = this.data.pool[name]
        if (listener != null) {
            return listener(event, options)
        }
    }

    pushMessage(name: string, options: Message | Array<Message> | string) {
        return this.post(name, 'pushMessage', options)
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
}
