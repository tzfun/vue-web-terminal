<script setup>
import 'vue-web-terminal/lib/theme/dark.css'
import {Terminal, TerminalApi, TerminalAsk, TerminalFlash} from "vue-web-terminal"
import {reactive, ref} from "vue";
import {commands} from "./commands.js";
import {exampleCode} from "./example.js";
import CodeEditor from "../editor/CodeEditor.vue";
import {usePageLang} from "@vuepress/client";
import languages from '../../languages.json'

const languageText = reactive(languages[usePageLang().value])

const getText = (key) => {
  if (languageText) {
    return languageText[key] || ''
  }
  return ''
}
const props = defineProps({
  name: String,
  context: {
    type: String,
    default: '/vue-web-terminal/demo'
  },
  initCmd: {
    type: String,
    default: null
  },
  showHeader: {
    type: Boolean,
    default: true
  },
  dragConf: {
    type: Object,
    default: () => {
      return {
        dragConf: {
          width: 700,
          height: 500,
          pinned: false
        }
      }
    }
  }
})
const customTextEditorRef = ref(null)
const version = reactive({
  vue2: '2.2.4',
  vue3: '3.2.6'
})

const cmdStore = ref(commands[usePageLang().value])
const initLog = reactive([
  {
    content: 'Terminal initializing...'
  },
  {
    content: "Welcome to vue-web-terminal! If you are using for the first time, you can use the <span class='t-cmd-key'>help</span> command to learn."
  },
  {
    type: 'html',
    content: `
                <div class='demo-init-box'>
                    <p>Hello vue-web-terminal! ✋</p>
                    <p>Demo version: vue2(<span class="t-cmd-key">${version.vue2}</span>), vue3(<span class="t-cmd-key">${version.vue3}</span>)</p>
                    <p>⭐️Github: <a class='t-a' target='_blank' href='https://github.com/tzfun/vue-web-terminal'>https://github.com/tzfun/vue-web-terminal</a></p>
                </div>
                `
  }
])

const guide = reactive({
  step: 0,
  command: null
})
const enableTextEditor = ref(false)

const emits = defineEmits(['on-active', 'update:context', 'close'])

const onActive = (name) => {
  emits('on-active', name)
}

/**
 * 当用户输入自定义命令时调用
 *
 * @param key     命令行key，用于唯一标识
 * @param command 命令行
 * @param success 成功回调
 * @param failed  失败回调
 */
const onExecCmd = (key, command, success, failed) => {
  if (guide.step > 0 && guide.command && key !== 'exit' && key !== guide.command) {
    let tip = getText('TERM_GUIDE_RETRY').format({
      guideCommand: `<span class="t-cmd-key">${guide.command}</span>`,
      exitCommand: `<span class="t-cmd-key">exit</span>`
    })
    failed(tip)
    return
  }
  if (key === 'fail') {
    failed('Something wrong!!!')
  } else if (key === 'json') {
    //  do something here
    success({
      type: 'json',
      class: 'success',
      content: {
        k1: 'welcome to vue-web-terminal',
        k2: 120,
        k3: ['h', 'e', 'l', 'l', 'o'],
        k4: {k41: 2, k42: '200'}
      }
    })
  } else if (key === 'code') {
    success({
      type: 'code',
      content: "import Vue from 'vue'\n" +
          "import App from './App.vue'\n" +
          "import Terminal from 'vue-web-terminal'\n" +
          "import Highlight from './Highlight.js'\n" +
          "\n" +
          "Vue.use(Highlight)\n" +
          "Vue.use(Terminal, { highlight: true })\n" +
          "Vue.config.productionTip = false\n" +
          "\n" +
          "new Vue({\n" +
          "    render: h => h(App),\n" +
          "}).$mount('#app')\n"
    })
  } else if (key === 'table') {
    success({
      type: 'table',
      content: {
        head: ['title1', 'title2', 'title3', 'title4'],
        rows: [
          ['name1', 'hello world', 'this is a test1', 'xxxxxxxx'],
          ['name2', 'hello world', 'this is a test2 test2', 'xxxxxxxx']
        ]
      }
    })
  } else if (key === 'context') {
    emits('update:context', command.split(" ")[1])
    success({
      type: 'normal',
      class: 'success',
      content: "ok"
    })
  } else if (key === 'html') {
    success({
      type: 'html',
      content: `
                            <div class='demo-init-box'>
                                <p>Hello vue-web-terminal! ✋</p>
                                <p>Demo version: vue2(<span class="t-cmd-key">${version.vue2}</span>), vue3(<span class="t-cmd-key">${version.vue3}</span>)</p>
                                <p>⭐️Github: <a class='t-a' target='_blank' href='https://github.com/tzfun/vue-web-terminal'>https://github.com/tzfun/vue-web-terminal</a></p>
                            </div>
                            `
    })
  } else if (key === 'ls') {
    success({
      type: 'html',
      content: `
                              <ul class="custom-content">
                                <li class="t-dir">dir 1</li>
                                <li class="t-dir">dir 2</li>
                                <li class="t-dir">dir 3</li>
                                <li class="t-file">file 1</li>
                                <li class="t-file">file 2</li>
                                <li class="t-file">file 3</li>
                              </ul>
                              <br>
                              `
    })
  } else if (key === 'fullscreen') {
    TerminalApi.fullscreen(props.name)
    success({
      type: 'normal',
      class: 'success',
      content: "ok"
    })
  } else if (key === 'loop') {
    for (let i = 0; i < 10; i++) {
      TerminalApi.pushMessage(props.name, {
        type: "normal",
        content: "loop => " + i
      })
    }
    success()
  } else if (key === 'drag') {
    let split = command.split(" ");
    TerminalApi.dragging(props.name, {x: parseInt(split[1]), y: parseInt(split[2])})
    success()
  } else if (key === 'info') {
    let info = TerminalApi.elementInfo(props.name)
    success({
      type: 'json',
      content: JSON.stringify(info)
    })
  } else if (key === 'list') {
    let allClass = ['system', 'info', 'success', 'warning', 'error'];
    allClass.forEach(clazz => {
      TerminalApi.pushMessage(props.name, {
        type: 'normal',
        class: clazz,
        tag: clazz,
        content: `This is a ${clazz} level message`
      })
    })
    success()
  } else if (key === 'ask') {
    let arg = command.split(' ')
    if (arg.length >= 2 && arg[1] === 'guide') {
      askGuide(key, command, success, failed)
    } else {
      let asker = new TerminalAsk()
      success(asker)
      asker.ask({
        question: getText('TERM_GUIDE_ASK_INPUT_USERNAME'),
        autoReview: true,
        callback: username => {
          asker.ask({
            question: getText('TERM_GUIDE_ASK_INPUT_PASSWORD'),
            autoReview: true,
            isPassword: true,
            callback: password => {
              asker.finish()
              TerminalApi.pushMessage(props.name, [
                {
                  class: "system",
                  content: getText('TERM_GUIDE_ASK_RESULT')
                }, {
                  content: `username: ${username}`
                }, {
                  content: `password: ${password}`
                }
              ])
              setTimeout(() => {
                nextGuide()
              }, 1000)
            }
          })
        }
      })
    }
    return;
  } else if (key === 'flash') {
    showFlash(success)
    return;
  } else if (key === 'ansi') {

    let ansiContent = getText('TERM_GUIDE_ANSI_PRODUCE') + '\n\n\x1B[1;34mThis are some blue text.\x1B[0m\n\x1B[30;43mThis is a line of text with a background color.\x1B[0m\n\x1B[92;5mThis is blink text.\x1B[0m\n'
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
  } else if (key === 'exit') {
    if (guide.step !== 0) {
      guide.step = 0
      guide.command = null
      success({content: getText('TERM_GUIDE_EXIT')})
    } else {
      success()
    }
  } else if (key === 'edit') {
    TerminalApi.textEditorOpen(props.name, {
      content: exampleCode,
      onClose: (value, options) => {
        enableTextEditor.value = false
        if (options === true) {
          success([
            {
              class: 'success',
              content: "Edit saved successfully!"
            },
            {
              type: 'code',
              content: value
            }
          ])
        } else {
          success({
            class: 'success',
            content: "Edit canceled!"
          },)
        }

        nextGuide()
      }
    })
    enableTextEditor.value = true
    return;
  } else {
    failed("Unknown command")
  }
  nextGuide(success)
}

const onClick = (key) => {
  if (key === "close") {
    emits('close', props.name)
  }
}
const onKeydown = (event) => {
  if (enableTextEditor.value && event.key === 's' && event.ctrlKey) {
    textEditorClose(true)
    event.preventDefault()
  }
}
const textEditorClose = (options) => {
  TerminalApi.textEditorClose(props.name, options)
}

const inputFilter = (data, value) => {
  // return value.replace(/[\u4e00-\u9fa5]/g, "")
  return value
}

const initComplete = () => {
  if (props.initCmd) {
    if (props.initCmd === 'flash') {
      setTimeout(() => {
        TerminalApi.execute(props.name, props.initCmd)
      }, 1000)
    } else {
      TerminalApi.execute(props.name, props.initCmd)
    }
  } else {
    TerminalApi.execute(props.name, 'ask guide')
  }
}

const askGuide = (key, command, success) => {
  let asker = new TerminalAsk()
  success(asker)
  asker.ask({
    question: getText('TERM_GUIDE_ASK'),
    autoReview: true,
    callback: value => {
      if (value === 'y') {
        guide.step = 1
        nextGuide()
      }
      asker.finish()
    }
  })
  TerminalApi.focus()
}

const nextGuide = () => {
  if (guide.step === 0) {
    return;
  }
  let message = null
  const guideStepArg = { guideStep: guide.step }
  if (guide.step === 1) {
    guide.command = 'list'
    const guideCommandArg = { guideCommand: `<span class="t-cmd-key">${guide.command}</span>` }
    message = getText('TERM_GUIDE_PREFIX').format(guideStepArg) + getText('TERM_GUIDE_COMMAND_LIST').format(guideCommandArg)
  } else if (guide.step === 2) {
    guide.command = 'json'
    const guideCommandArg = { guideCommand: `<span class="t-cmd-key">${guide.command}</span>` }
    message = getText('TERM_GUIDE_PREFIX').format(guideStepArg) + getText('TERM_GUIDE_COMMAND_JSON').format(guideCommandArg)
  } else if (guide.step === 3) {
    guide.command = 'code'
    const guideCommandArg = { guideCommand: `<span class="t-cmd-key">${guide.command}</span>` }
    message = getText('TERM_GUIDE_PREFIX').format(guideStepArg) + getText('TERM_GUIDE_COMMAND_CODE').format(guideCommandArg)
  } else if (guide.step === 4) {
    guide.command = 'table'
    const guideCommandArg = { guideCommand: `<span class="t-cmd-key">${guide.command}</span>` }
    message = getText('TERM_GUIDE_PREFIX').format(guideStepArg) + getText('TERM_GUIDE_COMMAND_TABLE').format(guideCommandArg)
  } else if (guide.step === 5) {
    guide.command = 'loop'
    const guideCommandArg = { guideCommand: `<span class="t-cmd-key">${guide.command}</span>` }
    message = getText('TERM_GUIDE_PREFIX').format(guideStepArg) + getText('TERM_GUIDE_COMMAND_LOOP').format(guideCommandArg)
  } else if (guide.step === 6) {
    guide.command = 'html'
    const guideCommandArg = { guideCommand: `<span class="t-cmd-key">${guide.command}</span>` }
    message = getText('TERM_GUIDE_PREFIX').format(guideStepArg) + getText('TERM_GUIDE_COMMAND_HTML').format(guideCommandArg)
  } else if (guide.step === 7) {
    guide.command = 'ansi'
    const guideCommandArg = { guideCommand: `<span class="t-cmd-key">${guide.command}</span>` }
    message = getText('TERM_GUIDE_PREFIX').format(guideStepArg) + getText('TERM_GUIDE_COMMAND_ANSI').format(guideCommandArg)
  } else if (guide.step === 8) {
    guide.command = 'flash'
    const guideCommandArg = { guideCommand: `<span class="t-cmd-key">${guide.command}</span>` }
    message = getText('TERM_GUIDE_PREFIX').format(guideStepArg) + getText('TERM_GUIDE_COMMAND_FLASH').format(guideCommandArg)
  } else if (guide.step === 9) {
    guide.command = 'edit'
    const guideCommandArg = { guideCommand: `<span class="t-cmd-key">${guide.command}</span>` }
    message = getText('TERM_GUIDE_PREFIX').format(guideStepArg) + getText('TERM_GUIDE_COMMAND_EDIT').format(guideCommandArg)
  } else if (guide.step === 10) {
    guide.command = 'ask'
    const guideCommandArg = { guideCommand: `<span class="t-cmd-key">${guide.command}</span>` }
    message = getText('TERM_GUIDE_PREFIX').format(guideStepArg) + getText('TERM_GUIDE_COMMAND_ASK').format(guideCommandArg)
  } else if (guide.step === 11) {
    guide.command = null
    message = getText('TERM_GUIDE_FINISH')
    TerminalApi.execute(props.name, 'help')
    TerminalApi.pushMessage(props.name, {
      content: message
    })
    guide.step = 0
    return
  } else {
    return
  }
  guide.step++

  TerminalApi.pushMessage(props.name, {
    content: message
  })
}

const showFlash = async (success) => {
  TerminalApi.pushMessage(props.name, {
    content: '🔍︎ Comparing versions, the relevant dependency files will be downloaded soon...'
  })
  TerminalApi.pushMessage(props.name, {
    content: '🚚 Start downloading dependent files'
  })

  let flash = new TerminalFlash()
  success(flash)

  let terminalInfo = TerminalApi.elementInfo(props.name)
  let start = new Date().getTime()
  await mockLoading(flash, 'vue', terminalInfo)
  await mockLoading(flash, 'vue-web-terminal', terminalInfo)
  await mockLoading(flash, 'core.js', terminalInfo)

  let useTime = ((new Date().getTime() - start) / 1000).toFixed(2)
  TerminalApi.pushMessage(props.name, {
    content: `🎉 All dependencies has downloaded <span style="color:green;">successful</span>, done in ${useTime} s`
  })
  nextGuide()
  flash.finish()
}

const mockLoading = (flash, fileName, terminalInfo) => {
  // 固定宽度 = 加载动画 + fileName + '[' + ']' + '100%' + 进度条宽度
  let fixedWidth = 15 + (6 + fileName.length) * terminalInfo.charWidth.en + 20
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
        TerminalApi.pushMessage(props.name, {
          content: `✔︎ <span style="color: aqua">${fileName}</span> download successful! use <span>${useTime}</span> s`
        })
        resolve()
      }
    }, Math.random() * 20)
  })
}

</script>

<template>
  <terminal
      :name="name"
      :title="name"
      :init-log="initLog"
      :input-filter="inputFilter"
      :context="context"
      :command-store="cmdStore"
      :warn-log-count-limit="200"
      :drag-conf="dragConf"
      :show-header="showHeader"
      :enable-hover-stripe="false"
      @exec-cmd="onExecCmd"
      @on-click="onClick"
      @on-keydown="onKeydown"
      @init-complete="initComplete"
      @on-active="onActive">
    <template #textEditor="{data}">
      <code-editor ref="customTextEditorRef"
                   class="my-text-editor"
                   autofocus
                   v-model="data.value"
                   language="js"
                   @focus="data.onFocus"
                   @blur="data.onBlur"/>
      <div class="t-text-editor-floor" align="center">
        <button class="t-text-editor-floor-btn t-save-btn" @click="textEditorClose(true)">Save & Close(Ctrl + S)
        </button>
        <button class="t-text-editor-floor-btn t-close-btn" @click="textEditorClose(false)">Cancel</button>
      </div>
    </template>
    <template #code="{ message }">
      <code-editor class="my-text-editor" v-model="message.content" language="js"/>
    </template>
  </terminal>
</template>

<style>
.custom-content {
  list-style: none;
  margin: 0;
  padding: 0;
}

.custom-content li {
  float: left;
  display: flex;
  margin: 0 5px;
}

.t-dir {
  color: cornflowerblue;
}

.t-file {
  color: greenyellow;
}

.demo-init-box {
  border-radius: 5px;
  border: 1px yellow solid;
  border-left: 1px dashed yellow;
  border-right: 1px dashed yellow;
  color: white;
  align-content: center;
  text-align: center;
  padding: 40px 15px;
  width: 400px;
  margin: 30px 0;
}

@media screen and (max-width: 768px) {
  .demo-init-box {
    width: 92%;
  }
}

.t-a {
  color: #77cfff;
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

.my-text-editor {
  height: calc(100% - 35px);
}

.my-text-editor .CodeMirror {
  height: 100% !important;
}
</style>