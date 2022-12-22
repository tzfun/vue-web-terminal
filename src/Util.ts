/**
 * 将空格、回车、Tab转译为html
 *
 * @param str
 * @returns {*|string}
 * @private
 */
export function _html(str: string) {
  return String(str)
    .replace(/&(?!\w+;)/g, "&amp;")
    .replace(/ /g, "&nbsp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/\n/g, "<br>")
    .replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;")
}

/**
 * 判断一个对象是否为逻辑上的空
 */
export function _isEmpty<T>(value: T): boolean {
  return (
    !value ||
    (typeof value === "string" && value.trim().length === 0) ||
    (typeof value === "object" && Object.keys(value).length === 0)
  )
}

export function _nonEmpty<T>(value: T): boolean {
  return !_isEmpty(value)
}

const unHtmlReplaceMap = new Map<string, string>(
  Object.entries({
    "<": "&lt;",
    '"': "&quot;",
    ">": "&gt;",
    "'": "&#39;",
  })
)

/**
 * 将字符串中的html标签转译
 *
 * @param str
 * @returns {*|string}
 * @private
 */
export function _unHtml(str?: string): string {
  return str
    ? str.replace(/[<">']/g, (a: string): string => {
        return unHtmlReplaceMap.get(a) ?? ""
      })
    : ""
}

export function _sleep(time: number) {
  return new Promise((resolve) => setTimeout(resolve, time))
}

export function _screenType(width = document.body.clientWidth) {
  return {
    xs: width < 600,
    sm: width >= 600 && width < 960,
    md: width >= 960 && width < 1264,
    lg: width >= 1264 && width < 1904,
    xl: width >= 1904,
  }
}

/**
 * 获取字符的字节长度
 */
export function _getByteLen(char: string) {
  let len = 0
  for (let i = 0; i < char.length; i++) {
    // eslint-disable-next-line no-control-regex
    if (char[i].match(/[^\x00-\xff]/gi))
      //  全角
      len += 2 //    如果是全角，占用两个字节
    else len += 1 //   半角占用一个字节
  }
  return len
}

/**
 * 获取两个连续字符串的不同部分
 */
export function _getStrDifferent(one: string, two: string): string {
  if (one === two) {
    return ""
  }
  let i = 0,
    j = 0
  const longOne = one.length > two.length ? one : two
  const shortOne = one.length > two.length ? two : one

  let diff = "",
    nextChar = ""
  let hasDiff = false
  while (i < shortOne.length || j < longOne.length) {
    if (shortOne[i] === longOne[j]) {
      if (hasDiff) {
        break
      }
      i++
      j++
    } else {
      if (i < shortOne.length - 1) {
        nextChar = shortOne[i + 1]
      }
      if (longOne[j] === nextChar || j >= longOne.length) {
        break
      } else {
        diff += longOne[j]
      }
      j++
      hasDiff = true
    }
  }
  return diff
}
