import TerminalCallback from "./TerminalCallback";

export type FlashHandler = (msg: string) => void;
class TerminalFlash extends TerminalCallback {
  handler: FlashHandler;

  constructor() {
    super();
    this.handler = () => {};
  }

  flush(msg: string) {
    if (this.handler != null) {
      this.handler(msg);
    }
  }

  onFlush(callback: FlashHandler) {
    this.handler = callback;
  }
}

export default TerminalFlash;
