class TerminalFlash {
    flush (msg) {
        if (this.onFlushListener != null) {
            this.onFlushListener(msg)
        }
    }

    onFlush (callback) {
        this.onFlushListener = callback
    }

    finish () {
        if (this.onFlushListener != null) {
            this.onFinishListener()
        }
    }

    onFinish (callback) {
        this.onFinishListener = callback
    }
}

export default TerminalFlash
