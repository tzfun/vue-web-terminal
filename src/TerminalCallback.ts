class TerminalCallback {
  onFinishListener: () => void;
  constructor() {
    this.onFinishListener = () => {};
  }
  finish() {
    if (this.onFinishListener != null) {
      this.onFinishListener();
    }
  }

  onFinish(callback: () => void) {
    this.onFinishListener = callback;
  }
}

export default TerminalCallback;
