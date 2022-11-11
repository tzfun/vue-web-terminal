import TApi from "@/components/TApi";

class TerminalApi extends TApi {

    setOptions (ops) {
        this.options = ops
    }

    getOptions() {
        return this.options
    }

}

export default new TerminalApi()
