<script setup lang="ts">
import { nextTick, onMounted, reactive, ref } from 'vue'
import { exampleCode } from '@@/demo/DemoCode'
import type { DragableConfType, ElementInfo, MessageType, TerminalAsk, TerminalFlash } from 'vue-web-terminal'
import Terminal from 'vue-web-terminal'
import { Codemirror } from 'vue-codemirror'
import { LocalTerminalConstants } from './LocalTerminalConstants'
const props = defineProps<{
  initCmd?: string
}>()
const emit = defineEmits<{
  (e: 'onClose'): void
}>()
const customTextEditor = ref<InstanceType<typeof Codemirror>>()
const name = 'my-terminal'
const title = '👌vue-web-terminal'
const context = ref('/vue-web-terminal/demo')
const version = LocalTerminalConstants.version
const cmdStore = LocalTerminalConstants.cmdStore
const dragConf = ref<DragableConfType | undefined>({
  width: 700,
  height: 500,
})
const guide = reactive<{
  step: number
  command: string
}>({
  step: 0,
  command: '',
})
const codemirrorOptions = {
  tabSize: 4,
  mode: 'javascript',
  theme: 'vibrant-ink',
  lineNumbers: true,
  line: true,
  smartIndent: true,
  collapseIdentical: false,
  scrollbarStyle: 'null',
}
const enableTextEditor = ref(false)
const initLog = LocalTerminalConstants.initLog
onMounted(() => {
  const width = document.body.clientWidth
  if (width < 960) {
    dragConf.value = undefined
  }
  else if (width >= 960 && width < 1264) {
    dragConf.value = {
      ...dragConf.value,
      width: '80%',
      height: '80%',
    }
  }
  else if (width >= 1264) {
    dragConf.value = {
      ...dragConf.value,
      width: '60%',
      height: '65%',
    }
  }
})
/**
 * 当用户输入自定义命令时调用
 *
 * @param key     命令行key，用于唯一标识
 * @param command 命令行
 * @param success 成功回调
 * @param failed  失败回调
 */
function onExecCmd(key: string, command: string, success: (msg?: MessageType | TerminalAsk | TerminalFlash) => void, failed: (msg: string) => void) {
  if (guide.step > 0 && guide.command && key !== 'exit' && key !== guide.command) {
    failed(`请按照引导输入命令 <span class="t-cmd-key">${guide.command}</span> 或输入 <span class="t-cmd-key">exit</span> 退出引导`)
    return
  }
  if (key === 'fail') {
    failed('Something wrong!!!')
  }
  else if (key === 'json') {
    //  do something here
    success({
      type: 'json',
      class: 'success',
      content: {
        k1: 'welcome to vue-web-terminal',
        k2: 120,
        k3: ['h', 'e', 'l', 'l', 'o'],
        k4: { k41: 2, k42: '200' },
      },
    })
  }
  else if (key === 'code') {
    success({
      type: 'code',
      content: 'import Vue from \'vue\'\n'
        + 'import App from \'./App.vue\'\n'
        + 'import Terminal from \'vue-web-terminal\'\n'
        + 'import Highlight from \'./Highlight.js\'\n'
        + '\n'
        + 'Vue.use(Highlight)\n'
        + 'Vue.use(Terminal, { highlight: true })\n'
        + 'Vue.config.productionTip = false\n'
        + '\n'
        + 'new Vue({\n'
        + '    render: h => h(App),\n'
        + '}).$mount(\'#app\')\n',
    })
  }
  else if (key === 'table') {
    success({
      type: 'table',
      content: {
        head: ['title1', 'title2', 'title3', 'title4'],
        rows: [
          ['name1', 'hello world', 'this is a test1', 'xxxxxxxx'],
          ['name2', 'hello world', 'this is a test2 test2', 'xxxxxxxx'],
        ],
      },
    })
  }
  else if (key === 'context') {
    context.value = command.split(' ')[1]
    success({
      type: 'normal',
      class: 'success',
      content: 'ok',
    })
  }
  else if (key === 'html') {
    success({
      type: 'html',
      content: `
                            <div class='demo-init-box'>
                                <p>Hello vue-web-terminal! ✋</p>
                                <p>Demo version: vue2(<span class="t-cmd-key">${version.vue2}</span>), vue3(<span class="t-cmd-key">${version.vue3}</span>)</p>
                                <p>⭐️Github: <a class='t-a' target='_blank' href='https://github.com/tzfun/vue-web-terminal'>https://github.com/tzfun/vue-web-terminal</a></p>
                            </div>
                            `,
    })
  }
  else if (key === 'ls') {
    success({
      type: 'html',
      content: `
                              <ul class="custom-content">
                                <li class="t-dir">目录1</li>
                                <li class="t-dir">目录2</li>
                                <li class="t-dir">目录3</li>
                                <li class="t-file">文件1</li>
                                <li class="t-file">文件2</li>
                                <li class="t-file">文件3</li>
                              </ul>
                              <br>
                              `,
    })
  }
  else if (key === 'fullscreen') {
    Terminal.$api.fullscreen(name)
    success({
      type: 'normal',
      class: 'success',
      content: 'ok',
    })
  }
  else if (key === 'loop') {
    for (let i = 0; i < 10; i++) {
      Terminal.$api.pushMessage(name, {
        type: 'normal',
        content: `loop => ${i}`,
      })
    }
    success()
  }
  else if (key === 'drag') {
    const split = command.split(' ')
    Terminal.$api.dragging(name, { x: parseInt(split[1]), y: parseInt(split[2]) })
    success()
  }
  else if (key === 'info') {
    const info = Terminal.$api.elementInfo(name)
    success({
      type: 'json',
      content: JSON.stringify(info),
    })
  }
  else if (key === 'random') {
    const allClass = ['success', 'error', 'system', 'info', 'warning']

    const clazz = allClass[Math.floor(Math.random() * allClass.length)]
    success({
      type: 'normal',
      class: clazz,
      tag: `random: ${clazz}`,
      content: `random number: ${Math.floor(Math.random() * 10)}`,
    })
  }
  else if (key === 'ask') {
    const arg = command.split(' ')
    if (arg.length >= 2 && arg[1] === 'guide') {
      askGuide(key, command, success, failed)
    }
    else {
      const asker = new Terminal.$Ask()
      success(asker)
      asker.ask({
        question: '请输入用户名：',
        autoReview: true,
        callback: () => {
          asker.ask({
            question: '请输入密码：',
            autoReview: true,
            isPassword: true,
            callback: () => {
              asker.finish()
              setTimeout(() => {
                nextGuide()
              }, 200)
            },
          })
        },
      })
    }
    return
  }
  else if (key === 'flash') {
    showFlash(success)
    return
  }
  else if (key === 'exit') {
    if (guide.step !== 0) {
      guide.step = 0
      guide.command = ''
      success({ content: '你已退出引导' })
    }
    else {
      success()
    }
  }
  else if (key === 'edit') {
    Terminal.$api.textEditorOpen(name, {
      content: exampleCode,
      onClose: (value) => {
        enableTextEditor.value = false
        success([
          {
            class: 'success',
            content: 'Edit saved successfully!',
          },
          {
            type: 'code',
            content: value,
          },
        ])
        nextGuide()
      },
    })
    enableTextEditor.value = true
    nextTick(() => {
      console.log(customTextEditor.value?.codemirror)
      customTextEditor.value?.codemirror.focus()
    })
    return
  }
  else {
    failed('Unknown command')
  }
  nextGuide()
}
function onClick(key: string) {
  if (key === 'close') {
    emit('onClose')
  }
  else {
    Terminal.$api.pushMessage(name, {
      tag: 'success',
      class: 'system',
      content: `User clicked <span class="t-cmd-key">${key}</span>`,
    })
  }
}
function onKeydown(event: KeyboardEvent) {
  if (enableTextEditor.value && event.key === 's' && event.ctrlKey) {
    _textEditorClose()
    event.preventDefault()
  }
}
function inputFilter(value: string) {
  // return value.replace(/[\u4e00-\u9fa5]/g, "")
  return value
}

function initComplete() {
  if (props.initCmd)
    Terminal.$api.execute(name, props.initCmd)

  else
    Terminal.$api.execute(name, 'ask guide')
}
function askGuide(key: string, command: string, success: (msg: TerminalAsk) => void, failed: (msg: string) => void) {
  const asker = new Terminal.$Ask()
  success(asker)

  asker.ask({
    question: '为了帮助你对插件功能有个大概的了解，你是否需要引导？(y/n)：',
    autoReview: true,
    callback: (value) => {
      if (value === 'y') {
        guide.step = 1
        nextGuide()
      }
      asker.finish()
    },
  })
  Terminal.$api.focus(name)
}
function nextGuide() {
  if (guide.step === 0)
    return

  let message = null
  if (guide.step === 1) {
    guide.command = 'random'
    message = `👉 [${guide.step}] 首先带你认识一下支持的消息格式，默认的消息是普通文本格式，请输入<span class="t-cmd-key">${guide.command}</span>随机一条文本消息`
  }
  else if (guide.step === 2) {
    guide.command = 'json'
    message = `👉 [${guide.step}] 接下来是json格式数据，请输入<span class="t-cmd-key">${guide.command}</span>`
  }
  else if (guide.step === 3) {
    guide.command = 'code'
    message = `👉 [${guide.step}] 接下来是code格式数据，拓展可支持 highlight 和 codemirror 高亮显示，请输入<span class="t-cmd-key">${guide.command}</span>`
  }
  else if (guide.step === 4) {
    guide.command = 'table'
    message = `👉 [${guide.step}] 接下来是表格数据，请输入<span class="t-cmd-key">${guide.command}</span>`
  }
  else if (guide.step === 5) {
    guide.command = 'loop'
    message = `👉 [${guide.step}] Terminal支持批量插入多条消息，请输入<span class="t-cmd-key">${guide.command}</span>`
  }
  else if (guide.step === 6) {
    guide.command = 'html'
    message = `👉 [${guide.step}] 接下来是自定义html消息，你可以在此基础上构建任意你需要的消息样式，请输入<span class="t-cmd-key">${guide.command}</span>`
  }
  else if (guide.step === 7) {
    guide.command = 'flash'
    message = `👉 [${guide.step}] 如果你想展示执行过程动画可以使用插件实时回显功能，你可以把它当做Falsh使用，请输入<span class="t-cmd-key">${guide.command}</span>`
  }
  else if (guide.step === 8) {
    guide.command = 'edit'
    message = `👉 [${guide.step}] 如果你想编辑文本文件，插件也提供了简单的文本编辑器，请输入<span class="t-cmd-key">${guide.command}</span>`
  }
  else if (guide.step === 9) {
    guide.command = 'ask'
    message = `👉 [${guide.step}] 如果你想获取到用户输入可以使用插件Ask功能，请输入<span class="t-cmd-key">${guide.command}</span>`
  }
  else if (guide.step === 10) {
    guide.command = ''
    message = `🎉 恭喜你完成了所有的引导，上面已为你展示本Demo支持的所以命令，另外插件还支持拖拽、全屏等功能也可在Demo中体验。
                        <br>🤗 更多关于插件的内容请前往 <a class='t-a' target='_blank' href="https://github.com/tzfun/vue-web-terminal">https://github.com/tzfun/vue-web-terminal</a> 查看，如果你觉得做的不错给个⭐️支持一下吧~`
    Terminal.$api.execute(name, 'help')
    Terminal.$api.pushMessage(name, {
      content: message,
    })
    guide.step = 0
    return
  }
  else {
    return
  }
  guide.step++

  Terminal.$api.pushMessage(name, {
    content: message,
  })
}
async function showFlash(success: (msg: TerminalFlash) => void) {
  Terminal.$api.pushMessage(name, {
    content: '🔍︎ Comparing versions, the relevant dependency files will be downloaded soon...',
  })
  Terminal.$api.pushMessage(name, {
    content: '🚚 Start downloading dependent files',
  })

  const flash = new Terminal.$Flash()
  success(flash)

  const terminalInfo = Terminal.$api.elementInfo(name)
  const start = new Date().getTime()

  await mockLoading(flash, 'vue', terminalInfo)
  await mockLoading(flash, 'vue-web-terminal', terminalInfo)
  await mockLoading(flash, 'core.js', terminalInfo)

  const useTime = ((new Date().getTime() - start) / 1000).toFixed(2)
  Terminal.$api.pushMessage(name, {
    content: `🎉 All dependencies has downloaded <span style="color:green;">successful</span>, done in ${useTime} s`,
  })
  nextGuide()
  flash.finish()
}
function mockLoading(flash: TerminalFlash, fileName: string, terminalInfo: ElementInfo) {
  // 固定宽度 = 加载动画 + fileName + '[' + ']' + '100%'
  const fixedWidth = 15 + (6 + fileName.length) * terminalInfo.charWidth.en
  //  计算出进度条的 '-' 个数
  const processDots = (terminalInfo.clientWidth - fixedWidth) / terminalInfo.charWidth.en
  const prefix1 = '<span class="loading-flash" style="transform: rotate('
  const prefix2 = `deg)"></span><span style="color: aqua">${fileName}</span>[`

  return new Promise<void>((resolve) => {
    const startTime = new Date().getTime()
    let count = 0
    const flashInterval = setInterval(() => {
      ++count

      const percent = Math.floor(count * 100 / processDots)
      const percentStr
        = (() => {
          if (percent < 10)
            return `  ${percent}`
          else if (percent < 100)
            return ` ${percent}`
          else
            return `${percent}`
        })()

      const str = `${prefix1 + (90 * (count % 8)) + prefix2 + '#'.repeat(count) + '-'.repeat(processDots - count)}]${percentStr}%`
      //  更新显示当前进度
      flash.flush(str)

      if (count >= processDots) {
        clearInterval(flashInterval)
        const useTime = ((new Date().getTime() - startTime) / 1000).toFixed(2)
        //  结束后向控制台追加成功日志
        Terminal.$api.pushMessage(name, {
          content: `✔︎ <span style="color: aqua">${fileName}</span> download successful! use <span>${useTime}</span> s`,
        })
        resolve()
      }
    }, Math.random() * 20)
  })
}
function _textEditorClose() {
  Terminal.$api.textEditorClose(name)
}
</script>

<template>
  <Terminal
    :name="name" :title="title" :init-log="initLog" :input-filter="inputFilter" :context="context"
    :command-store="cmdStore" :warn-log-count-limit="200" :drag-conf="dragConf" show-header
    style="position: fixed" @execCmd="onExecCmd" @onClick="onClick" @onKeydown="onKeydown" @initComplete="initComplete"
  >
    <template #code="message">
      <Codemirror v-model="message.message.content" :options="codemirrorOptions" />
    </template>
    <template #textEditor="{ data }">
      <Codemirror
        ref="customTextEditor" v-model="data.value" class="my-text-editor" :options="codemirrorOptions"
        @focus="data.onFocus" @blur="data.onBlur"
      />
      <div class="text-editor-floor" align="center">
        <button class="text-editor-floor-btn" @click="_textEditorClose">
          Save & Close(Ctrl + S)
        </button>
      </div>
    </template>
  </Terminal>
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
