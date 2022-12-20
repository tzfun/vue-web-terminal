import { onMounted, onUnmounted } from "vue"

export function useKeydownListener(onKeydown: (e: KeyboardEvent) => void) {
  // TODO vueuse中是否可替换
  onMounted(() => {
    window.addEventListener("keydown", onKeydown)
  })
  onUnmounted(() => {
    window.removeEventListener("keydown", onKeydown)
  })
}

export function useFullscreenListener(handler: () => void) {
  onMounted(() => {
    [
      "fullscreenchange",
      "webkitfullscreenchange",
      "mozfullscreenchange",
    ].forEach((item) => {
      window.addEventListener(item, handler)
    })
  })
  onUnmounted(() => {
    [
      "fullscreenchange",
      "webkitfullscreenchange",
      "mozfullscreenchange",
    ].forEach((item) => {
      window.removeEventListener(item, handler)
    })
  })
}
