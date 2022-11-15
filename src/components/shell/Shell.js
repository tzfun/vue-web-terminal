import TContainer from "@/components/TContainer";
import {shellProps} from "@/components/TProps";
import ShellApi from "@/components/shell/ShellApi";
import {_commandFormatter, _getSelection} from "@/tools/Util";

const ansi256colors = require('../../tools/ansi-256-colors.json')

export default {
    name: "Shell",
    components: {TContainer},
    props: shellProps,
    getApi: (name) => {
        return ShellApi.getApi(name)
    },
    data() {
        return {
            command: '',
            lines: [],
            cursorConf: {
                show: true
            },
            window: {
                cols: 0,
                rows: 0,
                width: 0,
                height: 0
            },
            ansiControl: {
                styleFlag: [],
                attachStyle: '',
                lineWidth: 0,
                //  光标的位置，从0开始
                rowNum:0,
                colNum:0
            }
        }
    },
    created() {
        // ShellApi.unregister(this.name)
        ShellApi.register(this.name, {
            output: str => {
                this._pushANSI(str)
            },
            clear: () => {
                this._clearScreen()
            },
            getCol: () => {
                return this.window.cols
            }
        }, true)
    },
    mounted() {
        this._calculateWindowInfo()
        this._focus()
    },
    destroyed() {
        this.$emit('destroyed', this.name)
        window.removeEventListener('keydown', this.keydownListener)
        ShellApi.unregister(this.name)
    },
    methods: {
        _calculateWindowInfo() {
            this.$nextTick(() => {
                let windowRect = this.$refs.frame.$refs.window.getBoundingClientRect()
                this.window.width = windowRect.width - 48
                this.window.height = windowRect.height
                this.window.cols = Math.floor(this.window.width / this.$refs.frame._getCharWidth().en)
            })
        },
        _onFullscreenSwitch() {
            this._calculateWindowInfo()
            this.$emit('onWindowChange', this.window)
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
        _commandFormatter(cmd) {
            if (this.commandFormatter != null) {
                return this.commandFormatter(cmd)
            }
            return _commandFormatter(cmd)
        },
        _execute() {
            this.lines.push([])
            this.$emit('execCmd', this.command)
            this.command = ''
        },
        _jumpToBottom() {
            this.$refs.frame._jumpToBottom()
        },
        _clearScreen() {
            this.lines = []
            this.ansiControl.styleFlag = []
            this.ansiControl.attachStyle = ''
            this.ansiControl.rowNum = 0
            this.ansiControl.colNum = 0
        },
        _pushANSI(str) {
            if (this.lines.length === 0) {
                this.lines.push([])
            }
            // eslint-disable-next-line no-control-regex
            const styleReg = new RegExp(/\x1B\[(\d+;)*\d+m/)
            // eslint-disable-next-line no-control-regex
            const clearReg = new RegExp(/\x1B\[\d+J/)

            let arr = Array.from(str)
            let getCharWidth = this.$refs.frame._getCharWidth

            for (let i = 0; i < arr.length; i++) {
                let c = arr[i]
                let cWidth = getCharWidth(c)
                if (c === '\x1B') {
                    let a = [c]
                    let y = i
                    let end = Math.min(arr.length - 1, i + 13)
                    while (y <= end && arr[y] !== 'm' && arr[y] !== 'J') {
                        a.push(arr[++y])
                    }
                    let tmpStr = a.join('')
                    if (styleReg.test(tmpStr)) {
                        this.ansiControl.styleFlag = a.slice(2, a.length - 1).join('').split(';')
                        if (this.ansiControl.styleFlag.length === 1 && this.ansiControl.styleFlag[0] === '0') {
                            this.ansiControl.styleFlag = []
                        }
                        if (this.ansiControl.styleFlag.length === 3) {
                            //  256前景色
                            if (this.ansiControl.styleFlag[0] === '38' && this.ansiControl.styleFlag[1] === '5') {
                                this.ansiControl.attachStyle = `color:${ansi256colors['c' + this.ansiControl.styleFlag[2]]};`
                                this.ansiControl.styleFlag = []
                            }
                            //  256背景色
                            else if (this.ansiControl.styleFlag[0] === '48' && this.ansiControl.styleFlag[1] === '5') {
                                this.ansiControl.attachStyle = `background-color:${ansi256colors['c' + this.ansiControl.styleFlag[2]]};`
                                this.ansiControl.styleFlag = []
                            } else {
                                this.ansiControl.attachStyle = ''
                            }
                        } else {
                            this.ansiControl.attachStyle = ''
                        }
                        i = y + 1
                        if (i >= arr.length) {
                            break
                        }
                        c = arr[i]
                        cWidth = getCharWidth(c)
                    } else if (clearReg.test(tmpStr)) {
                        this._clearScreen()
                        i = y + 1
                        if (i >= arr.length) {
                            break
                        }
                        continue
                    }
                } else if (c === '\r') {
                    if (i + 1 < arr.length && arr[i + 1] === '\n') {    //  \r\n换行
                        this.lines.push([])
                        this.ansiControl.rowNum++
                        this.ansiControl.colNum = 0
                        this.ansiControl.lineWidth = 0
                        this._jumpToBottom()
                        i++
                    } else {    //  \r回车
                        this.colNum = 0
                    }
                    continue
                } else if (c === '\n') {
                    this.lines.push([])
                    this.ansiControl.rowNum++
                    this.ansiControl.colNum = 0
                    this.ansiControl.lineWidth = 0
                    this._jumpToBottom()
                    continue
                } else if (c === '\b') {    //  退格
                    if (this.ansiControl.colNum > 0) {
                        this.ansiControl.colNum--
                    }
                    continue
                } else if (c === '\t') {    //  水平制表
                    c = '&nbsp;&nbsp;&nbsp;&nbsp;'
                    cWidth = getCharWidth('    ')
                }

                //  当前行太长换行
                this.ansiControl.lineWidth += cWidth
                if (this.ansiControl.lineWidth > this.window.width) {
                    this.lines.push([])
                    this.ansiControl.rowNum++
                    this.ansiControl.colNum = 0
                    this.ansiControl.lineWidth = cWidth
                    this._jumpToBottom()
                }

                let charStr
                if (this.ansiControl.styleFlag.length > 0) {
                    let clazz = "shell-char"
                    this.ansiControl.styleFlag.forEach(o => clazz += (' ansi-' + o))
                    charStr = `<span class="${clazz}" style="width:${cWidth}px;${this.ansiControl.attachStyle}">${c}</span>`
                } else {
                    charStr = `<span class="shell-char" style="width:${cWidth}px;${this.ansiControl.attachStyle}">${c}</span>`
                }
                let line = this.lines[this.ansiControl.rowNum]
                if (this.ansiControl.colNum >= line.length) {
                    line.push(charStr)
                } else {
                    line[this.ansiControl.colNum] = charStr
                }
            }
            this._jumpToBottom()
        }
    }
}
