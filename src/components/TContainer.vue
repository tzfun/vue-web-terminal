<template>
  <div class="t-container"
       :style="_draggable() ? _getDragStyle() : 'width:100%;height:100%;border-radius:0;'"
       ref="container">
    <span class="t-flag t-cmd-line disable-select">
        <span class="t-cmd-line-content" ref="terminalEnFlag">aa</span>
        <span class="t-cmd-line-content" ref="terminalCnFlag">你好</span>
    </span>
    <div class="t-header-container" ref="header" v-if="showHeader" :style="_draggable() ? 'cursor: move;' : ''">
      <slot name="header" :title="title">
        <THeader :title="title"></THeader>
      </slot>
    </div>
    <div class="t-window"
         :style="`${showHeader ? 'height:calc(100% - 34px);margin-top: 34px;' : 'height:100%'}`"
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
import {_getByteLen, _isSafari} from "@/Util";

export default {
  name: "TContainer",
  components: {THeader},
  props: containerProps,
  data() {
    return {
      fullscreen: false,
      charWidth: {
        en: 8,
        cn: 13
      },
    }
  },
  created() {
    TerminalApi.register(this.name, {
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
        let windowEle = this.$parent.$refs.window
        let windowRect = windowEle.getBoundingClientRect()
        let containerRect = this.$parent.$refs.container.getBoundingClientRect()
        let hasScroll = windowEle.scrollHeight > windowEle.clientHeight || windowEle.offsetHeight > windowEle.clientHeight
        return {
          pos: this._getPosition(),           //  窗口所在位置
          screenWidth: containerRect.width,   //  窗口整体宽度
          screenHeight: containerRect.height, //  窗口整体高度
          clientWidth: hasScroll ? (windowRect.width - 48) : (windowRect.width - 40), //  可显示内容范围高度，减去padding值，如果有滚动条去掉滚动条宽度
          clientHeight: windowRect.height,    //  可显示内容范围高度
          charWidth: this._getCharWidth()
        }
      }
    })
  },
  mounted() {

    this.charWidth = {
      en: this.$refs.terminalEnFlag.getBoundingClientRect().width / 2,
      cn: this.$refs.terminalCnFlag.getBoundingClientRect().width / 2
    }

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
    _getCharWidth(str) {
      if (str) {
        let width = 0
        for (let char of str) {
          width += (_getByteLen(char) === 1 ? this.charWidth.en : this.charWidth.cn)
        }
        return width
      } else {
        return this.charWidth
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
      let width = confWidth == null ? 700 : confWidth

      if (confWidth && typeof confWidth === 'string' && confWidth.endsWith("%")) {
        width = clientWidth * (parseInt(confWidth) / 100)
      }
      let confHeight = this.dragConf.height
      let height = confHeight == null ? 500 : confHeight
      if (confHeight && typeof confHeight === 'string' && confHeight.endsWith("%")) {
        height = clientHeight * (parseInt(confHeight) / 100)
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