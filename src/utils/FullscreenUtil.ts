import { useFullscreen } from '@vueuse/core'
import type { CSSProperties, Ref } from 'vue'
import { fullScreenStyle } from './ContainerUtil'

export function useTerminalFullscreen() {
  const { isFullscreen: fullscreen, toggle: toggleFullscreen } = useFullscreen()
  return {
    fullscreen,
    toggleFullscreen,
  }
}

export function useUpdateFullscreenStyle(fullscreen: Ref<boolean>, containerStyle: Ref<CSSProperties>) {
  const styleCache = ref<CSSProperties>()

  watchEffect(() => {
    if (fullscreen.value) {
      //  进入全屏
      styleCache.value = {
        ...containerStyle.value,
      }
      containerStyle.value = {
        ...containerStyle.value,
        ...fullScreenStyle,
      }
    }
    else {
      containerStyle.value = { ...styleCache.value }
    }
  })
}
