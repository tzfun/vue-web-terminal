<script setup lang="ts">
import './css/scrollbar.css'
import './css/style.css'
import 'vue-json-viewer/style.css'
import Code from './components/CodeMessage.vue'
import HeaderContainer from './components/HeaderContainer.vue'
import { DragableConfType } from './models/DraggableInterface';
import {
  _getByteLen,
  _html,
  _isEmpty,
  _isSafari,
  _nonEmpty,
  _unHtml,
  _screenType,
} from "./Util.js";
import { getDragStyle, useToggleFullscreen, dragging, initDrag } from './utils/ContainerUtil';
import { nextTick, reactive, ref, onMounted, onUnmounted, watch } from 'vue';
import { DataConstant } from './constants/TerminalConstants';
import { InitLogType } from './models/LogInterface';
import { CommandType } from './models/CommandInterface';
import TerminalFlash from "./TerminalFlash";
import TerminalAsk from "./TerminalAsk";
import historyStore from "./HistoryStore";
import { MessageType, TableContentType } from './models/MessageInterface';
import { useKeydownListener } from './utils/ListenerUtil';
import TableMessage from './components/TableMessage.vue'
import CodeMessage from './components/CodeMessage.vue'
import JsonMessage from './components/JsonMessage.vue'
import NormalMessage from './components/NormalMessage.vue'
import TerminalObj from './TerminalObj'
import { TerminalAskHandlerOption } from './TerminalAsk';

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
  /** 命令格式化器 */
  commandFormatter?: Function
  /** 按下Tab键处理函数 */
  tabKeyHandler?: Function
  /** 记录条数超出此限制会发出警告 */
  warnLogCountLimit?: number
  /** 自动搜索帮助 */
  autoHelp?: boolean
  /**  显示终端头部 */
  showHeader?: boolean
  /**  拖拽配置 */
  dragConf?: DragableConfType
}

const props = withDefaults(defineProps<TerminalProps>(), {
  name: 'terminal',
  title: 'vue-web-terminal',
  showHeader: true,
  initLog: () => {
    return DataConstant.InitLog
  },
  context: "/vue-web-terminal",
  warnLogCountLimit: 200,
  autoHelp: true,
  enableExampleHint: true,
})

const emit = defineEmits<{
  (e: 'click', key: string): void
  (e: 'keydown', event: KeyboardEvent): void
  (e: 'beforeExecCmd', cmdKey: string, cmdValue: string): void
  (e: 'execCmd', cmdKey: string, cmdValue: string, success: (message: MessageType | TerminalFlash | TerminalAsk) => void, failed: (msg: string) => void): void
  (e: 'destroyed', name: string): void
  (e: 'initBefore', name: string): void
  (e: 'initComplete', name: string): void
}>()

const command = ref("");
const fullscreen = ref(false);
const showInputLine = ref(true);
const textEditorData = reactive({
  open: false,
  focus: false,
  value: "",
  onClose: (content: string) => { },
  onFocus: () => {
    textEditorData.focus = true;
  },
  onBlur: () => {
    textEditorData.focus = false;
  },
})
const ask = reactive<{ open: boolean, input: string } & TerminalAskHandlerOption>({
  open: false,
  question: "",
  isPassword: false,
  autoReview: false,
  input: "",
  callback: () => { }
})
const cursorConf = reactive(DataConstant.CursorConf)
const searchCmd = reactive<{ item?: CommandType }>({ item: undefined })
const allCommandStore = reactive(DataConstant.AllCommandStore)
const byteLen = reactive(DataConstant.ByteLen)
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
  content: "",
})

const terminalContainer = ref<HTMLDivElement>();
const terminalWindow = ref<HTMLDivElement>();
const terminalHeader = ref<InstanceType<typeof HeaderContainer>>();
const cmdInput = ref<HTMLInputElement>();
const askInput = ref<HTMLInputElement>();
const terminalInputBox = ref<HTMLParagraphElement>();
const terminalInputPrompt = ref<HTMLSpanElement>();
const terminalEnFlag = ref<HTMLSpanElement>();
const terminalCnFlag = ref<HTMLSpanElement>();
const textEditor = ref<HTMLTextAreaElement>();

watch(terminalLog, () => {
  jumpToBottom();
})

watch(() => props.context, () => {
  nextTick(() => {
    if (terminalInputPrompt.value) {
      inputBoxParam.promptWidth =
        terminalInputPrompt.value.getBoundingClientRect().width;
    }
  })
})

onMounted(() => {
  TerminalObj.register(props.name, (type, options) => {
    if (type === "pushMessage") {
      pushMessage(options);
    } else if (type === "fullscreen") {
      toggleFullscreen();
    } else if (type === "isFullscreen") {
      return fullscreen.value;
    } else if (type === "dragging") {
      if (draggable() && terminalContainer.value) {
        dragging(options.x, options.y, terminalContainer.value)
      } else {
        console.warn("Terminal is not draggable");
      }
    } else if (type === "execute") {
      if (_nonEmpty(options)) {
        command.value = options;
        execute();
      }
    } else if (type === "elementInfo") {
      if (!terminalWindow.value || !terminalContainer.value) {
        return undefined
      }
      let windowRect = terminalWindow.value.getBoundingClientRect();
      let containerRect = terminalContainer.value.getBoundingClientRect();
      let hasScroll =
        terminalWindow.value && (
          terminalWindow.value.scrollHeight > terminalWindow.value.clientHeight ||
          terminalWindow.value.offsetHeight > terminalWindow.value.clientHeight);
      return {
        pos: getPosition(), //  窗口所在位置
        screenWidth: containerRect.width, //  窗口整体宽度
        screenHeight: containerRect.height, //  窗口整体高度
        clientWidth: hasScroll
          ? windowRect.width - 48
          : windowRect.width - 40, //  可显示内容范围高度，减去padding值，如果有滚动条去掉滚动条宽度
        clientHeight: windowRect.height, //  可显示内容范围高度
        charWidth: {
          en: byteLen.en, //  单个英文字符宽度
          cn: byteLen.cn, //  单个中文字符宽度
        },
      };
    } else if (type === "focus") {
      focus();
    } else if (type === "textEditorOpen") {
      let opt = options || {};
      textEditorData.value = opt.content;
      textEditorData.open = true;
      textEditorData.onClose = opt.onClose;
      focus();
    } else if (type === "textEditorClose") {
      return textEditorClose();
    } else {
      console.error("Unsupported event type: " + type);
    }
  });
})
onUnmounted(() => {
  TerminalObj.unregister(props.name);
})

onMounted(async () => {
  emit("initBefore", props.name);

  if (props.initLog) {
    await pushMessageBatch(props.initLog, true);
  }

  if (props.commandStore) {
    if (props.commandStoreSort) {
      props.commandStore.sort(props.commandStoreSort);
    }
    props.commandStore.forEach(cmd => {
      allCommandStore.push(cmd)
    })
  }
  if (terminalEnFlag.value) {
    byteLen.en = terminalEnFlag.value.getBoundingClientRect().width / 2
  }
  if (terminalCnFlag.value) {
    byteLen.cn = terminalCnFlag.value.getBoundingClientRect().width / 2
  }

  cursorConf.defaultWidth = byteLen.en;
  if (terminalWindow.value && terminalContainer.value && terminalHeader.value?.containerRef && terminalInputPrompt.value) {
    if (terminalWindow != null) {
      terminalWindow.value.scrollTop = terminalWindow.value.offsetHeight;
    }
    //  计算context的宽度和行高，用于跨行时定位光标位置
    let promptRect = terminalInputPrompt.value.getBoundingClientRect();
    inputBoxParam.promptHeight = promptRect.height;
    inputBoxParam.promptWidth = promptRect.width;
    initDrag(draggable(), fullscreen, terminalHeader.value?.containerRef, terminalContainer.value, terminalWindow.value)
  }

  emit("initComplete", props.name);
})
onUnmounted(() => {
  emit("destroyed", props.name);
})

function draggable(): boolean {
  return !!(props.showHeader && props.dragConf);
}

const getContainerStyle = () => {
  if (draggable()) {
    return getDragStyle(props.dragConf as DragableConfType)
  }
  return 'width:100%;height:100%;border-radius:0;'
}

const toggleFullscreen = useToggleFullscreen(fullscreen, terminalContainer)
const triggerClick = (key: string) => {
  if (key === "fullScreen" && !fullscreen.value) {
    toggleFullscreen()
  } else if (key === "minScreen" && fullscreen.value) {
    toggleFullscreen()
  }
  emit('click', key)
}

const focus = () => {
  nextTick(() => {
    if (ask.open) {
      askInput.value?.focus();
    } else if (textEditorData.open) {
      if (textEditor) {
        textEditor.value?.focus();
      }
    } else {
      //  没有被选中
      if (getSelection()?.isCollapsed) {
        cmdInput.value?.focus();
      } else {
        cursorConf.show = true;
      }
    }
  }).then(() => { });
}

const textEditorClose = () => {
  if (textEditorData.open) {
    textEditorData.open = false;
    let content = textEditorData.value;
    textEditorData.value = "";
    if (textEditorData.onClose) {
      textEditorData.onClose(content);
    }
    focus();
    return content;
  }
}

const resetSearchKey = () => {
  searchCmd.item = undefined;
}

const doSearchCmd = (cmd?: string) => {
  if (!props.autoHelp) {
    return;
  }
  if (!cmd) {
    cmd = command.value;
  }
  if (_isEmpty(cmd)) {
    resetSearchKey();
  } else if (cmd.trim().indexOf(" ") < 0) {
    const reg = new RegExp(cmd, "i");
    const matchSet = [];

    let target = null;
    for (const o of allCommandStore) {
      if (_nonEmpty(o.key)) {
        const res = o.key.match(reg);
        if (res) {
          // index不存在则给-1，保证分数较小
          let score =
            (res.index ?? -1) * 1000 +
            (cmd.length - res[0].length) +
            (o.key.length - res[0].length);
          if (score === 0) {
            //  完全匹配，直接返回
            target = o;
            break;
          } else {
            matchSet.push({
              item: o,
              score: score,
            });
          }
        }
      }
    }
    if (!target) {
      if (matchSet.length > 0) {
        matchSet.sort((a, b) => {
          return a.score - b.score;
        });
        target = matchSet[0].item;
      } else {
        searchCmd.item = undefined;
        return;
      }
    }
    searchCmd.item = target;
    jumpToBottom();
  }
}

const jumpToBottom = () => {
  nextTick(() => {
    let box = terminalWindow.value;
    if (box) {
      box.scrollTo({ top: box.scrollHeight, behavior: "smooth" });
    }
  }).then(() => { });
}

const fillCmd = () => {
  if (searchCmd.item) {
    command.value = searchCmd.item.key;
  }
}

/**
 * help命令执行后调用此方法
 *
 * 命令搜索：comm*、command
 * 分组搜索：:groupA
 */
const printHelp = (regExp: RegExp, srcStr: string) => {
  let content: TableContentType = {
    head: ["KEY", "GROUP", "DETAIL"],
    rows: [],
  };
  let findGroup =
    srcStr && srcStr.length > 1 && srcStr.startsWith(":")
      ? srcStr.substring(1).toLowerCase()
      : null;
  allCommandStore.forEach((cmd: CommandType) => {
    if (findGroup) {
      if (
        _isEmpty(cmd.group) ||
        findGroup !== cmd.group.toLowerCase()
      ) {
        return;
      }
    } else if (!regExp.test(cmd.key)) {
      return;
    }
    let row = [];
    row.push(`<span class='t-cmd-key'>${cmd.key}</span>`);
    row.push(cmd.group);

    let detail = "";
    if (_nonEmpty(cmd.description)) {
      detail += `Description: ${cmd.description}<br>`;
    }
    if (_nonEmpty(cmd.usage)) {
      detail += `Usage: <code>${_unHtml(cmd.usage)}</code><br>`;
    }
    if (cmd.example != null) {
      if (cmd.example.length > 0) {
        detail += "<br>";
      }

      for (let idx in cmd.example) {
        let eg = cmd.example[idx];
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
                        `;

        if (_nonEmpty(eg.des)) {
          detail += `<li class="t-example-li"><span>${eg.des}</span></li>`;
        }
        detail += `
                            </ul>
                        </div>
                    </div>
                    `;
      }
    }

    row.push(detail);

    content.rows.push(row);
  });
  pushMessage({
    type: "table",
    content: content,
  });
}

const execute = () => {
  resetSearchKey();
  saveCurCommand();
  if (_nonEmpty(command.value)) {
    try {
      let split = command.value.split(" ");
      let cmdKey = split[0];
      emit("beforeExecCmd", cmdKey, command.value);
      switch (cmdKey) {
        case "help": {
          let reg = `^${split.length > 1 && _nonEmpty(split[1]) ? split[1] : "*"
            }$`;
          reg = reg.replace(/\*/g, ".*");
          printHelp(new RegExp(reg, "i"), split[1]);
          break;
        }
        case "clear":
          doClear(split);
          break;
        case "open":
          openUrl(split[1]);
          break;
        default: {
          showInputLine.value = false;
          const success = (message: MessageType | TerminalFlash | TerminalAsk) => {
            const finish = () => {
              showInputLine.value = true;
              endExecCallBack();
            };

            if (message) {
              //  实时回显处理
              if (message instanceof TerminalFlash) {
                message.onFlush((msg) => {
                  flash.content = msg;
                });
                message.onFinish(() => {
                  flash.open = false;
                  finish();
                });
                flash.open = true;
                return;
              } else if (message instanceof TerminalAsk) {
                message.onAsk((options) => {
                  ask.input = "";
                  ask.isPassword = options.isPassword;
                  ask.question = _html(options.question);
                  ask.callback = options.callback;
                  ask.autoReview = options.autoReview;
                  focus();
                });

                message.onFinish(() => {
                  ask.open = false;
                  finish();
                });
                ask.open = true;
                return;
              } else {
                pushMessage(message);
              }
            }
            finish();
          };

          const failed = (message = "Failed to execute.") => {
            if (message != null) {
              pushMessage({
                type: "normal",
                class: "error",
                content: message,
              });
            }
            showInputLine.value = true;
            endExecCallBack();
          };

          emit(
            "execCmd",
            cmdKey,
            command.value,
            success,
            failed
          );
          return;
        }
      }
    } catch (e) {
      console.error(e);
      pushMessage({
        type: "normal",
        class: "error",
        content: _html(_unHtml((e as Error).stack)),
        tag: "error",
      });
    }
  }
  focus();
  endExecCallBack();
}

const endExecCallBack = () => {
  command.value = "";
  resetCursorPos();
  cursorConf.show = true;
  focus();
}

const pushMessage = (message: MessageType | MessageType[], ignoreCheck = false) => {
  if (message == null) return;
  if (Array.isArray(message))
    return pushMessageBatch(message, ignoreCheck);

  filterMessageType(message);

  terminalLog.push(message);
  if (!ignoreCheck) {
    checkTerminalLog();
  }

  if (message.type === "json") {
    setTimeout(() => {
      jumpToBottom();
    }, 80);
  }
}
const pushMessageBatch = async (messages: MessageType[], ignoreCheck = false) => {
  for (let m of messages) {
    filterMessageType(m);
    terminalLog.push(m);
  }
  if (!ignoreCheck) {
    checkTerminalLog();
  }
}
const resetCursorPos = (cmd?: string) => {
  cursorConf.idx = (!cmd ? command.value : cmd).length;
  cursorConf.left = "unset";
  cursorConf.top = "unset";
  cursorConf.width = cursorConf.defaultWidth;
}
const calculateCursorPos = (cmd?: string) => {
  //  idx可以认为是需要光标覆盖字符的索引
  let idx = cursorConf.idx;
  let _cmd = !cmd ? command.value : cmd;

  if (idx < 0 || idx >= _cmd.length) {
    resetCursorPos();
    return;
  }

  let lineWidth = terminalInputBox.value?.getBoundingClientRect().width ?? 0;

  let pos = { left: 0, top: 0 };
  //  当前字符长度
  let charWidth = cursorConf.defaultWidth;
  //  前一个字符的长度
  let preWidth = inputBoxParam.promptWidth;

  //  先找到被覆盖字符的位置
  for (let i = 0; i <= idx; i++) {
    charWidth = calculateStringWidth(command.value[i]);
    pos.left += preWidth;
    preWidth = charWidth;
    if (pos.left > lineWidth) {
      //  行高是20px
      pos.top += 20;
      pos.left = charWidth;
    }
  }

  cursorConf.left = pos.left;
  cursorConf.top = pos.top;
  cursorConf.width = charWidth;
}
const cursorGoLeft = () => {
  if (cursorConf.idx > 0) {
    cursorConf.idx--;
  }
  calculateCursorPos();
}
const cursorGoRight = () => {
  if (cursorConf.idx < command.value.length) {
    cursorConf.idx++;
  }
  calculateCursorPos();
}
const saveCurCommand = () => {
  if (_nonEmpty(command.value)) {
    historyStore.pushCmd(props.name, command.value);
  }

  terminalLog.push({
    type: "cmdLine",
    content: `${props.context} > ${commandFormatter(command.value)}`,
  });
}
const doClear = (args: string[]) => {
  if (args.length === 1) {
    terminalLog.length = 0;
  } else if (args.length === 2 && args[1] === "history") {
    historyStore.clearLog(props.name);
  }
  perfWarningRate.count = 0;
}
const openUrl = (url: string) => {
  let match =
    /^((http|https):\/\/)?(([A-Za-z0-9]+-[A-Za-z0-9]+|[A-Za-z0-9]+)\.)+([A-Za-z]+)[/?:]?.*$/;
  if (match.test(url)) {
    if (!url.startsWith("http") && !url.startsWith("https")) {
      window.open(`http://${url}`);
    } else {
      window.open(url);
    }
  } else {
    pushMessage({
      class: "error",
      type: "normal",
      content: "Invalid website url",
    });
  }
}

const filterMessageType = (message: MessageType) => {
  let valid =
    message.type && /^(normal|html|code|table|json)$/.test(message.type);
  if (!valid) {
    console.debug(
      `Invalid terminal message type: ${message.type}, the default type normal will be used`
    );
    message.type = "normal";
  }
  return valid;
}
const checkTerminalLog = () => {
  let count = terminalLog.length;
  if (
    props.warnLogCountLimit > 0 &&
    count > props.warnLogCountLimit &&
    Math.floor(count / props.warnLogCountLimit) !==
    perfWarningRate.count
  ) {
    perfWarningRate.count = Math.floor(count / props.warnLogCountLimit);
    pushMessage(
      {
        content: `Terminal log count exceeded <strong style="color: red">${count}/${props.warnLogCountLimit}</strong>. If the log content is too large, it may affect the performance of the browser. It is recommended to execute the "clear" command to clear it.`,
        class: "system",
        type: "normal",
      },
      true
    );
  }
}
const switchPreCmd = () => {
  let cmdLog = historyStore.getLog(props.name);
  let cmdIdx = historyStore.getIdx(props.name);
  if (cmdLog.length !== 0 && cmdIdx > 0) {
    cmdIdx -= 1;
    command.value = !cmdLog[cmdIdx] ? "" : cmdLog[cmdIdx];
  }
  resetCursorPos();
  historyStore.setIdx(props.name, cmdIdx);
  doSearchCmd(command.value.trim().split(" ")[0]);
}
const switchNextCmd = () => {
  let cmdLog = historyStore.getLog(props.name);
  let cmdIdx = historyStore.getIdx(props.name);
  if (cmdLog.length !== 0 && cmdIdx < cmdLog.length - 1) {
    cmdIdx += 1;
    command.value = !cmdLog[cmdIdx] ? "" : cmdLog[cmdIdx];
  } else {
    cmdIdx = cmdLog.length;
    command.value = "";
  }
  resetCursorPos();
  historyStore.setIdx(props.name, cmdIdx);
  doSearchCmd(command.value.trim().split(" ")[0]);
}
const calculateStringWidth = (str: string) => {
  let width = 0;
  for (let char of str) {
    width += _getByteLen(char) === 1 ? byteLen.en : byteLen.cn;
  }
  return width;
}
const onInput = (e: Event) => {
  if (props.inputFilter) {
    let value = (e.target as HTMLInputElement).value;
    let newStr = props.inputFilter(value);
    if (!newStr) {
      newStr = value;
    }
    command.value = newStr;
  }

  if (_isEmpty(command)) {
    resetSearchKey();
  } else {
    doSearchCmd();
  }

  nextTick(() => {
    checkInputCursor();
    calculateCursorPos();
  }).then(() => { });
}
const checkInputCursor = () => {
  let eIn = cmdInput.value;
  if (eIn?.selectionStart !== cursorConf.idx) {
    cursorConf.idx = eIn?.selectionStart ?? 0;
  }
}
const onInputKeydown = (e: KeyboardEvent) => {
  let key = e.key.toLowerCase();
  if (key === "arrowleft") {
    checkInputCursor();
    cursorGoLeft();
  } else if (key === "arrowright") {
    checkInputCursor();
    cursorGoRight();
  }
}
const onInputKeyup = (e: KeyboardEvent) => {
  let key = e.key.toLowerCase();
  let code = e.code.toLowerCase();
  if (
    key === "home" ||
    key === "end" ||
    code === "altleft" ||
    code === "metaleft" ||
    code === "controlleft" ||
    ((e.ctrlKey || e.metaKey || e.altKey) &&
      (key === "arrowright" || key === "arrowleft"))
  ) {
    checkInputCursor();
    calculateCursorPos();
  }
}
const commandFormatter = (cmd?: string) => {
  if (props.commandFormatter) {
    return props.commandFormatter(cmd);
  }
  let split = cmd?.split(" ") ?? [];
  let formatted = "";
  for (let i = 0; i < split.length; i++) {
    let char = _html(split[i]);
    if (i === 0) {
      formatted += `<span class='t-cmd-key'>${char}</span>`;
    } else if (char.startsWith("-")) {
      formatted += `<span class="t-cmd-arg">${char}</span>`;
    } else if (char.length > 0) {
      formatted += `<span>${char}</span>`;
    }
    if (i < split.length - 1) {
      formatted += "<span>&nbsp;</span>";
    }
  }
  return formatted;
}
const getPosition = () => {
  let box = terminalContainer.value;
  if (draggable() && box) {
    return { x: parseInt(box.style.left), y: parseInt(box.style.top) };
  } else {
    return { x: 0, y: 0 };
  }
}
const onAskInput = () => {
  if (ask.autoReview) {
    pushMessage({
      time: "",
      class: 'system',
      type: "normal",
      content:
        ask.question +
        (ask.isPassword
          ? "*".repeat(ask.input.length)
          : ask.input),
    });
  }
  ask.question = "";
  if (ask.callback) {
    ask.callback(ask.input);
  }
}
/**
 * 判断当前terminal是否活跃
 */
const isActive = (): boolean => {
  return (
    cursorConf.show ||
    (ask.open && askInput.value === document.activeElement) ||
    (textEditorData.open && textEditorData.focus)
  );
}

useKeydownListener((event: KeyboardEvent) => {
  if (isActive()) {
    if (cursorConf.show) {
      if (event.key.toLowerCase() === "tab") {
        if (!props.tabKeyHandler) {
          fillCmd();
        } else {
          props.tabKeyHandler(event);
        }
        event.preventDefault();
      } else if (document.activeElement !== cmdInput.value) {
        cmdInput.value?.focus();
      }
    }
    emit("keydown", event);
  }
})
</script>

<template>
  <div class="t-container" :style="getContainerStyle()" ref="terminalContainer" @click="focus">
    <div class="terminal">
      <HeaderContainer :title="title" :show-header="showHeader" :draggable="draggable()" :fullscreen="fullscreen"
        ref="terminalHeader" @click-title="triggerClick('title')" @close="triggerClick('close')"
        @min-screen="triggerClick('minScreen')" @full-screen="triggerClick('fullScreen')"></HeaderContainer>
      <div class="t-window" :style="`${showHeader ? 'height:calc(100% - 34px);margin-top: 34px;' : 'height:100%'}`"
        ref="terminalWindow">
        <div class="t-log-box" v-for="(item, idx) in terminalLog" v-bind:key="idx">
          <span v-if="item.type === 'cmdLine'" class="t-crude-font t-cmd-line">
            <span class="prompt t-cmd-line-content"><span v-html="item.content"></span></span>
          </span>
          <div v-else>
            <span v-if="item.type === 'normal'">
              <slot name="normal" :message="item">
                <NormalMessage :message="item"></NormalMessage>
              </slot>
            </span>
            <div v-if="item.type === 'json'">
              <slot name="json" :message="item">
                <JsonMessage :message="item" :key="idx + '_' + item.depth"></JsonMessage>
              </slot>
            </div>
            <div v-if="item.type === 'code'">
              <slot name="code" :message="item">
                <CodeMessage :message="item"></CodeMessage>
              </slot>
            </div>
            <div v-if="item.type === 'table'">
              <slot name="table" :message="item">
                <TableMessage :message="item"></TableMessage>
              </slot>
            </div>
            <div v-if="item.type === 'html'">
              <slot name="html" :message="item">
                <div v-html="item.content"></div>
              </slot>
            </div>
          </div>
        </div>
        <div v-if="flash.open && flash.content">
          <slot name="flash" :content="flash.content">
            <div v-html="flash.content"></div>
          </slot>
        </div>
        <div v-if="ask.open && ask.question" style="display: flex">
          <div v-html="ask.question" style="display: inline-block"></div>
          <input :type="ask.isPassword ? 'password' : 'text'" ref="askInput" v-model="ask.input" class="t-ask-input"
            autocomplete="off" auto-complete="new-password" @keyup.enter="onAskInput">
        </div>
        <p class="t-last-line t-crude-font t-cmd-line" ref="terminalInputBox" v-show="showInputLine">
          <span class="prompt t-cmd-line-content disable-select" ref="terminalInputPrompt">
            <span>{{ context }}</span>
            <span> > </span>
          </span><span class="t-cmd-line-content" v-html="commandFormatter(command)"></span><span
            v-show="cursorConf.show" class="cursor disable-select"
            :style="`width:${cursorConf.width}px;left:${cursorConf.left}px;top:${cursorConf.top}px;`">&nbsp;</span>
          <input type="text" autofocus v-model="command" class="t-cmd-input disable-select" ref="cmdInput"
            autocomplete="off" auto-complete="new-password" @keydown="onInputKeydown" @keyup="onInputKeyup"
            @input="onInput" @focusin="cursorConf.show = true" @focusout="cursorConf.show = false"
            @keyup.up.exact="switchPreCmd" @keyup.down.exact="switchNextCmd" @keyup.enter="execute">
          <span class="t-flag t-cmd-line disable-select">
            <span class="t-cmd-line-content" ref="terminalEnFlag">aa</span>
            <span class="t-cmd-line-content" ref="terminalCnFlag">你好</span>
          </span>
        </p>
        <slot name="helpCmd" :item="searchCmd.item">
          <p class="t-help-msg">
            {{ searchCmd.item == null ? '' : searchCmd.item.usage }}
          </p>
        </slot>
      </div>
    </div>
    <div v-if="enableExampleHint">
      <slot name="helpBox" :showHeader="showHeader" :item="searchCmd.item">
        <div class="t-cmd-help"
          :style="showHeader ? 'top: 40px;max-height: calc(100% - 60px);' : 'top: 15px;max-height: calc(100% - 40px);'"
          v-if="searchCmd.item != null && !_screenType().xs">
          <p class="text" v-if="searchCmd.item.description != null" style="margin: 15px 0"
            v-html="searchCmd.item.description"></p>
          <div v-if="searchCmd.item.example != null && searchCmd.item.example.length > 0">
            <div v-for="(it, idx) in searchCmd.item.example" :key="idx" class="text">
              <div v-if="searchCmd.item.example.length === 1">
                <span>Example: <code>{{ it.cmd }}</code> {{ it.des }}</span>
              </div>
              <div v-else>
                <div class="t-cmd-help-eg">
                  eg{{ (searchCmd.item.example.length > 1 ? (idx + 1) : '') }}:
                </div>
                <div class="t-cmd-help-example">
                  <ul class="t-example-ul">
                    <li class="t-example-li"><code>{{ it.cmd }}</code></li>
                    <li class="t-example-li"><span v-if="it.des != null" class="t-cmd-help-des">{{ it.des }}</span></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </slot>
    </div>

    <div class="text-editor-container" v-if="textEditorData.open"
      :style="`${showHeader ? 'height:calc(100% - 34px);margin-top: 34px;' : 'height:100%'}`">
      <slot name="textEditor" :data="textEditorData">
        <textarea name="editor" ref="textEditor" class="text-editor" v-model="textEditorData.value"
          @focus="textEditorData.onFocus" @blur="textEditorData.onBlur"></textarea>
        <div class="text-editor-floor" align="center">
          <button class="text-editor-floor-btn" @click="textEditorClose">Save & Close</button>
        </div>
      </slot>
    </div>

  </div>
</template>
