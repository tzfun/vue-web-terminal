import { useDraggable } from "@vueuse/core"
import { Ref, StyleValue, watchEffect } from "vue"
import { DragableConf } from "@/models/DraggableInterface"
import { _isSafari } from "@/Util"
import { useFullscreenListener } from "./ListenerUtil"

function getLengthStyle(length?: number | string): string | undefined {
  if (typeof length === "number") {
    return `${length}px`
  }
  return length
}

export function getDragStyle(dragConf: DragableConf): StyleValue {
  const width = getLengthStyle(dragConf.width) ?? 700
  const height = getLengthStyle(dragConf.height) ?? 500
  const zIndex = dragConf.zIndex ? dragConf.zIndex : 100

  const clientWidth = document.body.clientWidth
  const clientHeight = document.body.clientHeight
  const initPos = dragConf.init
  const initX = getLengthStyle(initPos?.x ?? (clientWidth - (dragConf.width as number)) / 2)
  const initY = getLengthStyle(initPos?.y ?? (clientHeight - (dragConf.height as number)) / 2)
  return {
    position: "fixed",
    width,
    height,
    zIndex,
    left: initX,
    top: initY,
    borderRadius: "15px",
  }
}

/**
 * 处理全屏事件 - 不再支持IE11
 *
 * @param fullscreen
 * @param fullArea
 */
export function useToggleFullscreen(fullscreen: Ref<boolean>, fullArea: Ref<HTMLDivElement | undefined>) {
  useFullscreenLifecycle(fullscreen, fullArea)
  return () => {
    if (fullscreen.value) {
      document.exitFullscreen()
    } else {
      fullArea.value?.requestFullscreen()
    }
    fullscreen.value = !fullscreen.value
  }
}

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

export function useFullscreenLifecycle(fullscreen: Ref<boolean>, fullArea: Ref<HTMLDivElement | undefined>) {
  // TODO 考虑用成熟的全屏库实现, 例如 vueuse
  let safariStyleCache: SafariStyleCache = { ...defaultFullScreenStyle }
  useFullscreenListener(() => {
    const isFullScreen = document.fullscreenElement
    if (isFullScreen) {
      const container = fullArea.value
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
      //  退出全屏
      fullscreen.value = false
      const container = fullArea.value
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

export function useDrag(
  draggable: boolean,
  fullscreenRef: Ref<boolean>,
  terminalHeader: Ref<HTMLDivElement | undefined>,
  terminalContainer: Ref<HTMLDivElement | undefined>,
  dragConf?: DragableConf
) {
  if (!draggable) {
    return
  }
  if (fullscreenRef.value) {
    return
  }
  const { x, y } = useDraggable(terminalHeader, {
    initialValue: {
      x: dragConf?.init?.x ?? 500,
      y: dragConf?.init?.y ?? 400,
    },
    preventDefault: true,
  })
  watchEffect(() => {
    // 拖动标题栏时同步窗口位置
    dragging(x.value, y.value, terminalContainer.value)
  })
}

export function dragging(x: number, y: number, terminalContainer: HTMLDivElement | undefined) {
  const clientWidth = document.body.clientWidth
  const clientHeight = document.body.clientHeight
  const box = terminalContainer
  if (!box) {
    return
  }
  if (x > clientWidth - box.clientWidth) {
    box.style.left = clientWidth - box.clientWidth + "px"
  } else {
    box.style.left = Math.max(0, x) + "px"
  }

  if (y > clientHeight - box.clientHeight) {
    box.style.top = clientHeight - box.clientHeight + "px"
  } else {
    box.style.top = Math.max(0, y) + "px"
  }
}

export function getSelection() {
  if (window.getSelection) {
    return window.getSelection()
  } else {
    return document.getSelection()
  }
}
