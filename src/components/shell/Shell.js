import TContainer from "@/components/TContainer";
import {shellProps} from "@/components/TProps";
import ShellApi from "@/components/shell/ShellApi";
import {_commandFormatter, _getByteLen, _getSelection} from "@/tools/Util";

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
            onResize: () => {
                return this._calculateWindowInfo()
            },
            getShellInfo: () => {
                return this.window
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
        _getCharWidth(str) {
            let charWidth = this.$refs.frame.domStyle.shellCharWidth
            if (str) {
                let width = 0
                for (let char of str) {
                    width += (_getByteLen(char) === 1 ? charWidth.en : charWidth.cn)
                }
                return width
            } else {
                return charWidth
            }
        },
        _calculateWindowInfo() {
            return new Promise(resolve => {
                this.$nextTick(() => {
                    let windowRect = this.$refs.frame.$refs.window.getBoundingClientRect()
                    this.window.width = windowRect.width - this.$refs.frame.domStyle.windowPaddingLeftAndRight * 2
                    this.window.height = windowRect.height
                    this.window.cols = Math.floor(this.window.width / this._getCharWidth().en)
                    this.window.rows = Math.floor(this.window.height / this.$refs.frame.domStyle.windowLineHeight)
                    resolve(this.window)
                })
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
            const styleReg = new RegExp(/\x1B\[(\d+;)*\d*m/)
            // eslint-disable-next-line no-control-regex
            const clearReg = new RegExp(/\x1B\[\d*J/)
            // eslint-disable-next-line no-control-regex
            const posReg = new RegExp(/\x1B\[(\d+;)?\d*H/)
            // eslint-disable-next-line no-control-regex
            const cursorFlagReg = new RegExp(/\x1B\[\d*[ABCDEFG]/)
            const endFlagReg = new RegExp(/[msuhlABCDEFGHJKST]/)


            let arr = Array.from(str)

            for (let i = 0; i < arr.length; i++) {
                let c = arr[i]

                if (c === '\x1B') {
                    let a = [c]
                    let y = i
                    let end = Math.min(arr.length - 1, i + 13)
                    while (y <= end && !endFlagReg.test(arr[y].toString())) {
                        a.push(arr[++y])
                    }
                    let tmpStr = a.join('')
                    //  着色
                    if (styleReg.test(tmpStr)) {
                        let split = a.slice(2, a.length - 1)
                        if (split.length > 0) {
                            this.ansiControl.styleFlag = split.join('').split(';')
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
                        }

                        i = y
                        continue
                    }
                    //  清屏
                    else if (clearReg.test(tmpStr)) {
                        this._clearScreen()
                        i = y
                        continue
                    }
                    // 光标重定位
                    else if (posReg.test(tmpStr)) {
                        let split = a.slice(2, a.length - 1)
                        if (split.length > 0) {
                            let pos = split.join('').split(';')
                            this.ansiControl.rowNum = parseInt(pos[0])
                            this.ansiControl.colNum = parseInt(pos[1])
                            this._checkRowCol()
                        }
                        i = y
                        continue
                    }
                    //  光标位移
                    else if (cursorFlagReg.test(tmpStr)) {
                        let split = a.slice(2, a.length - 1)
                        if (split.length > 0) {
                            let value = parseInt(split.join(''))
                            let type = a[a.length - 1]
                            if (type === 'A') { //  光标上移n个单位
                                this.ansiControl.rowNum = Math.max(0, this.ansiControl.rowNum - value)
                            } else if (type === 'B') {  //  光标下移n个单位
                                this.ansiControl.rowNum += value
                                this._checkRowCol()
                            } else if (type === 'C') {  //  光标前移n个单位
                                this.ansiControl.colNum += value
                                this._checkRowCol()
                            } else if (type === 'D') {  //  光标后移n个单位
                                this.ansiControl.colNum = Math.max(0, this.ansiControl.colNum - value)
                            } else if (type === 'E') {  //  光标下移到第n行的第一列
                                this.ansiControl.rowNum = value
                                this.ansiControl.colNum = 0
                                this._checkRowCol()
                            } else if (type === 'F') {  //  光标上移到第n行的第一列
                                this.ansiControl.rowNum = value
                                this.ansiControl.colNum = 0
                            } else if (type === 'G') {  //  光标移动到当前行的指定列
                                this.ansiControl.colNum = value
                            }
                        }
                        i = y
                        continue
                    }
                    else {
                        c = arr[i]
                    }
                } else if (c === '\r') {
                    if (i + 1 < arr.length && arr[i + 1] === '\n') {    //  \r\n换行
                        this.lines.push([])
                        this.ansiControl.rowNum++
                        this.ansiControl.colNum = 0
                        this._jumpToBottom()
                        i++
                    } else {    //  \r回车
                        this.ansiControl.colNum = 0
                    }
                    continue
                } else if (c === '\n') {
                    this.lines.push([])
                    this.ansiControl.rowNum++
                    this.ansiControl.colNum = 0
                    this._jumpToBottom()
                    continue
                } else if (c === '\b') {    //  退格
                    if (this.ansiControl.colNum > 0) {
                        this.ansiControl.colNum--
                    }
                    continue
                } else if (c === '\t') {    //  水平制表
                    this._fillChar(' '.repeat(4))
                    continue
                } else if (c >= '\x00' && c <= '\x1F') {
                    //  特殊ascii，暂不做处理
                    continue
                }

                this._fillChar(c)
            }
            this._jumpToBottom()
        },
        _checkRowCol() {
            let fillRow = this.ansiControl.rowNum - this.lines.length
            while (fillRow-- >= 0) {
                this.lines.push([])
            }

            let fillCol = this.ansiControl.colNum - this.lines[this.ansiControl.rowNum].length
            if (fillCol > 0) {
                this.ansiControl.colNum = this.lines[this.ansiControl.rowNum].length
                this._fillChar(' '.repeat(fillCol))
            }
        },
        _fillChar(char) {
            let arr = char.split('')
            for (let c of arr) {
                let cWidth = this._getCharWidth(c)

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
                this.ansiControl.colNum++
            }
        }
    }
}
