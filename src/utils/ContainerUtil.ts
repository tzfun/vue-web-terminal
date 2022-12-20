import { DragableConf } from "@/models/DraggableInterface"
import { _isSafari } from "@/Util"
import { Ref } from "vue"
import { useFullscreenListener } from "./ListenerUtil"

export function getDragStyle(dragConf: DragableConf) {
  const clientWidth = document.body.clientWidth
  const clientHeight = document.body.clientHeight

  const confWidth = dragConf.width
  let width = confWidth ?? 700

  if (confWidth && typeof confWidth === "string" && confWidth.endsWith("%")) {
    width = clientWidth * (parseInt(confWidth) / 100)
  }
  const confHeight = dragConf.height
  let height = confHeight ?? 500
  if (
    confHeight &&
    typeof confHeight === "string" &&
    confHeight.endsWith("%")
  ) {
    height = clientHeight * (parseInt(confHeight) / 100)
  }

  const zIndex = dragConf.zIndex ? dragConf.zIndex : 100

  let initX, initY

  const initPos = dragConf.init
  if (initPos && initPos.x && initPos.y) {
    initX = initPos.x
    initY = initPos.y
  } else {
    initX = (clientWidth - (width as number)) / 2
    initY = (clientHeight - (height as number)) / 2
  }
  return `position:fixed;
        width:${width}px;
        height:${height}px;
        z-index: ${zIndex};
        left:${initX}px;
        top:${initY}px;
        border-radius:15px;
        `
}

/**
 * 处理全屏事件 - 不再支持IE11
 *
 * @param fullscreen
 * @param fullArea
 */
export function useToggleFullscreen(
  fullscreen: Ref<boolean>,
  fullArea: Ref<HTMLDivElement | undefined>
) {
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
  position: string;
  width: string;
  height: string;
  left: string;
  top: string;
};

const defaultFullScreenStyle = {
  position: "fixed",
  width: "100%",
  height: "100%",
  left: "0",
  top: "0",
}

export function useFullscreenLifecycle(
  fullscreen: Ref<boolean>,
  fullArea: Ref<HTMLDivElement | undefined>
) {
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

export function initDrag(
  draggable: boolean,
  fullscreenRef: Ref<boolean>,
  terminalHeader: HTMLDivElement,
  terminalContainer: HTMLDivElement,
  terminalWindow: HTMLDivElement
) {
  // TODO 考虑用成熟的拖动库实现
  if (!draggable) {
    return
  }
  // 记录当前鼠标位置
  let mouseOffsetX = 0
  let mouseOffsetY = 0

  const dragArea = terminalHeader
  const box = terminalContainer

  let isDragging = false

  dragArea.onmousedown = (e1) => {
    if (fullscreenRef.value) {
      return
    }
    const e = e1 || window.event
    mouseOffsetX = e.clientX - box.offsetLeft
    mouseOffsetY = e.clientY - box.offsetTop

    isDragging = true
    terminalWindow.style.userSelect = "none"
  }

  document.onmousemove = (e2) => {
    if (isDragging) {
      const e = e2 || window.event
      const moveX = e.clientX - mouseOffsetX
      const moveY = e.clientY - mouseOffsetY
      dragging(moveX, moveY, terminalContainer)
    }
  }

  document.onmouseup = () => {
    isDragging = false
    terminalWindow.style.userSelect = "unset"
  }
}

export function dragging(
  x: number,
  y: number,
  terminalContainer: HTMLDivElement
) {
  const clientWidth = document.body.clientWidth
  const clientHeight = document.body.clientHeight
  const box = terminalContainer

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
