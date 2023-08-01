import ansi256colors from "./ansi-256-colors.json";

export const ANSI_NUL = '\x00'
export const ANSI_BEL = '\x07'
export const ANSI_BS = '\x08'
export const ANSI_CR = '\x0D'
export const ANSI_ENQ = '\x05'
export const ANSI_FF = '\x0C'
export const ANSI_LF = '\x0A'
export const ANSI_SO = '\x0E'
export const ANSI_SP = '\x20'
export const ANSI_TAB = '\x09'
export const ANSI_VT = '\x0B'
export const ANSI_SI = '\x0F'
export const ANSI_ESC = '\x1B'

export const ANSI_IND = ANSI_ESC + 'D' + '\u0000'
export const ANSI_NEL = ANSI_ESC + 'E'
export const ANSI_HTS = ANSI_ESC + 'H'
export const ANSI_RI = ANSI_ESC + 'M'
export const ANSI_SS2 = ANSI_ESC + 'N'
export const ANSI_SS3 = ANSI_ESC + 'O'
export const ANSI_DCS = ANSI_ESC + 'P'
export const ANSI_SPA = ANSI_ESC + 'V'
export const ANSI_EPA = ANSI_ESC + 'W'
export const ANSI_SOS = ANSI_ESC + 'X'
export const ANSI_DECID = ANSI_ESC + 'Z'
export const ANSI_CSI = ANSI_ESC + '['
export const ANSI_ST = ANSI_ESC + '\\'
export const ANSI_OSC = ANSI_ESC + ']'
export const ANSI_PM = ANSI_ESC + '^'
export const ANSI_APC = ANSI_ESC + '_'
export const ANSI_DECPAM = ANSI_ESC + '='
export const ANSI_DECPNM = ANSI_ESC + '>'
export const ANSI_DESIGNATE_CHARSET_0 = ANSI_ESC + '('
export const ANSI_DESIGNATE_CHARSET_1 = ANSI_ESC + ')'
export const ANSI_DESIGNATE_CHARSET_2 = ANSI_ESC + '*'
export const ANSI_DESIGNATE_CHARSET_3 = ANSI_ESC + '+'
export const ANSI_CHARSET = ANSI_ESC + '%'
export const ANSI_DECD = ANSI_ESC + '#'

/**
 * 解析并过滤ANSI Code，目前仅对着色码翻译，其余码过滤
 *
 * @param str
 * @param os windows | mac | linux | unix
 * @returns string
 * @private
 */
export function _parseANSI(str: string, os: 'windows' | 'mac' | 'linux' | 'unix' = 'windows'): string {
    let lines = ['']
    let data = {
        attachStyle: <string>'',
        styleFlag: <Array<string | number>>[]
    }

    function newLine() {
        lines[lines.length - 1] = '<div class="t-ansi-line">' + lines[lines.length - 1] + '</div>'
        lines.push('')
    }

    function fillChar(char: string) {
        try {
            let arr = char.split('')
            for (let c of arr) {
                let charStr
                let clazz = "t-ansi-char"
                if (data.styleFlag.length > 0) {
                    data.styleFlag.forEach(o => clazz += (' t-ansi-' + parseInt(String(o))))
                    charStr = `<span class="${clazz}" style="${data.attachStyle}">${c}</span>`
                } else {
                    charStr = `<span class="${clazz}" style="${data.attachStyle}">${c}</span>`
                }
                lines[lines.length - 1] = lines[lines.length - 1] + charStr
            }
        } catch (e) {
            console.error('Can not fill char: ' + char.toString(), e)
        }
    }

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

                if (controlType === 'm') {
                    let value = cs.substring(2, cs.length - 1)
                    if (value.length === 0) {
                        value = '0'
                    }
                    data.styleFlag = []
                    for (let ps of value.split(";")) {
                        let m = parseInt(ps)
                        if (m === 0) {
                            data.attachStyle = ''
                            data.styleFlag = []
                        } else {
                            data.styleFlag.push(m)
                        }
                    }

                    if (data.styleFlag.length === 3) {
                        //  256前景色
                        if (data.styleFlag[0] === 38 && data.styleFlag[1] === 5) {
                            // @ts-ignore
                            data.attachStyle += `color:${ansi256colors['c' + data.styleFlag[2]]};`
                            data.styleFlag = []
                        }
                        //  256背景色
                        else if (data.styleFlag[0] === 48 && data.styleFlag[1] === 5) {
                            // @ts-ignore
                            data.attachStyle += `background-color:${ansi256colors['c' + data.styleFlag[2]]};`
                            data.styleFlag = []
                        } else {
                            data.attachStyle = ''
                        }
                    }
                }
            }
            //  窗口信息同步
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
            } else if (flag === ANSI_PM) {
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
                y = i + 1
            }
            //  切换至常规键入模式
            else if (flag === ANSI_DECPNM) {
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
            if (os === 'windows') {
                if (i + 1 < arr.length && arr[i + 1] === '\n') {    //  \r\n换行
                    newLine()
                    i++
                } else {    //  \r回车
                    newLine()
                }
            } else if (os === 'mac') {
                newLine()
            }
            continue
        } else if (c === '\n') {
            newLine()
            continue
        } else if (c === '\b') {    //  退格
            continue
        } else if (c === '\t') {    //  水平制表
            fillChar(' '.repeat(4))
            continue
        } else if (c >= '\x00' && c <= '\x1F') {
            //  特殊ascii，暂不做处理
            continue
        }

        fillChar(c)
    }

    return lines.join('');
}