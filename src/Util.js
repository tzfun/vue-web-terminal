export function _dateFormat(fmt, date) {
    let ret;
    const opt = {
        "Y+": date.getFullYear().toString(),        // 年
        "m+": (date.getMonth() + 1).toString(),     // 月
        "d+": date.getDate().toString(),            // 日
        "H+": date.getHours().toString(),           // 时
        "M+": date.getMinutes().toString(),         // 分
        "S+": date.getSeconds().toString()          // 秒
    };
    for (let k in opt) {
        ret = new RegExp("(" + k + ")").exec(fmt);
        if (ret) {
            fmt = fmt.replace(ret[1], (ret[1].length === 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
        }
    }
    return fmt;
}

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