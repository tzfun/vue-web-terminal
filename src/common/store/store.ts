import {CmdHistory, TerminalStore} from "~/types";

//  每个terminal实例最多保存100条记录
const MAX_STORE_SIZE = 100
const DEFAULT_STORAGE_KEY = 'terminal'

export class HistoryStore implements TerminalStore {
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
