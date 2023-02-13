<script setup lang="ts">
import { cloneDeep } from 'lodash'
import './css/scrollbar.css'
import './css/style.css'
import type { CSSProperties } from 'vue'
import type { DragableConfType } from './models/DraggableInterface'
import {
  _getByteLen,
  _html,
  _isEmpty,
  _nonEmpty,
  _screenType,
  _unHtml,
} from './Util.js'
import { dragging, getDragStyle, useDrag } from './utils/DragUtil'
import { DataConstant } from './constants/TerminalConstants'
import type { InitLogType } from './models/LogInterface'
import type { CommandType } from './models/CommandInterface'
import TerminalFlash from './TerminalFlash'
import type { TerminalAskHandlerOption } from './TerminalAsk'
import TerminalAsk from './TerminalAsk'
import historyStore from './HistoryStore'
import type { MessageType, TableContentType } from './models/MessageInterface'
import { useKeydownListener } from './utils/ListenerUtil'
import HeaderContainer from './components/HeaderContainer.vue'
import TableMessage from './components/TableMessage.vue'
import CodeMessage from './components/CodeMessage.vue'
import JsonMessage from './components/JsonMessage.vue'
import NormalMessage from './components/NormalMessage.vue'
import TerminalObj from './TerminalObj'

import { useTerminalFullscreen, useUpdateFullscreenStyle } from './utils/FullscreenUtil'
import { fullScreenStyle } from './utils/ContainerUtil'
import TextEditor from './components/TextEditor.vue'

export interface TerminalProps {
  /** 终端唯一名称 */
  name?: string
  /** 终端标题 */
  title?: string
  /** 初始化日志内容 */
  initLog?: InitLogType
  /** 上下文 */
  context?: string
  /** 命令行搜索以及help指令用 */
  commandStore?: CommandType[]
  /** 命令行排序方式 */
  commandStoreSort?: (a: CommandType, b: CommandType) => number
  /** 是否开启命令提示 */
  enableExampleHint?: boolean
  /** 输入过滤器 */
  inputFilter?: (value: string) => string
  /**
   * 命令显示格式化函数，一般用于输入命令高亮显示，传入当前命令返回新的命令，支持html。
   * 如果不设置将使用内部定义的高亮样式
   */
  commandFormatter?: (cmd: string) => string
  /** 按下Tab键处理函数 */
  tabKeyHandler?: (e: KeyboardEvent) => void
  /** 记录条数超出此限制会发出警告 */
  warnLogCountLimit?: number
  /** 自动搜索帮助 */
  autoHelp?: boolean
  /** 显示终端头部 */
  showHeader?: boolean
  /** 拖拽配置 */
  dragConf?: DragableConfType
}

const props = withDefaults(defineProps<TerminalProps>(), {
  name: 'terminal',
  title: 'vue-web-terminal',
  showHeader: true,
  initLog: () => DataConstant.InitLog,
  context: '/vue-web-terminal',
  warnLogCountLimit: 200,
  autoHelp: true,
  enableExampleHint: true,
  // dragConf: () => DataConstant.DragableConf,
})

const emit = defineEmits<{
  (e: 'click', key: string, name: string): void
  (e: 'onClick', key: string, name: string): void
  (e: 'keydown', event: KeyboardEvent, name: string): void
  (e: 'onKeydown', event: KeyboardEvent, name: string): void
  (e: 'beforeExecCmd', cmdKey: string, cmdValue: string, name: string): void
  (e: 'execCmd', cmdKey: string, cmdValue: string, success: (message: MessageType | TerminalFlash | TerminalAsk) => void, failed: (msg: string) => void, name: string): void
  (e: 'destroyed', name: string): void
  (e: 'initBefore', name: string): void
  (e: 'initComplete', name: string): void
}>()

const command = ref('')
const showInputLine = ref(true)

const ask = reactive<{ open: boolean; input: string } & TerminalAskHandlerOption>({
  open: false,
  question: '',
  isPassword: false,
  autoReview: false,
  input: '',
  callback: undefined,
})
const cursor = reactive(DataConstant.CursorConf)
const searchCmd = reactive<{ item?: CommandType }>({ item: undefined })
const allCommandStore = reactive(DataConstant.AllCommandStore)
const terminalLog = reactive<MessageType[]>([])
const perfWarningRate = reactive({
  count: 0,
})
const inputBoxParam = reactive({
  boxWidth: 0,
  boxHeight: 0,
  promptWidth: 0,
  promptHeight: 0,
})
const flash = reactive({
  open: false,
  content: '',
})
const containerStyle = ref<CSSProperties>({})
onMounted(() => {
  if (draggable())
    containerStyle.value = getDragStyle(props.dragConf ?? DataConstant.DragableConf)
  else
    containerStyle.value = fullScreenStyle
})

const terminalContainer = ref<HTMLDivElement>()
const terminalWindow = ref<HTMLDivElement>()
const terminalHeader = ref<HTMLDivElement>()
const cmdInput = ref<HTMLInputElement>()
const askInput = ref<HTMLInputElement>()
const terminalInputBox = ref<HTMLParagraphElement>()
const terminalInputPrompt = ref<HTMLSpanElement>()
const terminalEnFlag = ref<HTMLSpanElement>()
const terminalCnFlag = ref<HTMLSpanElement>()
const textEditorComp = ref<InstanceType<typeof TextEditor> | null>(null)

const { fullscreen, toggleFullscreen } = useTerminalFullscreen()
useUpdateFullscreenStyle(fullscreen, containerStyle)
useDrag(draggable(), fullscreen, terminalHeader, terminalContainer, props.dragConf)

const byteLenEn = computed(() => {
  if (terminalEnFlag.value)
    return terminalEnFlag.value.getBoundingClientRect().width / 2
  else return DataConstant.ByteLen.en
})
const byteLenCn = computed(() => {
  if (terminalCnFlag.value)
    return terminalCnFlag.value.getBoundingClientRect().width / 2
  else return DataConstant.ByteLen.cn
})

watch(terminalLog, () => {
  jumpToBottom()
})

watch(() => props.context, () => {
  nextTick(() => {
    if (terminalInputPrompt.value) {
      inputBoxParam.promptWidth
        = terminalInputPrompt.value.getBoundingClientRect().width
    }
  })
})

onMounted(() => {
  TerminalObj.register(props.name, (type, options) => {
    if (type === 'pushMessage') {
      pushMessage(options)
    }
    else if (type === 'fullscreen') {
      toggleFullscreen()
    }
    else if (type === 'isFullscreen') {
      return fullscreen.value
    }
    else if (type === 'dragging') {
      if (draggable() && terminalContainer.value)
        dragging(options.x, options.y, terminalContainer.value)

      else
        console.warn('Terminal is not draggable')
    }
    else if (type === 'execute') {
      if (_nonEmpty(options)) {
        command.value = options
        execute()
      }
    }
    else if (type === 'elementInfo') {
      if (!terminalWindow.value || !terminalContainer.value)
        return undefined

      const windowRect = terminalWindow.value.getBoundingClientRect()
      const containerRect = terminalContainer.value.getBoundingClientRect()
      const hasScroll
        = terminalWindow.value && (
          terminalWindow.value.scrollHeight > terminalWindow.value.clientHeight
          || terminalWindow.value.offsetHeight > terminalWindow.value.clientHeight)
      return {
        pos: getPosition(), //  窗口所在位置
        screenWidth: containerRect.width, //  窗口整体宽度
        screenHeight: containerRect.height, //  窗口整体高度
        clientWidth: hasScroll
          ? windowRect.width - 48
          : windowRect.width - 40, //  可显示内容范围高度，减去padding值，如果有滚动条去掉滚动条宽度
        clientHeight: windowRect.height, //  可显示内容范围高度
        charWidth: {
          en: byteLenEn.value, //  单个英文字符宽度
          cn: byteLenCn.value, //  单个中文字符宽度
        },
      }
    }
    else if (type === 'focus') {
      focus()
    }
    else if (type === 'textEditorOpen') {
      const opt = options || {}
      if (textEditorComp.value) {
        textEditorComp.value.textEditorData.value = opt.content
        textEditorComp.value.textEditorData.open = true
        textEditorComp.value.textEditorData.onClose = opt.onClose
      }
      focus()
    }
    else if (type === 'textEditorClose') {
      return textEditorComp.value?.textEditorClose()
    }
    else {
      console.error(`Unsupported event type: ${type}`)
    }
  })
})
onUnmounted(() => {
  TerminalObj.unregister(props.name)
})

onMounted(async () => {
  emit('initBefore', props.name)

  if (props.initLog)
    pushMessageBatch(props.initLog, true)

  if (props.commandStore) {
    // 避免sort时对props的修改
    const commandStore = cloneDeep(props.commandStore)
    if (props.commandStoreSort)
      commandStore.sort(props.commandStoreSort)

    commandStore.forEach((cmd) => {
      allCommandStore.push(cmd)
    })
  }

  cursor.defaultWidth = byteLenEn.value
  if (terminalWindow.value && terminalContainer.value && terminalHeader.value && terminalInputPrompt.value) {
    if (terminalWindow.value)
      terminalWindow.value.scrollTop = terminalWindow.value.offsetHeight

    //  计算context的宽度和行高，用于跨行时定位光标位置
    const promptRect = terminalInputPrompt.value.getBoundingClientRect()
    inputBoxParam.promptHeight = promptRect.height
    inputBoxParam.promptWidth = promptRect.width
  }

  emit('initComplete', props.name)
})
onUnmounted(() => {
  emit('destroyed', props.name)
})

function draggable(): boolean {
  return !!(props.showHeader && props.dragConf)
}

function triggerClick(key: string) {
  if (key === 'fullScreen') {
    // 全屏时点击全屏，回复原大小
    toggleFullscreen()
  }
  else if (key === 'minScreen' && fullscreen.value) {
    toggleFullscreen()
  }
  emit('click', key, props.name)
  emit('onClick', key, props.name)
}

function focus() {
  if (ask.open) {
    askInput.value?.focus()
  }
  else if (textEditorComp.value && textEditorComp.value.textEditorData.open) {
    textEditorComp.value.focus()
  }
  else {
    //  没有被选中
    if (getSelection()?.isCollapsed)
      cmdInput.value?.focus()
    else
      cursor.show = true
  }
}

function resetSearchKey() {
  searchCmd.item = undefined
}

function doSearchCmd(cmd: string) {
  if (!props.autoHelp)
    return

  if (_isEmpty(cmd)) {
    resetSearchKey()
  }
  else if (!cmd.trim().includes(' ')) {
    const reg = new RegExp(cmd, 'i')
    const matchSet = []

    let target = null
    for (const o of allCommandStore) {
      if (_nonEmpty(o.key)) {
        const res = o.key.match(reg)
        if (res) {
          // index不存在则给-1，保证分数较小
          const score
            = (res.index ?? -1) * 1000
            + (cmd.length - res[0].length)
            + (o.key.length - res[0].length)
          if (score === 0) {
            //  完全匹配，直接返回
            target = o
            break
          }
          else {
            matchSet.push({
              item: o,
              score,
            })
          }
        }
      }
    }
    if (!target) {
      if (matchSet.length > 0) {
        matchSet.sort((a, b) => {
          return a.score - b.score
        })
        target = matchSet[0].item
      }
      else {
        resetSearchKey()
        return
      }
    }
    searchCmd.item = target
    jumpToBottom()
  }
}

function jumpToBottom() {
  nextTick(() => {
    const box = terminalWindow.value
    if (box)
      box.scrollTo({ top: box.scrollHeight, behavior: 'smooth' })
  })
}

/**
 * 按tab时补全命令
 */
function fillCmd() {
  if (searchCmd.item)
    command.value = searchCmd.item.key
}

/**
 * help命令执行后调用此方法
 *
 * 命令搜索：comm*、command
 * 分组搜索：:groupA
 */
function printHelp(regExp: RegExp, srcStr: string) {
  const content: TableContentType = {
    head: ['KEY', 'GROUP', 'DETAIL'],
    rows: [],
  }
  const findGroup
    = (srcStr && srcStr.length > 1 && srcStr.startsWith(':'))
      ? srcStr.substring(1).toLowerCase()
      : null
  allCommandStore.forEach((cmd: CommandType) => {
    if (findGroup) {
      if (
        _isEmpty(cmd.group)
        || findGroup !== cmd.group.toLowerCase()
      )
        return
    }
    else if (!regExp.test(cmd.key)) {
      return
    }
    const row = []
    row.push(`<span class='t-cmd-key'>${cmd.key}</span>`)
    row.push(cmd.group)

    let detail = ''
    if (_nonEmpty(cmd.description))
      detail += `Description: ${cmd.description}<br>`

    if (_nonEmpty(cmd.usage))
      detail += `Usage: <code>${_unHtml(cmd.usage)}</code><br>`

    if (cmd.example) {
      if (cmd.example.length > 0)
        detail += '<br>'

      for (const idx in cmd.example) {
        const eg = cmd.example[idx]
        detail += `
                        <div>
                            <div style="float:left;width: 30px;display:flex;font-size: 12px;line-height: 18px;">
                              eg${parseInt(idx) + 1}:
                            </div>
                            <div class="t-cmd-help-example">
                              <ul class="t-example-ul">
                                <li class="t-example-li"><code>${eg.cmd
          }</code></li>
                                <li class="t-example-li"><span></span></li>
                        `

        if (_nonEmpty(eg.des))
          detail += `<li class="t-example-li"><span>${eg.des}</span></li>`

        detail += `
                            </ul>
                        </div>
                    </div>
                    `
      }
    }

    row.push(detail)

    content.rows.push(row)
  })
  pushMessage({
    type: 'table',
    content,
  })
}

function execute() {
  resetSearchKey()
  saveCurCommand()
  if (_nonEmpty(command.value)) {
    try {
      const split = command.value.split(' ')
      const cmdKey = split[0]
      emit('beforeExecCmd', cmdKey, command.value, props.name)
      switch (cmdKey) {
        case 'help': {
          let reg = `^${(split.length > 1 && _nonEmpty(split[1])) ? split[1] : '*'
            }$`
          reg = reg.replace(/\*/g, '.*')
          printHelp(new RegExp(reg, 'i'), split[1])
          break
        }
        case 'clear':
          doClear(split)
          break
        case 'open':
          openUrl(split[1])
          break
        default: {
          showInputLine.value = false
          const success = (message: MessageType | TerminalFlash | TerminalAsk) => {
            const finish = () => {
              showInputLine.value = true
              endExecCallBack()
            }

            if (message) {
              //  实时回显处理
              if (message instanceof TerminalFlash) {
                message.onFlush((msg) => {
                  flash.content = msg
                })
                message.onFinish(() => {
                  flash.open = false
                  finish()
                })
                flash.open = true
                return
              }
              else if (message instanceof TerminalAsk) {
                message.onAsk((options) => {
                  ask.input = ''
                  ask.isPassword = options.isPassword
                  ask.question = _html(options.question)
                  ask.callback = options.callback
                  ask.autoReview = options.autoReview
                  focus()
                })

                message.onFinish(() => {
                  ask.open = false
                  finish()
                })
                ask.open = true
                return
              }
              else {
                pushMessage(message)
              }
            }
            finish()
          }

          const failed = (message = 'Failed to execute.') => {
            if (message) {
              pushMessage({
                type: 'normal',
                class: 'error',
                content: message,
              })
            }
            showInputLine.value = true
            endExecCallBack()
          }

          emit(
            'execCmd',
            cmdKey,
            command.value,
            success,
            failed,
            props.name,
          )
          return
        }
      }
    }
    catch (e) {
      console.error(e)
      pushMessage({
        type: 'normal',
        class: 'error',
        content: _html(_unHtml((e as Error).stack)),
        tag: 'error',
      })
    }
  }
  focus()
  endExecCallBack()
}

function endExecCallBack() {
  command.value = ''
  resetCursorPos()
  cursor.show = true
  focus()
}

function pushMessage(message: MessageType | MessageType[], ignoreCheck = false) {
  if (!message)
    return
  if (Array.isArray(message))
    return pushMessageBatch(message, ignoreCheck)

  filterMessageType(message)

  terminalLog.push(message)
  if (!ignoreCheck)
    checkTerminalLog()

  if (message.type === 'json') {
    setTimeout(() => {
      jumpToBottom()
    }, 80)
  }
}
function pushMessageBatch(messages: MessageType[], ignoreCheck = false) {
  for (const m of messages) {
    filterMessageType(m)
    terminalLog.push(m)
  }
  if (!ignoreCheck)
    checkTerminalLog()
}
function resetCursorPos(cmd?: string) {
  cursor.idx = (cmd ?? command.value).length
  cursor.left = 'unset'
  cursor.top = 'unset'
  cursor.width = cursor.defaultWidth
}
function calculateCursorPos(cmd?: string) {
  //  idx可以认为是需要光标覆盖字符的索引
  const idx = cursor.idx
  const _cmd = cmd ?? command.value

  if (idx < 0 || idx >= _cmd.length) {
    resetCursorPos()
    return
  }

  const lineWidth = terminalInputBox.value?.getBoundingClientRect().width ?? 0

  const pos = { left: 0, top: 0 }
  //  当前字符长度
  let charWidth = cursor.defaultWidth
  //  前一个字符的长度
  let preWidth = inputBoxParam.promptWidth

  //  先找到被覆盖字符的位置
  for (let i = 0; i <= idx; i++) {
    charWidth = calculateStringWidth(command.value[i])
    pos.left += preWidth
    preWidth = charWidth
    if (pos.left > lineWidth) {
      //  行高是20px
      pos.top += 20
      pos.left = charWidth
    }
  }

  cursor.left = pos.left
  cursor.top = pos.top
  cursor.width = charWidth
}
function cursorGoLeft() {
  if (cursor.idx > 0)
    cursor.idx--
  calculateCursorPos()
}
function cursorGoRight() {
  if (cursor.idx < command.value.length)
    cursor.idx++
  calculateCursorPos()
}
function saveCurCommand() {
  if (_nonEmpty(command.value))
    historyStore.pushCmd(props.name, command.value)

  terminalLog.push({
    type: 'cmdLine',
    content: `${props.context} > ${commandFormatter(command.value)}`,
  })
}
function doClear(args: string[]) {
  if (args.length === 1)
    terminalLog.length = 0

  else if (args.length === 2 && args[1] === 'history')
    historyStore.clearLog(props.name)

  perfWarningRate.count = 0
}
function openUrl(url: string) {
  const match
    = /^((http|https):\/\/)?(([A-Za-z0-9]+-[A-Za-z0-9]+|[A-Za-z0-9]+)\.)+([A-Za-z]+)[/?:]?.*$/
  if (match.test(url)) {
    if (!url.startsWith('http') && !url.startsWith('https'))
      window.open(`http://${url}`)

    else
      window.open(url)
  }
  else {
    pushMessage({
      class: 'error',
      type: 'normal',
      content: 'Invalid website url',
    })
  }
}

function filterMessageType(message: MessageType) {
  const valid
    = message.type && /^(normal|html|code|table|json)$/.test(message.type)
  if (!valid) {
    console.debug(
      `Invalid terminal message type: ${message.type}, the default type normal will be used`,
    )
    message.type = 'normal'
  }
  return valid
}
function checkTerminalLog() {
  const count = terminalLog.length
  if (
    props.warnLogCountLimit > 0
    && count > props.warnLogCountLimit
    && Math.floor(count / props.warnLogCountLimit)
    !== perfWarningRate.count
  ) {
    perfWarningRate.count = Math.floor(count / props.warnLogCountLimit)
    pushMessage(
      {
        content: `Terminal log count exceeded <strong style="color: red">${count}/${props.warnLogCountLimit}</strong>. If the log content is too large, it may affect the performance of the browser. It is recommended to execute the "clear" command to clear it.`,
        class: 'system',
        type: 'normal',
      },
      true,
    )
  }
}
function switchPreCmd() {
  const cmdLog = historyStore.getLog(props.name)
  let cmdIdx = historyStore.getIdx(props.name)
  if (cmdLog.length !== 0 && cmdIdx > 0) {
    cmdIdx -= 1
    command.value = !cmdLog[cmdIdx] ? '' : cmdLog[cmdIdx]
  }
  resetCursorPos()
  historyStore.setIdx(props.name, cmdIdx)
  doSearchCmd(command.value.trim().split(' ')[0])
}
function switchNextCmd() {
  const cmdLog = historyStore.getLog(props.name)
  let cmdIdx = historyStore.getIdx(props.name)
  if (cmdLog.length !== 0 && cmdIdx < cmdLog.length - 1) {
    cmdIdx += 1
    command.value = !cmdLog[cmdIdx] ? '' : cmdLog[cmdIdx]
  }
  else {
    cmdIdx = cmdLog.length
    command.value = ''
  }
  resetCursorPos()
  historyStore.setIdx(props.name, cmdIdx)
  doSearchCmd(command.value.trim().split(' ')[0])
}
function calculateStringWidth(str: string): number {
  let width = 0
  for (const char of str)
    width += _getByteLen(char) === 1 ? byteLenEn.value : byteLenCn.value

  return width
}
function onInput(e: Event) {
  if (props.inputFilter) {
    const value = (e.target as HTMLInputElement).value
    let newStr = props.inputFilter(value)
    if (!newStr)
      newStr = value

    command.value = newStr
  }

  if (_isEmpty(command.value))
    resetSearchKey()

  else
    doSearchCmd(command.value)

  nextTick(() => {
    checkInputCursor()
    calculateCursorPos()
  })
}
function checkInputCursor() {
  const eIn = cmdInput.value
  if (eIn?.selectionStart !== cursor.idx)
    cursor.idx = eIn?.selectionStart ?? 0
}
function onInputKeydown(e: KeyboardEvent) {
  const key = e.key.toLowerCase()
  if (key === 'arrowleft') {
    checkInputCursor()
    cursorGoLeft()
  }
  else if (key === 'arrowright') {
    checkInputCursor()
    cursorGoRight()
  }
}
function onInputKeyup(e: KeyboardEvent) {
  const key = e.key.toLowerCase()
  const code = e.code.toLowerCase()
  if (
    key === 'home'
    || key === 'end'
    || code === 'altleft'
    || code === 'metaleft'
    || code === 'controlleft'
    || ((e.ctrlKey || e.metaKey || e.altKey)
      && (key === 'arrowright' || key === 'arrowleft'))
  ) {
    checkInputCursor()
    calculateCursorPos()
  }
}
function commandFormatter(cmd?: string) {
  if (props.commandFormatter && cmd)
    return props.commandFormatter(cmd)

  const split = cmd?.split(' ') ?? []
  let formatted = ''
  for (let i = 0; i < split.length; i++) {
    const char = _html(split[i])
    if (i === 0)
      formatted += `<span class='t-cmd-key'>${char}</span>`

    else if (char.startsWith('-'))
      formatted += `<span class="t-cmd-arg">${char}</span>`

    else if (char.length > 0)
      formatted += `<span>${char}</span>`

    if (i < split.length - 1)
      formatted += '<span>&nbsp;</span>'
  }
  return formatted
}
function getPosition() {
  const box = terminalContainer.value
  if (draggable() && box)
    return { x: parseInt(box.style.left), y: parseInt(box.style.top) }
  else
    return { x: 0, y: 0 }
}
function onAskInput() {
  if (ask.autoReview) {
    pushMessage({
      time: '',
      class: 'system',
      type: 'normal',
      content:
        ask.question
        + (ask.isPassword
          ? '*'.repeat(ask.input.length)
          : ask.input),
    })
  }
  ask.question = ''
  if (ask.callback)
    ask.callback(ask.input)
}
/**
 * 判断当前terminal是否活跃
 */
function isActive(): boolean {
  return (
    cursor.show
    || (ask.open && askInput.value === document.activeElement)
    || !!(textEditorComp.value && textEditorComp.value.isActive)
  )
}

useKeydownListener((event: KeyboardEvent) => {
  if (isActive()) {
    if (cursor.show) {
      if (event.key.toLowerCase() === 'tab') {
        if (!props.tabKeyHandler)
          fillCmd()

        else
          props.tabKeyHandler(event)

        event.preventDefault()
      }
      else if (document.activeElement !== cmdInput.value) {
        cmdInput.value?.focus()
      }
    }
    emit('keydown', event, props.name)
    emit('onKeydown', event, props.name)
  }
})
</script>

<template>
  <div ref="terminalContainer" class="t-container" :style="containerStyle" @click="focus">
    <div class="terminal">
      <div
        v-if="showHeader" ref="terminalHeader" class="t-header-container"
        :style="draggable() ? 'cursor: move;' : ''"
      >
        <slot name="header">
          <HeaderContainer
            ref="terminalHeader" :title="title" :show-header="showHeader" :draggable="draggable()"
            :fullscreen="fullscreen" @click-title="triggerClick('title')" @close="triggerClick('close')"
            @min-screen="triggerClick('minScreen')" @full-screen="triggerClick('fullScreen')"
          />
        </slot>
      </div>
      <div
        ref="terminalWindow" class="t-window"
        :style="`${showHeader ? 'height:calc(100% - 34px);margin-top: 34px;' : 'height:100%'}`"
      >
        <div v-for="(item, idx) in terminalLog" :key="idx" class="t-log-box">
          <span v-if="item.type === 'cmdLine'" class="t-crude-font t-cmd-line">
            <span class="prompt t-cmd-line-content"><span v-html="item.content" /></span>
          </span>
          <div v-else>
            <span v-if="item.type === 'normal'">
              <slot name="normal" :message="item">
                <NormalMessage :message="item" />
              </slot>
            </span>
            <div v-if="item.type === 'json'">
              <slot name="json" :message="item">
                <JsonMessage :message="item" />
              </slot>
            </div>
            <div v-if="item.type === 'code'">
              <slot name="code" :message="item">
                <CodeMessage :message="item" />
              </slot>
            </div>
            <div v-if="item.type === 'table'">
              <slot name="table" :message="item">
                <TableMessage :message="item" />
              </slot>
            </div>
            <div v-if="item.type === 'html'">
              <slot name="html" :message="item">
                <div v-html="item.content" />
              </slot>
            </div>
          </div>
        </div>
        <div v-if="flash.open && flash.content">
          <slot name="flash" :content="flash.content">
            <div v-html="flash.content" />
          </slot>
        </div>
        <div v-if="ask.open && ask.question" style="display: flex">
          <div style="display: inline-block" v-html="ask.question" />
          <input
            ref="askInput" v-model="ask.input" :type="ask.isPassword ? 'password' : 'text'" class="t-ask-input"
            autocomplete="off" auto-complete="new-password" @keyup.enter="onAskInput"
          >
        </div>
        <p v-show="showInputLine" ref="terminalInputBox" class="t-last-line t-crude-font t-cmd-line">
          <span ref="terminalInputPrompt" class="prompt t-cmd-line-content disable-select">
            <span>{{ context }}</span>
            <span> > </span>
          </span><span class="t-cmd-line-content" v-html="commandFormatter(command)" /><span
            v-show="cursor.show"
            class="cursor disable-select"
            :style="`width:${cursor.width}px;left:${cursor.left}px;top:${cursor.top}px;`"
          >&nbsp;</span>
          <input
            ref="cmdInput" v-model="command" type="text" autofocus class="t-cmd-input disable-select"
            autocomplete="off" auto-complete="new-password" @keydown="onInputKeydown" @keyup="onInputKeyup"
            @input="onInput" @focusin="cursor.show = true" @focusout="cursor.show = false"
            @keyup.up.exact="switchPreCmd" @keyup.down.exact="switchNextCmd" @keyup.enter="execute"
          >
          <span class="t-flag t-cmd-line disable-select">
            <span ref="terminalEnFlag" class="t-cmd-line-content">aa</span>
            <span ref="terminalCnFlag" class="t-cmd-line-content">你好</span>
          </span>
        </p>
        <slot name="helpCmd" :item="searchCmd.item">
          <p class="t-help-msg">
            {{ searchCmd.item ? searchCmd.item.usage : '' }}
          </p>
        </slot>
      </div>
    </div>
    <div v-if="enableExampleHint">
      <slot name="helpBox" :show-header="showHeader" :item="searchCmd.item">
        <div
          v-if="searchCmd.item && !_screenType().xs" class="t-cmd-help"
          :style="showHeader ? 'top: 40px;max-height: calc(100% - 60px);' : 'top: 15px;max-height: calc(100% - 40px);'"
        >
          <p
            v-if="searchCmd.item.description" class="text" style="margin: 15px 0"
            v-html="searchCmd.item.description"
          />
          <div v-if="searchCmd.item.example && searchCmd.item.example.length > 0">
            <div v-for="(it, idx) in searchCmd.item.example" :key="idx" class="text">
              <div v-if="searchCmd.item.example.length === 1">
                <span>Example: <code>{{ it.cmd }}</code> {{ it.des }}</span>
              </div>
              <div v-else>
                <div class="t-cmd-help-eg">
                  eg{{ searchCmd.item.example.length > 1 ? (idx + 1) : '' }}:
                </div>
                <div class="t-cmd-help-example">
                  <ul class="t-example-ul">
                    <li class="t-example-li">
                      <code>{{ it.cmd }}</code>
                    </li>
                    <li class="t-example-li">
                      <span v-if="it.des" class="t-cmd-help-des">{{ it.des }}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </slot>
    </div>
    <TextEditor ref="textEditorComp" :show-header="showHeader" />
  </div>
</template>
