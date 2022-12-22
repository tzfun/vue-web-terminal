export function useKeydownListener(onKeydown: (e: KeyboardEvent) => void) {
  // TODO vueuse中是否可替换
  onMounted(() => {
    window.addEventListener("keydown", onKeydown)
  })
  onUnmounted(() => {
    window.removeEventListener("keydown", onKeydown)
  })
}
