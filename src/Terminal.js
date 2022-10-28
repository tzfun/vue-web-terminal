import {nextTick, ref} from 'vue'
import sizeof from 'object-sizeof'
import {_dateFormat, _getByteLen, _html, _isEmpty, _isSafari, _nonEmpty, _sleep, _unHtml} from "./Util.js";
import historyStore from "./HistoryStore.js";
import TerminalObj from './TerminalObj.js'

export default {
    name: 'Terminal',
    data() {
        return {
            command: "",
            commandLog: [],
            cmdChange: false,
            cursorConf: {
                defaultWidth: 6,
                width: 6,
                left: 'unset',
                top: 0,
                idx: 0, //  从0开始
                show: false
            },
            byteLen: {
                en: 8, cn: 13
            },
            jsonViewDepth: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            showInputLine: true,
            terminalLog: [],
            terminalSize: 0,
            keydownListener: null,
            searchCmd: {
                item: null
            },
            allCommandStore: [
                {
                    key: 'help',
                    title: 'Help',
                    group: 'local',
                    usage: 'help [pattern]',
                    description: 'Show command document.',
                    example: [
                        {
                            des: "Get all commands.",
                            cmd: 'help'
                        }, {
                            des: "Get help documentation for exact match commands.",
                            cmd: 'help refresh'
                        }, {
                            des: "Get help documentation for fuzzy matching commands.",
                            cmd: 'help *e*'
                        }, {
                            des: "Get help documentation for specified group, match key must start with ':'.",
                            cmd: 'help :groupA'
                        }
                    ]
                }, {
                    key: 'clear',
                    title: 'Clear screen or history logs',
                    group: 'local',
                    usage: 'clear [history]',
                    description: 'Clear screen or history.',
                    example: [
                        {
                            cmd: 'clear',
                            des: 'Clear all records on the current screen.'
                        }, {
                            cmd: 'clear history',
                            des: 'Clear command history'
                        }
                    ]
                }, {
                    key: 'open',
                    title: 'Open page',
                    group: 'local',
                    usage: 'open <url>',
                    description: 'Open a specified page.',
                    example: [{
                        cmd: 'open blog.beifengtz.com'
                    }]
                }
            ],
            fullscreen: false,
            perfWarningRate: {
                size: 0,
                count: 0
            },
            inputBoxParam: {
                boxWidth: 0,
                boxHeight: 0,
                promptWidth: 0,
                promptHeight: 0
            }
        }
    },
    props: {
        name: {
            type: String, default: 'terminal'
        },
        //  终端标题
        title: {
            type: String, default: 'vue-web-terminal'
        },
        //  初始化日志内容
        initLog: {
            type: Array, default: () => {
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
        //  初始化日志每条延迟时间，单位毫秒
        initLogDelay: {
            type: Number, default: 150
        },
        //  是否显示记录结果的时间
        showLogTime: {
            type: Boolean,
            default: true
        },
        //  命令行搜索以及help指令用
        commandStore: {
            type: Array
        },
        //   命令行排序方式
        commandStoreSort: {
            type: Function
        },
        //  记录大小超出此限制会发出警告，单位byte
        warnLogByteLimit: {
            type: Number, default: 1024 * 1024 * 10
        },
        //  记录条数超出此限制会发出警告
        warnLogCountLimit: {
            type: Number, default: 200
        },
        //  记录限制警告开关
        warnLogLimitEnable: {
            type: Boolean,
            default: true
        },
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
        inputFilter: {
            type: Function
        },
        //  拖拽配置
        dragConf: {
            type: Object,
            default: () => {
                /*
                {
                    width: 700,
                    height: 500,
                    zIndex: 100,
                    init: {
                        x: null,
                        y: null
                    }
                }
                **/
                return null
            }
        },
        commandFormatter: {
            type: Function
        }
    },
    emits: ["update:context", "onKeydown", "onClick", "beforeExecCmd", "execCmd", "destroyed", "initBefore", "initComplete"],
    setup() {
        const terminalContainer = ref(null)
        const terminalHeader = ref(null)
        const terminalWindow = ref(null)
        const cmdInput = ref(null)
        const terminalInputBox = ref(null)
        const terminalInputPrompt = ref(null)
        const terminalEnFlag = ref(null)
        const terminalCnFlag = ref(null)
        const terminalObj = TerminalObj

        return {
            terminalContainer,
            terminalHeader,
            terminalWindow,
            cmdInput,
            terminalInputBox,
            terminalInputPrompt,
            terminalObj,
            terminalEnFlag,
            terminalCnFlag
        }
    },
    created() {
        TerminalObj.register(this.name, (type, options) => {
            if (type === 'pushMessage') {
                this._pushMessage(options)
            } else if (type === 'updateContext') {
                this.$emit("update:context", options)
                nextTick(() => {
                    this.inputBoxParam.promptWidth = this.terminalInputPrompt.getBoundingClientRect().width
                }).then(() => {
                })
            } else if (type === 'fullscreen') {
                this._fullscreen()
            } else if (type === 'isFullscreen') {
                return this.fullscreen
            } else if (type === 'dragging') {
                if (this._draggable()) {
                    this._dragging(options.x, options.y)
                } else {
                    console.warn("Terminal is not draggable")
                }
            } else if (type === 'execute') {
                if (_nonEmpty(options)) {
                    this.command = options
                    this._execute()
                }
            } else if (type === 'getPosition') {
                if (this._draggable()) {
                    let box = this.terminalContainer
                    return {x: parseInt(box.style.left), y: parseInt(box.style.top)}
                } else {
                    return {x: 0, y: 0}
                }
            } else if (type === 'focus') {
                this._focus()
            } else {
                console.error("Unsupported event type: " + type)
            }
        })
    },
    async mounted() {
        this.$emit('initBefore', this.name)

        if (this.initLog != null) {
            await this._pushMessageBatch(this.initLog, this.initLogDelay, true)
        }

        if (this.commandStore != null) {
            if (this.commandStoreSort != null) {
                this.commandStore.sort(this.commandStoreSort)
            }
            this.allCommandStore = this.allCommandStore.concat(this.commandStore)
        }
        this.byteLen = {
            en: this.terminalEnFlag.getBoundingClientRect().width / 2,
            cn: this.terminalCnFlag.getBoundingClientRect().width / 2
        }
        this.cursorConf.defaultWidth = this.byteLen.en

        if (this.terminalWindow != null) {
            this.terminalWindow.scrollTop = this.terminalWindow.offsetHeight;
        }

        //  计算context的宽度和行高，用于跨行时定位光标位置
        let promptRect = this.terminalInputPrompt.getBoundingClientRect()
        this.inputBoxParam.promptHeight = promptRect.height
        this.inputBoxParam.promptWidth = promptRect.width

        this.keydownListener = event => {
            if (event.key.toLowerCase() === 'tab') {
                this._fillCmd()
                event.preventDefault()
            }
            if (this.cursorConf.show) {
                this.$emit('onKeydown', event, this.name)
            }
        }
        window.addEventListener('keydown', this.keydownListener);
        let safariStyleCache = {};
        //  监听全屏事件，用户ESC退出时需要设置全屏状态
        ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange'].forEach((item) => {
            window.addEventListener(item, () => {
                let isFullScreen = document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen || document.fullscreenElement;
                if (isFullScreen) {
                    //  进入全屏
                    if (_isSafari()) {
                        let container = this.terminalContainer
                        safariStyleCache = {
                            position: container.style.position,
                            width: container.style.width,
                            height: container.style.height,
                            left: container.style.left,
                            top: container.style.top
                        }
                        container.style.position = 'fixed'
                        container.style.width = '100%'
                        container.style.height = '100%'
                        container.style.left = '0'
                        container.style.top = '0'
                    }
                } else {
                    //  退出全屏
                    this.fullscreen = false
                    if (_isSafari()) {
                        let container = this.terminalContainer
                        container.style.position = safariStyleCache.position
                        container.style.width = safariStyleCache.width
                        container.style.height = safariStyleCache.height
                        container.style.left = safariStyleCache.left
                        container.style.top = safariStyleCache.top
                    }
                }
            });
        })

        this._initDrag()
        this.$emit('initComplete', this.name)
    },
    unmounted() {
        this.$emit('destroyed', this.name)
        window.removeEventListener('keydown', this.keydownListener)
        TerminalObj.unregister(this.name)
    },
    watch: {
        terminalLog: {
            handler() {
                this._jumpToBottom()
            },
            deep: true
        },
    },
    methods: {
        _triggerClick(key) {
            if (key === 'fullScreen' && !this.fullscreen) {
                this._fullscreen()
            } else if (key === 'minScreen' && this.fullscreen) {
                this._fullscreen()
            }
            this.$emit('onClick', key, this.name)
        },
        _resetSearchKey() {
            this.searchCmd = {
                item: null
            }
        },
        _searchCmd(key) {
            if (!this.autoHelp) {
                return;
            }
            let cmd = key
            if (key == null) {
                cmd = this.command
            }
            if (_isEmpty(cmd)) {
                this._resetSearchKey()
            } else if (cmd.trim().indexOf(" ") < 0) {
                for (let i in this.allCommandStore) {
                    let o = this.allCommandStore[i]
                    if (o.key.trim().toLowerCase().indexOf(cmd.trim().toLowerCase()) >= 0) {
                        this.searchCmd.item = o
                        this._jumpToBottom()
                        return
                    }
                }
                this.searchCmd.item = null
            }
        },
        _fillCmd() {
            if (this.searchCmd.item != null) {
                this.command = this.searchCmd.item.key
            }
        },
        _focus() {
            nextTick(() => {
                this.cmdInput.focus()
            }).then(() => {
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
                type: 'table',
                content: content
            })
        },
        _execute() {
            this._resetSearchKey()
            if (this.command.trim() !== "") {
                try {
                    let split = this.command.split(" ")
                    let cmdKey = split[0];
                    this._saveCurCommand();
                    this.$emit("beforeExecCmd", cmdKey, this.command, this.name)
                    switch (cmdKey) {
                        case 'help': {
                            let reg = `^${split.length > 1 && _nonEmpty(split[1]) ? split[1] : "*"}$`
                            reg = reg.replace(/\*/g, ".*")
                            this._printHelp(new RegExp(reg, "i"), split[1])
                            break;
                        }
                        case 'clear':
                            this._doClear(split);
                            break;
                        case 'open':
                            this._openUrl(split[1]);
                            break;
                        default: {
                            this.showInputLine = false
                            let success = (message) => {
                                if (message != null) {
                                    this._pushMessage(message)
                                }
                                this.showInputLine = true
                                this._endExecCallBack()
                            }

                            let failed = (message = 'Failed to execute.') => {
                                if (message != null) {
                                    this._pushMessage({
                                        time: this._curTime(), type: 'normal', class: 'error', content: message
                                    })
                                }
                                this.showInputLine = true
                                this._endExecCallBack()
                            }

                            this.$emit("execCmd", cmdKey, this.command, success, failed, this.name)
                            return
                        }
                    }
                } catch (e) {
                    console.error(e)
                    this._pushMessage({
                        type: 'normal',
                        class: 'error',
                        content: _html(_unHtml(e.stack)),
                        tag: 'error'
                    })
                }
            }
            this._focus()
            this._endExecCallBack()
        },
        _endExecCallBack() {
            this.command = ""
            this._resetCursorPos()
            this.cursorConf.show = true
            this._focus()
        },
        _parseToJson(obj) {
            if (typeof obj === 'object' && obj) {
                return obj;
            } else if (typeof obj === 'string') {
                try {
                    return JSON.parse(obj);
                } catch (e) {
                    return obj;
                }
            }
        },
        _filterMessageType(message) {
            let valid = message.type && /^(normal|html|code|table|json)$/.test(message.type)
            if (!valid) {
                console.debug(`Invalid terminal message type: ${message.type}, the default type normal will be used`)
                message.type = 'normal'
            }
            return valid
        },
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
        _pushMessage(message, ignoreCheck = false) {
            if (message == null) return
            if (message instanceof Array) return this._pushMessageBatch(message, null, ignoreCheck)

            this._filterMessageType(message)

            if (this.showLogTime) {
                message.time = this._curTime()
            }

            this.terminalLog.push(message);
            this.terminalSize += sizeof(message)
            if (!ignoreCheck) {
                this._checkTerminalLog()
            }
        },
        async _pushMessageBatch(messages, time, ignoreCheck = false) {
            for (let m of messages) {
                this._filterMessageType(m)
                this.terminalLog.push(m);
                this.terminalSize += sizeof(m)
                if (time != null) {
                    await _sleep(time);
                }
            }
            if (!ignoreCheck) {
                this._checkTerminalLog()
            }
        },
        _jumpToBottom() {
            nextTick(() => {
                let box = this.terminalWindow
                if (box != null) {
                    box.scrollTo({top: box.scrollHeight, behavior: 'smooth'})
                }
            }).then(() => {
            })
        },
        _checkTerminalLog() {
            if (!this.warnLogLimitEnable) {
                return
            }
            let count = this.terminalLog.length
            let size = this.terminalSize
            if (this.warnLogCountLimit > 0
                && count > this.warnLogCountLimit
                && Math.floor(count / this.warnLogCountLimit) !== this.perfWarningRate.count) {
                this.perfWarningRate.count = Math.floor(count / this.warnLogCountLimit)
                this._pushMessage({
                    time: this._curTime(),
                    content: `Terminal log count exceeded <strong style="color: red">${count}/${this.warnLogCountLimit}</strong>. If the log content is too large, it may affect the performance of the browser. It is recommended to execute the "clear" command to clear it.`,
                    class: 'system',
                    type: 'normal'
                }, true)
            } else if (this.warnLogByteLimit > 0
                && size > this.warnLogByteLimit) {
                let rate = Math.floor(size / this.warnLogByteLimit);
                if (this.perfWarningRate.size !== rate) {
                    this.perfWarningRate.size = rate
                    this._pushMessage({
                        time: this._curTime(),
                        content: `Terminal log size exceeded <strong style="color: red">${size}/${this.warnLogByteLimit}(byte)</strong>. If the log content is too large, it may affect the performance of the browser. It is recommended to execute the "clear" command to clear it.`,
                        class: 'system',
                        type: 'normal'
                    }, true)
                }
            }
        },
        _saveCurCommand() {
            historyStore.pushCmd(this.name, this.command)

            this.terminalLog.push({
                type: "cmdLine",
                content: `${this.context} > ${this._commandFormatter(this.command)}`
            });
        },
        _curTime() {
            return _dateFormat("YYYY-mm-dd HH:MM:SS", new Date())
        },
        _doClear(args) {
            if (args.length === 1) {
                this.terminalLog = [];
                this.terminalSize = 0;
            } else if (args.length === 2 && args[1] === 'history') {
                historyStore.clearLog(this.name)
            }
            this.perfWarningRate.size = 0
            this.perfWarningRate.count = 0
        },
        _openUrl(url) {
            let match = /^((http|https):\/\/)?(([A-Za-z0-9]+-[A-Za-z0-9]+|[A-Za-z0-9]+)\.)+([A-Za-z]+)[/?:]?.*$/;
            if (match.test(url)) {
                if (!url.startsWith("http") && !url.startsWith("https")) {
                    window.open(`http://${url}`)
                } else {
                    window.open(url);
                }
            } else {
                this._pushMessage({
                    time: this._curTime(), class: 'error', type: 'normal', content: "Invalid website url"
                })
            }
        },
        _resetCursorPos(cmd) {
            this.cursorConf.idx = (cmd == null ? this.command : cmd).length
            this.cursorConf.left = 'unset'
            this.cursorConf.top = 'unset'
            this.cursorConf.width = this.cursorConf.defaultWidth
        },
        _calculateCursorPos(cmd) {
            //  idx可以认为是需要光标覆盖字符的索引
            let idx = this.cursorConf.idx
            let command = cmd == null ? this.command : cmd

            if (idx < 0 || idx >= command.length) {
                this._resetCursorPos()
                return
            }

            let lineWidth = this.terminalInputBox.getBoundingClientRect().width

            let pos = {left: this.inputBoxParam.promptWidth, top: 0}
            let charWidth = this.cursorConf.defaultWidth;
            if (idx > 0) {
                //  先找到被覆盖字符的位置
                for (let i = 1; i <= idx; i++) {
                    charWidth = this._calculateStringWidth(command[i])
                    pos.left += charWidth

                    if (pos.left > lineWidth) {
                        //  行高是20px
                        pos.top += 20
                        pos.left = charWidth
                    }
                }
            }

            this.cursorConf.left = pos.left
            this.cursorConf.top = pos.top
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
            let cmdLog = historyStore.getLog(this.name)
            let cmdIdx = historyStore.getIdx(this.name)
            if (cmdLog.length !== 0 && cmdIdx > 0) {
                cmdIdx -= 1;
                this.command = cmdLog[cmdIdx] == null ? [] : cmdLog[cmdIdx];
                this._resetCursorPos()
            }
            historyStore.setIdx(this.name, cmdIdx)
            this._searchCmd(this.command.trim().split(" ")[0])
        },
        _switchNextCmd() {
            let cmdLog = historyStore.getLog(this.name)
            let cmdIdx = historyStore.getIdx(this.name)
            if (cmdLog.length !== 0 && cmdIdx < cmdLog.length - 1) {
                cmdIdx += 1;
                this.command = cmdLog[cmdIdx] == null ? [] : cmdLog[cmdIdx];
                this._resetCursorPos()
            } else {
                cmdIdx = cmdLog.length;
                this.command = '';
            }
            historyStore.setIdx(this.name, cmdIdx)
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

            nextTick(() => {
                this._checkInputCursor()
                this._calculateCursorPos()
            }).then(() => {
            })
        },
        _checkInputCursor() {
            let eIn = this.cmdInput
            if (eIn.selectionStart !== this.cursorConf.idx) {
                this.cursorConf.idx = eIn.selectionStart
            }
        },
        _onInputKeydown(e) {
            console.log(this.cmdInput.selectionStart, e)
            if (e.key.toLowerCase() === 'arrowleft') {
                this._checkInputCursor()
                this._cursorGoLeft()
            } else if (e.key.toLowerCase() === 'arrowright') {
                this._checkInputCursor()
                this._cursorGoRight()
            }
        },
        _fullscreen() {
            let fullArea = this.terminalContainer
            if (this.fullscreen) {
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
            this.fullscreen = !this.fullscreen
        },
        _draggable() {
            return this.showHeader && this.dragConf
        },
        _initDrag() {
            if (!this._draggable()) {
                return
            }
            // 记录当前鼠标位置
            let mouseOffsetX = 0;
            let mouseOffsetY = 0;

            let dragArea = this.terminalHeader
            let box = this.terminalContainer
            let window = this.terminalWindow

            let isDragging = false;

            dragArea.onmousedown = e1 => {
                if (this.fullscreen) {
                    return
                }
                let e = e1 || window.event;
                mouseOffsetX = e.clientX - box.offsetLeft;
                mouseOffsetY = e.clientY - box.offsetTop;

                isDragging = true
                window.style['user-select'] = 'none'
            }

            document.onmousemove = e2 => {
                if (isDragging) {
                    let e = e2 || window.event;
                    let moveX = e.clientX - mouseOffsetX;
                    let moveY = e.clientY - mouseOffsetY;
                    this._dragging(moveX, moveY)
                }
            }

            document.onmouseup = () => {
                isDragging = false
                window.style['user-select'] = 'unset'
            }

        },
        _dragging(x, y) {
            let clientWidth = document.body.clientWidth
            let clientHeight = document.body.clientHeight
            let box = this.terminalContainer

            if (x > clientWidth - box.clientWidth) {
                box.style.left = (clientWidth - box.clientWidth) + "px";
            } else {
                box.style.left = Math.max(0, x) + "px";
            }

            if (y > clientHeight - box.clientHeight) {
                box.style.top = (clientHeight - box.clientHeight) + "px";
            } else {
                box.style.top = Math.max(0, y) + "px";
            }
        },
        _getDragStyle() {
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
            return `position:fixed;
            width:${width}px;
            height:${height}px;
            z-index: ${zIndex};
            left:${initX}px;
            top:${initY}px;
            `
        },
        _nonEmpty(obj) {
            return _nonEmpty(obj)
        },
        _commandFormatter(cmd) {
            if (this.commandFormatter != null) {
                return this.commandFormatter(cmd)
            }
            let split = cmd.split(" ")
            let formatted = ''
            for (let i = 0; i < split.length; i++) {
                let char = _html(split[i])
                if (i === 0) {
                    formatted += `<span class='t-cmd-key'>&ZeroWidthSpace;${char}</span>`
                } else if (char.startsWith("-")) {
                    formatted += `<span class="t-cmd-arg">&ZeroWidthSpace;${char}</span>`
                } else if (char.length > 0) {
                    formatted += `<span>&ZeroWidthSpace;${char}</span>`
                }
                if (i < split.length - 1) {
                    formatted += "<span>&ZeroWidthSpace;&nbsp;</span>"
                }
            }
            return formatted
        }
    }
}
