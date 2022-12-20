//  每个terminal实例最多保存100条记录
const MAX_STORE_SIZE = 100
const storageKey = "terminal"
type HistoryState = {
  cmdIdx?: number;
  cmdLog?: string[];
};

class HistoryStore {
  _dataMap: Map<string, HistoryState>

  constructor() {
    const dataMapStr = window.localStorage.getItem(storageKey)
    if (!dataMapStr) {
      this._dataMap = new Map<string, HistoryState>()
    } else {
      this._dataMap = new Map<string, HistoryState>(
        Object.entries(JSON.parse(dataMapStr))
      )
    }
  }

  pushCmd(name: string, cmd: string) {
    const data = this._get(name)
    if (!data.cmdLog) {
      data.cmdLog = []
    }
    if (
      data.cmdLog.length === 0 ||
      data.cmdLog[data.cmdLog.length - 1] !== cmd
    ) {
      data.cmdLog.push(cmd)

      if (data.cmdLog.length > MAX_STORE_SIZE) {
        data.cmdLog.splice(0, data.cmdLog.length - MAX_STORE_SIZE)
      }
    }

    data.cmdIdx = data.cmdLog.length
    this._store()
  }

  _store() {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify(Object.fromEntries(this._dataMap))
    )
  }

  _get(name: string): HistoryState {
    let data = this._dataMap.get(name)
    if (!data) {
      data = {}
      this._dataMap.set(name, data)
    }
    return data
  }

  getLog(name: string): string[] {
    const data = this._get(name)
    if (!data.cmdLog) {
      data.cmdLog = []
    }
    return data.cmdLog
  }

  clearLog(name: string) {
    const data = this._get(name)
    data.cmdLog = []
    data.cmdIdx = 0
    this._store()
  }

  getIdx(name: string): number {
    const data = this._get(name)
    return data.cmdIdx ?? 0
  }

  setIdx(name: string, idx: number) {
    const data = this._get(name)
    data.cmdIdx = idx
  }
}

const instance = new HistoryStore()
export default instance
