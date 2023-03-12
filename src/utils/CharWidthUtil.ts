import { DataConstant } from '@/constants/TerminalConstants'

export function useFlagWidth() {
  const terminalEnFlag = ref<HTMLSpanElement>()
  const terminalCnFlag = ref<HTMLSpanElement>()
  const byteLen = reactive(DataConstant.ByteLen)
  const updateByteLen = () => {
    if (terminalEnFlag.value && terminalEnFlag.value.clientWidth)
      byteLen.en = terminalEnFlag.value.clientWidth / 2

    if (terminalCnFlag.value && terminalCnFlag.value.clientWidth)
      byteLen.cn = terminalCnFlag.value.clientWidth / 2
  }
  onMounted(updateByteLen)
  // 使用ref访问dom不是响应式的, 因此应使用onUpdated
  onUpdated(updateByteLen)
  return { byteLen, terminalEnFlag, terminalCnFlag }
}
