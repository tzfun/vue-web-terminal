import TerminalCallback from './TerminalCallback'

export interface TerminalAskHandlerOption {
  isPassword: boolean
  question: string
  callback?: (input: string) => void
  autoReview: boolean
}

export type TerminalAskHandler = (options: TerminalAskHandlerOption) => void

class TerminalAsk extends TerminalCallback {
  handler?: TerminalAskHandler

  constructor() {
    super()
    this.handler = undefined
  }

  ask(options: TerminalAskHandlerOption) {
    if (this.handler)
      this.handler(options)
  }

  onAsk(callback: TerminalAskHandler) {
    this.handler = callback
  }
}

export default TerminalAsk
