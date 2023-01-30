import { useDraggable } from '@vueuse/core'
import type { CSSProperties, Ref } from 'vue'
import type { DragableConf } from '@/models/DraggableInterface'

function getLengthStyle(length?: number | string): string | undefined {
  if (typeof length === 'number')
    return `${length}px`

  return length
}

export function getDragStyle(dragConf: DragableConf): CSSProperties {
  const width = getLengthStyle(dragConf.width) ?? 700
  const height = getLengthStyle(dragConf.height) ?? 500
  const zIndex = dragConf.zIndex ? dragConf.zIndex : 100

  const clientWidth = document.body.clientWidth
  const clientHeight = document.body.clientHeight
  const initPos = dragConf.init
  const initX = getLengthStyle(initPos?.x ?? (clientWidth - (dragConf.width as number)) / 2)
  const initY = getLengthStyle(initPos?.y ?? (clientHeight - (dragConf.height as number)) / 2)
  return {
    position: 'fixed',
    width,
    height,
    zIndex,
    left: initX,
    top: initY,
    borderRadius: '15px',
  }
}

export function useDrag(
  draggable: boolean,
  fullscreenRef: Ref<boolean>,
  terminalHeader: Ref<HTMLDivElement | undefined>,
  terminalContainer: Ref<HTMLDivElement | undefined>,
  dragConf?: DragableConf,
) {
  if (!draggable)
    return

  if (fullscreenRef.value)
    return

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
  if (!box)
    return

  if (x > clientWidth - box.clientWidth)
    box.style.left = `${clientWidth - box.clientWidth}px`

  else
    box.style.left = `${Math.max(0, x)}px`

  if (y > clientHeight - box.clientHeight)
    box.style.top = `${clientHeight - box.clientHeight}px`

  else
    box.style.top = `${Math.max(0, y)}px`
}

export function getSelection() {
  if (window.getSelection)
    return window.getSelection()

  else
    return document.getSelection()
}
