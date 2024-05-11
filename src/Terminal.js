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
    _unHtml
} from "./js/Util.js";
import historyStore from "@/js/TerminalStore.js";
import TerminalFlash from "@/js/TerminalFlash.js";
import TerminalAsk from "@/js/TerminalAsk";
import {
    dragging,
    elementInfo,
    execute,
    focus,
    fullscreen,
    isFullscreen,
    pushMessage,
    register,
    rename,
    textEditorClose,
    textEditorOpen,
    unregister
} from './js/TerminalApi';
import {terminalProps} from "@/js/TerminalAttribute";
import THeader from "@/components/THeader.vue";
import TViewJson from "@/components/TViewJson.vue";
import TViewNormal from "@/components/TViewNormal.vue";
import TViewCode from "@/components/TViewCode.vue";
import TViewTable from "@/components/TViewTable.vue";
import THelpBox from "@/components/THelpBox.vue";
import TEditor from "@/components/TEditor.vue";
import {DEFAULT_COMMANDS, MESSAGE_CLASS, MESSAGE_TYPE} from "@/js/Configuration";
import {_parseANSI} from "@/js/ansi/ANSI";

let idx = 0;

function generateTerminalName() {
    idx++;
    return `terminal_${idx}`;
}

export default {
    name: 'Terminal',
    components: {THelpBox, TViewNormal, THeader, TViewJson, TViewCode, TViewTable, TEditor},
    data() {
        return {
            command: "",
            commandLog: [],
            cursorConf: {
                defaultWidth: 7,
                width: 7,
                left: 'unset',
                top: 'unset',
                idx: 0, //  从0开始
                show: false
            },
            byteLen: {
                init: false,
                en: 8,
                cn: 13
            },
            showInputLine: true,
            terminalLog: [],
            searchCmdResult: {
                //  避免默认提示板与输入框遮挡，某些情况下需要隐藏提示板
                show: false,
                defaultBoxRect: null,
                item: null
            },
            allCommandStore: [],
            fullscreenState: false,
            inputBoxParam: {
                boxWidth: 0,
                boxHeight: 0,
                promptWidth: 0,
                promptHeight: 0
            },
            flash: {
                open: false,
                content: null
            },
            ask: {
                open: false,
                question: null,
                isPassword: false,
                callback: null,
                autoReview: false,
                input: ''
            },
            textEditor: {
                open: false,
                focus: false,
                value: '',
                onClose: null,
                onFocus: () => {
                    this.textEditor.focus = true
                },
                onBlur: () => {
                    this.textEditor.focus = false
                }
            },
            containerStyleStore: null,
            headerHeight: 0,
            resizeObserver: null
        }
    },
    props: terminalProps(),
    mounted() {
        this.$emit('init-before', this.getName())

        this._initContainerStyle()

        if (this.initLog) {
            this._pushMessage(this.initLog)
        }

        let allCommandStore = []
        if (this.enableDefaultCommand) {
            allCommandStore = allCommandStore.concat(DEFAULT_COMMANDS)
        }
        if (this.commandStore) {
            if (this.commandStoreSort) {
                this.commandStore.sort(this.commandStoreSort)
            }
            allCommandStore = allCommandStore.concat(this.commandStore)
        }
        this.allCommandStore = allCommandStore

        let el = this.$refs.terminalWindow
        el.scrollTop = el.offsetHeight;

        let selectContentText = null

        _eventOn(window, "click", this.clickListener = e => {
            let activeCursor = false
            let container = this.$refs.terminalContainer
            if (container && container.getBoundingClientRect && _pointInRect(e, container.getBoundingClientRect())) {
                activeCursor = _isParentDom(e.target, container, "t-container")
                    || (e.target && e.target.classList.contains('t-text-editor-floor-btn'))
            }
            if (this.isBlockCommandFocus()) {
                this.cursorConf.show = false
            } else {
                this.cursorConf.show = activeCursor
            }

            if (activeCursor) {
                this._onActive()
            } else {
                this._onInactive()
            }
        })

        _eventOn(window, 'keydown', this.keydownListener = event => {
            if (this.isActive()) {
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
                    if (this.cursorConf.show) {
                        if (key === 'tab') {
                            if (this.tabKeyHandler) {
                                this.tabKeyHandler(event, (cmd) => {
                                    if (cmd) {
                                        this.command = cmd.trim()
                                    } else {
                                        this.command = ''
                                    }
                                })
                            } else {
                                this._fillCmd()
                            }
                            event.preventDefault()
                        } else if (document.activeElement !== this.$refs.terminalCmdInput) {
                            this.$refs.terminalCmdInput.focus()
                            this._onInputKeydown(event)
                        }
                    }
                } finally {
                    this.$emit('on-keydown', event, this.getName())
                }
            }
        });

        //  先暂存选中文本
        _eventOn(el, 'mousedown', () => {
            let selection = _getSelection();
            let content = ''
            if (!selection.isCollapsed || (content = selection.toString()).length > 0) {
                selectContentText = content.length > 0 ? content : selection.toString()
            }
        });
        _eventOn(el, 'contextmenu', this.contextMenuClick = (event) => {
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
                    const command = this.command;
                    this.command = command && command.length ? `${command}${text}` : text;
                    this._focus()
                }).catch(error => {
                    console.error(error);
                })
            } else {
                this._focus()
            }
        });

        let containerStyleCache = null;
        //  监听全屏事件，用户ESC退出时需要设置全屏状态
        ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange'].forEach((item) => {
            _eventOn(window, item, () => {
                let isFullScreen = document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen || document.fullscreenElement;

                if (isFullScreen) {
                    //  存储窗口样式
                    containerStyleCache = JSON.parse(JSON.stringify(this.containerStyleStore))

                    //  进入全屏
                    if (_isSafari()) {
                        this.containerStyleStore.width = '100%'
                        this.containerStyleStore.height = '100%'
                        this.containerStyleStore.left = '0'
                        this.containerStyleStore.top = '0'
                    }
                } else {
                    //  退出全屏
                    this.fullscreenState = false
                    if (containerStyleCache) {
                        this.containerStyleStore = containerStyleCache
                    }
                }
            });
        });

        //  如果是移动设备，需要监听touch事件来模拟双击事件
        if (_isPhone() || _isPad()) {
            let touchTime = 0
            el.addEventListener('touchend', () => {
                let now = new Date().getTime()
                if (touchTime === 0) {
                    touchTime = now
                } else {
                    if (new Date().getTime() - touchTime < 600) {
                        //  移动端双击
                        this._focus(true)
                    } else {
                        touchTime = now
                    }
                }
            })
        }

        //  监听header的尺寸变化
        this.resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                if (entry.target === this.$refs.terminalHeader) {
                    this._updateHeaderHeight()
                }
            }
        })
        if (this.$refs.terminalHeader) {
            this.resizeObserver.observe(this.$refs.terminalHeader)
        }

        this._initDrag()

        register(this.getName(), this.terminalListener = (type, options) => {
            if (type === 'pushMessage') {
                this._pushMessage(options)
            } else if (type === 'appendMessage') {
                this._appendMessage(options)
            } else if (type === 'fullscreen') {
                this._fullscreen()
            } else if (type === 'isFullscreen') {
                return this.fullscreenState
            } else if (type === 'dragging') {
                if (this.isDraggable()) {
                    this._dragging(options.x, options.y)
                } else {
                    console.warn("Terminal is not draggable: " + this.getName())
                }
            } else if (type === 'execute') {
                if (!this.isBlockCommandFocus() && _nonEmpty(options)) {
                    this.command = options.trim()
                    this._execute()
                }
            } else if (type === 'focus') {
                this._focus(options)
            } else if (type === 'elementInfo') {
                let windowEle = this.$refs.terminalWindow
                let windowRect = windowEle.getBoundingClientRect()
                let containerRect = this.$refs.terminalContainer.getBoundingClientRect()
                let hasScroll = windowEle.scrollHeight > windowEle.clientHeight || windowEle.offsetHeight > windowEle.clientHeight
                return {
                    pos: this._getPosition(),           //  窗口所在位置
                    screenWidth: containerRect.width,   //  窗口整体宽度
                    screenHeight: containerRect.height, //  窗口整体高度
                    clientWidth: hasScroll ? (windowRect.width - 48) : (windowRect.width - 40), //  可显示内容范围高度，减去padding值，如果有滚动条去掉滚动条宽度
                    clientHeight: windowRect.height,    //  可显示内容范围高度
                    charWidth: {
                        en: this.byteLen.en,            //  单个英文字符宽度
                        cn: this.byteLen.cn             //  单个中文字符宽度
                    }
                }
            } else if (type === 'textEditorOpen') {
                let opt = options || {}
                this.textEditor.value = opt.content
                this.textEditor.open = true
                this.textEditor.onClose = opt.onClose
                this._focus()
            } else if (type === 'textEditorClose') {
                return this._textEditorClose(options)
            } else if (type === 'clearLog') {
                return this.clearLog(options)
            } else {
                console.error(`Unsupported event type ${type} in instance ${this.getName()}`)
            }
        })
        this.$emit('init-complete', this.getName())
    },
    destroyed() {
        this.$emit('destroyed', this.getName())
        _eventOff(window, 'keydown', this.keydownListener);
        _eventOff(window, "click", this.clickListener);
        if (this.resizeObserver && this.$refs.terminalHeader) {
            this.resizeObserver.unobserve(this.$refs.terminalHeader)
            this.resizeObserver = null
        }
        unregister(this.getName())
    },
    watch: {
        terminalLog() {
            this._jumpToBottom()
        },
        context: {
            handler() {
                this.$nextTick(() => {
                    this._calculatePromptLen()
                })
            }
        },
        name: {
            handler(newVal, oldVal) {
                rename(newVal ? newVal : this.getName(), oldVal ? oldVal : this._name, this.terminalListener)
            }
        },
        "dragConf.zIndex"(newVal) {
            this.containerStyleStore['z-index'] = newVal
        },
        showHeader() {
            this._updateHeaderHeight()
        }
    },
    methods: {
        pushMessage(message) {
            pushMessage(this.getName(), message);
        },
        fullscreen() {
            return fullscreen(this.getName());
        },
        isFullscreen() {
            return isFullscreen(this.getName());
        },
        dragging(options) {
            return dragging(this.getName(), options);
        },
        execute(options) {
            return execute(this.getName(), options);
        },
        focus() {
            return focus(this.getName());
        },
        elementInfo() {
            return elementInfo(this.getName());
        },
        textEditorClose(options) {
            return textEditorClose(this.getName(), options);
        },
        textEditorOpen(options) {
            return textEditorOpen(this.getName(), options);
        },
        clearLog(clearHistory) {
            if (clearHistory) {
                historyStore.clearLog(this.getName())
            } else {
                this.terminalLog = [];
            }
        },
        getName() {
            if (this.name) {
                return this.name;
            }
            if (!this._name) {
                this._name = generateTerminalName();
            }
            return this._name;
        },
        isPinned() {
            return this.dragConf && this.dragConf.pinned
        },
        isDraggable() {
            return this.showHeader && this.dragConf != null
        },
        /**
         * 判断当前terminal是否活跃
         * @returns {boolean}
         */
        isActive() {
            return this.cursorConf.show
                || (this.ask.open && this.$refs.terminalAskInput === document.activeElement)
                || (this.textEditor.open && this.textEditor.focus)
        },
        /**
         * 是否会阻断获取命令焦点
         * @returns {boolean}
         */
        isBlockCommandFocus() {
            return this.textEditor.open || this.flash.open || this.ask.open
        },
        _triggerClick(key) {
            if (key === 'fullScreen' && !this.fullscreenState) {
                this._fullscreen()
            } else if (key === 'minScreen' && this.fullscreenState) {
                this._fullscreen()
            } else if (key === 'pin' && this.showHeader) {
                let pinned = this.dragConf.pinned || false
                this.dragConf.pinned = !pinned;
            }

            this.$emit('on-click', key, this.getName())
        },
        _updateHeaderHeight() {
            this.$nextTick(() => {
                let headerRef = this.$refs.terminalHeader
                if (headerRef && headerRef.getBoundingClientRect) {
                    let rect = headerRef.getBoundingClientRect()
                    this.headerHeight = rect.height
                } else {
                    this.headerHeight = 0
                }
            })
        },
        _calculateByteLen() {
            if (this.byteLen.init) {
                return
            }
            let enGhost = this.$refs.terminalEnFlag
            if (enGhost) {
                let rect = enGhost.getBoundingClientRect()
                if (rect && rect.width > 0) {
                    this.byteLen = {
                        init: true,
                        en: rect.width,
                        cn: this.$refs.terminalCnFlag.getBoundingClientRect().width
                    }

                    this.cursorConf.defaultWidth = this.byteLen.en
                }
            }
        },
        _calculatePromptLen() {
            let prompt = this.$refs.terminalInputPrompt
            if (prompt) {
                let rect = prompt.getBoundingClientRect()
                if (rect.width > 0) {
                    this.inputBoxParam.promptWidth = rect.width
                    this.inputBoxParam.promptHeight = rect.height
                }
            }
        },
        _resetSearchKey() {
            this.searchCmdResult.item = null
        },
        _searchCmd(key) {
            if (!this.autoHelp) {
                return;
            }

            //  用户自定义搜索实现
            if (this.searchHandler) {
                this.searchHandler(this.allCommandStore, key, item => {
                    this.searchCmdResult.item = item
                    this._jumpToBottom()
                })
                return;
            }

            let cmd = key
            if (cmd == null) {
                cmd = this.command.split(' ')[0]
            }
            if (_isEmpty(cmd)) {
                this._resetSearchKey()
            } else if (cmd.trim().indexOf(" ") < 0) {
                let reg = new RegExp(cmd.trim().replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i')
                let matchSet = []

                let target = null
                for (let i in this.allCommandStore) {
                    let o = this.allCommandStore[i]
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
                        this.searchCmdResult.item = null
                        return
                    }
                }
                this.searchCmdResult.item = target
                this._jumpToBottom()
            }
        },
        _fillCmd() {
            if (this.searchCmdResult.item) {
                this.command = this.searchCmdResult.item.key
            }
        },
        _focus(enforceFocus = false) {
            this.$nextTick(function () {
                let input
                if (this.ask.open) {
                    input = this.$refs.terminalAskInput
                    this.cursorConf.show = false
                } else if (this.textEditor.open) {
                    input = this.$refs.terminalTextEditor
                    this.cursorConf.show = false
                } else {
                    if (enforceFocus === true) {
                        input = this.$refs.terminalCmdInput
                    }
                    this.cursorConf.show = true
                }

                if (input) {
                    input.focus()
                }
                this._onActive()
            })
        },
        /**
         * help命令执行后调用此方法
         *
         * 命令搜索：comm*、command
         * 分组搜索：:groupA
         */
        _printHelp(regExp, srcStr) {
            let content = {
                head: ['KEY', 'GROUP', 'DETAIL'],
                rows: []
            }
            let findGroup = srcStr && srcStr.length > 1 && srcStr.startsWith(":")
                ? srcStr.substring(1).toLowerCase()
                : null
            this.allCommandStore.forEach(command => {
                if (findGroup) {
                    if (_isEmpty(command.group) || findGroup !== command.group.toLowerCase()) {
                        return;
                    }
                } else if (!regExp.test(command.key)) {
                    return
                }
                let row = []
                row.push(`<span class='t-cmd-key'>${command.key}</span>`)
                row.push(command.group)

                let detail = ''
                if (_nonEmpty(command.description)) {
                    detail += `Description: ${command.description}<br>`
                }
                if (_nonEmpty(command.usage)) {
                    detail += `Usage: <code>${_unHtml(command.usage)}</code><br>`
                }
                if (command.example != null) {
                    if (command.example.length > 0) {
                        detail += '<br>'
                    }

                    for (let idx in command.example) {
                        let eg = command.example[idx]
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
            this._pushMessage({
                type: MESSAGE_TYPE.TABLE,
                content: content
            })
        },
        _execute() {
            this._resetSearchKey()
            this._saveCurCommand();
            if (_nonEmpty(this.command)) {
                try {
                    let split = this.command.split(" ")
                    let cmdKey = split[0];
                    this.$emit("before-exec-cmd", cmdKey, this.command, this.getName())

                    const execute = () => {
                        this.showInputLine = false
                        let success = (message) => {
                            let finish = () => {
                                this.showInputLine = true
                                this._endExecCallBack()
                            }

                            if (message != null) {
                                //  实时回显处理
                                if (message instanceof TerminalFlash) {
                                    message.onFlush(msg => {
                                        this.flash.content = msg
                                    })
                                    message.onFinish(() => {
                                        this.flash.open = false
                                        finish()
                                    })
                                    this.flash.open = true
                                    return
                                } else if (message instanceof TerminalAsk) {
                                    message.onAsk((options) => {
                                        this.ask.input = ''
                                        this.ask.isPassword = options.isPassword
                                        this.ask.question = _html(options.question)
                                        this.ask.callback = options.callback
                                        this.ask.autoReview = options.autoReview
                                        this._focus()
                                    })

                                    message.onFinish(() => {
                                        this.ask.open = false
                                        finish()
                                        this._focus(true)
                                    })
                                    this.ask.open = true
                                    return
                                } else {
                                    this._pushMessage(message)
                                }
                            }
                            finish()
                        }

                        let failed = (message = 'Failed to execute.') => {
                            if (message != null) {
                                this._pushMessage({
                                    type: MESSAGE_TYPE.NORMAL, class: MESSAGE_CLASS.ERROR, content: message
                                })
                            }
                            this.showInputLine = true
                            this._endExecCallBack()
                        }

                        this.$emit("exec-cmd", cmdKey, this.command, success, failed, this.getName())
                    }

                    if (this.enableDefaultCommand) {
                        switch (cmdKey) {
                            case 'help': {
                                let reg = `^${split.length > 1 && _nonEmpty(split[1]) ? split[1] : "*"}$`
                                reg = reg.replace(/\*/g, ".*")
                                this._printHelp(new RegExp(reg, "i"), split[1])
                                break;
                            }
                            case 'clear':
                                this.clearLog(split.length === 2 && split[1] === 'history');
                                break;
                            case 'open':
                                _openUrl(split[1]);
                                break;
                            default:
                                execute()
                                return
                        }
                    } else {
                        execute()
                        return
                    }
                } catch (e) {
                    console.error(e)
                    this._pushMessage({
                        type: MESSAGE_TYPE.NORMAL,
                        class: MESSAGE_CLASS.ERROR,
                        content: _html(_unHtml(e.stack)),
                        tag: 'error'
                    })
                }
            }
            this._endExecCallBack()
        },
        _endExecCallBack() {
            this.command = ""
            this._resetCursorPos()
            if (this.isActive()) {
                this._focus()
                this.cursorConf.show = true
            } else {
                this.cursorConf.show = false
            }
            this.searchCmdResult.show = true
            this.searchCmdResult.defaultBoxRect = null
        },
        _filterMessageType(message) {
            let valid = message.type && /^(normal|html|code|table|json)$/.test(message.type)
            if (!valid) {
                console.debug(`Invalid terminal message type: ${message.type}, the default type normal will be used`)
                message.type = MESSAGE_TYPE.NORMAL
            } else {
                if (message.type === MESSAGE_TYPE.JSON) {
                    if (!message.depth) {
                        message.depth = 1;
                    }
                }
            }
            return valid
        },
        /**
         * message内容：
         *
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
         * @private
         */
        _pushMessage(message) {
            if (!message) return
            if (message instanceof Array) {
                for (let m of message) {
                    this._pushMessage0(m)
                }
                return;
            }

            if (typeof message === 'string') {
                message = {
                    type: MESSAGE_TYPE.NORMAL,
                    content: message
                }
            }

            if (message.type === MESSAGE_TYPE.ANSI) {
                message.type = MESSAGE_TYPE.HTML
                message.content = _parseANSI(message.content)
            }

            this._pushMessage0(message)

            if (message.type === MESSAGE_TYPE.JSON) {
                setTimeout(() => {
                    this._jumpToBottom()
                }, 80)
            }
        },
        _pushMessage0(message) {
            this._filterMessageType(message)
            if (message.type !== MESSAGE_TYPE.CMD_LINE && this.pushMessageBefore) {
                this.pushMessageBefore(message, this.getName())
            }
            this.terminalLog.push(message)
            //  留10%的缓冲
            let limit = Math.floor(this.logSizeLimit * 1.1)
            if (limit > 0 && this.terminalLog.length > limit) {
                let left = this.terminalLog.length - this.logSizeLimit
                this.terminalLog.splice(0, left)
            }
        },
        /**
         * 追加内容到最后一条记录中，仅当最后一条消息存在，且其格式为 normal、ansi、code、html时才会追加，
         * 否则push一条新的消息
         * @param message 被追加的内容，格式为string
         */
        _appendMessage(message) {
            let lastMessage
            for (let i = this.terminalLog.length - 1; i >= 0; i--) {
                let message = this.terminalLog[i]
                if (message.type !== 'cmdLine') {
                    lastMessage = message
                    break
                }
            }
            if (lastMessage) {
                //  仅对部分格式的消息可追加
                if (lastMessage.type === 'normal' || lastMessage.type === 'ansi'
                    || lastMessage.type === 'code' || lastMessage.type === 'html') {
                    lastMessage.content += message
                } else {
                    console.warn(`The last message type is ${lastMessage.type}, can not append it and then push it.`)
                    this._pushMessage(message)
                }
            } else {
                this._pushMessage(message)
            }
        },
        _jumpToBottom() {
            this.$nextTick(() => {
                let box = this.$refs.terminalWindow
                if (box != null) {
                    box.scrollTo({top: box.scrollHeight, behavior: this.scrollMode})
                }
            })
        },
        _saveCurCommand() {
            if (_nonEmpty(this.command)) {
                historyStore.pushCmd(this.getName(), this.command)
            }

            this.terminalLog.push({
                type: "cmdLine",
                content: `${_unHtml(this.context)}${this.contextSuffix}${this._commandFormatter(this.command)}`
            });
        },
        _resetCursorPos(cmd) {
            this._calculateByteLen()
            this.cursorConf.idx = (cmd == null ? this.command : cmd).length
            this.cursorConf.left = 'unset'
            this.cursorConf.top = 'unset'
            this.cursorConf.width = this.cursorConf.defaultWidth
        },
        _calculateCursorPos(cmd) {
            //  idx可以认为是需要光标覆盖字符的索引
            let idx = this.cursorConf.idx
            let command = cmd == null ? this.command : cmd

            this._calculateByteLen()

            if (idx < 0 || idx >= command.length) {
                this._resetCursorPos()
                return
            }

            if (this.inputBoxParam.promptWidth === 0) {
                this._calculatePromptLen()
            }

            let lineWidth = this.$refs.terminalInputBox.getBoundingClientRect().width

            let pos = {left: 0, top: 0}
            //  当前字符长度
            let charWidth = this.cursorConf.defaultWidth
            //  前一个字符的长度
            let preWidth = this.inputBoxParam.promptWidth

            //  先找到被覆盖字符的位置
            for (let i = 0; i <= idx; i++) {
                charWidth = this._calculateStringWidth(command[i])
                pos.left += preWidth
                preWidth = charWidth
                if (pos.left > lineWidth) {
                    //  行高默认是20px
                    pos.top += this.lineHeight
                    pos.left = charWidth
                }
            }

            this.cursorConf.left = pos.left + 'px'
            this.cursorConf.top = pos.top + 'px'
            this.cursorConf.width = charWidth
        },
        _cursorGoLeft() {
            if (this.cursorConf.idx > 0) {
                this.cursorConf.idx--;
            }
            this._calculateCursorPos()
        },
        _cursorGoRight() {
            if (this.cursorConf.idx < this.command.length) {
                this.cursorConf.idx++;
            }
            this._calculateCursorPos()
        },
        _switchPreCmd() {
            let cmdLog = historyStore.getLog(this.getName())
            let cmdIdx = historyStore.getIdx(this.getName())
            if (cmdLog.length !== 0 && cmdIdx > 0) {
                cmdIdx -= 1;
                this.command = cmdLog[cmdIdx] == null ? [] : cmdLog[cmdIdx];
            }
            this._resetCursorPos()
            historyStore.setIdx(this.getName(), cmdIdx)
            this._searchCmd(this.command.trim().split(" ")[0])
        },
        _switchNextCmd() {
            let cmdLog = historyStore.getLog(this.getName())
            let cmdIdx = historyStore.getIdx(this.getName())
            if (cmdLog.length !== 0 && cmdIdx < cmdLog.length - 1) {
                cmdIdx += 1;
                this.command = cmdLog[cmdIdx] == null ? [] : cmdLog[cmdIdx];
            } else {
                cmdIdx = cmdLog.length;
                this.command = '';
            }
            this._resetCursorPos()
            historyStore.setIdx(this.getName(), cmdIdx)
            this._searchCmd(this.command.trim().split(" ")[0])
        },
        _calculateStringWidth(str) {
            let width = 0
            for (let char of str) {
                width += (_getByteLen(char) === 1 ? this.byteLen.en : this.byteLen.cn)
            }
            return width
        },
        _onInput(e) {
            if (this.inputFilter != null) {
                let value = e.target.value
                let newStr = this.inputFilter(e.data, value, e)
                if (newStr == null) {
                    newStr = value
                }
                this.command = newStr
            }

            if (_isEmpty(this.command)) {
                this._resetSearchKey();
            } else {
                this._searchCmd()
            }

            this.$nextTick(() => {
                this._checkInputCursor()
                this._calculateCursorPos()

                let point = this.$refs.terminalCursor.getBoundingClientRect()
                let rect = this.searchCmdResult.defaultBoxRect || this.$refs.terminalHelpBox.getBoundingClientRect()
                if (point && rect && _pointInRect(point, rect)) {
                    this.searchCmdResult.show = false
                    this.searchCmdResult.defaultBoxRect = rect
                } else {
                    this.searchCmdResult.show = true
                    this.searchCmdResult.defaultBoxRect = null
                }
            })
        },
        _checkInputCursor() {
            let eIn = this.$refs.terminalCmdInput
            if (eIn.selectionStart !== this.cursorConf.idx) {
                this.cursorConf.idx = eIn.selectionStart
            }
        },
        _onInputKeydown(e) {
            let key = e.key.toLowerCase()
            if (key === 'arrowleft') {
                this._checkInputCursor()
                this._cursorGoLeft()
            } else if (key === 'arrowright') {
                this._checkInputCursor()
                this._cursorGoRight()
            }
        },
        _onInputKeyup(e) {
            let key = e.key.toLowerCase()
            let code = e.code.toLowerCase()
            if (key === 'home' || key === 'end' || code === 'altleft' || code === 'metaleft' || code === 'controlleft'
                || ((e.ctrlKey || e.metaKey || e.altKey) && (key === 'arrowright' || key === 'arrowleft'))) {
                this._checkInputCursor()
                this._calculateCursorPos()
            }
        },
        _fullscreen() {
            let fullArea = this.$refs.terminalContainer
            if (this.fullscreenState) {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.webkitCancelFullScreen) {
                    document.webkitCancelFullScreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
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
            this.fullscreenState = !this.fullscreenState
        },
        _initContainerStyle() {
            let containerStyleStore = {}
            if (this.isDraggable()) {
                let clientWidth = document.body.clientWidth
                let clientHeight = document.body.clientHeight

                let confWidth = this.dragConf.width
                let width = confWidth == null ? 700 : confWidth

                if (confWidth && typeof confWidth === 'string' && confWidth.endsWith("%")) {
                    width = clientWidth * (parseInt(confWidth) / 100)
                }
                let confHeight = this.dragConf.height
                let height = confHeight == null ? 500 : confHeight
                if (confHeight && typeof confHeight === 'string' && confHeight.endsWith("%")) {
                    height = clientHeight * (parseInt(confHeight) / 100)
                }

                let zIndex = this.dragConf.zIndex ? this.dragConf.zIndex : 100

                let initX, initY

                let initPos = this.dragConf.init
                if (initPos && initPos.x && initPos.y) {
                    initX = initPos.x
                    initY = initPos.y
                } else {
                    initX = (clientWidth - width) / 2
                    initY = (clientHeight - height) / 2
                }
                containerStyleStore.position = 'fixed'
                containerStyleStore.width = width + 'px'
                containerStyleStore.height = height + 'px'
                containerStyleStore.left = initX + 'px'
                containerStyleStore.top = initY + 'px'
                containerStyleStore['z-index'] = zIndex
            } else {
                containerStyleStore.width = '100%'
                containerStyleStore.height = '100%'
            }
            this.containerStyleStore = containerStyleStore
        },
        _getContainerStyle() {
            if (this.containerStyleStore) {
                let styles = []
                for (let key in this.containerStyleStore) {
                    styles.push(`${key}:${this.containerStyleStore[key]}`)
                }
                return styles.join(';')
            }
            return ''
        },
        _initDrag() {
            if (!this.isDraggable()) {
                return
            }
            // 记录当前鼠标位置
            let mouseOffsetX = 0;
            let mouseOffsetY = 0;

            let dragArea = this.$refs.terminalHeader
            let box = this.$refs.terminalContainer
            let window = this.$refs.terminalWindow

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

            const storeResizeData = (type, evt) => {
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

            _eventOn(dragArea, 'mousedown', evt => {
                if (this.fullscreenState) {
                    return
                }
                this._onActive()
                mouseOffsetX = evt.clientX - box.offsetLeft;
                mouseOffsetY = evt.clientY - box.offsetTop;

                isDragging = true
                window.style['user-select'] = 'none'
            })

            _eventOn(this.$refs.resizeLT, 'mousedown', evt => {
                storeResizeData('lt', evt)
            })
            _eventOn(this.$refs.resizeRT, 'mousedown', evt => {
                storeResizeData('rt', evt)
            })
            _eventOn(this.$refs.resizeLB, 'mousedown', evt => {
                storeResizeData('lb', evt)
            })
            _eventOn(this.$refs.resizeRB, 'mousedown', evt => {
                storeResizeData('rb', evt)
            })

            _eventOn(document, 'mousemove', evt => {
                if (this.isPinned() || this.fullscreenState) {
                    return
                }
                if (isDragging) {
                    let moveX = evt.clientX - mouseOffsetX;
                    let moveY = evt.clientY - mouseOffsetY;
                    this._dragging(moveX, moveY)
                } else if (isResize) {
                    let cx = evt.clientX - resizeData.cursorX
                    let cy = evt.clientY - resizeData.cursorY
                    //  右下
                    if (resizeData.type === 'rb') {
                        cx = cx < 0 ? -Math.min(resizeData.boxWidth - resizeData.minWidth, -cx) : cx
                        cy = cy < 0 ? -Math.min(resizeData.boxHeight - resizeData.minHeight, -cy) : cy

                        this.containerStyleStore.width = (resizeData.boxWidth + cx) + 'px'
                        this.containerStyleStore.height = (resizeData.boxHeight + cy) + 'px'
                    }
                    //  右上
                    else if (resizeData.type === 'rt') {
                        cx = cx < 0 ? -Math.min(resizeData.boxWidth - resizeData.minWidth, -cx) : cx
                        cy = cy > 0 ? Math.min(resizeData.boxHeight - resizeData.minHeight, cy) : cy

                        this.containerStyleStore.width = (resizeData.boxWidth + cx) + 'px'
                        this.containerStyleStore.height = (resizeData.boxHeight - cy) + 'px'
                        this.containerStyleStore.top = Math.max(0, resizeData.boxY + cy) + 'px'
                    }
                    //  左下
                    else if (resizeData.type === 'lb') {
                        cx = cx > 0 ? Math.min(resizeData.boxWidth - resizeData.minWidth, cx) : cx
                        cy = cy < 0 ? -Math.min(resizeData.boxHeight - resizeData.minHeight, -cy) : cy

                        this.containerStyleStore.width = (resizeData.boxWidth - cx) + 'px'
                        this.containerStyleStore.height = (resizeData.boxHeight + cy) + 'px'
                        this.containerStyleStore.left = Math.max(0, resizeData.boxX + cx) + 'px'
                    }
                    //  左上
                    else if (resizeData.type === 'lt') {
                        cx = cx > 0 ? Math.min(resizeData.boxWidth - resizeData.minWidth, cx) : cx
                        cy = cy > 0 ? Math.min(resizeData.boxHeight - resizeData.minHeight, cy) : cy

                        this.containerStyleStore.width = (resizeData.boxWidth - cx) + 'px'
                        this.containerStyleStore.height = (resizeData.boxHeight - cy) + 'px'
                        this.containerStyleStore.left = Math.max(0, resizeData.boxX + cx) + 'px'
                        this.containerStyleStore.top = Math.max(0, resizeData.boxY + cy) + 'px'
                    }
                }
            })

            _eventOn(document, 'mouseup', () => {
                if (isDragging || isResize) {
                    this._onActive()
                }
                isDragging = false
                isResize = false
                window.style['user-select'] = 'unset'
            })
        },
        _dragging(x, y) {
            if (this.isPinned()) {
                return
            }
            let clientWidth = document.body.clientWidth
            let clientHeight = document.body.clientHeight
            let container = this.$refs.terminalContainer

            let xVal, yVal
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

            if (this.dragConf) {
                this.dragConf.init = {
                    x: xVal,
                    y: yVal
                }
            }

            this.containerStyleStore.left = xVal + "px";
            this.containerStyleStore.top = yVal + "px";
        },
        _nonEmpty(obj) {
            return _nonEmpty(obj)
        },
        _commandFormatter(cmd) {
            if (this.commandFormatter != null) {
                return this.commandFormatter(cmd)
            }
            return _defaultCommandFormatter(cmd)
        },
        _getPosition() {
            if (this.isDraggable()) {
                let box = this.$refs.terminalContainer
                return {x: parseInt(box.style.left), y: parseInt(box.style.top)}
            } else {
                return {x: 0, y: 0}
            }
        },
        _onAskInput() {
            if (this.ask.autoReview) {
                this._pushMessage({
                    content: this.ask.question + (this.ask.isPassword ? '*'.repeat(this.ask.input.length) : this.ask.input)
                })
            }
            this.ask.question = null
            if (this.ask.callback) {
                this.ask.callback(this.ask.input)
            }
        },
        _textEditorClose(options) {
            if (this.textEditor.open) {
                this.textEditor.open = false
                let content = this.textEditor.value
                this.textEditor.value = ''
                if (this.textEditor.onClose) {
                    this.textEditor.onClose(content, options)
                    this.textEditor.onClose = null
                }
                this._focus(true)
                return content
            }
        },
        _onActive() {
            this.$emit('on-active', this.getName())
        },
        _onInactive() {
            this.$emit('on-inactive', this.getName())
        },
    }
}
