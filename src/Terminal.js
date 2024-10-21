import {
    _copyTextToClipboard,
    _debounce,
    _defaultMergedCommandFormatter,
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
    _openUrl, _parsePixelFromValue,
    _pointInRect
} from "./js/Util.js";
import historyStore from "@/js/TerminalStore.js";
import TerminalFlash from "@/js/TerminalFlash.js";
import TerminalAsk from "@/js/TerminalAsk";
import TerminalApi, {getOptions, register, rename, unregister} from './js/TerminalApi';
import {terminalProps} from "@/js/TerminalAttribute";
import THeader from "@/components/THeader.vue";
import TViewJson from "@/components/TViewJson.vue";
import TViewNormal from "@/components/TViewNormal.vue";
import TViewCode from "@/components/TViewCode.vue";
import TViewTable from "@/components/TViewTable.vue";
import THelpBox from "@/components/THelpBox.vue";
import TEditor from "@/components/TEditor.vue";
import {DEFAULT_COMMANDS, MESSAGE_CLASS, MESSAGE_TYPE, WINDOW_STYLE} from "@/js/Configuration";
import {_parseANSI} from "@/js/ansi/ANSI";
import {_screenType} from "@/js/Util";

import themeDark from "!!raw-loader!./css/theme/dark.css"
import themeLight from "!!raw-loader!./css/theme/light.css"

let idx = 0;

function generateTerminalName() {
    idx++;
    return `terminal_${idx}`;
}

//  对应css变量 --t-font-height
const FONT_HEIGHT = 19;

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
            logSize: 0,
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
            resizeObserver: null,
            tips: {
                open: false,
                style: {
                    opacity: 100,
                    top: 0,
                    left: 0
                },
                cursorIdx: 0,
                items: [],
                helpBox: {
                    //  避免默认提示板与输入框遮挡，某些情况下需要隐藏提示板
                    open: false,
                    lastRect: null
                },
                selectedIndex: 0
            }
        }
    },
    props: terminalProps(),
    mounted() {
        this.$emit('init-before', this.getName())
        this.setTheme(this.theme)
        this._initContainerStyle()

        if (this.initLog) {
            this._newTerminalLogGroup("init")
            this._pushMessage(this.initLog)
        }

        let allCommandStore = []
        if (this.enableDefaultCommand) {
            allCommandStore = allCommandStore.concat(DEFAULT_COMMANDS)
        }
        if (this.commandStore) {
            if (this.commandSortHandler) {
                this.commandStore.sort(this.commandSortHandler)
            }
            allCommandStore = allCommandStore.concat(this.commandStore)
        }
        this.allCommandStore = allCommandStore

        let el = this.$refs.terminalWindowRef
        el.scrollTop = el.offsetHeight;

        let selectContentText = null

        _eventOn(window, "click", this.clickListener = e => {
            let activeCursor = false
            let container = this.$refs.terminalContainerRef
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
                this._closeTips(false)
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
                    if (this.tips.open) {
                        if (key === 'escape') {
                            this._closeTips(false)
                            return;
                        }
                    }


                    if (this.cursorConf.show) {
                        if (key === 'tab') {
                            this._selectTips()
                            event.preventDefault()
                        } else if (document.activeElement !== this.$refs.terminalCmdInputRef) {
                            this.$refs.terminalCmdInputRef.focus()
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
                selectContentText = selectContentText.replace(new RegExp(String.fromCharCode(160), 'g'), ' ')
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
                        .replace(/\r\n/g, '\n')
                        .replace(/\r/g, '\n')
                    const command = this.command;
                    this.command = command && command.length > 0 ? `${command}${text}` : text;
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
                if (entry.target === this.$refs.terminalHeaderRef) {
                    this._updateHeaderHeight()
                }
            }
        })
        if (this.$refs.terminalHeaderRef) {
            this.resizeObserver.observe(this.$refs.terminalHeaderRef)
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
                return this._getElementInfo()
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
            } else if (type === 'getCommand') {
                return this.getCommand()
            } else if (type === 'setCommand') {
                return this.setCommand(options)
            } else if (type === 'switchAllFoldState') {
                return this._switchAllFoldState(options)
            } else {
                console.error(`Unsupported event type '${type}' in instance ${this.getName()}`)
            }
        })
        this.$emit('init-complete', this.getName())
    },
    destroyed() {
        //  通知
        this.$emit('destroyed', this.getName())

        //  注销事件监听器
        _eventOff(window, 'keydown', this.keydownListener);
        _eventOff(window, "click", this.clickListener);
        if (this.resizeObserver && this.$refs.terminalHeaderRef) {
            this.resizeObserver.unobserve(this.$refs.terminalHeaderRef)
            this.resizeObserver = null
        }

        //  移除样式文件
        let style = document.getElementById(this.getThemeStyleId(this.getName()))
        if (style) {
            document.body.removeChild(style)
        }

        //  注销本地数据
        unregister(this.getName())
    },
    watch: {
        context: {
            handler() {
                this.$nextTick(() => {
                    this._calculatePromptLen()
                })
            }
        },
        //  监听改名称
        name: {
            handler(newVal, oldVal) {
                let newName = newVal ? newVal : this.getName()
                let oldName = oldVal ? oldVal : this._name

                rename(newName, oldName, this.terminalListener)
                this.changeThemeFlag(newName, oldName)
            }
        },
        //  监听层级变化
        "dragConf.zIndex"(newVal) {
            this.containerStyleStore['z-index'] = newVal
        },
        //  监听header显示
        showHeader() {
            this._updateHeaderHeight()
        },
        //  监听主题
        theme: {
            handler(newVal) {
                console.log("changed theme",newVal)
                this.setTheme(newVal)
            }
        },
        cursorConf: {
            handler() {
                this._calculateTipsPos()
            },
            deep: true
        }
    },
    computed: {
        WINDOW_STYLE() {
            return WINDOW_STYLE
        },
        isEnableHelpBox: function () {
            return this.enableHelpBox && this.tips.items[this.tips.selectedIndex] && this.tips.items[this.tips.selectedIndex].command
        },
        selectedTipCommand: function () {
            let selectedTip = this.tips.items[this.tips.selectedIndex]
            return selectedTip ? selectedTip.command : null
        }
    },
    methods: {
        _screenType,
        pushMessage(message) {
            TerminalApi.pushMessage(this.getName(), message);
        },
        fullscreen() {
            return TerminalApi.fullscreen(this.getName());
        },
        isFullscreen() {
            return TerminalApi.isFullscreen(this.getName());
        },
        dragging(options) {
            return TerminalApi.dragging(this.getName(), options);
        },
        execute(options) {
            return TerminalApi.execute(this.getName(), options);
        },
        focus() {
            return TerminalApi.focus(this.getName());
        },
        elementInfo() {
            return this._getElementInfo();
        },
        textEditorClose(options) {
            return TerminalApi.textEditorClose(this.getName(), options);
        },
        textEditorOpen(options) {
            return TerminalApi.textEditorOpen(this.getName(), options);
        },
        clearLog(clearHistory) {
            if (clearHistory) {
                historyStore.clearLog(this.getName())
            } else {
                this.terminalLog = [];
                this.logSize = 0;
            }
        },
        getCommand() {
            return this.command
        },
        setCommand(cmd) {
            if (this.ask.open) {
                console.error("Cannot call 'setCommand' api in ask mode")
                return
            } else if (this.textEditor.open) {
                console.error("Cannot call 'setCommand' api in editor mode")
                return
            } else if (this.flash.open) {
                console.error("Cannot call 'setCommand' api in flash mode")
                return
            }
            if (cmd) {
                this.command = cmd.toString()
                this.$nextTick(() => {
                    this._resetCursorPos()
                })
            } else {
                console.warn("The parameter received by the 'setCommand' api is undefined")
            }
            return this.command
        },
        switchAllFoldState(state) {
            return this._switchAllFoldState(state)
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
                || (this.ask.open && this.$refs.terminalAskInputRef === document.activeElement)
                || (this.textEditor.open && this.textEditor.focus)
        },
        /**
         * 是否会阻断获取命令焦点
         * @returns {boolean}
         */
        isBlockCommandFocus() {
            return this.textEditor.open || this.flash.open || this.ask.open
        },
        getThemeStyleId(salt) {
            return `t-theme-style-${salt}`
        },
        setTheme(theme) {
            let customThemes = getOptions().themes
            let themeStyle
            if (customThemes && customThemes[theme]) {
                themeStyle = customThemes[theme]
            } else if (theme === 'dark') {
                themeStyle = themeDark
            } else if (theme === 'light') {
                themeStyle = themeLight
            } else {
                console.warn("The specified terminal theme style was not found:", theme)
                return
            }
            let css = themeStyle.match(/^.*\{(.*)}\s*$/s)[1]

            themeStyle = `#t-${this.getName()} { ${css} }`

            let tagId = this.getThemeStyleId(this.getName())
            let styleTag = document.getElementById(tagId)
            if (styleTag) {
                styleTag.innerHTML = themeStyle
            } else {
                let themeLink = document.createElement("style")
                themeLink.innerHTML = themeStyle
                themeLink.id = tagId
                document.body.appendChild(themeLink)
            }
        },
        changeThemeFlag(newName, oldName) {
            let newTagId = this.getThemeStyleId(newName)
            let oldThemeStyle = document.getElementById(this.getThemeStyleId(oldName))
            if (oldThemeStyle) {
                let style = oldThemeStyle.innerHTML.replace(`#t-${oldName}`, `#t-${newName}`)
                oldThemeStyle.id = newTagId
                oldThemeStyle.innerHTML = style
            }
        },
        _triggerClick(key) {
            if (key === 'fullscreen') {
                this._fullscreen()
            } else if (key === 'pin' && this.showHeader) {
                let pinned = this.dragConf.pinned || false
                this.dragConf.pinned = !pinned;
            }

            this.$emit('on-click', key, this.getName())
        },
        _updateHeaderHeight() {
            this.$nextTick(() => {
                let headerRef = this.$refs.terminalHeaderRef
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
            let enGhost = this.$refs.terminalEnFlagRef
            if (enGhost) {
                let rect = enGhost.getBoundingClientRect()
                if (rect && rect.width > 0) {
                    this.byteLen = {
                        init: true,
                        en: rect.width / 10,
                        cn: this.$refs.terminalCnFlagRef.getBoundingClientRect().width / 10
                    }

                    this.cursorConf.defaultWidth = this.byteLen.en
                    this.byteLen.init = true
                }
            }
        },
        _calculatePromptLen() {
            let prompt = this.$refs.terminalInputPromptRef
            if (prompt) {
                let rect = prompt.getBoundingClientRect()
                if (rect.width > 0) {
                    this.inputBoxParam.promptWidth = rect.width
                    this.inputBoxParam.promptHeight = rect.height
                }
            }
        },
        _searchCmd() {
            if (!this.enableInputTips) {
                return;
            }

            //  用户自定义搜索实现
            if (this.inputTipsSearchHandler) {
                this.inputTipsSearchHandler(this.command, this.cursorConf.idx, this.allCommandStore, (items, openTips) => {
                    this._updateTipsItems(items, openTips)
                })
                return;
            }

            let firstSpaceIdx = this.command.indexOf(' ')
            let cursorInKey = firstSpaceIdx <= 0 || this.cursorConf.idx <= firstSpaceIdx

            let cmd = this.command.trim().split(' ')[0]
            if (cmd.length === 0) {
                this._closeTips(true)
            } else {
                let reg = new RegExp(cmd.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'ig')
                let matchArray = []

                let lowerCaseCmd = cmd.toLowerCase()

                for (let o of this.allCommandStore) {
                    if (_nonEmpty(o.key)) {
                        let res = o.key.match(reg)
                        if (res) {

                            //  匹配分数集合：[是否完全匹配，是否大小写完全匹配，首个匹配索引位置，匹配次数, 源字符串长度]
                            let score = [0, 0, 0, 0, 0]
                            //  完全匹配
                            if (cmd.length === o.key.length) {
                                score[0] = 1
                            } else {
                                score[1] = res.includes(cmd) ? 1 : 0
                                score[2] = o.key.toLowerCase().indexOf(lowerCaseCmd)
                                score[3] = res.length
                                score[4] = o.key.length
                            }
                            matchArray.push({
                                item: o,
                                keyword: o.key.replace(reg, '<span class="t-cmd-key">$&</span>'),
                                score: score
                            })
                        }
                    }
                }

                if (matchArray.length > 0) {
                    matchArray.sort((a, b) => {
                        let scoreA = a.score
                        let scoreB = b.score

                        //  都完全匹配
                        if (scoreA[0] === 1 && scoreA[0] === scoreB[0]) {
                            return 0
                        }
                        //  a完全匹配
                        else if (scoreA[0] === 1) {
                            return -1
                        }
                        //  b完全匹配
                        else if (scoreB[0] === 1) {
                            return 1
                        }
                        //  均不完全匹配
                        else {
                            if (scoreA[1] === scoreB[1]) {
                                //  匹配索引位置越靠左越优先展示
                                let res = scoreA[2] - scoreB[2]
                                if (res === 0) {
                                    //  匹配次数越多越优先展示
                                    res = scoreB[3] - scoreA[3]
                                    //  匹配源字符长度越短越优先展示
                                    if (res === 0) {
                                        res = scoreA[4] - scoreB[4]
                                    }
                                }
                                return res
                            } else {
                                //  大小写完全匹配的优先展示
                                return scoreB[1] - scoreA[1]
                            }
                        }
                    })

                    let items = []

                    for (let o of matchArray) {
                        items.push({
                            content: o.keyword,
                            description: o.item.description,
                            command: o.item
                        })
                    }
                    this._updateTipsItems(items, cursorInKey)
                } else {
                    this._closeTips(true)
                }
            }
        },
        _focus(enforceFocus = false) {
            this.$nextTick(function () {
                let input
                if (this.ask.open) {
                    input = this.$refs.terminalAskInputRef
                    this.cursorConf.show = false
                } else if (this.textEditor.open) {
                    input = this.$refs.terminalTextEditorRef
                    this.cursorConf.show = false
                } else {
                    if (enforceFocus === true) {
                        input = this.$refs.terminalCmdInputRef
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
                    detail += `Usage: <code class="t-code-inline">${_html(command.usage)}</code><br>`
                }
                if (command.example != null) {
                    if (command.example.length > 0) {
                        detail += '<br>'
                    }

                    for (let idx in command.example) {
                        let eg = command.example[idx]
                        detail += `
                        <div>
                            <div class="t-cmd-help-eg">
                              eg${parseInt(idx) + 1}:
                            </div>
                            <div class="t-cmd-help-example">
                              <ul class="t-example-ul">
                                <li class="t-example-li"><code class="t-code-inline">${eg.cmd}</code></li>
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
        _inputEnter(e) {
            if (e.ctrlKey) {
                if (this.command.length > 0) {
                    let cursorIdx = this.cursorConf.idx
                    this.command = this.command.substring(0, cursorIdx) + '\n' + this.command.substring(cursorIdx)

                    cursorIdx++
                    //  恢复光标位置
                    this.$nextTick(() => {
                        this.$refs.terminalCmdInputRef.selectionStart = cursorIdx
                        this.$refs.terminalCmdInputRef.selectionEnd = cursorIdx
                        this.cursorConf.idx = cursorIdx
                    })
                }
            } else {
                this._execute()
            }
        },
        _execute() {
            this._closeTips(true)
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
                                this._jumpToBottom()
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
                                        this._jumpToBottom()
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
                        content: _html(e.stack),
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
            this._closeTips(true)
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
        _newTerminalLogGroup(tag) {
            let newGroup = {
                fold: false,
                logs: []
            }
            if (tag) {
                newGroup.tag = tag
            }
            this.terminalLog.push(newGroup)
            return newGroup
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
                    this._pushMessage0(m, false)
                }
                this._checkLogSize()
                this._jumpToBottom()
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
            this._jumpToBottom()

            if (message.type === MESSAGE_TYPE.JSON) {
                setTimeout(() => {
                    this._jumpToBottom()
                }, 80)
            }
        },
        _pushMessage0(message, checkSize = true) {
            this._filterMessageType(message)
            if (message.type !== MESSAGE_TYPE.CMD_LINE && this.pushMessageBefore) {
                this.pushMessageBefore(message, this.getName())
            }
            let terminalLogLength = this.terminalLog.length;
            if (terminalLogLength === 0) {
                this._newTerminalLogGroup()
            }
            terminalLogLength = this.terminalLog.length;
            let logGroup = this.terminalLog[terminalLogLength - 1]
            logGroup.logs.push(message)
            this.logSize++

            if (checkSize) {
                this._checkLogSize()
            }
        },
        _checkLogSize() {
            if (this.logSizeLimit <= 0) {
                console.warn("Invalid attribute 'log-size-limit':", this.logSizeLimit)
                return;
            }

            //  留10%的缓冲
            let limit = Math.floor(this.logSizeLimit * 1.1)

            let count = this.logSize - limit;
            while (count > 0) {
                let group = this.terminalLog[0]
                let leftCount = count - group.logs.length
                if (leftCount >= 0) {
                    this.terminalLog.splice(0, 1)
                    this.logSize -= group.logs.length
                } else {
                    group.logs.splice(0, count);
                    group.fold = false
                    this.logSize -= count
                }
                count = leftCount;
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
                let group = this.terminalLog[i]
                for (let j = group.logs.length - 1; j >= 0; j--) {
                    let message = group.logs[j]
                    if (message.type !== MESSAGE_TYPE.CMD_LINE) {
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
                if (lastMessage.type === MESSAGE_TYPE.NORMAL
                    || lastMessage.type === MESSAGE_TYPE.ANSI
                    || lastMessage.type === MESSAGE_TYPE.CODE
                    || lastMessage.type === MESSAGE_TYPE.HTML) {
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
                let box = this.$refs.terminalWindowRef
                if (box != null) {
                    box.scrollTo({
                        top: box.scrollHeight,
                        behavior: this.scrollMode
                    })
                }
            })
        },
        _saveCurCommand() {
            let cmd = this.command = this.command.trim()

            if (cmd.length > 0) {
                historyStore.pushCmd(this.getName(), cmd)
            }
            let group = this._newTerminalLogGroup()

            group.logs.push({
                type: MESSAGE_TYPE.CMD_LINE,
                content: `${_html(this.context)}${this.contextSuffix}${this._commandFormatter(cmd)}`
            });
            this._jumpToBottom()
        },
        _resetCursorPos(cmd) {
            this._calculateByteLen()

            let input = this.$refs.terminalCmdInputRef
            if (input) {
                input.focus()
                input.setSelectionRange(this.command.length, this.command.length)
            }

            this.cursorConf.idx = (cmd == null ? this.command : cmd).length
            this.cursorConf.left = 'unset'
            this.cursorConf.top = 'unset'
            this.cursorConf.width = this.cursorConf.defaultWidth
        },
        _calculateCursorPos(cmdStr) {
            let cmd = cmdStr ? cmdStr : this.command

            //  idx可以认为是需要光标覆盖字符的索引
            let idx = this.cursorConf.idx

            this._calculateByteLen()

            if (idx < 0 || idx >= cmd.length) {
                this._resetCursorPos()
                return
            }

            if (this.inputBoxParam.promptWidth === 0) {
                this._calculatePromptLen()
            }

            let lineWidth = this.$refs.terminalInputBoxRef.getBoundingClientRect().width

            let pos = {left: 0, top: 0}
            //  当前字符长度
            let charWidth = this.cursorConf.defaultWidth
            //  前面字符的长度
            let lastCharWidth = this.inputBoxParam.promptWidth
            //  前一个字符是否是回车换行
            let lastCharIsEnter = false

            //  先找到被覆盖字符的位置
            for (let i = 0; i <= idx; i++) {
                let char = cmd[i]

                if (lastCharIsEnter) {
                    pos.top += FONT_HEIGHT
                    pos.left = 0
                    lastCharWidth = 0
                }

                if (char === '\n') {
                    pos.left += lastCharWidth
                    lastCharIsEnter = true
                    continue
                } else {
                    lastCharIsEnter = false
                }


                charWidth = this._calculateStringWidth(cmd[i])
                pos.left += lastCharWidth
                lastCharWidth = charWidth
                if (pos.left > lineWidth) {
                    //  行高 对应css变量 --t-font-height
                    pos.top += FONT_HEIGHT
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
        _inputKeyUp() {
            if (this.tips.open) {
                let idx = this.tips.selectedIndex
                if (idx > 0) {
                    idx--
                } else {
                    idx = this.tips.items.length - 1
                }
                this._switchTipsSelectedIdx(idx)
            } else {
                this._switchPreCmd()
            }
        },
        _inputKeyDown() {
            if (this.tips.open) {
                let idx = this.tips.selectedIndex
                if (idx < this.tips.items.length - 1) {
                    idx++
                } else {
                    idx = 0
                }
                this._switchTipsSelectedIdx(idx)
            } else {
                this._switchNextCmd()
            }
        },
        _switchTipsSelectedIdx(idx) {
            let viewItem = this.$refs.terminalCmdTipsRef.querySelector(".t-cmd-tips-item:nth-child(" + (idx + 1) + ")")
            if (viewItem) {
                viewItem.scrollIntoView({block: "start", behavior: "smooth"})
            }
            this.tips.selectedIndex = idx

            //  重置input的光标
            let input = this.$refs.terminalCmdInputRef
            if (input) {
                input.setSelectionRange(this.tips.cursorIdx, this.tips.cursorIdx)
            }
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
            this._searchCmd()
            this._jumpToBottom()
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
            this._searchCmd()
            this._jumpToBottom()
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
                this._closeTips(true);
            } else {
                this._searchCmd()
            }

            this.$nextTick(() => {
                this._checkInputCursor()
                this._calculateCursorPos()

                let cursorRect = this.$refs.terminalCursorRef.getBoundingClientRect()
                let helpBoxRect = this.tips.helpBox.lastRect || (this.$refs.terminalHelpBoxRef ? this.$refs.terminalHelpBoxRef.getBoundingClientRect() : null)
                if (cursorRect && helpBoxRect && _pointInRect({
                    x: cursorRect.x + this.byteLen.en * 2,
                    y: cursorRect.y + FONT_HEIGHT
                }, helpBoxRect)) {
                    this.tips.helpBox.open = false
                    this.tips.helpBox.lastRect = helpBoxRect
                } else {
                    this.tips.helpBox.open = true
                    this.tips.helpBox.lastRect = null
                }

            })
        },
        _checkInputCursor() {
            let eIn = this.$refs.terminalCmdInputRef
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
            } else if (key === 'enter') {
                e.preventDefault()
            }
        },
        _onInputKeyup(e) {
            let key = e.key.toLowerCase()
            if (key === 'enter') {
                e.preventDefault()
                return
            }
            let code = e.code.toLowerCase()
            if (key === 'home' || key === 'end' || code === 'altleft' || code === 'metaleft' || code === 'controlleft'
                || ((e.ctrlKey || e.metaKey || e.altKey) && (key === 'arrowright' || key === 'arrowleft'))) {
                this._checkInputCursor()
                this._calculateCursorPos()
            }
        },
        _fullscreen() {
            let fullArea = this.$refs.terminalContainerRef
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

                let width = _parsePixelFromValue(this.dragConf.width, clientWidth, 700)
                let height = _parsePixelFromValue(this.dragConf.height, clientHeight, 500)

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

            let dragArea = this.$refs.terminalHeaderRef
            let box = this.$refs.terminalContainerRef
            let window = this.$refs.terminalWindowRef

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

            _eventOn(this.$refs.resizeLTRef, 'mousedown', evt => {
                storeResizeData('lt', evt)
            })
            _eventOn(this.$refs.resizeRTRef, 'mousedown', evt => {
                storeResizeData('rt', evt)
            })
            _eventOn(this.$refs.resizeLBRef, 'mousedown', evt => {
                storeResizeData('lb', evt)
            })
            _eventOn(this.$refs.resizeRBRef, 'mousedown', evt => {
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
                    this._onResize()
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
            let container = this.$refs.terminalContainerRef

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
        _commandFormatter(cmd) {
            if (this.commandFormatter) {
                return this.commandFormatter(cmd)
            }
            let splitsCode = []
            let splits = cmd.split(/\r\n|\n|\r/g)
            for (let c of splits) {
                splitsCode.push(_defaultMergedCommandFormatter(c))
            }
            return splitsCode.join("<br/>")
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
        _closeGroupFold(group) {
            if (this.enableFold && group.fold) {
                group.fold = false
            }
        },
        _enableFold(group) {
            return this.enableFold && group.tag !== 'init' && group.logs.length > 1 && group.logs[0].type === MESSAGE_TYPE.CMD_LINE
        },
        _switchAllFoldState(fold) {
            let count = 0;
            if (this.enableFold) {
                for (let group of this.terminalLog) {
                    if (this._enableFold(group) && group.fold !== fold) {
                        group.fold = fold
                        count++;
                    }
                }
            } else {
                console.warn("Before using folding related functions, please set enable-fold to enable the folding function.")
            }
            return count
        },
        _calculateTipsPos() {
            if (this.tips.open) {
                this.$nextTick(() => {
                    let cursorRect = this.$refs.terminalCursorRef.getBoundingClientRect()
                    let containerRect = this.$refs.terminalContainerRef.getBoundingClientRect()
                    let tipsRect = this.$refs.terminalCmdTipsRef.getBoundingClientRect()

                    let cursorRelativeLeft = cursorRect.left - containerRect.left
                    // let cursorRelativeTop = cursorRect.top - containerRect.top

                    let containerPaddingLeft = this.enableFold ? WINDOW_STYLE.PADDING_LEFT_FOLD : WINDOW_STYLE.PADDING_LEFT

                    let tipsRelativeTop = FONT_HEIGHT
                    let tipsRelativeLeft = cursorRelativeLeft - containerPaddingLeft

                    //  超右边界
                    if (cursorRect.left + tipsRect.width > containerRect.left + containerRect.width) {
                        tipsRelativeLeft -= (tipsRect.width - this.cursorConf.width)
                    }

                    //  超下边界
                    if (cursorRect.top + tipsRect.height > containerRect.top + containerRect.height) {
                        tipsRelativeTop = -tipsRect.height
                    }

                    this.tips.style.top = tipsRelativeTop
                    this.tips.style.left = tipsRelativeLeft
                    this.tips.style.opacity = 100
                })
            }
        },
        _closeTips(clearItems = true) {
            this.tips.open = false
            if (clearItems) {
                this.tips.items = []
                this.tips.selectedIndex = 0
            }
        },
        _updateTipsItems(items, openTips = true) {
            if (this.enableInputTips && items && items instanceof Array && items.length > 0) {
                this.tips.items = items
                this.tips.selectedIndex = 0
                if (openTips) {
                    this.tips.style.opacity = 0
                    this.tips.cursorIdx = this.$refs.terminalCmdInputRef.selectionStart
                    this.tips.open = true
                } else {
                    this.tips.open = false
                }
            } else {
                this._closeTips(true)
            }
        },
        _clickTips(idx) {
            if (idx === this.tips.selectedIndex) {
                this._selectTips()
            } else {
                this.tips.selectedIndex = idx
            }
        },
        _selectTips() {
            if (!this.tips.open) {
                return
            }
            let selectedItem = this.tips.items[this.tips.selectedIndex]
            if (this.inputTipsSelectHandler) {
                this.inputTipsSelectHandler(this.command, this.cursorConf.idx, selectedItem, newCommand => {
                    if (newCommand && typeof newCommand === 'string') {
                        this.command = newCommand
                        this._resetCursorPos()
                        this._jumpToBottom()
                    } else {
                        console.warn(`'tipsSelectHandler' returns an invalid result, the expected return value is string type, got ${typeof newCommand}.`)
                    }
                })
                return
            }
            this.command = selectedItem.command.key
            this._resetCursorPos()
            this._jumpToBottom()
        },
        _getElementInfo() {
            let windowEle = this.$refs.terminalWindowRef
            let windowRect = windowEle.getBoundingClientRect()
            let containerRect = this.$refs.terminalContainerRef.getBoundingClientRect()
            let hasScroll = windowEle.scrollHeight > windowEle.clientHeight || windowEle.offsetHeight > windowEle.clientHeight
            let clientWidth = windowRect.width - WINDOW_STYLE.PADDING_RIGHT
            if (hasScroll) {
                //  滚动条宽度 8px
                clientWidth -= 8
            }

            //  减去padding值
            if (this.enableFold) {
                clientWidth -= WINDOW_STYLE.PADDING_LEFT_FOLD
            } else {
                clientWidth -= WINDOW_STYLE.PADDING_LEFT
            }
            let clientHeight = windowRect.height - WINDOW_STYLE.PADDING_TOP - WINDOW_STYLE.PADDING_BOTTOM - this.headerHeight

            return {
                //  窗口所在位置
                pos: {
                    x: containerRect.x,
                    y: containerRect.y
                },
                screenWidth: containerRect.width,   //  窗口整体宽度
                screenHeight: containerRect.height, //  窗口整体高度
                clientWidth: clientWidth, //  可显示内容范围高度，减去padding值，如果有滚动条去掉滚动条宽度
                clientHeight: clientHeight,    //  可显示内容范围高度
                charWidth: {
                    en: this.byteLen.en,            //  单个英文字符宽度
                    cn: this.byteLen.cn             //  单个中文字符宽度
                }
            }
        },
        _onResize: _debounce(function () {
            this.$emit('on-resize', this._getElementInfo(), this.getName())
        }, 50)
    }
}
