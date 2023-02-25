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

export function on(dom, eventName, handler) {
    dom && dom.addEventListener && dom.addEventListener(eventName, handler);
}

export function off(dom, eventName, handler) {
    dom && dom.removeEventListener && dom.removeEventListener(eventName, handler);
}

export function getClipboardText() {
    if (navigator && navigator.clipboard) {
        return navigator.clipboard.readText();
    }
    return null;
}

export function pointInRect(point, rect) {
    const { x, y } = point;
    const dx = rect.x, dy = rect.y, width = rect.width, height = rect.height;
    return x >= dx && x <= dx + width && y >= dy && y <= dy + height;
}
