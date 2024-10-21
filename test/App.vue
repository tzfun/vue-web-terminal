<template>
  <div id="app">
    <button @click="_getCommand">get command</button>
    <button @click="_setCommand">set command</button>
    <div v-for="item in terminals" :key="item.name">
      <terminal
          v-show="item.show"
          :name="item.name"
          :title="item.name"
          :context="item.context"
          :drag-conf="item.dragConf"
          show-header
          :push-message-before="_pushMessageBefore"
          cursor-style="underline"
          :enable-cursor-blink="true"
          :log-size-limit="20"
          :enable-default-command="true"
          :line-space="15"
          :init-log="initLog"
          :theme="item.theme"
          :enable-fold="true"
          :command-store="commandStore"
          @on-keydown="onKeyDown"
          @exec-cmd="onExecCmd"
          @on-active="onActive"
          @on-inactive="onInactive"
          @on-resize="onResize"
          style="position: fixed">
      </terminal>
    </div>
  </div>

</template>

<script>
import {Terminal, TerminalApi, TerminalAsk} from '../src/index.js'
// import '../src/css/theme/dark.css'
// import '../src/css/theme/light.css'
import {_html} from "@/js/Util";

const commandStore = [
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

export default {
  name: "App",
  components: {Terminal},
  data() {
    return {
      terminals: [
        {
          show: true,
          name: 'terminal-test',
          context: '/vue-web-terminal/test',
          dragConf: {
            width: "60%",
            height: "70%",
            zIndex: 100,
            init: {
              x: 100,
              y: 70
            },
            pinned: false
          },
          theme: 'dark'
        }
      ],
      commandStore: commandStore,
      initLog: [{
        type: 'normal',
        content: "Terminal Initializing ..."
      }, {
        type: 'normal',
        content: "Current login time: " + new Date().toLocaleString()
      }, {
        type: 'normal',
        content: "Welcome to vue web terminal! If you are using for the first time, you can use the <span class='t-cmd-key'>help</span> command to learn. Thanks for your star support: <a class='t-a' target='_blank' href='https://github.com/tzfun/vue-web-terminal'>https://github.com/tzfun/vue-web-terminal</a>"
      }]
    }
  },
  methods: {
    onExecCmd(key, command, success, failed, name) {
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
      } else if (key === 'close') {
        this.closeWindow(name)

        success()
      } else if (key === 'loop') {
        let count = 0;
        let interval = setInterval(() => {
          if (count++ > 20) {
            clearInterval(interval)
            success()
          }
          for (let i = 0; i < 20; i++) {
            TerminalApi.pushMessage(name, {
              type: 'normal',
              class: 'system',
              tag: 'output',
              content: "random content: " + Math.random()
            });
          }
        }, 100)
      } else if (key === 'new') {
        let seq = this.terminals.length
        this.terminals.push({
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
          },
          theme: 'dark'
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
          content: 'hello world!',
          onClose: (value, option) => {
            console.log("text close, value:", value, "option:", option)
          }
        })
        success()
      } else if (key === 'json') {
        success({
          type: "json",
          content: {
            show: true,
            name: 'terminal-test',
            context: '/vue-web-terminal/test',
            dragConf: {
              width: "60%",
              height: "50%",
              zIndex: 100,
              init: {
                x: 100,
                y: 70
              },
              pinned: false
            }
          }
        })
      } else if (key === 'ask') {
        let asker = new TerminalAsk()
        success(asker)
        asker.ask({
          question: 'Ask? (y/n): ',
          autoReview: true,
          callback: value => {
            console.log("input: ", value)
            asker.finish()
          }
        })
        TerminalApi.focus(name)
      } else if (key === 'err') {
        failed(_html(new Error("Some error").stack))
      } else if (key === 'info') {
        success({
          type: 'json',
          content: TerminalApi.elementInfo(name)
        })
      } else if (key === 'fold') {
        success(TerminalApi.switchAllFoldState(name, true).toString())
      } else if (key === 'unfold') {
        success(TerminalApi.switchAllFoldState(name, false).toString())
      } else if (key === 'theme') {
        let theme = command.split(" ")[1]
        if (theme.match("dark|light")) {
          this.terminals.forEach((o) => {
            if (o.name === name) {
              o.theme = theme
              console.log(`set '${name}' theme to ${theme}`)
            }
          })
          success()
        } else {
          failed("Invalid theme")
        }
      } else if (key === 'name') {
        let newName = command.split(" ")[1]
        this.terminals.forEach((o) => {
          if (o.name === name) {
            o.name = newName
          }
        })
        success()
      } else {
        failed("Unknown command: " + key)
      }
    },
    onActive(name) {
      this.terminals.forEach(o => {
        if (o.name === name) {
          o.dragConf.zIndex = 101
        }
      })
    },
    onInactive(name) {
      this.terminals.forEach(o => {
        if (o.name === name) {
          o.dragConf.zIndex = 100
        }
      })
    },
    _pushMessageBefore(message, name) {
      console.debug(message, name)
    },
    onKeyDown() {
    },
    _getCommand() {
      console.log("Current command is[", TerminalApi.getCommand(this.terminals[0].name), "]")
    },
    _setCommand() {
      TerminalApi.setCommand(this.terminals[0].name, "hello this is a new command -a xxx")
    },
    onResize(info, name) {
      console.log(name, info)
    },
    closeWindow(name) {
      let activeNext

      let idx = -1
      for (let i = 0; i < this.terminals.length; i++) {
        let o = this.terminals[i]
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
      if (idx >= 0) {
        this.terminals.splice(idx, 1)
      }
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
  background-color: #ffffff;
  font-family: Menlo, Consolas, monospace;
  overflow: auto;
}
</style>
