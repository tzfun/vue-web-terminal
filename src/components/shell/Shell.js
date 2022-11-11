import TContainer from "@/components/TContainer";
import {shellProps} from "@/components/TProps";
import ShellApi from "@/components/shell/ShellApi";
import {_commandFormatter, _getSelection} from "@/Util";

export default {
    name: "Shell",
    components: {TContainer},
    props: shellProps,
    data() {
        return {
            command: '',
            lines: [],
            cursorConf: {
                show: true
            },
            col: 0
        }
    },
    created() {
        ShellApi.register(this.name, {
            output: str => {
                this._parseAndPush(str)
            },
            clear: () => {
                this.lines = []
            },
            getCol: () => {
                return this.col
            }
        })
    },
    mounted() {
        this._calculateCols()
        this._focus()
    },
    destroyed() {
        this.$emit('destroyed', this.name)
        window.removeEventListener('keydown', this.keydownListener)
        ShellApi.unregister(this.name)
    },
    methods: {
        _calculateCols() {
            this.$nextTick(() => {
                let windowRect = this.$refs.frame.$refs.window.getBoundingClientRect()
                this.col = Math.floor((windowRect.width - 48) / this.$refs.frame._getCharWidth().en)
                console.log("col",this.col)
            })
        },
        _onFullscreenSwitch() {
            this._calculateCols()
            this.$emit('onColChange', this.col)
        },
        _triggerClick(key) {
            this.$emit('onClick', key, this.name)
        },
        _focus() {
            this.$nextTick(() => {
                //  没有被选中
                if (_getSelection().isCollapsed) {
                    if (this.$refs.cmdInput) {
                        this.$refs.cmdInput.focus()
                    }
                } else {
                    this.cursorConf.show = true
                }
            })
        },
        _parseAndPush(s) {
            if (s) {
                let chars = s.split('')
                let lineChars = []
                let _getCharWidth = this.$refs.frame._getCharWidth
                for (let c of chars) {
                    if (c === '\n') {
                        this.lines.push(lineChars.join(''))
                        this._jumpToBottom()
                        lineChars = []
                    } else {
                        lineChars.push(`<span class="shell-char" style="width:${_getCharWidth(c)}px">${c}</span>`)
                    }
                }
                if (lineChars.length > 0) {
                    this.lines.push(lineChars.join(''))
                    this._jumpToBottom()
                }
            }
        },
        _commandFormatter(cmd) {
            if (this.commandFormatter != null) {
                return this.commandFormatter(cmd)
            }
            return _commandFormatter(cmd)
        },
        _execute() {
            this.$emit('execCmd', this.command)
            this.command = ''
        },
        _jumpToBottom() {
            this.$refs.frame._jumpToBottom()
        },
    }
}