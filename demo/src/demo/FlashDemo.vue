<script setup lang="ts">
import Terminal, { ElementInfo, TerminalFlash } from "vue-web-terminal"
const name = 'demo-flash'

function execCmd(key: string, command: string, success: (msg: TerminalFlash) => void, failed: (msg: string) => void) {
  if (key === 'download') {
    Terminal.$api.pushMessage(name, {
      content: '🔍︎ Comparing versions, the relevant dependency files will be downloaded soon...'
    })
    Terminal.$api.pushMessage(name, {
      content: '🚚 Start downloading dependent files'
    })
    let flash = new Terminal.$Flash()
    success(flash)
    mockDownload(flash)
  } else {
    failed('unknown command')
  }
}
async function mockDownload(flash: TerminalFlash) {
  let startTime = new Date().getTime()
  let terminalInfo = Terminal.$api.elementInfo(name)

  await mockLoading(flash, 'vue', terminalInfo)
  await mockLoading(flash, 'echarts.js', terminalInfo)
  await mockLoading(flash, 'highlight.js', terminalInfo)
  await mockLoading(flash, 'vue-web-terminal', terminalInfo)
  await mockLoading(flash, 'vue-router', terminalInfo)

  let useTime = ((new Date().getTime() - startTime) / 1000).toFixed(2)
  Terminal.$api.pushMessage(name, {
    content: `🍺 All dependencies has downloaded, done in ${useTime} s`
  })
  flash.finish()
}
function mockLoading(flash: TerminalFlash, fileName: string, terminalInfo: ElementInfo) {
  // 固定宽度 = 加载动画 + fileName + '[' + ']' + '100%'
  let fixedWidth = 15 + (6 + fileName.length) * terminalInfo.charWidth.en
  //  计算出进度条的 '-' 个数
  let processDots = (terminalInfo.clientWidth - fixedWidth) / terminalInfo.charWidth.en
  let prefix1 = '<span class="loading-flash" style="transform: rotate('
  let prefix2 = `deg)"></span><span style="color: aqua">${fileName}</span>[`

  return new Promise<void>(resolve => {
    let startTime = new Date().getTime()
    let count = 0
    let flashInterval = setInterval(() => {
      ++count

      const percent = Math.floor(count * 100 / processDots)
      const percentStr =
        (() => {
          if (percent < 10) {
            return `  ${percent}`
          } else if (percent < 100) {
            return ` ${percent}`
          } else {
            return `${percent}`
          }
        })()

      let str = prefix1 + (90 * (count % 8)) + prefix2 + "#".repeat(count) + "-".repeat(processDots - count) + ']' + percentStr + '%'
      //  更新显示当前进度
      flash.flush(str)

      if (count >= processDots) {
        clearInterval(flashInterval)
        let useTime = ((new Date().getTime() - startTime) / 1000).toFixed(2)
        //  结束后向控制台追加成功日志
        Terminal.$api.pushMessage(name, {
          content: `✔︎ <span style="color: aqua">${fileName}</span> download successful! use <span>${useTime}</span> s`
        })
        resolve()
      }
    }, Math.random() * 50)
  })
}
</script>

<template>
  <div id="app">
    <terminal :name="name" @execCmd="execCmd" :drag-conf="{ width: 700, height: 500 }"></terminal>
  </div>
</template>

<style>
body,
html,
#app {
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