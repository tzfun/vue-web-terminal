import historyStore from "./HistoryStore";
import { MessageType } from "./models/MessageInterface";

export type TerminalObjListener = (type: string, options: any) => void;
export type DraggingOption = {
  x: number;
  y: number;
};
export type TextEditorOpenOption = {
  content: string;
  onClose?: (value: string) => void;
};

class TerminalObj {
  private pool: Map<string, TerminalObjListener>;
  private options: {
    highlight?: boolean;
    codemirror?: any;
  };

  constructor() {
    this.pool = new Map();
    this.options = {};
  }

  setOptions(ops: any) {
    this.options = ops;
  }

  getOptions() {
    return this.options;
  }

  register(name: string, listener: TerminalObjListener) {
    if (this.pool.get(name)) {
      throw Error(`Unable to register an existing terminal: ${name}`);
    }
    this.pool.set(name, listener);
  }

  unregister(name: string) {
    this.pool.delete(name);
  }

  post(name = "terminal", event: string, options?: any) {
    let listener = this.pool.get(name);
    if (listener != null) {
      return listener(event, options);
    }
  }

  pushMessage(name: string, options: MessageType[]) {
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

  elementInfo(name: string) {
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