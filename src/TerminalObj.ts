import historyStore from "./HistoryStore";
import { MessageType } from "./models/MessageInterface";

export type TerminalObjListener<O, R> = (type: string, options: O) => R;
export type DraggingOption = {
  x: number;
  y: number;
};
export type TextEditorOpenOption = {
  content: string;
  onClose?: (value: string) => void;
};
export type ElementInfo = {
  /** 窗口所在位置 */
  pos: {
    x: number;
    y: number;
  };
  /** 窗口整体宽度 */
  screenWidth: number;
  /** 窗口整体高度 */
  screenHeight: number;
  /** 可显示内容范围高度，减去padding值，如果有滚动条去掉滚动条宽度 */
  clientWidth: number;
  /** 可显示内容范围高度 */
  clientHeight: number;
  charWidth: {
    /** 单个英文字符宽度 */
    en: number;
    /** 单个中文字符宽度 */
    cn: number;
  };
};

class TerminalObj {
  _pool: Map<string, TerminalObjListener<any, any>>;

  constructor() {
    this._pool = new Map();
  }

  register(name: string, listener: TerminalObjListener<any, any>) {
    if (this._pool.get(name)) {
      throw Error(`Unable to register an existing terminal: ${name}`);
    }
    this._pool.set(name, listener);
  }

  unregister(name: string) {
    this._pool.delete(name);
  }

  post<O, R>(name = "terminal", event: string, options?: O): R {
    const listener = this._pool.get(name);
    if (listener) {
      return listener(event, options) as R;
    } else {
      throw new Error(`terminal: ${name} not register ${event}`);
    }
  }

  pushMessage(name: string, options: MessageType | MessageType[]) {
    return this.post(name, "pushMessage", options);
  }

  getHistory() {
    return historyStore;
  }

  fullscreen(name: string) {
    return this.post(name, "fullscreen");
  }

  isFullscreen(name: string) {
    return this.post(name, "isFullscreen");
  }

  dragging(name: string, options: DraggingOption) {
    return this.post(name, "dragging", options);
  }

  execute(name: string, options: string) {
    return this.post(name, "execute", options);
  }

  focus(name: string) {
    return this.post(name, "focus");
  }

  elementInfo(name: string): ElementInfo {
    return this.post(name, "elementInfo");
  }

  textEditorOpen(name: string, options: TextEditorOpenOption) {
    return this.post(name, "textEditorOpen", options);
  }

  textEditorClose(name: string) {
    return this.post(name, "textEditorClose");
  }
}

const instance = new TerminalObj();
export default instance;
