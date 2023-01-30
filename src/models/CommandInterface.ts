export interface CommandType {
  key: string
  title: string
  group: string
  usage: string
  description: string
  example: Array<{
    cmd: string
    des?: string
  }>
}

export interface CursorConfType {
  defaultWidth: number
  width: number
  left: 'unset' | number
  top: 'unset' | number
  idx: number //  从0开始
  show: boolean
}
