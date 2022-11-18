import {
    ANSI_BEL, ANSI_CHARSET,
    ANSI_CSI, ANSI_DECD,
    ANSI_DECPAM,
    ANSI_DECPNM,
    ANSI_DESIGNATE_CHARSET_0,
    ANSI_DESIGNATE_CHARSET_1,
    ANSI_DESIGNATE_CHARSET_2,
    ANSI_DESIGNATE_CHARSET_3,
    ANSI_ESC,
    ANSI_NUL,
    ANSI_OSC,
    ANSI_PM,
    ANSI_SS3
} from "@/components/shell/ansi/ControlSequence";
import ansi256colors from "@/tools/ansi-256-colors.json";

const config = require('@/config.json')

export default class Term {
    constructor(data, vue, name) {
        this.data = data
        this.vue = vue
        this.name = name
    }

    onInput(event) {
        if (event.key !== 'Process') {
            const funcKeyReg = /(Shift|Meta|Alt|Control)/
            if (funcKeyReg.test(event.key)) {
                return
            }
            let key = null
            if (/F[1-9][0-2]?/.test(event.key)) {
                switch (event.key) {
                    case 'F1':
                        key = ANSI_SS3 + 'P'
                        break
                    case 'F2':
                        key = ANSI_SS3 + 'Q'
                        break
                    case 'F3':
                        key = ANSI_SS3 + 'R'
                        break
                    case 'F4':
                        key = ANSI_SS3 + 'S'
                        break
                    case 'F5':
                        key = ANSI_CSI + '15~'
                        break
                    case 'F6':
                        key = ANSI_CSI + '17~'
                        break
                    case 'F7':
                        key = ANSI_CSI + '18~'
                        break
                    case 'F8':
                        key = ANSI_CSI + '19~'
                        break
                    case 'F9':
                        key = ANSI_CSI + '20~'
                        break
                    case 'F10':
                        key = ANSI_CSI + '21~'
                        break
                    case 'F11':
                        key = ANSI_CSI + '23~'
                        break
                    case 'F12':
                        key = ANSI_CSI + '24~'
                        break
                }
            } else if (/ArrowUp|ArrowDown|ArrowLeft|ArrowRight/.test(event.key)) {
                let prefix = this.data.keypad === 0 ? ANSI_CSI : ANSI_SS3
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
            } else if (event.which <= 32) {
                key = 'ascii:' + event.which
            } else if (!event.altKey && !event.metaKey && !event.shiftKey && event.ctrlKey) {
                //  处理ctrl + a-z的ascii码
                if (event.which >= 65 && event.which <= 90) {
                    key = 'ascii:' + (event.which - 64)
                }
            }
            if (key != null) {
                event.preventDefault()
                this.vue.$emit('onInput', key, event, this.name)
            }
        }
    }

    onOutput(str) {
        this.checkRowCol()


        let arr = Array.from(str)

        for (let i = 0; i < arr.length; i++) {
            let c = arr[i]
            if (c === ANSI_NUL) {
                continue
            }
            //  Control Sequence
            if (c === ANSI_ESC) {
                let flag = str.substring(i, i + 2)
                let y = i
                if (flag === ANSI_CSI) {
                    const endFlagReg = /[@ABCDEFGHIJKLMPSTXZ`"bcdfghilmnpqrstwxz]/
                    let controlType
                    y = i + 1
                    while (y < arr.length - 1) {
                        let char = arr[++y]
                        if (endFlagReg.test(char.toString())) {
                            if (char === '`' && y + 1 < arr.length) {
                                let next = arr[y + 1]
                                if (/[wz{|]/.test(next.toString())) {
                                    controlType = char + next
                                    y++
                                    break
                                }
                            } else if (char === '"' && y + 1 < arr.length) {
                                let next = arr[y + 1]
                                if (/[pq]/.test(next.toString())) {
                                    controlType = char + next
                                    y++
                                    break
                                }
                            } else if (char === '&' && y + 1 < arr.length) {
                                let next = arr[y + 1]
                                if (next === 'w') {
                                    controlType = char + next
                                    y++
                                    break
                                }
                            }
                            controlType = char
                            break
                        }
                    }

                    let cs = str.substring(i, y + 1)

                    //  插入空白字符
                    if (controlType === '@') {
                        let value = cs.substring(2, cs.length - 1)
                        value = value.length === 0 ? 1 : parseInt(value)

                        for (let j = 0; j < value; j++) {
                            this.fillChar(arr[++y], true)
                        }
                    }
                    //  光标位移
                    else if (/[ABCDEFG]/.test(controlType)) {
                        let value = cs.substring(2, cs.length - 1)
                        value = value.length === 0 ? 1 : parseInt(value)

                        if (controlType === 'A') { //  光标上移n个单位
                            this.data.rowNum = Math.max(0, this.data.rowNum - value)
                        } else if (controlType === 'B') {  //  光标下移n个单位
                            this.data.rowNum += value
                            this.checkRowCol()
                        } else if (controlType === 'C') {  //  光标右移n个单位
                            this.data.colNum += value
                            this.checkRowCol()
                        } else if (controlType === 'D') {  //  光标左移n个单位
                            this.data.colNum = Math.max(0, this.data.colNum - value)
                        } else if (controlType === 'E') {  //  光标下移到第n行的第一列
                            this.data.rowNum = value - 1
                            this.data.colNum = 0
                            this.checkRowCol()
                        } else if (controlType === 'F') {  //  光标上移到第n行的第一列
                            this.data.rowNum = value - 1
                            this.data.colNum = 0
                        } else if (controlType === 'G') {  //  光标移动到当前行的指定列
                            this.data.colNum = value - 1
                        }
                    }
                    //  向光标以前制表
                    else if (controlType === 'I') {
                        let value = cs.substring(2, cs.length - 1)
                        value = value.length === 0 ? 1 : parseInt(value)
                        this.data.colNum += (value * config.tabLength)
                        this.checkRowCol()
                    }
                    // 光标重定位
                    else if (controlType === 'H' || controlType === 'f') {
                        let value = cs.substring(2, cs.length - 1)
                        let row, col
                        if (value.length === 0) {
                            row = 1
                            col = 1
                        } else {
                            let pos = value.split(";")
                            row = pos[0].length === 0 ? 1 : parseInt(pos[0])
                            col = pos[1].length === 0 ? 1 : parseInt(pos[1])
                        }

                        this.data.rowNum = row - 1
                        this.data.colNum = col - 1
                        this.checkRowCol()
                    }
                    //  跨行清屏
                    else if (controlType === 'J') {
                        let value = cs.substring(cs.indexOf("?") < 0 ? 2 : 3, cs.length - 1)
                        value = value.length === 0 ? 0 : parseInt(value)

                        if (value === 0) {  //  清除光标之后（右侧）的所有内容
                            this.data.lines[this.data.rowNum].splice(0, this.data.colNum)
                            this.data.lines.splice(0, this.data.rowNum)
                            this.data.rowNum = 0
                        } else if (value === 1) {   //  清除光标之前（左侧）的所有内容
                            this.data.lines[this.data.rowNum].splice(this.data.colNum)
                            this.data.lines.splice(this.data.rowNum)
                            this.data.colNum = 0
                        } else if (value === 2) {   //  清除全屏
                            this.clearScreen()
                        } else if (value === 3) {   //  清除全屏并保存
                            this.data.backup.lines = JSON.parse(JSON.stringify(this.data.lines))
                            this.data.backup.rowNum = this.data.rowNum
                            this.data.backup.colNum = this.data.colNum
                            this.clearScreen()
                        }
                        this.checkRowCol()
                    }
                    //  清当前行
                    else if (controlType === 'K') {
                        let value = cs.substring(cs.indexOf("?") < 0 ? 2 : 3, cs.length - 1)
                        value = value.length === 0 ? 0 : parseInt(value)

                        if (value === 0) {  //  清除右侧所有内容
                            this.data.lines[this.data.rowNum].splice(this.data.colNum)
                        } else if (value === 1) {   //  清除左侧所有内容
                            this.data.lines[this.data.rowNum].splice(0, this.data.colNum)
                        } else if (value === 2) {   //  清除整行
                            this.data.lines[this.data.rowNum] = []
                        }
                    }
                    //  插入n行
                    else if (controlType === 'L') {
                        let value = cs.substring(2, cs.length - 1)
                        value = value.length === 0 ? 1 : parseInt(value)

                        for (let j = 0; j < value; j++) {
                            this.data.lines.push([])
                        }
                    }
                    //  删除n行
                    else if (controlType === 'M') {
                        let value = cs.substring(2, cs.length - 1)
                        value = value.length === 0 ? 1 : parseInt(value)

                        this.data.lines.splice(this.data.rowNum - value + 1, value)
                    }
                    //  删除 n 个字符
                    else if (controlType === 'P' || controlType === 'X') {
                        let value = cs.substring(2, cs.length - 1)
                        value = value.length === 0 ? 1 : parseInt(value)

                        this.data.lines[this.data.rowNum].splice(this.data.colNum, value)
                    }
                    //  向上滚动 n 行
                    else if (controlType === 'S') {
                        let value = cs.substring(2, cs.length - 1)
                        value = value.length === 0 ? 1 : parseInt(value)

                        this.vue._scrollOffset(-config.domStyle.windowLineHeight * value)
                    }
                        //  向下滚动 n 行
                    //  启动鼠标跟踪
                    else if (controlType === 'T') {
                        let value = cs.substring(2, cs.length - 1)
                        if (value.indexOf(";") < 0) {
                            value = value.length === 0 ? 1 : parseInt(value)

                            this.vue._scrollOffset(config.domStyle.windowLineHeight * value)
                        } else {
                            //  CSI n;n;n;n;n T
                            //  鼠标跟踪逻辑
                        }
                    }
                    //  向光标以后制表
                    else if (controlType === 'Z') {
                        let value = cs.substring(2, cs.length - 1)
                        value = value.length === 0 ? 1 : parseInt(value)
                        this.fillChar(' '.repeat(value * config.tabLength), true)
                    }
                    //  切换光标列，支持多列
                    else if (controlType === '`') {
                        let value = cs.substring(2, cs.length - 1)
                        if (value.indexOf(";") < 0) {
                            value = value.length === 0 ? 1 : parseInt(value)
                        } else {
                            let colRange = value.split(";")
                            console.log('Col Range', colRange)
                        }

                        this.data.colNum = value - 1
                        this.checkRowCol()
                    }
                    //  复制前面的字符n次
                    else if (controlType === 'b') {
                        let value = cs.substring(2, cs.length - 1)
                        value = value.length === 0 ? 1 : parseInt(value)
                        let preChar = this.data.lines[this.data.rowNum][this.data.colNum - 1]
                        let line = this.data.lines[this.data.rowNum]
                        for (let j = 0; j < value; j++) {
                            line.push(preChar)
                            this.data.rowNum++
                        }
                    }
                    //  设置终端识别码
                    else if (controlType === 'c') {
                        let value = cs.substring(2, cs.length - 1)
                        value = value.length === 0 ? 0 : parseInt(value)

                        //  格式：其中Val为0、1或不填
                        //  CSI > Val c
                        //  CSI Val c
                    }
                    //  切换光标行，支持多行
                    else if (controlType === 'd') {
                        let value = cs.substring(2, cs.length - 1)
                        if (value.indexOf(";") < 0) {
                            value = value.length === 0 ? 1 : parseInt(value)
                        } else {
                            let rowRange = value.split(";")
                            console.log('Row Range', rowRange)
                        }

                        this.data.rowNum = value - 1
                        this.checkRowCol()
                    }
                    //  清除tab
                    else if (controlType === 'g') {
                        // 暂时不处理
                    }
                    //  设备模式切换
                    else if (controlType === 'h') {
                        let value = cs.substring(2, cs.length - 1)
                        if (value.indexOf('?') < 0) {
                            value = value.split(";")
                            console.log("Set mode", value)
                        } else {
                            value = parseInt(cs.substring(3, cs.length - 1))
                            value = cs.substring(3, cs.length - 1)
                            value = value.split(";")
                            console.log("Set device mode", value)
                        }
                    }
                    //  媒体操作
                    else if (controlType === 'i') {
                        let value = cs.substring(2, cs.length - 1)
                        if (value.indexOf('?') < 0) {
                            value = value.split(";")
                            console.log("Media mode", value)
                        } else {
                            value = parseInt(cs.substring(3, cs.length - 1))
                            value = cs.substring(3, cs.length - 1)
                            value = value.split(";")
                            console.log("Media-specific mode", value)
                        }
                    }
                    //  模式重置
                    else if (controlType === 'l') {
                        let value = cs.substring(2, cs.length - 1)
                        if (value.indexOf('?') < 0) {
                            value = value.split(";")
                            console.log("Reset mode", value)
                        } else {
                            value = parseInt(cs.substring(3, cs.length - 1))
                            value = cs.substring(3, cs.length - 1)
                            value = value.split(";")
                            console.log("Reset private mode", value)
                        }
                    }
                    //  着色
                    else if (controlType === 'm') {
                        let value = cs.substring(2, cs.length - 1)
                        if (value.length === 0) {
                            value = '0'
                        }
                        this.data.styleFlag = []
                        for (let ps of value.split(";")) {
                            this.data.styleFlag.push(parseInt(ps))
                        }

                        if (this.data.styleFlag.length === 1 && this.data.styleFlag[0] === 0) {
                            this.data.attachStyle = ''
                            this.data.styleFlag = []
                        } else if (this.data.styleFlag.length === 3) {
                            //  256前景色
                            if (this.data.styleFlag[0] === '38' && this.data.styleFlag[1] === '5') {
                                this.data.attachStyle = `color:${ansi256colors['c' + this.data.styleFlag[2]]};`
                                this.data.styleFlag = []
                            }
                            //  256背景色
                            else if (this.data.styleFlag[0] === '48' && this.data.styleFlag[1] === '5') {
                                this.data.attachStyle = `background-color:${ansi256colors['c' + this.data.styleFlag[2]]};`
                                this.data.styleFlag = []
                            } else {
                                this.data.attachStyle = ''
                            }
                        }
                    }
                    //  报告设备状态
                    else if (controlType === 'n') {
                        let value = cs.substring(2, cs.length - 1)
                        if (value.indexOf("?") < 0) {
                            value = parseInt(value)
                            if (value === 5) {  //  报告OK状态
                                this.vue.$emit('onInput', ANSI_CSI + '0n', null, this.name)
                            } else if (value === 6) {   //  报告光标位置
                                let row = this.data.rowNum + 1
                                let col = this.data.colNum + 1
                                this.vue.$emit('onInput', `${ANSI_CSI}${row};${col}R`, null, this.name)
                            }
                        } else {
                            value = parseInt(cs.substring(3, cs.length - 1))
                            if (value === 6) {  //  报告光标位置
                                let row = this.data.rowNum + 1
                                let col = this.data.colNum + 1
                                this.vue.$emit('onInput', `${ANSI_CSI}?${row};${col}R`, null, this.name)
                            } else if (value === 15) {  //  报告打印是否已就绪
                                //  ready CSI ?10 n
                                //  not ready CSI ?11 n
                                this.vue.$emit('onInput', `${ANSI_CSI}?10n`, null, this.name)
                            } else if (value === 25) {  //  报告UDK状态
                                //  unlocked: CSI?20n
                                //  locked: CSI?21n
                            } else if (value === 26) {  //  报告 keyboard status
                                //  North American: CSI?27;1;0;0;n
                                //  Locator available: CSI?53n
                                //  No Locator: CSI?50n
                            }
                        }
                    }
                    //  terminal重置
                    else if (controlType === 'p') {
                        //  暂不处理
                    }
                    //  设置识别环境级别
                    else if (controlType === '"p') {
                        let value = cs.substring(2, cs.length - 2).split(";")
                        let term = parseInt(value[0])
                        if (term === 61) {
                            //  VT100
                        } else if (term === 62) {
                            //  VT200
                        } else if (term === 63) {
                            //  VT300
                        }

                        let validValues = parseInt(value[1])
                        if (validValues === 0 || validValues === 2) {
                            //  8位控制码
                        } else if (validValues === 0) {
                            //  7位控制码（仅对VT100有效）
                        }
                    }
                    //  设置字符保护属性
                    else if (controlType === '"q') {
                        //  暂不处理
                    }
                    //  设置滚动区域
                    else if (controlType === 'r') {
                        //  暂不处理
                    }
                    //  保存Private Mode值
                    else if (controlType === 's') {
                        //  暂不处理
                    }
                    //  DEC Private模式设置
                    else if (controlType === 'l') {
                        //  暂不做处理
                    }
                    // 窗口操作
                    else if (controlType === 't') {
                        /*
                        * Ps;Ps;Ps 三个参数，第一个参数是控制码
                        * 暂不处理，但后期可能会用到
                        * 第一个参数是控制码，其含义如下：
                        * 1 - 去掉窗口图标icon
                        * 2 - 显示窗口图标icon
                        * 3 - 移动窗口位置到 [x;y]
                        * 4 - resize窗口大小，[height;width]，单位px
                        * 5 - 窗口层级置顶
                        * 6 - 窗口层级置底
                        * 7 - 刷新爽口
                        * 8 - resize内容显示区域大小，[height;width]，单位px
                        * 9 - [0]窗口最大化，[1]全屏
                        * 11- 报告窗口状态
                        * 13- 报告窗口位置 CSI 3;x;y t
                        * 14- 报告窗口大小 CSI 4;height;width t
                        * 18- 报告内容显示区域大小 CSI 8;height;width t
                        * 19- 报告屏幕内内容显示区域大小 CSI 9;height;width t
                        * 20- 报告窗口图标icon
                        * 21- 报告窗口标题title
                        * 24- (or > 24) resize n行大小
                        * */
                    }
                    //  过滤器
                    else if (controlType === '`w') {
                        //  暂不做处理

                        //  CSI Pt;Pl;Pb;Pr `w
                        //  参数：[top;left;bottom;right]
                    }
                }
                else if (flag === ANSI_OSC) {
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
                            this.vue.$emit("update:title", content)
                            break
                    }
                }
                else if (flag === ANSI_PM) {
                    //  for xterm
                    let p = i + 1
                    while (p < arr.length) {
                        ++p
                        if (arr[p] === '\\') {
                            break
                        }
                    }
                    y = p
                }
                //  切换至Application Keypad
                else if (flag === ANSI_DECPAM) {
                    this.data.keypad = 1
                    y = i + 1
                }
                //  切换至常规键入模式
                else if (flag === ANSI_DECPNM) {
                    this.data.keypad = 0
                    y = i + 1
                }
                //  设置字符集
                else if (flag === ANSI_DESIGNATE_CHARSET_0 || flag === ANSI_DESIGNATE_CHARSET_1
                    || ANSI_DESIGNATE_CHARSET_2 || ANSI_DESIGNATE_CHARSET_3) {
                    //  忽略
                    y = i + 2
                }
                //  设置字符编码
                else if (flag === ANSI_CHARSET) {
                    //  忽略
                    y = i + 2
                }
                //  设置字符和行 的 宽度、高度
                else if (flag === ANSI_DECD) {
                    y = i + 2
                }
                i = y
                continue
            } else if (c === '\r') {
                if (i + 1 < arr.length && arr[i + 1] === '\n') {    //  \r\n换行
                    this.data.lines.push([])
                    this.data.rowNum++
                    this.data.colNum = 0
                    this.vue._scrollToBottom()
                    i++
                } else {    //  \r回车
                    this.data.colNum = 0
                }
                continue
            } else if (c === '\n') {
                this.data.lines.push([])
                this.data.rowNum++
                this.data.colNum = 0
                this.vue._scrollToBottom()
                continue
            } else if (c === '\b') {    //  退格
                if (this.data.colNum > 0) {
                    this.data.colNum--
                }
                continue
            } else if (c === '\t') {    //  水平制表
                this.fillChar(' '.repeat(4))
                continue
            } else if (c >= '\x00' && c <= '\x1F') {
                //  特殊ascii，暂不做处理
                continue
            }

            this.fillChar(c)
        }
        this.vue._scrollToBottom()
    }

    checkRowCol() {
        if (this.data.lines.length === 0) {
            this.data.lines.push([])
        }

        let fillRow = this.data.rowNum - this.data.lines.length
        while (fillRow-- >= 0) {
            this.data.lines.push([])
        }

        let fillCol = this.data.colNum - this.data.lines[this.data.rowNum].length
        if (fillCol > 0) {
            this.data.colNum = this.data.lines[this.data.rowNum].length
            this.fillChar(' '.repeat(fillCol))
        }
    }

    clearScreen() {
        this.data.lines = []
        this.data.styleFlag = []
        this.data.attachStyle = ''
        this.data.rowNum = 0
        this.data.colNum = 0
    }

    fillChar(char, insert = false) {
        try {
            let arr = char.split('')
            for (let c of arr) {
                let cWidth = this.vue._getCharWidth(c)

                let charStr
                if (this.data.styleFlag.length > 0) {
                    let clazz = "shell-char"
                    this.data.styleFlag.forEach(o => clazz += (' ansi-' + parseInt(o)))
                    charStr = `<span class="${clazz}" style="width:${cWidth}px;${this.data.attachStyle}">${c}</span>`
                } else {
                    charStr = `<span class="shell-char" style="width:${cWidth}px;${this.data.attachStyle}">${c}</span>`
                }
                let line = this.data.lines[this.data.rowNum]
                if (this.data.colNum >= line.length) {
                    line.push(charStr)
                } else {
                    if (insert) {
                        line.splice(this.data.colNum, 0, charStr)
                    } else {
                        line[this.data.colNum] = charStr
                    }
                }
                this.data.colNum++
            }
        } catch (e) {
            console.error('Can not fill char: ' + char.toString(), e)
        }
    }
}
