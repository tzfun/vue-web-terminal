<script setup lang="ts">
import {computed, nextTick, onMounted, onUnmounted, PropType, reactive, ref, watch} from "vue";
import {
  AskConfig,
  Command,
  CommandFormatterFunc,
  CommandStoreSortFunc,
  DragConfig,
  EditorConfig,
  EditorSetting,
  FailedFunc,
  InputFilterFunc,
  Message, MessageGroup,
  Position,
  PushMessageBeforeFunc,
  SearchHandlerFunc,
  SuccessFunc,
  TabKeyHandlerFunc,
  TerminalAsk,
  TerminalFlash
} from "./types";
import {
  _copyTextToClipboard,
  _defaultCommandFormatter,
  _eventOff,
  _eventOn,
  _getByteLen,
  _getClipboardText,
  _getSelection,
  _html,
  _isEmpty,
  _isPad,
  _isParentDom,
  _isPhone,
  _isSafari,
  _nonEmpty,
  _openUrl,
  _pointInRect,
  _screenType,
} from "~/common/util.ts";
import api, {register, rename, unregister} from "~/common/api";
import {DEFAULT_COMMANDS} from "~/common/configuration.ts";
import {_parseANSI, ANSI_BEL} from "~/ansi";
import store from "~/common/store";
import THeader from "~/components/THeader.vue";
import TViewerNormal from "~/components/TViewerNormal.vue";
import TViewerJson from "~/components/TViewerJson.vue";
import TViewerCode from "~/components/TViewerCode.vue";
import TViewerTable from "~/components/TViewerTable.vue";
import THelpBox from "~/components/THelpBox.vue";
import TEditor from "~/components/TEditor.vue";

const emits = defineEmits(["on-keydown", "on-click", "before-exec-cmd", "exec-cmd", "destroyed", "init-before", "init-complete", 'on-active', 'on-inactive'])
const props = defineProps({
  title: {
    type: String,
    default: 'vue-web-terminal'
  },
  name: {
    type: String,
    default: ''
  },
  //  初始化日志内容
  initLog: {
    type: Array<Message>,
    default: (): Array<Message> => {
      return [{
        type: 'normal',
        content: "Terminal Initializing ..."
      }, {
        type: 'normal',
        content: "Current login time: " + new Date().toLocaleString()
      }, {
        type: 'normal',
        content: "Welcome to vue web terminal! If you are using for the first time, you can use the <span class='t-cmd-key'>help</span> command to learn.Thanks for your star support: <a class='t-a' target='_blank' href='https://github.com/tzfun/vue-web-terminal'>https://github.com/tzfun/vue-web-terminal</a>"
      }]
    }
  },
  //  上下文
  context: {
    type: String,
    default: '/vue-web-terminal'
  },
  contextSuffix: {
    type: String,
    default: ' > '
  },
  //  命令行搜索以及help指令用
  commandStore: Array<Command>,
  //   命令行排序方式
  commandStoreSort: Function as PropType<CommandStoreSortFunc>,
  //  自动搜索帮助
  autoHelp: {
    type: Boolean,
    default: true
  },
  //  显示终端头部
  showHeader: {
    type: Boolean,
    default: true
  },
  //  是否开启命令提示
  enableExampleHint: {
    type: Boolean,
    default: true
  },
  //  输入过滤器
  inputFilter: Function as PropType<InputFilterFunc>,
  //  拖拽配置
  dragConf: Object as PropType<DragConfig>,
  //  命令格式化显示函数
  commandFormatter: Function as PropType<CommandFormatterFunc>,
  //  按下Tab键处理函数
  tabKeyHandler: Function as PropType<TabKeyHandlerFunc>,
  //  用户自定义命令搜索提示实现
  searchHandler: Function as PropType<SearchHandlerFunc>,
  //  滚动条滚动模式
  scrollMode: {
    type: String,
    default: 'smooth'
  },
  /**
   * 在 push 消息之前触发的钩子函数，只能对message对象的属性进行修改
   *
   * @param message 命令对象
   * @param name terminal name
   */
  pushMessageBefore: Function as PropType<PushMessageBeforeFunc>,
  //  日志条数限制，命令行也算一条日志
  logSizeLimit: {
    type: Number,
    default: 200
  },
  //  是否开启内部默认指令，例如 help、open等
  enableDefaultCommand: {
    type: Boolean,
    default: true
  },
  //  行间距，单位px
  lineSpace: {
    type: Number,
    default: 15
  },
  /**
   * 光标样式，可选值：
   * - block
   * - underline
   * - bar
   * - none
   */
  cursorStyle: {
    type: String,
    default: () => "block"
  },
  //  光标闪烁开关
  cursorBlink: {
    type: Boolean,
    default: () => true
  },
  //  命令折叠开关
  enableFold: {
    type: Boolean,
    default: () => true
  },
  //  鼠标hover时分组高亮开关
  enableHoverStripe: {
    type: Boolean,
    default: () => false
  },
})

const draggable = computed<boolean>(() => {
  return props.showHeader && props.dragConf != undefined
})

const isPinned = computed<boolean>(() => {
  return props.dragConf && props.dragConf.pinned
})

const isActive = computed(() => {
  return cursorConf.show
      || (ask.open && terminalAskInputRef.value === document.activeElement)
      || (textEditor.open && textEditor.focus)
})

const isBlockCommandFocus = computed(() => {
  return textEditor.open || flash.open || ask.open
})

const containerStyle = computed(() => {
  if (containerStyleStore.value) {
    let styles = []
    for (let key in containerStyleStore.value) {
      styles.push(`${key}:${containerStyleStore.value[key]}`)
    }
    return styles.join(';')
  }
  return ''
})

const _name = ref<string>()
const command = ref<string>("")
const cursorConf = reactive({
  defaultWidth: 7,
  width: 7,
  left: 'unset',
  top: 'unset',
  idx: 0, //  从0开始
  show: false
})
const byteLen = reactive({
  init: false,
  en: 8,
  cn: 13
})
const showInputLine = ref<boolean>(true)
const terminalLog = ref<MessageGroup[]>([])
const searchCmdResult = reactive({
  //  避免默认提示板与输入框遮挡，某些情况下需要隐藏提示板
  show: false,
  defaultBoxRect: null,
  item: <Command>null
})
const allCommandStore = ref<Command[]>([])
const fullscreenState = ref<boolean>(false)
const inputBoxParam = reactive({
  boxWidth: 0,
  boxHeight: 0,
  promptWidth: 0,
  promptHeight: 0
})
const flash = reactive({
  open: false,
  content: null
})
const ask = reactive({
  open: false,
  question: <string>null,
  isPassword: false,
  callback: null,
  autoReview: false,
  input: ''
})
const textEditor = reactive<EditorConfig>({
  open: false,
  focus: false,
  value: '',
  onClose: null
})
textEditor.onFocus = () => {
  textEditor.focus = true
}
textEditor.onBlur = () => {
  textEditor.focus = false
}
const containerStyleStore = ref<{ [prop: string]: string | number }>()
const headerHeight = ref(0)

//  references
const terminalContainerRef = ref(null)
const terminalHeaderRef = ref(null)
const terminalWindowRef = ref(null)
const terminalCmdInputRef = ref(null)
const terminalAskInputRef = ref(null)
const terminalInputBoxRef = ref(null)
const terminalInputPromptRef = ref(null)
const terminalEnFlagRef = ref(null)
const terminalCnFlagRef = ref(null)
const terminalTextEditorRef = ref(null)
const terminalCursorRef = ref(null)
const terminalHelpBoxRef = ref(null)
const resizeLTRef = ref(null)
const resizeRTRef = ref(null)
const resizeLBRef = ref(null)
const resizeRBRef = ref(null)

//  listeners
const clickListener = ref()
const keydownListener = ref()
const terminalListener = ref()

const resizeObserver = ref<ResizeObserver>()

onMounted(() => {
  emits('init-before', getName())

  _initContainerStyle()

  if (props.initLog) {
    _newTerminalLogGroup('init')
    _pushMessage(props.initLog)
  }

  let commandStore = []
  if (props.enableDefaultCommand) {
    commandStore = commandStore.concat(DEFAULT_COMMANDS)
  }
  if (props.commandStore) {
    if (props.commandStoreSort) {
      props.commandStore.sort(props.commandStoreSort)
    }
    commandStore = commandStore.concat(props.commandStore)
  }
  allCommandStore.value = commandStore

  if (terminalWindowRef.value) {
    terminalWindowRef.value.scrollTop = terminalWindowRef.value.offsetHeight;
  }

  let selectContentText = null

  _eventOn(window, "click", clickListener.value = e => {
    let activeCursor = false
    let container = terminalContainerRef.value
    if (container && container.getBoundingClientRect && _pointInRect(e, container.getBoundingClientRect())) {
      activeCursor = _isParentDom(e.target, container, "t-container")
          || (e.target && e.target.classList.contains('t-text-editor-floor-btn'))
    }

    if (isBlockCommandFocus.value) {
      cursorConf.show = false
    } else {
      cursorConf.show = activeCursor
    }

    if (activeCursor) {
      _onActive()
    } else {
      _onInactive()
    }
  })

  _eventOn(window, 'keydown', keydownListener.value = (event: KeyboardEvent) => {
    if (isActive.value) {
      try {
        let key = event.key.toLowerCase()
        if (key.match(/c|control|meta/g)) {
          if (event.metaKey || event.ctrlKey) {
            return
          }
          if (key === 'c' && (event.metaKey || event.ctrlKey)) {
            return
          }
        }
        if (cursorConf.show) {
          if (key === 'tab') {
            if (props.tabKeyHandler) {
              props.tabKeyHandler(event, (cmd: string) => {
                if (cmd) {
                  command.value = cmd.trim()
                } else {
                  command.value = ''
                }
              })
            } else {
              _fillCmd()
            }
            event.preventDefault()
          } else if (document.activeElement !== terminalCmdInputRef.value) {
            terminalCmdInputRef.value.focus()
            _onInputKeydown(event)
          }
        }
      } finally {
        emits('on-keydown', event, getName())
      }
    }
  })

  //  先暂存选中文本
  _eventOn(terminalWindowRef.value, 'mousedown', () => {
    let selection = _getSelection();
    let content = ''
    if (!selection.isCollapsed || (content = selection.toString()).length > 0) {
      selectContentText = content.length > 0 ? content : selection.toString()
      selectContentText = selectContentText.replace(new RegExp(String.fromCharCode(160), "g"), ' ')
    }
  })

  _eventOn(terminalWindowRef.value, 'contextmenu', (event: MouseEvent) => {
    event.preventDefault();

    if (selectContentText) {
      _copyTextToClipboard(selectContentText)
      selectContentText = null
      return;
    }

    const clipboardText = _getClipboardText();
    if (clipboardText) {
      clipboardText.then(text => {
        if (!text) {
          return;
        }
        text = text.trim()
        const cmd = command.value;
        command.value = cmd && cmd.length ? `${cmd}${text}` : text;
        _focus()
      }).catch(error => {
        console.error(error);
      })
    } else {
      _focus()
    }
  });

  let containerStyleCache = null;
  //  监听全屏事件，用户ESC退出时需要设置全屏状态
  ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange'].forEach((item) => {
    _eventOn(window, item, () => {
      const dom: any = document
      let isFullScreen = dom.fullscreenElement || dom.fullScreen || dom.mozFullScreen || dom.webkitIsFullScreen
      if (isFullScreen) {
        //  存储窗口样式
        containerStyleCache = JSON.parse(JSON.stringify(containerStyleStore.value))

        //  进入全屏
        if (_isSafari()) {
          containerStyleStore.value.width = '100%'
          containerStyleStore.value.height = '100%'
          containerStyleStore.value.left = '0'
          containerStyleStore.value.top = '0'
        }
      } else {
        //  退出全屏
        fullscreenState.value = false
        if (containerStyleCache) {
          containerStyleStore.value = containerStyleCache
        }
      }
    });
  });

  //  如果是移动设备，需要监听touch事件来模拟双击事件
  if (_isPhone() || _isPad()) {
    let touchTime = 0
    terminalWindowRef.value.addEventListener('touchend', () => {
      let now = new Date().getTime()
      if (touchTime === 0) {
        touchTime = now
      } else {
        if (new Date().getTime() - touchTime < 600) {
          //  移动端双击
          _focus(true)
        } else {
          touchTime = now
        }
      }
    })
  }

  //  监听header的尺寸变化
  resizeObserver.value = new ResizeObserver(entries => {
    for (const entry of entries) {
      if (entry.target === terminalHeaderRef.value) {
        updateHeaderHeight()
      }
    }
  });
  if (terminalHeaderRef.value) {
    resizeObserver.value.observe(terminalHeaderRef.value)
  }

  _initDrag()

  register(getName(), terminalListener.value = (type: string, options?: any) => {
    if (type === 'pushMessage') {
      _pushMessage(options)
    } else if (type === 'appendMessage') {
      _appendMessage(options as string)
    } else if (type === 'fullscreen') {
      _fullscreen()
    } else if (type === 'isFullscreen') {
      return fullscreenState.value
    } else if (type === 'dragging') {
      if (draggable.value) {
        _dragging(options.x, options.y)
      } else {
        console.warn("Terminal is not draggable: " + getName())
      }
    } else if (type === 'execute') {
      if (!isBlockCommandFocus.value && _nonEmpty(options)) {
        command.value = options.trim()
        _execute()
      }
    } else if (type === 'focus') {
      _focus(options)
    } else if (type === 'elementInfo') {
      let windowRect = terminalWindowRef.value.getBoundingClientRect()
      let containerRect = terminalContainerRef.value.getBoundingClientRect()
      let hasScroll = terminalWindowRef.value.scrollHeight > terminalWindowRef.value.clientHeight
          || terminalWindowRef.value.offsetHeight > terminalWindowRef.value.clientHeight
      return {
        pos: _getPosition(),           //  窗口所在位置
        screenWidth: containerRect.width,   //  窗口整体宽度
        screenHeight: containerRect.height, //  窗口整体高度
        clientWidth: hasScroll ? (windowRect.width - 48) : (windowRect.width - 40), //  可显示内容范围高度，减去padding值，如果有滚动条去掉滚动条宽度
        clientHeight: windowRect.height,    //  可显示内容范围高度
        charWidth: {
          en: byteLen.en,            //  单个英文字符宽度
          cn: byteLen.cn             //  单个中文字符宽度
        }
      }
    } else if (type === 'textEditorOpen') {
      let opt: EditorSetting = options || {}

      textEditor.value = opt.content
      textEditor.open = true
      textEditor.onClose = opt.onClose
      _focus()
    } else if (type === 'textEditorClose') {
      return _textEditorClose(options)
    } else if (type === 'clearLog') {
      return _clearLog(options)
    } else if (type === 'getCommand') {
      return _getCommand()
    } else if (type === 'setCommand') {
      return _setCommand(options)
    } else {
      console.error(`Unsupported event type ${type} in instance ${getName()}`)
    }
  })
  emits('init-complete', getName())
})

onUnmounted(() => {
  emits('destroyed', getName())
  _eventOff(window, 'keydown', keydownListener.value)
  _eventOff(window, "click", clickListener.value)
  if (resizeObserver.value && terminalHeaderRef.value) {
    resizeObserver.value.unobserve(terminalHeaderRef.value)
    resizeObserver.value = null
  }
  unregister(getName())
})

watch(
    () => props.context,
    () => {
      nextTick(() => {
        _calculatePromptLen()
      }).then(() => {
      })
    }
)

watch(
    () => props.name,
    (newVal, oldVal) => {
      rename(newVal ? newVal : getName(), oldVal ? oldVal : _name.value, terminalListener.value)
    }
)

watch(
    () => {
      if (props.dragConf) {
        return props.dragConf.zIndex
      } else {
        return null
      }
    },
    (newVal) => {
      if (containerStyleStore.value) {
        containerStyleStore.value['z-index'] = newVal
      }
    }
)

watch(
    () => props.showHeader,
    () => {
      updateHeaderHeight()
    }
)

let idx = 0;

function generateTerminalName() {
  idx++;
  return `terminal_${idx}`;
}

const updateHeaderHeight = () => {
  nextTick(() => {
    if (terminalHeaderRef.value && terminalHeaderRef.value.getBoundingClientRect) {
      let rect: DOMRect = terminalHeaderRef.value.getBoundingClientRect()
      headerHeight.value = rect.height
    } else {
      headerHeight.value = 0
    }
  })
}

const getName = () => {
  if (props.name) {
    return props.name;
  }
  if (!_name.value) {
    _name.value = generateTerminalName();
  }
  return _name.value;
}

const _clearLog = (clearHistory: boolean) => {
  if (clearHistory) {
    store.clear(getName())
  } else {
    terminalLog.value = [];
  }
}

const _triggerClick = (key: string) => {
  if (key === 'fullScreen' && !fullscreenState.value) {
    _fullscreen()
  } else if (key === 'minScreen' && fullscreenState.value) {
    _fullscreen()
  } else if (key === 'pin' && props.showHeader) {
    let pinned = props.dragConf.pinned || false
    props.dragConf.pinned = !pinned;
  }

  emits('on-click', key, getName())
}

const _calculateByteLen = () => {
  if (byteLen.init) {
    return
  }
  let enGhost = terminalEnFlagRef.value
  if (enGhost) {
    let rect = enGhost.getBoundingClientRect()
    if (rect && rect.width > 0) {
      byteLen.init = true
      byteLen.en = rect.width
      byteLen.cn = terminalCnFlagRef.value.getBoundingClientRect().width

      cursorConf.defaultWidth = byteLen.en
    }
  }
}

const _calculatePromptLen = () => {
  let prompt = terminalInputPromptRef.value
  if (prompt) {
    let rect = prompt.getBoundingClientRect()
    if (rect.width > 0) {
      inputBoxParam.promptWidth = rect.width
      inputBoxParam.promptHeight = rect.height
    }
  }
}

const _resetSearchKey = () => {
  searchCmdResult.item = null
}

const _searchCmd = (key?: string) => {
  if (!props.autoHelp) {
    return
  }

  //  用户自定义搜索实现
  if (props.searchHandler) {
    props.searchHandler(allCommandStore.value, key, (cmd: Command) => {
      searchCmdResult.item = cmd
      _jumpToBottom()
    })
    return
  }

  let cmd = key
  if (cmd == null) {
    cmd = command.value.split(' ')[0]
  }
  if (_isEmpty(cmd)) {
    _resetSearchKey()
  } else if (cmd.trim().indexOf(" ") < 0) {
    let reg = new RegExp(cmd.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i')
    let matchSet = []

    let target = null
    for (const o of allCommandStore.value) {
      if (_nonEmpty(o.key)) {
        let res = o.key.match(reg)
        if (res != null) {
          let score = res.index * 1000 + (cmd.length - res[0].length) + (o.key.length - res[0].length)
          if (score === 0) {
            //  完全匹配，直接返回
            target = o
            break
          } else {
            matchSet.push({
              item: o,
              score: score
            })
          }
        }
      }
    }
    if (target == null) {
      if (matchSet.length > 0) {
        matchSet.sort((a, b) => {
          return a.score - b.score
        })
        target = matchSet[0].item
      } else {
        searchCmdResult.item = null
        return
      }
    }
    searchCmdResult.item = target
    _jumpToBottom()
  }
}

const _fillCmd = () => {
  if (searchCmdResult.item) {
    command.value = searchCmdResult.item.key
  }
}

const _focus = (enforceFocus?: boolean | MouseEvent) => {
  nextTick(() => {
    _onActive()
    let input: HTMLInputElement
    if (ask.open) {
      input = terminalAskInputRef.value
      cursorConf.show = false
    } else if (textEditor.open) {
      input = terminalTextEditorRef.value
      cursorConf.show = false
    } else {
      if (enforceFocus === true) {
        input = terminalCmdInputRef.value
      }
      cursorConf.show = true
    }
    if (input) {
      input.focus()
    }
  })
}

/**
 * help命令执行后调用此方法
 *
 * 命令搜索：comm*、command
 * 分组搜索：:groupA
 */
const _printHelp = (regExp: RegExp, srcStr: string) => {
  let content = {
    head: ['KEY', 'GROUP', 'DETAIL'],
    rows: []
  }
  let findGroup = srcStr && srcStr.length > 1 && srcStr.startsWith(":")
      ? srcStr.substring(1).toLowerCase()
      : null
  allCommandStore.value.forEach(cmd => {
    if (findGroup) {
      if (_isEmpty(cmd.group) || findGroup !== cmd.group.toLowerCase()) {
        return;
      }
    } else if (!regExp.test(cmd.key)) {
      return
    }
    let row = []
    row.push(`<span class='t-cmd-key'>${cmd.key}</span>`)
    row.push(cmd.group)

    let detail = ''
    if (_nonEmpty(cmd.description)) {
      detail += `Description: ${cmd.description}<br>`
    }
    if (_nonEmpty(cmd.usage)) {
      detail += `Usage: <code>${_html(cmd.usage)}</code><br>`
    }
    if (cmd.example != null) {
      if (cmd.example.length > 0) {
        detail += '<br>'
      }

      for (let idx in cmd.example) {
        let eg = cmd.example[idx]
        detail += `
                        <div>
                            <div style="float:left;width: 30px;display:flex;font-size: 12px;line-height: 18px;">
                              eg${parseInt(idx) + 1}:
                            </div>
                            <div class="t-cmd-help-example">
                              <ul class="t-example-ul">
                                <li class="t-example-li"><code>${eg.cmd}</code></li>
                                <li class="t-example-li"><span></span></li>
                        `

        if (_nonEmpty(eg.des)) {
          detail += `<li class="t-example-li"><span>${eg.des}</span></li>`
        }
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
  _pushMessage({
    type: 'table',
    content: content
  })
}

const _execute = () => {
  _resetSearchKey()
  _saveCurCommand();
  if (_nonEmpty(command.value)) {
    try {
      let split = command.value.split(" ")
      let cmdKey = split[0];
      emits("before-exec-cmd", cmdKey, command.value, getName())

      const execute = () => {
        showInputLine.value = false
        let _success: SuccessFunc = (message) => {
          let _finish = () => {
            showInputLine.value = true
            _endExecCallBack()
          }

          if (message) {
            //  实时回显处理
            if (message instanceof TerminalFlash) {
              message.onFlush((msg: string) => {
                flash.content = msg
              })
              message.onFinish(() => {
                flash.open = false
                _finish()
              })
              flash.open = true
              return
            } else if (message instanceof TerminalAsk) {
              message.onAsk((options: AskConfig) => {
                ask.input = ''
                ask.isPassword = options.isPassword
                ask.question = _html(options.question)
                ask.callback = options.callback
                ask.autoReview = options.autoReview
                _focus()
              })

              message.onFinish(() => {
                ask.open = false
                _finish()
                _focus(true)
              })
              ask.open = true
              return
            } else {
              _pushMessage(message)
            }
          }
          _finish()
        }

        let _failed: FailedFunc = (message) => {
          if (message) {
            _pushMessage({
              type: 'normal',
              class: 'error',
              content: message
            })
          }
          showInputLine.value = true
          _endExecCallBack()
        }

        emits("exec-cmd", cmdKey, command.value, _success, _failed, getName())
      }
      if (props.enableDefaultCommand) {
        switch (cmdKey) {
          case 'help': {
            let reg = `^${split.length > 1 && _nonEmpty(split[1]) ? split[1] : "*"}$`
            reg = reg.replace(/\*/g, ".*")
            _printHelp(new RegExp(reg, "i"), split[1])
            break;
          }
          case 'clear':
            _clearLog(split.length === 2 && split[1] === 'history');
            break;
          case 'open':
            _openUrl(split[1], _pushMessage);
            break;
          default: {
            execute()
            return
          }
        }
      } else {
        execute()
        return;
      }
    } catch (e) {
      console.error(e)
      _pushMessage({
        type: 'normal',
        class: 'error',
        content: _html(e.stack),
        tag: 'error'
      })
    }
  }
  _endExecCallBack()
}

const _endExecCallBack = () => {
  command.value = ""
  _resetCursorPos()
  if (isActive.value) {
    _focus()
    cursorConf.show = true
  } else {
    cursorConf.show = false
  }
  searchCmdResult.show = true
  searchCmdResult.defaultBoxRect = null
}

const _filterMessageType = (message: Message) => {
  const valid = message.type && /^(normal|html|code|table|json)$/.test(message.type)
  if (!valid) {
    console.debug(`Invalid terminal message type: ${message.type}, the default type normal will be used`)
    message.type = 'normal'
  } else {
    if (message.type === 'json') {
      if (!message.depth) {
        message.depth = 1;
      }
    }
  }
  return valid
}

const _newTerminalLogGroup = (tag?: string): MessageGroup => {
  let newGroup: MessageGroup = {
    fold: false,
    logs: []
  }
  if (tag) {
    newGroup.tag = tag
  }
  terminalLog.value.push(newGroup)
  return newGroup
}

const _pushMessage = (message: Message | Array<Message> | string) => {
  if (!message) return
  if (message instanceof Array) {
    for (let m of message) {
      _pushMessage0(m)
    }
    return;
  }

  if (typeof message === 'string') {
    message = {
      type: 'normal',
      content: message as string
    }
  }

  if (message.type === 'ansi') {
    message.type = 'html'
    message.content = _parseANSI(message.content as string)
  }

  _pushMessage0(message)

  if (message.type === 'json') {
    setTimeout(() => {
      _jumpToBottom()
    }, 80)
  }
}

const _pushMessage0 = (message: Message) => {
  _filterMessageType(message)
  if (message.type !== 'cmdLine' && props.pushMessageBefore) {
    props.pushMessageBefore(message, getName())
  }

  let terminalLogLength = terminalLog.value.length
  if (terminalLogLength === 0) {
    _newTerminalLogGroup()
  }
  terminalLogLength = terminalLog.value.length
  let logGroup = terminalLog.value[terminalLogLength - 1]
  logGroup.logs.push(message)

  //  留 10% 的缓冲
  let limit = Math.floor(props.logSizeLimit * 1.1)
  if (limit > 0 && terminalLogLength > limit) {
    let left = terminalLogLength - props.logSizeLimit
    terminalLog.value.splice(0, left)
  }

  _jumpToBottom()
}

/**
 * 追加内容到最后一条记录中，仅当最后一条消息存在，且其格式为 normal、ansi、code、html时才会追加，
 * 否则push一条新的消息
 * @param message 被追加的内容，格式为string
 */
const _appendMessage = (message: string) => {
  let lastMessage: Message
  for (let i = terminalLog.value.length - 1; i >= 0; i--) {
    let group = terminalLog.value[i]
    for (let j = group.logs.length - 1; j>=0;j--) {
      let message = group.logs[j]
      if (message.type !== 'cmdLine') {
        lastMessage = message
        break
      }
    }
    if (lastMessage) {
      break
    }
  }
  if (lastMessage) {
    //  仅对部分格式的消息可追加
    if (lastMessage.type === 'normal' || lastMessage.type === 'ansi'
        || lastMessage.type === 'code' || lastMessage.type == 'html') {
      lastMessage.content += message
    } else {
      console.warn(`The last message type is ${lastMessage.type}, can not append it and then push it.`)
      _pushMessage(message)
    }
  } else {
    _pushMessage(message)
  }
}

const _jumpToBottom = () => {
  nextTick(() => {
    let box = terminalWindowRef.value
    if (box != null) {
      box.scrollTo({top: box.scrollHeight, behavior: props.scrollMode})
    }
  }).then(() => {
  })
}

const _saveCurCommand = () => {
  if (_nonEmpty(command.value)) {
    store.push(getName(), command.value)
  }

  let group = _newTerminalLogGroup()

  group.logs.push({
    type: "cmdLine",
    content: `${_html(props.context)}${props.contextSuffix}${_commandFormatter(command.value)}`
  });
  _jumpToBottom()
}

const _resetCursorPos = (cmd?: string) => {
  _calculateByteLen()
  cursorConf.idx = (cmd ? cmd : command.value).length
  cursorConf.left = 'unset'
  cursorConf.top = 'unset'
  cursorConf.width = cursorConf.defaultWidth
}

const _calculateCursorPos = (cmdStr?: string) => {
  //  idx可以认为是需要光标覆盖字符的索引
  let idx = cursorConf.idx
  let cmd = cmdStr ? cmdStr : command.value

  _calculateByteLen()

  if (idx < 0 || idx >= cmd.length) {
    _resetCursorPos()
    return
  }

  if (inputBoxParam.promptWidth === 0) {
    _calculatePromptLen()
  }

  let lineWidth = terminalInputBoxRef.value.getBoundingClientRect().width

  let pos = {left: 0, top: 0}
  //  当前字符长度
  let charWidth = cursorConf.defaultWidth
  //  前一个字符的长度
  let preWidth = inputBoxParam.promptWidth

  //  先找到被覆盖字符的位置
  for (let i = 0; i <= idx; i++) {
    charWidth = _calculateStringWidth(cmd[i])
    pos.left += preWidth
    preWidth = charWidth
    if (pos.left > lineWidth) {
      //  行高 对应 css 变量 --t-point-size
      pos.top += 15
      pos.left = charWidth
    }
  }

  cursorConf.left = pos.left + 'px'
  cursorConf.top = pos.top + 'px'
  cursorConf.width = charWidth
}

const _cursorGoLeft = () => {
  if (cursorConf.idx > 0) {
    cursorConf.idx--;
  }
  _calculateCursorPos()
}

const _cursorGoRight = () => {
  if (cursorConf.idx < command.value.length) {
    cursorConf.idx++;
  }
  _calculateCursorPos()
}

const _switchPreCmd = () => {
  let cmdLog = store.getLog(getName())
  let cmdIdx = store.getIdx(getName())
  if (cmdLog.length !== 0 && cmdIdx > 0) {
    cmdIdx -= 1;
    command.value = cmdLog[cmdIdx] ? cmdLog[cmdIdx] : '';
  }
  _resetCursorPos()
  store.setIdx(getName(), cmdIdx)
  _searchCmd(command.value.trim().split(" ")[0])
}

const _switchNextCmd = () => {
  let cmdLog = store.getLog(getName())
  let cmdIdx = store.getIdx(getName())
  if (cmdLog.length !== 0 && cmdIdx < cmdLog.length - 1) {
    cmdIdx += 1;
    command.value = cmdLog[cmdIdx] ? cmdLog[cmdIdx] : '';
  } else {
    cmdIdx = cmdLog.length;
    command.value = '';
  }
  _resetCursorPos()
  store.setIdx(getName(), cmdIdx)
  _searchCmd(command.value.trim().split(" ")[0])
}

const _calculateStringWidth = (str: string): number => {
  let width = 0
  for (let char of str) {
    width += (_getByteLen(char) === 1 ? byteLen.en : byteLen.cn)
  }
  return width
}

const _onInput = (e: InputEvent) => {
  if (props.inputFilter) {
    let value = (e.target as HTMLInputElement).value
    let newStr = props.inputFilter(e.data, value, e)
    if (newStr == null) {
      newStr = value
    }
    command.value = newStr
  }

  if (_isEmpty(command.value)) {
    _resetSearchKey();
  } else {
    _searchCmd()
  }

  _checkInputCursor()
  _calculateCursorPos()

  let point = terminalCursorRef.value.getBoundingClientRect()
  let rect = searchCmdResult.defaultBoxRect || (terminalHelpBoxRef.value ? terminalHelpBoxRef.value.getClientRect() : null)
  if (point && rect && _pointInRect(point, rect)) {
    searchCmdResult.show = false
    searchCmdResult.defaultBoxRect = rect
  } else {
    searchCmdResult.show = true
    searchCmdResult.defaultBoxRect = null
  }
}

const _checkInputCursor = () => {
  let eIn = terminalCmdInputRef.value
  if (eIn.selectionStart !== cursorConf.idx) {
    cursorConf.idx = eIn.selectionStart
  }
}

const _onInputKeydown = (e: KeyboardEvent) => {
  let key = e.key.toLowerCase()
  if (key === 'arrowleft') {
    _checkInputCursor()
    _cursorGoLeft()
  } else if (key === 'arrowright') {
    _checkInputCursor()
    _cursorGoRight()
  }
}

const _onInputKeyup = (e: KeyboardEvent) => {
  let key = e.key.toLowerCase()
  let code = e.code.toLowerCase()
  if (key === 'home' || key === 'end' || code === 'altleft' || code === 'metaleft' || code === 'controlleft'
      || ((e.ctrlKey || e.metaKey || e.altKey) && (key === 'arrowright' || key === 'arrowleft'))) {
    _checkInputCursor()
    _calculateCursorPos()
  }
}

const _fullscreen = () => {
  let fullArea = terminalContainerRef.value
  if (fullscreenState.value) {
    let dom: any = document
    if (dom.exitFullscreen) {
      dom.exitFullscreen();
    } else if (dom.webkitCancelFullScreen) {
      dom.webkitCancelFullScreen();
    } else if (dom.mozCancelFullScreen) {
      dom.mozCancelFullScreen();
    } else if (dom.msExitFullscreen) {
      dom.msExitFullscreen();
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
  fullscreenState.value = !fullscreenState.value
}

const _initContainerStyle = () => {
  let styleStore: { [prop: string]: string | number } = {}
  if (draggable.value) {
    let clientWidth = document.body.clientWidth
    let clientHeight = document.body.clientHeight

    let confWidth = props.dragConf.width
    let width = confWidth ? confWidth : 700

    if (confWidth && typeof confWidth === 'string' && (confWidth as string).endsWith("%")) {
      width = clientWidth * (parseInt(confWidth) / 100)
    }
    let confHeight = props.dragConf.height
    let height: number = confHeight ? parseInt(confHeight) : 500
    if (confHeight && typeof confHeight === 'string' && confHeight.endsWith("%")) {
      height = clientHeight * (parseInt(confHeight) / 100)
    }

    let zIndex = props.dragConf.zIndex ? props.dragConf.zIndex : 100

    let initX: number, initY: number

    let initPos = props.dragConf.init
    if (initPos && initPos.x && initPos.y) {
      initX = initPos.x
      initY = initPos.y
    } else {
      initX = (clientWidth - width) / 2
      initY = (clientHeight - height) / 2
    }
    styleStore.position = 'fixed'
    styleStore.width = width + 'px'
    styleStore.height = height + 'px'
    styleStore.left = initX + 'px'
    styleStore.top = initY + 'px'
    styleStore['z-index'] = zIndex
  } else {
    styleStore.width = '100%'
    styleStore.height = '100%'
  }
  containerStyleStore.value = styleStore
}

const _initDrag = () => {
  if (!draggable.value) {
    return
  }
  // 记录当前鼠标位置
  let mouseOffsetX = 0;
  let mouseOffsetY = 0;

  let dragArea = terminalHeaderRef.value
  let box = terminalContainerRef.value
  let window = terminalWindowRef.value

  let isDragging = false;
  let isResize = false;
  let resizeData = {
    minWidth: 270,
    minHeight: 180,
    type: '',
    boxX: 0,
    boxY: 0,
    boxWidth: 0,
    boxHeight: 0,
    cursorX: 0,
    cursorY: 0
  }

  const storeResizeData = (type: string, evt: MouseEvent) => {
    isResize = true
    window.style['user-select'] = 'none'
    resizeData.type = type
    resizeData.cursorX = evt.clientX
    resizeData.cursorY = evt.clientY
    resizeData.boxX = box.offsetLeft
    resizeData.boxY = box.offsetTop
    resizeData.boxWidth = box.clientWidth
    resizeData.boxHeight = box.clientHeight
  }

  _eventOn(dragArea, 'mousedown', (evt: MouseEvent) => {
    if (fullscreenState.value) {
      return
    }
    _onActive()
    mouseOffsetX = evt.clientX - box.offsetLeft;
    mouseOffsetY = evt.clientY - box.offsetTop;

    isDragging = true
    window.style['user-select'] = 'none'
  })

  _eventOn(resizeLTRef.value, 'mousedown', (evt: MouseEvent) => {
    storeResizeData('lt', evt)
  })
  _eventOn(resizeRTRef.value, 'mousedown', (evt: MouseEvent) => {
    storeResizeData('rt', evt)
  })
  _eventOn(resizeLBRef.value, 'mousedown', (evt: MouseEvent) => {
    storeResizeData('lb', evt)
  })
  _eventOn(resizeRBRef.value, 'mousedown', (evt: MouseEvent) => {
    storeResizeData('rb', evt)
  })

  _eventOn(document, 'mousemove', (evt: MouseEvent) => {
    if (isPinned.value || fullscreenState.value) {
      return
    }
    if (isDragging) {
      let moveX = evt.clientX - mouseOffsetX;
      let moveY = evt.clientY - mouseOffsetY;
      _dragging(moveX, moveY)
    } else if (isResize) {
      let cx = evt.clientX - resizeData.cursorX
      let cy = evt.clientY - resizeData.cursorY
      //  右下
      if (resizeData.type === 'rb') {
        cx = cx < 0 ? -Math.min(resizeData.boxWidth - resizeData.minWidth, -cx) : cx
        cy = cy < 0 ? -Math.min(resizeData.boxHeight - resizeData.minHeight, -cy) : cy

        containerStyleStore.value.width = (resizeData.boxWidth + cx) + 'px'
        containerStyleStore.value.height = (resizeData.boxHeight + cy) + 'px'
      }
      //  右上
      else if (resizeData.type === 'rt') {
        cx = cx < 0 ? -Math.min(resizeData.boxWidth - resizeData.minWidth, -cx) : cx
        cy = cy > 0 ? Math.min(resizeData.boxHeight - resizeData.minHeight, cy) : cy

        containerStyleStore.value.width = (resizeData.boxWidth + cx) + 'px'
        containerStyleStore.value.height = (resizeData.boxHeight - cy) + 'px'
        containerStyleStore.value.top = Math.max(0, resizeData.boxY + cy) + 'px'
      }
      //  左下
      else if (resizeData.type === 'lb') {
        cx = cx > 0 ? Math.min(resizeData.boxWidth - resizeData.minWidth, cx) : cx
        cy = cy < 0 ? -Math.min(resizeData.boxHeight - resizeData.minHeight, -cy) : cy

        containerStyleStore.value.width = (resizeData.boxWidth - cx) + 'px'
        containerStyleStore.value.height = (resizeData.boxHeight + cy) + 'px'
        containerStyleStore.value.left = Math.max(0, resizeData.boxX + cx) + 'px'
      }
      //  左上
      else if (resizeData.type === 'lt') {
        cx = cx > 0 ? Math.min(resizeData.boxWidth - resizeData.minWidth, cx) : cx
        cy = cy > 0 ? Math.min(resizeData.boxHeight - resizeData.minHeight, cy) : cy

        containerStyleStore.value.width = (resizeData.boxWidth - cx) + 'px'
        containerStyleStore.value.height = (resizeData.boxHeight - cy) + 'px'
        containerStyleStore.value.left = Math.max(0, resizeData.boxX + cx) + 'px'
        containerStyleStore.value.top = Math.max(0, resizeData.boxY + cy) + 'px'
      }
    }
  })

  _eventOn(document, 'mouseup', () => {
    if (isDragging || isResize) {
      _onActive()
    }
    isDragging = false
    isResize = false
    window.style['user-select'] = 'unset'
  })
}

const _dragging = (x: number, y: number) => {
  if (isPinned.value) {
    return
  }
  let clientWidth = document.body.clientWidth
  let clientHeight = document.body.clientHeight
  let container = terminalContainerRef.value

  let xVal: number, yVal: number
  if (x > clientWidth - container.clientWidth) {
    xVal = clientWidth - container.clientWidth
  } else {
    xVal = Math.max(0, x)
  }

  if (y > clientHeight - container.clientHeight) {
    yVal = clientHeight - container.clientHeight
  } else {
    yVal = Math.max(0, y)
  }

  if (props.dragConf) {
    props.dragConf.init = {
      x: xVal,
      y: yVal
    }
  }

  containerStyleStore.value.left = xVal + "px";
  containerStyleStore.value.top = yVal + "px";
}

const _commandFormatter = (cmd: string): string => {
  if (props.commandFormatter != null) {
    return props.commandFormatter(cmd)
  }
  return _defaultCommandFormatter(cmd)
}

const _getPosition = (): Position => {
  if (draggable.value) {
    let box = terminalContainerRef.value
    return {x: parseInt(box.style.left), y: parseInt(box.style.top)}
  } else {
    return {x: 0, y: 0}
  }
}

const _onAskInput = () => {
  if (ask.autoReview) {
    _pushMessage(ask.question + (ask.isPassword ? '*'.repeat(ask.input.length) : ask.input))
  }
  ask.question = null
  if (ask.callback) {
    ask.callback(ask.input)
  }
}

const _textEditorClose = (options: any) => {
  if (textEditor.open) {
    textEditor.open = false
    let content = textEditor.value
    textEditor.value = ''
    if (textEditor.onClose) {
      textEditor.onClose(content, options)
      textEditor.onClose = null
    }
    _focus(true)
    return content
  }
}

const _onActive = () => {
  emits('on-active', getName())
}

const _onInactive = () => {
  emits('on-inactive', getName())
}

const _getCommand = () => {
  return command.value
}

const _setCommand = (cmd: any) => {
  if(ask.open) {
    console.error("Cannot call 'setCommand' api in ask mode")
    return
  } else if(textEditor.open) {
    console.error("Cannot call 'setCommand' api in editor mode")
    return
  } else if(flash.open) {
    console.error("Cannot call 'setCommand' api in flash mode")
    return
  }
  if (cmd) {
    command.value = cmd.toString()
    nextTick(() => {
      _resetCursorPos()
      let input = terminalCmdInputRef.value
      input.focus()
      let cursorPos = command.value.length
      input.setSelectionRange(cursorPos,cursorPos)
    })
  } else {
    console.warn("The parameter received by the 'setCommand' api is undefined")
  }
}

const _closeGroupFold = (group: MessageGroup) => {
  if (props.enableFold && group.fold) {
    group.fold = false
  }
}

defineExpose({
  pushMessage: _pushMessage,
  fullscreen: _fullscreen,
  isFullscreen: (): boolean => {
    return fullscreenState.value
  },
  dragging: _dragging,
  execute: (cmd: string): any => {
    return api.execute(getName(), cmd)
  },
  focus: _focus,
  elementInfo: (): any => {
    return api.elementInfo(getName())
  },
  textEditorOpen: (options?: EditorSetting) => {
    return api.textEditorOpen(getName(), options)
  },
  textEditorClose: _textEditorClose,
  clearLog: _clearLog
})

</script>

<template>
  <div :class="'t-container ' + (isActive ? '' : 't-disable-select')"
       :style="containerStyle"
       ref="terminalContainerRef">
    <div v-if="draggable">
      <div class="t-point t-point-lt" ref="resizeLTRef"></div>
      <div class="t-point t-point-rt" ref="resizeRTRef"></div>
      <div class="t-point t-point-lb" ref="resizeLBRef"></div>
      <div class="t-point t-point-rb" ref="resizeRBRef"></div>
    </div>

    <div class="terminal">
      <div class="t-header-container" ref="terminalHeaderRef" v-if="showHeader"
           :style="draggable ? 'cursor: move;' : ''" @dblclick="_fullscreen">
        <slot name="header">
          <t-header :title="title" :pinned="isPinned" :draggable="draggable" @on-click="_triggerClick"/>
        </slot>
      </div>
      <div class="t-window"
           :style="`${showHeader ? `height:calc(100% - ${headerHeight}px);margin-top: ${headerHeight}px;` : 'height:100%'};${enableFold ? 'padding:0 0 0 20px;' : 'padding:5px 10px;'}`"
           ref="terminalWindowRef"
           @click="_focus"
           @dblclick="_focus(true)">
        <div v-for="(group,groupIdx) in terminalLog"
             :key="groupIdx"
             :class="`t-log-box t-log-fold-container ${enableHoverStripe && group.logs.length > 1 ? 't-log-box-hover-script' : ''} ${group.fold ? 't-log-box-folded' : ''}`"
             :style="`margin-top:${lineSpace}px;`">
          <span v-if="enableFold && group.tag !== 'init' && group.logs.length > 1">
            <span class="t-log-fold-icon t-log-fold-icon-active"  v-if="group.fold" @click="_closeGroupFold(group)">+</span>
            <span class="t-log-fold-icon" v-else @click="group.fold = true">-</span>
            <span class="t-log-fold-line" v-if="!group.fold"/>
          </span>
          <div v-for="(item,idx) in group.logs"
               :key="idx"
               :style="`margin-top:${lineSpace}px;`"
               @click="_closeGroupFold(group)">
            <span v-if="item.type === 'cmdLine'"
                  class="t-crude-font t-cmd-line t-cmd-line-content"
                  v-html="item.content"/>
            <div v-else>
              <span v-if="item.type === 'normal'">
                <slot name="normal" :message="item">
                  <t-viewer-normal :message="item"/>
                </slot>
              </span>
              <div v-else-if="item.type === 'json'">
                <slot name="json" :message="item">
                  <t-viewer-json :message="item" :idx="idx"/>
                </slot>
              </div>
              <div v-else-if="item.type === 'code'">
                <slot name="code" :message="item">
                  <t-viewer-code :message="item"/>
                </slot>
              </div>
              <div v-else-if="item.type === 'table'">
                <slot name="table" :message="item">
                  <t-viewer-table :message="item"/>
                </slot>
              </div>
              <div v-else-if="item.type === 'html'">
                <slot name="html" :message="item">
                  <div v-html="item.content"></div>
                </slot>
              </div>
            </div>
          </div>
        </div>
        <div v-if="flash.open && flash.content" :style="`margin-top:${lineSpace}px;`">
          <slot name="flash" :content="flash.content">
            <div v-html="flash.content"></div>
          </slot>
        </div>
        <div v-if="ask.open && ask.question" :style="`margin-top:${lineSpace}px;`">
          <div v-html="ask.question" style="display: inline-block"></div>
          <input :type="ask.isPassword ? 'password' : 'text'"
                 ref="terminalAskInputRef"
                 v-model="ask.input"
                 class="t-ask-input"
                 autofocus
                 autocomplete="off"
                 auto-complete="new-password"
                 @keyup.enter="_onAskInput">
        </div>
        <p class="t-last-line t-crude-font t-cmd-line"
           ref="terminalInputBoxRef"
           v-show="showInputLine"
           :style="`margin-top:${lineSpace}px;`">
          <span class="t-prompt t-cmd-line-content t-disable-select" ref="terminalInputPromptRef">
            <span>{{ context }}</span>
            <span>{{ contextSuffix }}</span>
          </span><span class="t-cmd-line-content" v-html="_commandFormatter(command)"></span><span
            v-show="cursorConf.show"
            :class="`t-cursor t-disable-select t-cursor-${cursorStyle} ${cursorBlink ? 't-cursor-blink' : ''}`"
            ref="terminalCursorRef"
            :style="`width:${cursorConf.width}px;left:${cursorConf.left};top:${cursorConf.top};`">&nbsp;</span>
          <input type="text"
                 autofocus
                 v-model="command"
                 class="t-cmd-input t-disable-select"
                 ref="terminalCmdInputRef"
                 autocomplete="off"
                 auto-complete="new-password"
                 @keydown="_onInputKeydown"
                 @keyup="_onInputKeyup"
                 @input="_onInput"
                 @focusin="cursorConf.show = true"
                 @keyup.up.exact="_switchPreCmd"
                 @keyup.down.exact="_switchNextCmd"
                 @keyup.enter="_execute">
        </p>
        <slot name="helpCmd" :item="searchCmdResult.item">
          <p class="t-help-msg">
            {{ searchCmdResult.item ? searchCmdResult.item.usage : '' }}
          </p>
        </slot>
      </div>
    </div>
    <div v-if="enableExampleHint">
      <slot name="helpBox" :showHeader="showHeader" :item="searchCmdResult.item">
        <t-help-box ref="terminalHelpBoxRef"
                    :top="headerHeight + 10"
                    :result="searchCmdResult"
                    v-if="searchCmdResult.show && searchCmdResult.item && !_screenType().xs"/>
      </slot>
    </div>

    <div class="t-text-editor-container" v-if="textEditor.open"
         :style="`${showHeader ? `height:calc(100% - ${headerHeight}px);margin-top: ${headerHeight}px;` : 'height:100%'}`">
      <slot name="textEditor" :data="textEditor">
        <t-editor :config="textEditor"
                  v-model="textEditor.value"
                  @close="_textEditorClose"
                  ref="terminalTextEditorRef"></t-editor>
      </slot>
    </div>
    <span class="t-flag t-crude-font t-cmd-line t-disable-select">
      <span class="t-cmd-line-content t-disable-select" ref="terminalEnFlagRef">a</span>
      <span class="t-cmd-line-content t-disable-select" ref="terminalCnFlagRef">你</span>
    </span>
  </div>
</template>

<style scoped>

</style>
