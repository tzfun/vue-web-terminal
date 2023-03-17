import TerminalCallback from "@/js/TerminalCallback";

class TerminalFlash extends TerminalCallback  {
    flush (msg) {
        if (this.handler != null) {
            this.handler(msg)
        }
    }

    onFlush (callback) {
        this.handler = callback
    }
}

export default TerminalFlash
