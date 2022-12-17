import { DragableConfType } from "@/models/DraggableInterface";
import { _isSafari } from "@/Util";
import { onMounted, Ref } from "vue";

export const getDragStyle = (dragConf: DragableConfType) => {
  let clientWidth = document.body.clientWidth;
  let clientHeight = document.body.clientHeight;

  let confWidth = dragConf.width;
  let width = confWidth == null ? 700 : confWidth;

  if (confWidth && typeof confWidth === "string" && confWidth.endsWith("%")) {
    width = clientWidth * (parseInt(confWidth) / 100);
  }
  let confHeight = dragConf.height;
  let height = confHeight == null ? 500 : confHeight;
  if (
    confHeight &&
    typeof confHeight === "string" &&
    confHeight.endsWith("%")
  ) {
    height = clientHeight * (parseInt(confHeight) / 100);
  }

  let zIndex = dragConf.zIndex ? dragConf.zIndex : 100;

  let initX, initY;

  let initPos = dragConf.init;
  if (initPos && initPos.x && initPos.y) {
    initX = initPos.x;
    initY = initPos.y;
  } else {
    initX = (clientWidth - (width as number)) / 2;
    initY = (clientHeight - (height as number)) / 2;
  }
  return `position:fixed;
        width:${width}px;
        height:${height}px;
        z-index: ${zIndex};
        left:${initX}px;
        top:${initY}px;
        border-radius:15px;
        `;
};

/**
 * 处理全屏事件 - 不再支持IE11
 *
 * @param fullscreen
 * @param fullArea
 */
export const useToggleFullscreen = (
  fullscreen: Ref<boolean>,
  fullArea: Ref<HTMLDivElement | undefined>
) => {
  useFullscreenLifecycle(fullscreen, fullArea);
  return () => {
    if (fullscreen.value) {
      document.exitFullscreen();
    } else {
      fullArea.value?.requestFullscreen();
    }
    fullscreen.value = !fullscreen.value;
  };
};

const useFullscreenLifecycle = (
  fullscreen: Ref<boolean>,
  fullArea: Ref<HTMLDivElement | undefined>
) => {
  // TODO 考虑用成熟的全屏库实现, 例如 vueuse
  onMounted(() => {
    let safariStyleCache = {};
    //  监听全屏事件，用户ESC退出时需要设置全屏状态
    [
      "fullscreenchange",
      "webkitfullscreenchange",
      "mozfullscreenchange",
    ].forEach((item) => {
      window.addEventListener(item, () => {
        let isFullScreen = document.fullscreenElement;
        if (isFullScreen) {
          let container = fullArea.value;
          if (!container) {
            return;
          }
          //  进入全屏
          if (_isSafari()) {
            safariStyleCache = {
              position: container.style.position,
              width: container.style.width,
              height: container.style.height,
              left: container.style.left,
              top: container.style.top,
            };
            container.style.position = "fixed";
            container.style.width = "100%";
            container.style.height = "100%";
            container.style.left = "0";
            container.style.top = "0";
          }
        } else {
          //  退出全屏
          fullscreen.value = false;
          let container = fullArea.value;
          if (!container) {
            return;
          }
          if (_isSafari()) {
            container.style.position = safariStyleCache.position;
            container.style.width = safariStyleCache.width;
            container.style.height = safariStyleCache.height;
            container.style.left = safariStyleCache.left;
            container.style.top = safariStyleCache.top;
          }
        }
      });
    });
  });
};

export const initDrag = (draggable: boolean,
  terminalHeader: Ref<HTMLDivElement>
  
  ) => {
  // TODO 后续用成熟的拖动库实现
  if (!draggable) {
    return;
  }
  // 记录当前鼠标位置
  let mouseOffsetX = 0;
  let mouseOffsetY = 0;

  let dragArea = this.terminalHeader;
  let box = this.terminalContainer;
  let window = this.terminalWindow;

  let isDragging = false;

  dragArea.onmousedown = (e1) => {
    if (this.fullscreen) {
      return;
    }
    let e = e1 || window.event;
    mouseOffsetX = e.clientX - box.offsetLeft;
    mouseOffsetY = e.clientY - box.offsetTop;

    isDragging = true;
    window.style["user-select"] = "none";
  };

  document.onmousemove = (e2) => {
    if (isDragging) {
      let e = e2 || window.event;
      let moveX = e.clientX - mouseOffsetX;
      let moveY = e.clientY - mouseOffsetY;
      this._dragging(moveX, moveY);
    }
  };

  document.onmouseup = () => {
    isDragging = false;
    window.style["user-select"] = "unset";
  };
};

export const dragging = (x: number, y: number) => {
  let clientWidth = document.body.clientWidth;
  let clientHeight = document.body.clientHeight;
  let box = this.terminalContainer;

  if (x > clientWidth - box.clientWidth) {
    box.style.left = clientWidth - box.clientWidth + "px";
  } else {
    box.style.left = Math.max(0, x) + "px";
  }

  if (y > clientHeight - box.clientHeight) {
    box.style.top = clientHeight - box.clientHeight + "px";
  } else {
    box.style.top = Math.max(0, y) + "px";
  }
};

export const getSelection = () => {
  if (window.getSelection) {
    return window.getSelection();
  } else {
    return document.getSelection();
  }
};
