import { _isSafari } from "@/Util"
import { useFullscreen } from "@vueuse/core"
import type { Ref } from "vue"

type SafariStyleCache = {
  position: string
  width: string
  height: string
  left: string
  top: string
}

const defaultFullScreenStyle = {
  position: "fixed",
  width: "100%",
  height: "100%",
  left: "0",
  top: "0",
}

export function useTerminalFullscreen(fullArea: Ref<HTMLDivElement | undefined>) {
  const { isFullscreen: fullscreen, toggle: toggleFullscreen } = useFullscreen()
  useFullscreenLifecycle(fullscreen, fullArea)
  return {
    fullscreen,
    toggleFullscreen,
  }
}

export function useFullscreenLifecycle(fullscreen: Ref<boolean>, fullArea: Ref<HTMLDivElement | undefined>) {
  let safariStyleCache: SafariStyleCache = { ...defaultFullScreenStyle }
  const container = fullArea.value

  watchEffect(() => {
    if (fullscreen.value) {
      if (!container) {
        return
      }
      //  进入全屏
      if (_isSafari()) {
        safariStyleCache = {
          position: container.style.position,
          width: container.style.width,
          height: container.style.height,
          left: container.style.left,
          top: container.style.top,
        }
        container.style.position = defaultFullScreenStyle.position
        container.style.width = defaultFullScreenStyle.width
        container.style.height = defaultFullScreenStyle.height
        container.style.left = defaultFullScreenStyle.left
        container.style.top = defaultFullScreenStyle.top
      }
    } else {
      if (!container) {
        return
      }
      if (_isSafari()) {
        container.style.position = safariStyleCache.position
        container.style.width = safariStyleCache.width
        container.style.height = safariStyleCache.height
        container.style.left = safariStyleCache.left
        container.style.top = safariStyleCache.top
      }
    }
  })
}
