class TerminalCallback {
  onFinishListener?: () => void;
  constructor() {
    this.onFinishListener = undefined;
  }
  finish() {
    if (this.onFinishListener) {
      this.onFinishListener();
    }
  }

  onFinish(callback: () => void) {
    this.onFinishListener = callback;
  }
}

export default TerminalCallback;
