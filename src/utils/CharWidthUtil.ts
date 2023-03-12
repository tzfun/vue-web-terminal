import { DataConstant } from '@/constants/TerminalConstants'

export function useFlagWidth() {
  const terminalEnFlag = ref<HTMLSpanElement>()
  const terminalCnFlag = ref<HTMLSpanElement>()
  const byteLen = reactive(DataConstant.ByteLen)
  const updateByteLen = () => {
    if (terminalEnFlag.value && terminalEnFlag.value.getBoundingClientRect().width)
      byteLen.en = terminalEnFlag.value.getBoundingClientRect().width / 2

    if (terminalCnFlag.value && terminalCnFlag.value.getBoundingClientRect().width)
      byteLen.cn = terminalCnFlag.value.getBoundingClientRect().width / 2
  }
  onMounted(updateByteLen)
  // 使用ref访问dom不是响应式的, 因此应使用onUpdated
  onUpdated(updateByteLen)
  return { byteLen, terminalEnFlag, terminalCnFlag }
}

export function usePromptSize() {
  const terminalInputPrompt = ref<HTMLSpanElement>()
  const inputPromptSize = reactive({
    width: 0,
    height: 0,
  })
  const updateInputBoxSize = () => {
    if (terminalInputPrompt.value) {
      //  计算context的宽度和行高，用于跨行时定位光标位置
      const promptRect = terminalInputPrompt.value.getBoundingClientRect()
      inputPromptSize.height = promptRect.height
      inputPromptSize.width = promptRect.width
    }
  }
  onMounted(updateInputBoxSize)
  onUpdated(updateInputBoxSize)
  return { inputPromptSize, terminalInputPrompt }
}
