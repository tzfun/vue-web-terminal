<template>
  <div id="app">
    <terminal :name="name" @execCmd="execCmd" :drag-conf="{width:700,height:500}"></terminal>
  </div>
</template>

<script>
import Terminal from "vue-web-terminal";

export default {
  name: "Flash.vue",
  components: {Terminal},
  data() {
    return {
      name: 'demo-flash'
    }
  },
  methods: {
    execCmd(key, command, success, failed) {
      if (key === 'download') {
        Terminal.$api.pushMessage(this.name, {
          content: '🔍︎ Comparing versions, the relevant dependency files will be downloaded soon...'
        })
        Terminal.$api.pushMessage(this.name, {
          content: '🚚 Start downloading dependent files'
        })
        let flash = new Terminal.$Flash()
        success(flash)
        this.mockDownload(flash)
      } else {
        failed('unknown command')
      }
    },
    async mockDownload(flash) {
      let startTime = new Date().getTime()
      let terminalInfo = Terminal.$api.elementInfo(this.name)

      await this.mockLoading(flash, 'vue', terminalInfo)
      await this.mockLoading(flash, 'echarts.js', terminalInfo)
      await this.mockLoading(flash, 'highlight.js', terminalInfo)
      await this.mockLoading(flash, 'vue-web-terminal', terminalInfo)
      await this.mockLoading(flash, 'vue-router', terminalInfo)

      let useTime = ((new Date().getTime() - startTime) / 1000).toFixed(2)
      Terminal.$api.pushMessage(this.name, {
        content: `🍺 All dependencies has downloaded, done in ${useTime} s`
      })
      flash.finish()
    },
    mockLoading(flash, fileName, terminalInfo) {
      // 固定宽度 = 加载动画 + fileName + '[' + ']' + '100%'
      let fixedWidth = 15 + (6 + fileName.length) * terminalInfo.charWidth.en
      //  计算出进度条的 '-' 个数
      let processDots = (terminalInfo.clientWidth - fixedWidth) / terminalInfo.charWidth.en
      let prefix1 = '<span class="loading-flash" style="transform: rotate('
      let prefix2 = `deg)"></span><span style="color: aqua">${fileName}</span>[`

      return new Promise(resolve => {
        let startTime = new Date().getTime()
        let count = 0
        let flashInterval = setInterval(() => {
          ++count

          let percent = Math.floor(count * 100 / processDots)
          if (percent < 10) {
            percent = '  ' + percent
          } else if (percent < 100) {
            percent = ' ' + percent
          }

          let str = prefix1 + (90 * (count % 8)) + prefix2 + "#".repeat(count) + "-".repeat(processDots - count) + ']' + percent + '%';
          //  更新显示当前进度
          flash.flush(str)

          if (count >= processDots) {
            clearInterval(flashInterval)
            let useTime = ((new Date().getTime() - startTime) / 1000).toFixed(2)
            //  结束后向控制台追加成功日志
            Terminal.$api.pushMessage(this.name, {
              content: `✔︎ <span style="color: aqua">${fileName}</span> download successful! use <span>${useTime}</span> s`
            })
            resolve()
          }
        }, Math.random() * 50)
      })
    }
  }
}
</script>

<style>
body, html, #app {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}

.loading-flash {
  position: relative;
  display: inline-block;
  width: 15px;
  height: 15px;
  transform: rotate(0deg);
  top: 3px;
  left: -3px;
}

.loading-flash:before {
  content: '';
  position: absolute;
  width: 10.606px;
  height: 10.606px;
  border: 2px solid rgba(240, 236, 236, 0.3);
  border-left-color: #a4eac8;
  border-radius: 50%;
}
</style>