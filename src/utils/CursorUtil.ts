import { _getByteLen } from '../Util'

export interface CursorPos {
  width: number
  left: number
  top: number
}

export interface ByteLen {
  en: number
  cn: number
}

function calculateCursorPos(command: string, index: number, lineWidth: number, defaultWidth: number, defaultPreWidth: number, byteLen: ByteLen): CursorPos {
  const pos = { left: 0, top: 0 }
  //  当前字符长度
  let charWidth = defaultWidth
  //  前一个字符的长度
  let preWidth = defaultPreWidth

  //  先找到被覆盖字符的位置
  for (let i = 0; i <= index; i++) {
    charWidth = calculateStringWidth(command[i], byteLen)
    pos.left += preWidth
    preWidth = charWidth
    if (pos.left > lineWidth) {
      //  行高是20px
      pos.top += 20
      pos.left = charWidth
    }
  }
  return {
    width: charWidth,
    ...pos,
  }
}

function calculateStringWidth(str: string, byteLen: { en: number; cn: number }): number {
  let width = 0
  for (const char of str)
    width += _getByteLen(char) === 1 ? byteLen.en : byteLen.cn

  return width
}

export {
  calculateCursorPos,
}
