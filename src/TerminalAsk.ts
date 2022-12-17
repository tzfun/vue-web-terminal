import TerminalCallback from "./TerminalCallback";

export type TerminalAskHandlerOption = {
  isPassword: boolean;
  question: string;
  callback: (input: string) => void;
  autoReview: boolean;
};

export type TerminalAskHandler = (options: TerminalAskHandlerOption) => void;

class TerminalAsk extends TerminalCallback {
  handler: TerminalAskHandler;

  constructor() {
    super();
    this.handler = () => {};
  }

  ask(options: TerminalAskHandlerOption) {
    if (this.handler != null) {
      this.handler(options);
    }
  }

  onAsk(callback: TerminalAskHandler) {
    this.handler = callback;
  }
}

export default TerminalAsk;
