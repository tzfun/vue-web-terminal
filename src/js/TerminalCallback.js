class TerminalCallback {
    finish () {
        if (this.onFinishListener != null) {
            this.onFinishListener()
        }
    }

    onFinish (callback) {
        this.onFinishListener = callback
    }
}

export default TerminalCallback
