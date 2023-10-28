<script lang="ts" setup>
// import '../lib/theme/light.css'
// import {Terminal, TerminalApi, TerminalAsk} from '../lib/vue-web-terminal.js'
// import {Command} from "../lib/types";

// import '~/css/theme/light.css'
import '~/css/theme/dark.css'
import {Terminal, TerminalApi, TerminalAsk} from '~/index'
import {Command, FailedFunc, Message, SuccessFunc} from "~/types";
import {ref} from "vue";

const terminals = ref<any>([
  {
    show: true,
    name: 'terminal-test',
    context: '/vue-web-terminal/test<br/>123',
    dragConf: {
      width: "60%",
      height: "50%",
      zIndex: 100,
      init: {
        x: 100,
        y: 70
      },
      pinned: false
    },
    showHeader: true
  }
])

const onExecCmd = (key: string, command: Command, success: SuccessFunc, failed: FailedFunc, name: string) => {
  if (key === 'list') {
    success("hello")
  } else if (key === 'code') {
    success({
      type: 'code',
      content: "<template>\n" +
          "  <div id=\"app\">\n" +
          "    <div v-for=\"(item,i) in terminals\" :key=\"i\">\n" +
          "      <terminal\n" +
          "          v-show=\"item.show\"\n" +
          "          :name=\"item.name\"\n" +
          "          :title=\"item.name\"\n" +
          "          :context=\"item.context\"\n" +
          "          :warn-log-count-limit=\"200\"\n" +
          "          :drag-conf=\"item.dragConf\"\n" +
          "          show-header\n" +
          "          :push-message-before=\"_pushMessageBefore\"\n" +
          "          @exec-cmd=\"onExecCmd\"\n" +
          "          @on-active=\"onActive\"\n" +
          "          @on-inactive=\"onInactive\"\n" +
          "          style=\"position: fixed\">\n" +
          "      </terminal>\n" +
          "    </div>\n" +
          "  </div>\n" +
          "\n" +
          "</template>"
    })
  } else if (key === 'loop') {
    let count = 0
    let timer = setInterval(() => {
      if (count++ > 10) {
        clearInterval(timer)
        success()
      }
      TerminalApi.pushMessage(name, "loop: " + count)
    }, 500)
  } else if (key === 'json') {
    success({
      type: 'json',
      content: {
        key1: '123123',
        key2: true,
        key3: 123123123,
        key4: [{
          key: 12312,
          k: "vasdas"
        }],
        key5: {
          "kasdasd": "asdasd",
          "aksdasd": 1243123423
        }
      }
    })
  } else if (key === 'close') {
    let activeNext: string
    terminals.value.forEach((o: any) => {
      if (o.name === name) {
        o.show = false
      }
      if (o.show) {
        activeNext = o.name
      }
    })
    if (activeNext) {
      TerminalApi.focus(activeNext, true)
    }
    success()
  } else if (key === 'new') {
    let seq = terminals.value.length
    terminals.value.push({
      show: true,
      name: 'terminal-test-' + seq,
      context: '/vue-web-terminal/test/' + seq,
      dragConf: {
        width: "60%",
        height: "50%",
        zIndex: 100,
        init: {
          x: 100 + seq * 50,
          y: 70 + seq * 20
        }
      }
    })
    success()
  } else if (key === 'ansi') {
    let ansiContent = 'vue-wen-terminal 支持 ANSI 码的着色解码功能，但暂不支持其他的光标、设备、窗口控制等，默认会将不支持的 ANSI 码过滤。\n\n\x1B[1;34mThis are some blue text.\x1B[0m\n\x1B[30;43mThis is a line of text with a background color.\x1B[0m\n\x1B[92;5mThis is blink text.\x1B[0m\n'

    ansiContent += '\nThis is xterm-256-color content:\n'
    for (let i = 0; i < 256; i++) {
      ansiContent += ('\x1B[38;5;' + i + 'mV\x1B[0m')
    }

    ansiContent += '\n\nThis is xterm-256-color background content:\n'
    for (let i = 0; i < 256; i++) {
      ansiContent += ('\x1B[48;5;' + i + 'm \x1B[0m')
    }

    success({
      type: 'ansi',
      content: ansiContent
    })
  } else if (key === 'edit') {
    TerminalApi.textEditorOpen(name, {
      content: 'Please edit this file',
      onClose: (value: string, option: boolean) => {
        console.log("text close, value:", value, "option:", option)
        success({
          type: 'code',
          content: value
        })
      }
    })
  } else if (key === 'ask') {
    let asker = new TerminalAsk()
    success(asker)
    asker.ask({
      question: 'Ask? (y/n): ',
      autoReview: true,
      callback: (value: string) => {
        console.log("input: ", value)
        asker.finish()
      }
    })
    TerminalApi.focus(name)
  } else if (key === 'header') {
    terminals.value.forEach((o: any) => {
      if (o.name === name) {
        o.showHeader = !o.showHeader
      }
    })
    success()
  } else {
    failed("Unknown command: " + key)
  }
}

const onActive = (name: string) => {
  terminals.value.forEach((o: any) => {
    if (o.name === name) {
      o.dragConf.zIndex = 101
    }
  })
}

const onInactive = (name: string) => {
  terminals.value.forEach((o: any) => {
    if (o.name === name) {
      o.dragConf.zIndex = 100
    }
  })
}
const pushMessageBefore = (message: Message, name: string) => {
  console.log(message, name)
}

</script>
<template>
  <div id="app">

    <!--    <div style="width: 700px;height: 400px;margin-left: 150px;margin-top: 300px">-->
    <!--      <terminal-->
    <!--          name="test"-->
    <!--          show-header-->
    <!--          @exec-cmd="onExecCmd">-->
    <!--      </terminal>-->
    <!--    </div>-->

    <div v-for="(item,i) in terminals" :key="i">
      <terminal
          v-show="item.show"
          :name="item.name"
          :title="item.name"
          :context="item.context"
          context-suffix="~# "
          :warn-log-count-limit="200"
          :drag-conf="item.dragConf"
          :show-header="item.showHeader"
          :push-message-before="pushMessageBefore"
          @exec-cmd="onExecCmd"
          @on-active="onActive"
          @on-inactive="onInactive"
          :log-size-limit="20"
          style="position: fixed">
<!--        <template #header>-->
<!--          <div class="custom-header">This is custom header</div>-->
<!--        </template>-->
      </terminal>
    </div>
  </div>
</template>

<style>
body, html, #app {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  background-color: #ffffff;
  font-family: Menlo, Consolas, monospace;
  overflow: auto;
}
.custom-header{
  background-color: #0eb4b4;
  color: white;
  text-align: center;
  height: 100px;
}
</style>
