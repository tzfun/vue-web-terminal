<script lang="ts" setup>
// import '../lib/theme/light.css'
// import {Terminal, TerminalApi, TerminalAsk} from '../lib/vue-web-terminal.js'
// import {Command} from "../lib/types";

// import '~/css/theme/light.css'
// import '~/css/theme/dark.css'
import {Terminal, TerminalApi, TerminalAsk, TerminalElementInfo} from '~/index'
import {Command, FailedFunc, Message, SuccessFunc} from "~/types";
import {reactive, ref} from "vue";
const commandStore: Array<Command> = [
  {
    key: "COMMAND CONFIG"
  },
  {
    key: "CONFIG",
  },
  {
    key: "config",
  },
  {
    key: "COMMAND CONFIG come on",
  },
  {
    key: "CONFIG haha",
  },
  {
    key: "Test CONFIG",
  }
]
const initLog = reactive([{
  type: 'normal',
  content: "Terminal Initializing ..."
}, {
  type: 'normal',
  content: "Current login time: " + new Date().toLocaleString()
}, {
  type: 'normal',
  content: "Welcome to vue web terminal! If you are using for the first time, you can use the <span class='t-cmd-key'>help</span> command to learn. Thanks for your star support: <a class='t-a' target='_blank' href='https://github.com/tzfun/vue-web-terminal'>https://github.com/tzfun/vue-web-terminal</a>"
}])

const terminals = ref<Array<any>>([
  {
    show: true,
    name: 'terminal-test',
    context: '/vue-web-terminal/test<br/>123/线上服/2',
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
    showHeader: true,
    theme: 'dark'
  }
])

const onExecCmd = (key: string, command: Command, success: SuccessFunc, failed: FailedFunc, name: string) => {
  if (key === 'list') {
    success("hello")
    TerminalApi.pushMessage(name, {
      class: "success",
      content: "success text"
    })
    TerminalApi.pushMessage(name, {
      class: "warning",
      content: "warning text"
    })
    TerminalApi.pushMessage(name, {
      class: "error",
      content: "error text"
    })
    TerminalApi.pushMessage(name, {
      class: "system",
      content: "system text"
    })
    TerminalApi.pushMessage(name, {
      class: "info",
      content: "info text"
    })
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
    closeWindow(name, true)
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
    let args = command.split(' ')
    let loop = 1;
    if (args.length > 1) {
      loop = parseInt(args[1])
    }
    for (let i = 0; i < loop; i++) {
      let ansiContent = 'vue-wen-terminal 支持 ANSI 码的着色解码功能，但暂不支持其他的光标、设备、窗口控制等，默认会将不支持的 ANSI 码过滤。\n\n\x1B[1;34mThis are some blue text.\x1B[0m\n\x1B[30;43mThis is a line of text with a background color.\x1B[0m\n\x1B[92;5mThis is blink text.\x1B[0m\n'

      ansiContent += '\nThis is xterm-256-color content:\n'
      for (let i = 0; i < 256; i++) {
        ansiContent += ('\x1B[38;5;' + i + 'mV\x1B[0m')
      }

      ansiContent += '\n\nThis is xterm-256-color background content:\n'
      for (let i = 0; i < 256; i++) {
        ansiContent += ('\x1B[48;5;' + i + 'm \x1B[0m')
      }

      ansiContent += `\nfinished ${i}`
      TerminalApi.pushMessage(name, {
        type: 'ansi',
        content: ansiContent
      })
    }

    success()
  } else if (key === 'edit') {
    TerminalApi.textEditorOpen(name, {
      content: 'Please edit this file',
      onClose: (value: string, option: boolean) => {
        console.log("text close, value:", value, ". option:", option)
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
  } else if (key === 'append') {
    let content = command.split(" ")[1]
    TerminalApi.appendMessage(name, content)
    success()
  } else if (key === 'doclear') {
    TerminalApi.clearLog(name)
    success()
  } else if (key === 'fold') {
    success(TerminalApi.switchAllFoldState(name, true).toString())
  } else if (key === 'unfold') {
    success(TerminalApi.switchAllFoldState(name, false).toString())
  } else if (key === 'info') {
    success({
      type: 'json',
      content: TerminalApi.elementInfo(name)
    })
  } else if (key === 'theme') {
    let theme = command.split(" ")[1]
    if (theme.match("dark|light")) {
      terminals.value.forEach((o: any) => {
        if (o.name === name) {
          o.theme = theme
        }
      })
      success()
    } else {
      failed("Invalid theme")
    }
  } else if (key === 'name') {
    let newName = command.split(" ")[1]
    terminals.value.forEach((o: any) => {
      if (o.name === name) {
        o.name = newName
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

const onResize = (info: TerminalElementInfo, name: string) => {
  console.log(name, "resize =>", info)
}

const pushMessageBefore = (message: Message, name: string) => {
  console.log(message, name)
}

const getCommand = () => {
  console.log("The current command is[", TerminalApi.getCommand(terminals.value[0].name), "]")
}

const setCommand = () => {
  TerminalApi.setCommand(terminals.value[0].name, "The custom command -a xxx")
}

const closeWindow = (name: string, remove: boolean = false) => {
  let activeNext: string
  let idx = -1
  for (let i = 0; i < terminals.value.length; i++) {
    let o = terminals.value[i]
    if (o.name === name) {
      o.show = false
      idx = i
    }
    if (o.show) {
      activeNext = o.name
    }
  }
  if (activeNext) {
    TerminalApi.focus(activeNext, true)
  }
  if (remove && idx >= 0) {
    terminals.value.splice(idx, 1)
  }
}

const onClick = (key: string, name: string) => {
  if (key === 'close') {
    closeWindow(name, true)
  }
}

</script>
<template>
  <div id="app">

    <button @click="getCommand">get command</button>
    <button @click="setCommand">set command</button>

    <!--    <div style="width: 700px;height: 400px;margin-left: 150px;margin-top: 300px">-->
    <!--      <terminal-->
    <!--          name="test"-->
    <!--          show-header-->
    <!--          @exec-cmd="onExecCmd">-->
    <!--      </terminal>-->
    <!--    </div>-->

    <div v-for="item in terminals" :key="item.name">
      <terminal
          v-show="item.show"
          :name="item.name"
          :title="item.name"
          :context="item.context"
          context-suffix=" > "
          :drag-conf="item.dragConf"
          :show-header="item.showHeader"
          :push-message-before="pushMessageBefore"
          :log-size-limit="20"
          cursor-style="block"
          :enable-cursor-blink="true"
          :line-space="15"
          enable-hover-stripe
          :enable-fold="true"
          :init-log="initLog"
          :theme="item.theme"
          :command-store="commandStore"
          @exec-cmd="onExecCmd"
          @on-active="onActive"
          @on-inactive="onInactive"
          @on-resize="onResize"
          @on-click="onClick"
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

.custom-header {
  background-color: #0eb4b4;
  color: white;
  text-align: center;
  height: 100px;
}
</style>
