/**
 * 将空格、回车、Tab转译为html
 *
 * @param str
 * @returns {*|string}
 * @private
 */
export function _html(str) {
    return String(str)
        .replace(/&(?!\w+;)/g, '&amp;')
        .replace(/ /g, '&nbsp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
        .replace(/\r\n/g, '<br>')
        .replace(/\n/g, '<br>')
        .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
}

/**
 * 判断一个对象是否为逻辑上的空
 *
 * @param value
 * @returns {boolean|boolean}
 * @private
 */
export function _isEmpty(value) {
    return (
        value === undefined ||
        value === null ||
        (typeof value === "string" && value.trim().length === 0) ||
        (typeof value === "object" && Object.keys(value).length === 0)
    );
}

export function _nonEmpty(value) {
    return !_isEmpty(value)
}

/**
 * 将字符串中的html标签转译
 *
 * @param str
 * @returns {*|string}
 * @private
 */
export function _unHtml(str) {
    return str ? str.replace(/[<">']/g, (a) => {
        return {
            '<': '&lt;',
            '"': '&quot;',
            '>': '&gt;',
            "'": '&#39;',
        }[a]
    }) : '';
}

export function _sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

export function _screenType(width = document.body.clientWidth) {
    let result = {}
    if (width < 600) {
        result.xs = true
    } else if (width >= 600 && width < 960) {
        result.sm = true
    } else if (width >= 960 && width < 1264) {
        result.md = true
    } else if (width >= 1264 && width < 1904) {
        result.lg = true
    } else {
        result.xl = true
    }
    return result
}

export function _isSafari() {
    return /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)
}

export function _getByteLen(val) {
    if (val.length === 1) {
        //  全角，占用两个字节
        // eslint-disable-next-line no-control-regex
        if (val.match(/[^\x00-\xff]/ig) != null) {
            return 2
        }
        //  半角占一个字节
        else {
            return 1
        }
    }
}

/**
 * 获取两个连续字符串的不同部分
 *
 * @param one
 * @param two
 * @returns {string}
 */
export function _getDifferent(one, two) {
    if (one === two) {
        return '';
    }
    let i = 0, j = 0;
    let longOne = one.length > two.length ? one : two;
    let shortOne = one.length > two.length ? two : one;

    let diff = '', nextChar = '';
    let hasDiff = false;
    while (i < shortOne.length || j < longOne.length) {
        if (shortOne[i] === longOne[j]) {
            if (hasDiff) {
                break;
            }
            i++;
            j++;
        } else {
            if (i < shortOne.length - 1) {
                nextChar = shortOne[i + 1]
            }
            if (longOne[j] === nextChar || j >= longOne.length) {
                break;
            } else {
                diff += longOne[j];
            }
            j++;
            hasDiff = true;
        }
    }
    return diff;
}

export function _commandFormatter(cmd) {
    if (cmd == null) {
        return ''
    }
    let split = cmd.split(" ")
    let formatted = ''
    for (let i = 0; i < split.length; i++) {
        let char = _html(split[i])
        if (i === 0) {
            formatted += `<span class='t-cmd-key'>${char}</span>`
        } else if (char.startsWith("-")) {
            formatted += `<span class="t-cmd-arg">${char}</span>`
        } else if (char.length > 0) {
            formatted += `<span>${char}</span>`
        }
        if (i < split.length - 1) {
            formatted += "<span>&nbsp;</span>"
        }
    }
    return formatted
}

export function _getSelection() {
    if (window.getSelection) {
        return window.getSelection()
    } else {
        return document.getSelection()
    }
}

/**
 * 过滤ANSI字符
 *
 * 单个 \r 是回到行首
 * windows下 \r\n 和 \n 都是换行
 *
 * ANSI控制序列开始符号：\u001B \033 \e \x1B
 * ANSI样式控制格式：\e[1;2;3m
 * ANSI换行控制格式(y是行号，x是列号）：\e[y:xH
 *
 * @param str
 * @private
 */
export function _ANSI2String(str) {
    // eslint-disable-next-line no-control-regex
    let flagReg = new RegExp(/\x1B\[(\d+;)*\d+m/)

    let arr = Array.from(str)
    let newArr = []
    for (let i = 0; i < arr.length; i++) {
        let c = arr[i]
        if (c === '\x1B') {
            let a = [c]
            let y = i
            let end = Math.min(arr.length - 1, i + 13)
            while (y <= end && arr[y] !== 'm') {
                a.push(arr[++y])
            }
            if (flagReg.test(a.join(''))) {
                i = y + 1
            }
        }
        newArr.push(arr[i])
    }
    return newArr.join('')
}