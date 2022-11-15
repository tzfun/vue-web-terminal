<template>
  <div class="t-container"
       :style="_draggable() ? _getDragStyle() : 'width:100%;height:100%;border-radius:0;'"
       ref="container">
    <div class="t-header-container" ref="header" v-if="showHeader"
         :style="`${(_draggable() ? 'cursor: move;' : '')}height:${domStyle.headerHeight};`">
      <slot name="header" :title="title">
        <THeader :title="title" :headerHeight="domStyle.headerHeight"></THeader>
      </slot>
    </div>
    <div class="t-window"
         :style="_getWindowStyle()"
         ref="window"
         @click="$emit('clickWindow')">
      <slot name="window"></slot>
    </div>
  </div>
</template>

<script>
import {containerProps} from "@/components/TProps";
import THeader from "@/components/THeader";
import TerminalApi from "@/components/terminal/TerminalApi";
import {_isSafari} from "@/tools/Util";
import ShellApi from "@/components/shell/ShellApi";

export default {
  name: "TContainer",
  components: {THeader},
  props: containerProps,
  data() {
    return {
      fullscreen: false,
      domStyle: {
        headerHeight: 30,
        windowPaddingTopAndDown: 0,
        windowPaddingLeftAndRight: 8,
        windowLineHeight: 20,
        windowScrollWidth: 8,
        shellCharWidth: {
          en: 8,
          cn: 13
        }
      },
      windowPadding: {
        top: 0,
        left: 8
      },
    }
  },
  created() {
    let listener = {
      fullscreen: () => {
        this._fullscreen()
      },
      isFullscreen: () => {
        return this.fullscreen
      },
      dragging: options => {
        if (this._draggable()) {
          this._dragging(options.x, options.y)
        } else {
          console.warn("Terminal is not draggable")
        }
      },
      elementInfo: () => {
        let windowEle = this.$refs.window
        let windowRect = windowEle.getBoundingClientRect()
        let containerRect = this.$refs.container.getBoundingClientRect()
        // let hasScroll = windowEle.scrollHeight > windowEle.clientHeight || windowEle.offsetHeight > windowEle.clientHeight
        return {
          //  窗口所在位置
          pos: this._getPosition(),
          //  窗口整体宽度
          screenWidth: containerRect.width,
          //  窗口整体高度
          screenHeight: containerRect.height,
          //  可显示内容范围高度，减去padding值
          clientWidth: windowRect.width - this.domStyle.windowPaddingLeftAndRight * 2,
          //  可显示内容范围高度
          clientHeight: windowRect.height,
          //  兼容旧版本
          charWidth: this.terminal ? this.$parent._getCharWidth() : null
        }
      }
    }
    if (this.terminal) {
      TerminalApi.register(this.name, listener)
    }
    if (this.shell) {
      ShellApi.register(this.name, listener)
    }
  },
  mounted() {
    let safariStyleCache = {};
    //  监听全屏事件，用户ESC退出时需要设置全屏状态
    ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange'].forEach((item) => {
      window.addEventListener(item, () => {
        let isFullScreen = document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen || document.fullscreenElement;
        if (isFullScreen) {
          //  进入全屏
          if (_isSafari()) {
            let container = this.$refs.container
            safariStyleCache = {
              position: container.style.position,
              width: container.style.width,
              height: container.style.height,
              left: container.style.left,
              top: container.style.top
            }
            container.style.position = 'fixed'
            container.style.width = '100%'
            container.style.height = '100%'
            container.style.left = '0'
            container.style.top = '0'
          }
        } else {
          //  退出全屏
          this.fullscreen = false
          if (_isSafari()) {
            let container = this.$refs.container
            container.style.position = safariStyleCache.position
            container.style.width = safariStyleCache.width
            container.style.height = safariStyleCache.height
            container.style.left = safariStyleCache.left
            container.style.top = safariStyleCache.top
          }
        }
        this.$emit('onFullscreenSwitch')
      });
    })
    this._initDrag()
  },
  methods: {
    _getPosition() {
      if (this._draggable()) {
        let box = this.$refs.container
        return {x: parseInt(box.style.left), y: parseInt(box.style.top)}
      } else {
        return {x: 0, y: 0}
      }
    },
    _triggerClick(key) {
      if (key === 'fullScreen' && !this.fullscreen) {
        this._fullscreen()
      } else if (key === 'minScreen' && this.fullscreen) {
        this._fullscreen()
      }
      this.$parent._triggerClick(key)
    },
    _jumpToBottom() {
      this.$nextTick(() => {
        let box = this.$refs.window
        if (box != null) {
          box.scrollTo({top: box.scrollHeight, behavior: 'smooth'})
        }
      })
    },
    _draggable() {
      return this.showHeader && this.dragConf
    },
    _getDragStyle() {
      let clientWidth = document.body.clientWidth
      let clientHeight = document.body.clientHeight

      let confWidth = this.dragConf.width
      let width = 0
      if (this.dragConf.col > 0) {
        width = this.dragConf.col * this.domStyle.shellCharWidth.en + this.domStyle.windowPaddingLeftAndRight * 2
      } else {
        width = confWidth == null ? 700 : confWidth
        if (confWidth && typeof confWidth === 'string' && confWidth.endsWith("%")) {
          width = clientWidth * (parseInt(confWidth) / 100)
        }
      }

      let confHeight = this.dragConf.height
      let height
      if (this.dragConf.row > 0) {
        height = this.dragConf.row * this.domStyle.windowLineHeight + this.domStyle.windowPaddingTopAndDown * 2 + this.domStyle.headerHeight
      } else {
        height = confHeight == null ? 500 : confHeight
        if (confHeight && typeof confHeight === 'string' && confHeight.endsWith("%")) {
          height = clientHeight * (parseInt(confHeight) / 100)
        }
      }

      let zIndex = this.dragConf.zIndex ? this.dragConf.zIndex : 100

      let initX, initY

      let initPos = this.dragConf.init
      if (initPos && initPos.x && initPos.y) {
        initX = initPos.x
        initY = initPos.y
      } else {
        initX = (clientWidth - width) / 2
        initY = (clientHeight - height) / 2
      }
      return `position:fixed;
            width:${width}px;
            height:${height}px;
            z-index: ${zIndex};
            left:${initX}px;
            top:${initY}px;
            border-radius:15px;
            `
    },
    _getWindowStyle() {
      let style = `padding:${this.domStyle.windowPaddingTopAndDown}px ${this.domStyle.windowPaddingLeftAndRight}px;line-height:${this.domStyle.windowLineHeight}px;`
      if (this.showHeader) {
        style += `height:calc(100% - ${this.domStyle.headerHeight}px);margin-top: ${this.domStyle.headerHeight}px;`
      } else {
        style += 'height:100%;'
      }
      return style
    },
    _fullscreen() {
      let fullArea = this.$refs.container
      if (this.fullscreen) {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitCancelFullScreen) {
          document.webkitCancelFullScreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      } else {
        if (fullArea.requestFullscreen) {
          fullArea.requestFullscreen();
        } else if (fullArea.webkitRequestFullScreen) {
          fullArea.webkitRequestFullScreen();
        } else if (fullArea.mozRequestFullScreen) {
          fullArea.mozRequestFullScreen();
        } else if (fullArea.msRequestFullscreen) {
          // IE11
          fullArea.msRequestFullscreen();
        }
      }
      this.fullscreen = !this.fullscreen
    },
    _initDrag() {
      if (!this._draggable()) {
        return
      }
      // 记录当前鼠标位置
      let mouseOffsetX = 0;
      let mouseOffsetY = 0;

      let dragArea = this.$refs.header
      let box = this.$refs.container
      let window = this.$refs.window

      let isDragging = false;

      dragArea.onmousedown = e1 => {
        if (this.fullscreen) {
          return
        }
        let e = e1 || window.event;
        mouseOffsetX = e.clientX - box.offsetLeft;
        mouseOffsetY = e.clientY - box.offsetTop;

        isDragging = true
        window.style['user-select'] = 'none'
      }

      document.onmousemove = e2 => {
        if (isDragging) {
          let e = e2 || window.event;
          let moveX = e.clientX - mouseOffsetX;
          let moveY = e.clientY - mouseOffsetY;
          this._dragging(moveX, moveY)
        }
      }

      document.onmouseup = () => {
        isDragging = false
        window.style['user-select'] = 'unset'
      }
    },
    _dragging(x, y) {
      let clientWidth = document.body.clientWidth
      let clientHeight = document.body.clientHeight
      let box = this.$refs.container

      if (x > clientWidth - box.clientWidth) {
        box.style.left = (clientWidth - box.clientWidth) + "px";
      } else {
        box.style.left = Math.max(0, x) + "px";
      }

      if (y > clientHeight - box.clientHeight) {
        box.style.top = (clientHeight - box.clientHeight) + "px";
      } else {
        box.style.top = Math.max(0, y) + "px";
      }
    },
  }
}
</script>

<style scoped>

</style>
