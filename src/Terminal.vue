<script setup lang="ts">
import './css/scrollbar.css'
import './css/style.css'
import 'vue-json-viewer/style.css'
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
import { getDragStyle, useToggleFullscreen } from './utils/ContainerUtil';
import { nextTick, reactive, ref } from 'vue';
import { title } from 'process';
import { DataConstant } from './constants/TerminalConstants';
import { InitLogType } from './models/LogInterface';
import { CommandType } from './models/CommandInterface';
import TerminalFlash from "./TerminalFlash";
import TerminalObj from './TerminalObj';
import TerminalAsk from "./TerminalAsk";
import historyStore from "./HistoryStore";
import { MessageType } from './models/MessageInterface';
import { useKeydownListener } from './utils/ListenerUtil';

export interface TerminalProps {
  //  终端标题
  title: string,
  // 初始化日志内容
  initLog: InitLogType,
  // 上下文
  context: string,
  // 命令行搜索以及help指令用
  commandStore: any[],
  // 命令行排序方式
  commandStoreSort: Function,
  // 记录条数超出此限制会发出警告
  warnLogCountLimit: number,
  // 自动搜索帮助
  autoHelp: boolean,
  // 是否开启命令提示
  enableExampleHint: boolean,
  // 输入过滤器
  inputFilter: Function,
  commandFormatter: Function,
  // 按下Tab键处理函数
  tabKeyHandler: Function
  //  显示终端头部
  showHeader: boolean
  //  拖拽配置
  dragConf?: DragableConfType
}

const props = withDefaults(defineProps<TerminalProps>(), {
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
  (e: 'keydown'): void
  (e: 'beforeExecCmd', cmdKey: string, cmdValue: string): void
  (e: 'execCmd'): void
  (e: 'destroyed'): void
  (e: 'initBefore'): void
  (e: 'initComplete'): void
}>()

const command = ref("");
const fullscreen = ref(false);
const textEditorData = reactive({
  open: false,
  focus: false,
  value: "",
  onClose: null,
  onFocus: () => {
    textEditorData.focus = true;
  },
  onBlur: () => {
    textEditorData.focus = false;
  },
})
const ask = reactive({
  open: false,
  question: null,
  isPassword: false,
  callback: null,
  autoReview: false,
  input: "",
})
const cursorConf = reactive(DataConstant.CursorConf)
const searchCmd = reactive<{ item?: CommandType }>({ item: undefined })
const allCommandStore = reactive(DataConstant.AllCommandStore)
const commandLog = reactive([])
const byteLen = reactive(DataConstant.ByteLen)
const jsonViewDepth = reactive(DataConstant.JsonViewDepth)
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
  content: null,
})

const terminalContainer = ref<HTMLDivElement>();
const terminalWindow = ref<HTMLDivElement>();
const cmdInput = ref<HTMLInputElement>();
const askInput = ref<HTMLInputElement>();
const terminalInputBox = ref(null);
const terminalInputPrompt = ref(null);
const terminalEnFlag = ref(null);
const terminalCnFlag = ref(null);
const terminalObj = TerminalObj;
const textEditor = ref<HTMLTextAreaElement>();

const draggable = (): boolean => {
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
    textEditorData.onClose = null;
    focus();
    return content;
  }
}

const resetSearchKey = () => {
  searchCmd.item = undefined;
},
const doSearchCmd = (key: string) => {
  if (!props.autoHelp) {
    return;
  }
  let cmd = key;
  if (cmd) {
    cmd = command.value;
  }
  if (_isEmpty(cmd)) {
    resetSearchKey();
  } else if (cmd.trim().indexOf(" ") < 0) {
    let reg = new RegExp(cmd, "i");
    let matchSet = [];

    let target = null;
    for (let i in allCommandStore) {
      let o = allCommandStore[i];
      if (_nonEmpty(o.key)) {
        let res = o.key.match(reg);
        if (res) {
          let score =
            res.index * 1000 +
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
const printHelp = (regExp, srcStr: string) => {
  let content = {
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
},
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
          showInputLine = false;
          let success = (message) => {
            let finish = () => {
              showInputLine = true;
              _endExecCallBack();
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

          let failed = (message = "Failed to execute.") => {
            if (message != null) {
              pushMessage({
                type: "normal",
                class: "error",
                content: message,
              });
            }
            showInputLine = true;
            _endExecCallBack();
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
        content: _html(_unHtml(e.stack)),
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
/**
 * message内容：
 *
 * time: 当前时间
 * class: 类别，只可选：success、error、system、info、warning
 * type: 类型，只可选：normal、json、code、table、cmdLine、splitLine
 * content: 具体内容，不同消息内容格式不一样
 * tag: 标签，仅类型为normal有效
 *
 * 当 type 为 table 时 content 的格式：
 * {
 *     head: [headName1, headName2, headName3...],
 *     rows: [
 *         [ value1, value2, value3... ],
 *         [ value1, value2, value3... ]
 *     ]
 * }
 *
 * @param message
 * @param ignoreCheck
 * @private
 */
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
const resetCursorPos = (cmd) => {
  cursorConf.idx = (cmd == null ? command.value : cmd).length;
  cursorConf.left = "unset";
  cursorConf.top = "unset";
  cursorConf.width = cursorConf.defaultWidth;
}
const calculateCursorPos = (cmd) => {
  //  idx可以认为是需要光标覆盖字符的索引
  let idx = cursorConf.idx;
  let command = cmd == null ? command : cmd;

  if (idx < 0 || idx >= command.length) {
    _resetCursorPos();
    return;
  }

  let lineWidth = terminalInputBox.getBoundingClientRect().width;

  let pos = { left: 0, top: 0 };
  //  当前字符长度
  let charWidth = cursorConf.defaultWidth;
  //  前一个字符的长度
  let preWidth = inputBoxParam.promptWidth;

  //  先找到被覆盖字符的位置
  for (let i = 0; i <= idx; i++) {
    charWidth = _calculateStringWidth(command[i]);
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
    historyStore.pushCmd(name, command);
  }

  terminalLog.push({
    type: "cmdLine",
    content: `${context} > ${_commandFormatter(command)}`,
  });
}
const doClear = (args) => {
  if (args.length === 1) {
    terminalLog = [];
  } else if (args.length === 2 && args[1] === "history") {
    historyStore.clearLog(name);
  }
  perfWarningRate.size = 0;
  perfWarningRate.count = 0;
}
const openUrl = (url) => {
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

const parseToJson = (obj) => {
  if (typeof obj === "object" && obj) {
    return obj;
  } else if (typeof obj === "string") {
    try {
      return JSON.parse(obj);
    } catch (e) {
      return obj;
    }
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
    warnLogCountLimit > 0 &&
    count > warnLogCountLimit &&
    Math.floor(count / warnLogCountLimit) !==
    perfWarningRate.count
  ) {
    perfWarningRate.count = Math.floor(count / warnLogCountLimit);
    pushMessage(
      {
        content: `Terminal log count exceeded <strong style="color: red">${count}/${warnLogCountLimit}</strong>. If the log content is too large, it may affect the performance of the browser. It is recommended to execute the "clear" command to clear it.`,
        class: "system",
        type: "normal",
      },
      true
    );
  }
}
const switchPreCmd = () => {
  let cmdLog = historyStore.getLog(name);
  let cmdIdx = historyStore.getIdx(name);
  if (cmdLog.length !== 0 && cmdIdx > 0) {
    cmdIdx -= 1;
    command.value = cmdLog[cmdIdx] == null ? [] : cmdLog[cmdIdx];
  }
  resetCursorPos();
  historyStore.setIdx(name, cmdIdx);
  doSearchCmd(command.value.trim().split(" ")[0]);
}
const switchNextCmd = () => {
  let cmdLog = historyStore.getLog(name);
  let cmdIdx = historyStore.getIdx(name);
  if (cmdLog.length !== 0 && cmdIdx < cmdLog.length - 1) {
    cmdIdx += 1;
    command.value = cmdLog[cmdIdx] == null ? [] : cmdLog[cmdIdx];
  } else {
    cmdIdx = cmdLog.length;
    command.value = "";
  }
  resetCursorPos();
  historyStore.setIdx(name, cmdIdx);
  doSearchCmd(command.value.trim().split(" ")[0]);
}
const calculateStringWidth = (str: string) => {
  let width = 0;
  for (let char of str) {
    width += _getByteLen(char) === 1 ? byteLen.en : byteLen.cn;
  }
  return width;
}
const onInput = (e) => {
  if (inputFilter != null) {
    let value = e.target.value;
    let newStr = inputFilter(e.data, value, e);
    if (newStr == null) {
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
  let eIn = cmdInput;
  if (eIn.selectionStart !== cursorConf.idx) {
    cursorConf.idx = eIn.selectionStart;
  }
}
const onInputKeydown = (e) => {
  let key = e.key.toLowerCase();
  if (key === "arrowleft") {
    checkInputCursor();
    cursorGoLeft();
  } else if (key === "arrowright") {
    checkInputCursor();
    cursorGoRight();
  }
}
const onInputKeyup = (e) => {
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
const commandFormatter = (cmd) => {
  if (commandFormatter != null) {
    return commandFormatter(cmd);
  }
  let split = cmd.split(" ");
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
      content:
        ask.question +
        (ask.isPassword
          ? "*".repeat(ask.input.length)
          : ask.input),
    });
  }
  ask.question = null;
  if (ask.callback) {
    ask.callback(ask.input);
  }
}
/**
 * 判断当前terminal是否活跃
 * @returns {boolean}
 * @private
 */
const isActive = () => {
  return (
    cursorConf.show ||
    (ask.open && askInput.value === document.activeElement) ||
    (textEditorData.open && textEditorData.focus)
  );
}

useKeydownListener((event) => {
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
        @click-title="triggerClick('title')" @close="triggerClick('close')" @min-screen="triggerClick('minScreen')"
        @full-screen="triggerClick('fullScreen')"></HeaderContainer>
      <div class="t-window" :style="`${showHeader ? 'height:calc(100% - 34px);margin-top: 34px;' : 'height:100%'}`"
        ref="terminalWindow">
        <div class="t-log-box" v-for="(item, idx) in terminalLog" v-bind:key="idx">
          <span v-if="item.type === 'cmdLine'" class="t-crude-font t-cmd-line">
            <span class="prompt t-cmd-line-content"><span v-html="item.content"></span></span>
          </span>
          <div v-else>
            <span v-if="item.type === 'normal'">
              <slot name="normal" :message="item">
                <span class="t-content-normal">
                  <span v-if="_nonEmpty(item.tag == null ? item.class : item.tag)" :class="item.class"
                    style="margin-right: 10px">{{ item.tag == null ? item.class : item.tag }}</span>
                  <span v-html="item.content"></span>
                </span>
              </slot>
            </span>
            <div v-if="item.type === 'json'">
              <slot name="json" :message="item">
                <span style="position: relative">
                  <json-viewer :expand-depth="item.depth" sort boxed copyable expanded :key="idx + '_' + item.depth"
                    :value="parseToJson(item.content)">
                  </json-viewer>
                  <select class="t-json-deep-selector" v-model="item.depth">
                    <option value="" disabled selected hidden label="Choose a display deep"></option>
                    <option v-for="i in jsonViewDepth" :key="i" :label="`Deep ${i}`" :value="i">
                    </option>
                  </select>
                </span>
              </slot>
            </div>
            <div v-if="item.type === 'code'">
              <slot name="code" :message="item">
                <div class="t-code">
                  <div v-if="terminalObj.getOptions().highlight">
                    <highlightjs ref="highlightjs" autodetect :code="item.content" />
                  </div>
                  <div v-else-if="terminalObj.getOptions().codemirror">
                    <codemirror ref="codemirror" v-model="item.content"
                      :options="terminalObj.getOptions().codemirror" />
                  </div>
                  <div v-else style="background: rgb(39 50 58);">
                    <pre style="padding: 1em;margin: 0"><code style="font-size: 15px"
                                                              v-html="item.content"></code></pre>
                  </div>
                </div>
              </slot>
            </div>
            <div v-if="item.type === 'table'">
              <slot name="table" :message="item">
                <div class="t-table-container">
                  <table class="t-table t-border-dashed">
                    <thead>
                      <tr class="t-border-dashed">
                        <td v-for="it in item.content.head" :key="it" class="t-border-dashed">{{ it }}</td>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(row, idx) in item.content.rows" :key="idx" class="t-border-dashed">
                        <td v-for="(it, idx) in row" :key="idx" class="t-border-dashed">
                          <div v-html="it"></div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
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
          <input type="text" autofocus="autofocus" v-model="command" class="t-cmd-input disable-select" ref="cmdInput"
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
