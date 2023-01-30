/**
 * 消息
 *
 * 当 type 为 table 时 content 的格式：
 * {
 *     head: [headName1, headName2, headName3...],
 *     rows: [
 *         [ value1, value2, value3... ],
 *         [ value1, value2, value3... ]
 *     ]
 * }
 */
export interface MessageType {
  /** 当前时间 */
  time?: any
  /** 类别 */
  class?: 'success' | 'error' | 'system' | 'info' | 'warning'
  /** 类型 */
  type?: 'normal' | 'json' | 'code' | 'table' | 'cmdLine' | 'splitLine' | 'html'
  /** 具体内容，不同消息内容格式不一样 */
  content: any
  /** 标签，仅类型为normal有效 */
  tag?: any
  /** json viewer depth */
  depth?: number
}

export interface TableContentType {
  head: string[]
  rows: any[][]
}
