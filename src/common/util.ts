import {ScreenType} from "~/types";

/**
 * 将空格、回车、Tab转译为html
 *
 * @param str
 * @returns {*|string}
 * @private
 */
export function _html(str: string): string {
    return String(str)
        .replace(/&(?!\w+;)/g, '&amp;')
        .replace(/ /g, '&nbsp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
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

export function _sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

export function _screenType(width: number = document.body.clientWidth): ScreenType {
    let result: ScreenType = {}
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
    return result as ScreenType
}

export function _isSafari() {
    return /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)
}

export function _getByteLen(val) {
    let len = 0;
    for (let i = 0; i < val.length; i++) {
        // eslint-disable-next-line no-control-regex
        if (val[i].match(/[^\x00-\xff]/ig) != null) //全角
            len += 2; //如果是全角，占用两个字节
        else len += 1; //半角占用一个字节
    }
    return len;
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

export function _eventOn(dom: Document | Window, eventName: string, handler: EventListenerOrEventListenerObject) {
    dom && dom.addEventListener && dom.addEventListener(eventName, handler);
}

export function _eventOff(dom: Document | Window, eventName: string, handler: EventListenerOrEventListenerObject) {
    dom && dom.removeEventListener && dom.removeEventListener(eventName, handler);
}

export function _getClipboardText(): Promise<string> {
    if (navigator && navigator.clipboard) {
        return navigator.clipboard.readText();
    } else {
        return new Promise((resolve, reject) => {
            try {
                let pasteTarget = document.createElement("div");
                pasteTarget.contentEditable = "true";
                let actElem = document.activeElement.appendChild(pasteTarget).parentNode;
                pasteTarget.focus();
                //  可能会失败
                document.execCommand("paste")
                let paste = pasteTarget.innerText;
                actElem.removeChild(pasteTarget);
                resolve(paste)
            } catch (e) {
                reject(e)
            }
        })
    }
}

export function _copyTextToClipboard(text): Promise<any> {
    if (!text) {
        return
    }
    text = text.replace(/nbsp;/g, ' ')
    if (navigator && navigator.clipboard) {
        return navigator.clipboard.writeText(text)
    } else {
        let textArea = document.createElement("textarea")
        textArea.value = text
        textArea.style.position = "absolute"
        textArea.style.opacity = "0"
        textArea.style.left = "-999999px"
        textArea.style.top = "-999999px"
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        document.execCommand('copy')
        textArea.remove()
        return Promise.resolve()
    }
}

export function _pointInRect(point, rect) {
    const {x, y} = point;
    const dx = rect.x, dy = rect.y, width = rect.width, height = rect.height;
    return x >= dx && x <= dx + width && y >= dy && y <= dy + height;
}

export function _getSelection() {
    if (window.getSelection) {
        return window.getSelection()
    } else {
        return document.getSelection()
    }
}

export function _parseToJson(obj) {
    if (typeof obj === 'object' && obj) {
        return obj;
    } else if (typeof obj === 'string') {
        try {
            return JSON.parse(obj);
        } catch (e) {
            return obj;
        }
    }
}

export function _openUrl(url: string, pushMessage: Function) {
    let match = /^((http|https):\/\/)?(([A-Za-z0-9]+-[A-Za-z0-9]+|[A-Za-z0-9]+)\.)+([A-Za-z]+)[/?:]?.*$/;
    if (match.test(url)) {
        if (!url.startsWith("http") && !url.startsWith("https")) {
            window.open(`http://${url}`)
        } else {
            window.open(url);
        }
    } else {
        pushMessage({
            class: 'error',
            type: 'normal',
            content: "Invalid website url"
        })
    }
}

/**
 * 默认命令行样式格式化实现
 *
 * @param cmd
 * @return {string}
 * @private
 */
export function _defaultCommandFormatter(cmd: string): string {
    //  过滤ASCII 160的空白字符串
    let split = cmd.replace(/\xA0/g, " ").split(" ")
    let formatted = ''
    let isCmdKey = true

    for (let i = 0; i < split.length; i++) {
        let char = _html(split[i])
        if (isCmdKey) {
            formatted += `<span class='t-cmd-key'>${char}</span>`
            isCmdKey = false
        } else if (char.startsWith("-")) {
            formatted += `<span class="t-cmd-arg">${char}</span>`
        } else if (char.length > 0) {
            if (char === '|') {
                isCmdKey = true
                formatted += `<span>${char}</span>`
            } else {
                formatted += '<span>'
                let startNewCmdKey = false
                const charArr: string[] = [...char];
                charArr.forEach((ch, index) => {
                    if (ch === ',') {
                        formatted += `<span class="t-cmd-splitter">${ch}</span>`
                    } else if (ch === '|') {
                        formatted += ch

                        isCmdKey = true
                        if (index < char.length - 1) {
                            formatted += `<span class='t-cmd-key'>`
                            startNewCmdKey = true
                        }
                    } else {
                        formatted += ch
                    }
                    if (index == charArr.length - 1 && ch != '|') {
                        isCmdKey = false
                    }
                });

                formatted += '</span>'
                if (startNewCmdKey) {
                    formatted += '</span>'
                }
            }
        }
        if (i < split.length - 1) {
            formatted += "<span>&nbsp;</span>"
        }
    }

    return formatted
}

/**
 * 判断一个Dom A是否是另一个Dom B的孩子节点
 *
 * @param target    目标Dom，A
 * @param parent    父级Dom，B
 * @param clazz     中断类，当检索到当前节点拥有这个 class 时就中断搜索，用于优化处理，避免搜索整个Dom树
 * @return {boolean}
 * @private
 */
export function _isParentDom(target, parent, clazz = null) {
    while (target) {
        if (target === parent) {
            return true;
        }

        if (clazz && target.classList.contains(clazz)) {
            break
        }
        target = target.parentElement
    }
    return false;
}

export function _isPhone() {
    let info = navigator.userAgent;
    if (info) {
        return /mobile/i.test(info)
    }
    let screen: ScreenType = _screenType()
    return screen.xs || screen.sm
}

export function _isPad() {
    let info = navigator.userAgent;
    if (info) {
        return /pad/i.test(info)
    }
    return _screenType().sm
}
