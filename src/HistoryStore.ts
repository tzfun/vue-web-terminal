//  每个terminal实例最多保存100条记录
const MAX_STORE_SIZE = 100;
const storageKey = "terminal";
type HistoryState = {
  cmdIdx?: number;
  cmdLog?: string[];
};

class HistoryStore {
  private dataMap: Map<string, HistoryState>;

  constructor() {
    let dataMapStr = window.localStorage.getItem(storageKey);
    if (!dataMapStr) {
      this.dataMap = new Map<string, HistoryState>();
    } else {
      this.dataMap = new Map<string, HistoryState>(
        Object.entries(JSON.parse(dataMapStr))
      );
    }
  }

  public pushCmd(name: string, cmd: string) {
    let data = this.getData(name);
    if (!data.cmdLog) {
      data.cmdLog = [];
    }
    if (
      data.cmdLog.length === 0 ||
      data.cmdLog[data.cmdLog.length - 1] !== cmd
    ) {
      data.cmdLog.push(cmd);

      if (data.cmdLog.length > MAX_STORE_SIZE) {
        data.cmdLog.splice(0, data.cmdLog.length - MAX_STORE_SIZE);
      }
    }

    data.cmdIdx = data.cmdLog.length;
    this.store();
  }

  private store() {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify(Object.fromEntries(this.dataMap))
    );
  }

  private getData(name: string): HistoryState {
    let data = this.dataMap.get(name);
    if (!data) {
      data = {};
      this.dataMap.set(name, data);
    }
    return data;
  }

  public getLog(name: string): string[] {
    let data = this.getData(name);
    if (!data.cmdLog) {
      data.cmdLog = [];
    }
    return data.cmdLog;
  }

  public clearLog(name: string) {
    let data = this.getData(name);
    data.cmdLog = [];
    data.cmdIdx = 0;
    this.store();
  }

  public getIdx(name: string): number {
    let data = this.getData(name);
    return data.cmdIdx ?? 0;
  }

  public setIdx(name: string, idx: number) {
    let data = this.getData(name);
    data.cmdIdx = idx;
  }
}

const instance = new HistoryStore();
export default instance;
