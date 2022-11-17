import TContainer from "@/components/TContainer";
import {shellProps} from "@/components/TProps";
import ShellApi from "@/components/shell/ShellApi";
import {_getByteLen, _getSelection} from "@/tools/Util";

const ansi256colors = require('../../tools/ansi-256-colors.json')
const config = require("@/config.json")

const ANSI_ESC = '\x1B'
const ANSI_BEL = '\x07'
const ANSI_CONTROL = {
    EMPTY: '\x00',
    IND: ANSI_ESC + 'D',
    NEL: ANSI_ESC + 'E',
    HTS: ANSI_ESC + 'H',
    RI: ANSI_ESC + 'M',
    SS2: ANSI_ESC + 'N',
    SS3: ANSI_ESC + 'O',
    DCS: ANSI_ESC + 'P',
    SPA: ANSI_ESC + 'V',
    EPA: ANSI_ESC + 'W',
    SOS: ANSI_ESC + 'X',
    DECID: ANSI_ESC + 'Z',
    CSI: ANSI_ESC + '[',
    ST: ANSI_ESC + '\\',
    OSC: ANSI_ESC + ']',
    PM: ANSI_ESC + '^',
    APC: ANSI_ESC + '_',
}

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
            showCursor: false,
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
                rowNum: 0,
                colNum: 0,
                backup: {
                    lines: [],
                    rowNum: 0,
                    colNum: 0
                },
                //  0-normal, 1-application
                keypad: 0
            },
            keydownListener: null
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

        this.keydownListener = event => {
            if (this.showCursor) {
                if (this.showCursor && document.activeElement !== this.$refs.cmdInput) {
                    this.$refs.cmdInput.focus()
                }
                if (event.key !== 'Process') {
                    const funcKeyReg = /(Shift|Meta|Alt|Control)/
                    if (funcKeyReg.test(event.key)) {
                        return
                    }
                    let key = null
                    if (/F[1-9][0-2]?/.test(event.key)) {
                        switch (event.key) {
                            case 'F1':
                                key = ANSI_CONTROL.SS3 + 'P'
                                break
                            case 'F2':
                                key = ANSI_CONTROL.SS3 + 'Q'
                                break
                            case 'F3':
                                key = ANSI_CONTROL.SS3 + 'R'
                                break
                            case 'F4':
                                key = ANSI_CONTROL.SS3 + 'S'
                                break
                            case 'F5':
                                key = ANSI_CONTROL.CSI + '15~'
                                break
                            case 'F6':
                                key = ANSI_CONTROL.CSI + '17~'
                                break
                            case 'F7':
                                key = ANSI_CONTROL.CSI + '18~'
                                break
                            case 'F8':
                                key = ANSI_CONTROL.CSI + '19~'
                                break
                            case 'F9':
                                key = ANSI_CONTROL.CSI + '20~'
                                break
                            case 'F10':
                                key = ANSI_CONTROL.CSI + '21~'
                                break
                            case 'F11':
                                key = ANSI_CONTROL.CSI + '23~'
                                break
                            case 'F12':
                                key = ANSI_CONTROL.CSI + '24~'
                                break
                        }
                    } else if (/ArrowUp|ArrowDown|ArrowLeft|ArrowRight/.test(event.key)) {
                        let prefix = this.ansiControl.keypad === 0 ? ANSI_CONTROL.CSI : ANSI_CONTROL.SS3
                        switch (event.key) {
                            case 'ArrowUp':
                                key = prefix + 'A'
                                break
                            case 'ArrowDown':
                                key = prefix + 'B'
                                break
                            case 'ArrowRight':
                                key = prefix + 'C'
                                break
                            case 'ArrowLeft':
                                key = prefix + 'D'
                                break
                        }
                    } else if (event.which < 32) {
                        key = 'ascii:' + event.which
                    } else if (!event.altKey && !event.metaKey && !event.shiftKey && event.ctrlKey) {
                        //  处理ctrl + a-z的ascii码
                        if (event.which >= 65 && event.which <= 90) {
                            key = 'ascii:' + (event.which - 64)
                        }
                    }
                    if (key != null) {
                        event.preventDefault()
                        this.$emit('onInput', key, event, this.name)
                    }
                }
            }
        }
        window.addEventListener('keydown', this.keydownListener);
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
        _onInput(event) {
            if (event.data) {
                this.$emit('onInput', event.data, event, this.name)
            }
        },
        _getCharWidth(str) {
            let charWidth = config.domStyle.shellCharWidth
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
                    this.window.width = windowRect.width - config.domStyle.windowPaddingLeftAndRight * 2
                    this.window.height = windowRect.height
                    this.window.cols = Math.floor(this.window.width / this._getCharWidth().en)
                    this.window.rows = Math.floor(this.window.height / config.domStyle.windowLineHeight)
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
                //  没有文本被选中
                if (_getSelection().isCollapsed) {
                    if (this.$refs.cmdInput) {
                        this.$refs.cmdInput.focus()
                    }
                } else {
                    this.showCursor = true
                }
            })
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
        _getCursorStyle() {
            let charWidth = config.domStyle.shellCharWidth.en
            let charHeight = config.domStyle.windowLineHeight

            return `display: inline-block;
                    position: absolute;
                    width: ${charWidth}px;
                    height: ${charHeight};
                    left: ${this.ansiControl.colNum * charWidth}px;
                    top: ${this.ansiControl.rowNum * charHeight}px;`
        },
        /**
         *  ANSI码中的数值都是从1开始
         *
         * @param str   ANSI字符串
         * @private
         */
        _pushANSI: function (str) {
            this._checkRowCol()
            const endFlagReg = /[cmsuhlrABCDEFGHJKLSTXZP@>=]/

            let arr = Array.from(str)

            for (let i = 0; i < arr.length; i++) {
                let c = arr[i]
                if (c === ANSI_CONTROL.EMPTY) {
                    continue
                }
                //  Control Sequence
                if (c === ANSI_ESC) {
                    let a = [c]
                    let y = i
                    let end = Math.min(arr.length - 1, i + 13)
                    while (y <= end && !endFlagReg.test(arr[y].toString())) {
                        a.push(arr[++y])
                    }
                    let cs = a.join('')
                    let controlType = a[a.length - 1]
                    //  CSI Control Mode
                    if (cs.startsWith(ANSI_CONTROL.CSI)) {
                        //  着色
                        if (controlType === 'm') {
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
                            } else {
                                this.ansiControl.styleFlag = []
                                this.ansiControl.attachStyle = ''
                            }
                        }
                        //  设置终端识别码
                        else if (controlType === 'c') {
                            //  格式：其中Val为0、1或不填
                            //  CSI > Val c
                            //  CSI Val c
                        }
                        //  清当前行
                        else if (controlType === 'K') {
                            let split = a.slice(a.includes('?') ? 3 : 2, a.length - 1)
                            let value = 0
                            if (split.length > 0) {
                                value = parseInt(split.join(''))
                            }

                            if (value === 0) {  //  清除右侧所有内容
                                this.lines[this.ansiControl.rowNum].splice(this.ansiControl.colNum)
                            } else if (value === 1) {   //  清除左侧所有内容
                                this.lines[this.ansiControl.rowNum].splice(0, this.ansiControl.colNum)
                            } else if (value === 2) {   //  清除整行
                                this.lines[this.ansiControl.rowNum] = []
                            }
                        }
                        //  插入n行
                        else if (controlType === 'L') {
                            let split = a.slice(2, a.length - 1)
                            let value = 1
                            if (split.length > 0) {
                                value = parseInt(split.join(''))
                            }
                            for (let j = 0; j < value; j++) {
                                this.lines.push([])
                            }
                        }
                        //  跨行清屏
                        else if (controlType === 'J') {
                            let split = a.slice(2, a.length - 1)
                            let value = 0
                            if (split.length > 0) {
                                value = parseInt(split.join(''))
                            }

                            if (value === 0) {  //  清除光标之后的所有内容
                                this.lines[this.ansiControl.rowNum].splice(0, this.ansiControl.colNum)
                                this.lines.splice(0, this.ansiControl.rowNum)
                                this.ansiControl.rowNum = 0
                            } else if (value === 1) {   //  清除光标之前的所有内容
                                this.lines[this.ansiControl.rowNum].splice(this.ansiControl.colNum)
                                this.lines.splice(this.ansiControl.rowNum)
                                this.ansiControl.colNum = 0
                            } else if (value === 2) {   //  清除全屏
                                this._clearScreen()
                            } else if (value === 3) {   //  清除全屏并保存
                                this.ansiControl.backup.lines = JSON.parse(JSON.stringify(this.lines))
                                this.ansiControl.backup.rowNum = this.ansiControl.rowNum
                                this.ansiControl.backup.colNum = this.ansiControl.colNum
                                this._clearScreen()
                            }
                            this._checkRowCol()
                        }
                        // 光标重定位
                        else if (controlType === 'H') {
                            let split = a.slice(2, a.length - 1)
                            if (split.length > 0) {
                                let pos = split.join('').split(';')
                                this.ansiControl.rowNum = parseInt(pos[0]) - 1
                                this.ansiControl.colNum = parseInt(pos[1]) - 1
                                this._checkRowCol()
                            }
                        }
                        //  删除字符
                        else if (controlType === 'P') {
                            let split = a.slice(2, a.length - 1)
                            let value = 1
                            if (split.length > 0) {
                                value = parseInt(split.join(''))
                            }
                            this.lines[this.ansiControl.rowNum].splice(this.ansiControl.colNum, value)
                        }
                        //  插入字符
                        else if (controlType === '@') {
                            let split = a.slice(2, a.length - 1)
                            let value = 1
                            if (split.length > 0) {
                                value = parseInt(split.join(''))
                            }
                            for (let j = 0; j < value; j++) {
                                this._fillChar(arr[++y], true)
                            }
                        }
                        //  光标位移
                        else if (/[ABCDEFG]/.test(controlType)) {
                            let split = a.slice(2, a.length - 1)
                            if (split.length > 0) {
                                let value = parseInt(split.join(''))
                                let type = a[a.length - 1]
                                if (type === 'A') { //  光标上移n个单位
                                    this.ansiControl.rowNum = Math.max(0, this.ansiControl.rowNum - value)
                                } else if (type === 'B') {  //  光标下移n个单位
                                    this.ansiControl.rowNum += value
                                    this._checkRowCol()
                                } else if (type === 'C') {  //  光标右移n个单位
                                    this.ansiControl.colNum += value
                                    this._checkRowCol()
                                } else if (type === 'D') {  //  光标左移n个单位
                                    this.ansiControl.colNum = Math.max(0, this.ansiControl.colNum - value)
                                } else if (type === 'E') {  //  光标下移到第n行的第一列
                                    this.ansiControl.rowNum = value - 1
                                    this.ansiControl.colNum = 0
                                    this._checkRowCol()
                                } else if (type === 'F') {  //  光标上移到第n行的第一列
                                    this.ansiControl.rowNum = value - 1
                                    this.ansiControl.colNum = 0
                                } else if (type === 'G') {  //  光标移动到当前行的指定列
                                    this.ansiControl.colNum = value - 1
                                }
                            }
                        }
                        //  设置滚动区域
                        else if (controlType === 'r') {
                            //  暂不做处理
                        }
                        //  DEC Private模式设置
                        else if (controlType === 'l') {
                            //  暂不做处理
                        }
                        //  设备模式切换
                        else if (controlType === 'h') {
                            let value = cs.slice(2, a.length - 1)
                            switch (value) {
                                case '?1000':
                                    //  开启鼠标点击坐标发送模式
                                    break
                            }
                        }
                        // 窗口操作
                        else if (controlType === 't') {
                            // let param = cs.slice(2, a.length - 1).split(';')
                        }
                    }
                    //  OSC Control Mode
                    else if (cs.startsWith(ANSI_CONTROL.OSC)) {
                        let p = i + 1
                        while (p <= arr.length) {
                            p++
                            if (arr[p] === ANSI_BEL) {
                                y = p
                                break
                            } else if (arr[p] === ANSI_ESC && arr[p] === '\\') {
                                y = p + 1
                                break
                            }
                        }
                        let value = str.substring(i + 2, p)
                        let flagIdx = value.indexOf(";")
                        let type = parseInt(value.substring(0, flagIdx))
                        let content = value.substring(flagIdx + 1, value.length)
                        switch (type) {
                            case 0: //  修改icon和title
                            case 2: //  修改title
                                this.$emit("update:title", content)
                                break
                        }
                    }
                    //  VT100 Mode
                    else if (cs.startsWith(ANSI_ESC)) {
                        //  切换至Application Keypad
                        if (controlType === '=') {
                            this.ansiControl.keypad = 1
                        }
                        //  切换至常规键入模式
                        else if (controlType === '>') {
                            this.ansiControl.keypad = 0
                        }
                    } else {
                        console.warn('Can not handle ANSI code: ' + arr[i].toString())
                    }
                    i = y
                    continue
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
            if (this.lines.length === 0) {
                this.lines.push([])
            }

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
        _fillChar(char, insert = false) {
            try {
                let arr = char.split('')
                for (let c of arr) {
                    let cWidth = this._getCharWidth(c)

                    let charStr
                    if (this.ansiControl.styleFlag.length > 0) {
                        let clazz = "shell-char"
                        this.ansiControl.styleFlag.forEach(o => clazz += (' ansi-' + parseInt(o)))
                        charStr = `<span class="${clazz}" style="width:${cWidth}px;${this.ansiControl.attachStyle}">${c}</span>`
                    } else {
                        charStr = `<span class="shell-char" style="width:${cWidth}px;${this.ansiControl.attachStyle}">${c}</span>`
                    }
                    let line = this.lines[this.ansiControl.rowNum]
                    if (this.ansiControl.colNum >= line.length) {
                        line.push(charStr)
                    } else {
                        if (insert) {
                            line.splice(this.ansiControl.colNum, 0, charStr)
                        } else {
                            line[this.ansiControl.colNum] = charStr
                        }
                    }
                    this.ansiControl.colNum++
                }
            } catch (e) {
                console.error('Can not fill char: ' + char.toString())
                console.error(e)
            }
        }
    }
}
