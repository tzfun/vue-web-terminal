import {_commandFormatter, _getByteLen, _getSelection, _html, _isEmpty, _nonEmpty, _unHtml} from "@/tools/Util";
import historyStore from "./HistoryStore.js";
import TerminalApi from './TerminalApi.js'
import TerminalFlash from "./TerminalFlash.js";
import TerminalAsk from "@/components/terminal/TerminalAsk";
import {terminalProps} from "@/components/TProps";
import TContainer from "@/components/TContainer";

export default {
    name: 'Terminal',
    components: {TContainer},
    getApi: (name) => {
        return TerminalApi.getApi(name)
    },
    data() {
        return {
            command: "",
            commandLog: [],
            cursorConf: {
                defaultWidth: 6,
                width: 6,
                left: 'unset',
                top: 'unset',
                idx: 0, //  从0开始
                show: false
            },
            jsonViewDepth: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            showInputLine: true,
            terminalLog: [],
            keydownListener: null,
            searchCmd: {
                item: null
            },
            charWidth: {
                en: 8,
                cn: 13
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
                },
                {
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
                },
                {
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
            perfWarningRate: {
                count: 0
            },
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
            fullscreenEditor: {
                open: false,
                value: ''
            }
        }
    },
    props: terminalProps,
    created() {
        TerminalApi.register(this.name, {
            pushMessage: options => {
                this._pushMessage(options)
            },
            updateContext: options => {
                this.$emit("update:context", options)
                this.$nextTick(() => {
                    this.inputBoxParam.promptWidth = this.$refs.terminalInputPrompt.getBoundingClientRect().width
                })
            },
            execute: options => {
                if (!this.ask.open && !this.flash.open && _nonEmpty(options)) {
                    this.command = options
                    this._execute()
                }
            },
            focus: () => {
                this._focus()
            }
        }, true)
    },
    mounted() {
        this.$emit('initBefore', this.name)

        if (this.initLog != null) {
            this._pushMessageBatch(this.initLog, true)
        }

        if (this.commandStore != null) {
            if (this.commandStoreSort != null) {
                this.commandStore.sort(this.commandStoreSort)
            }
            this.allCommandStore = this.allCommandStore.concat(this.commandStore)
        }

        this.charWidth = {
            en: this.$refs.terminalEnFlag.getBoundingClientRect().width / 2,
            cn: this.$refs.terminalCnFlag.getBoundingClientRect().width / 2
        }
        this.cursorConf.defaultWidth = this.charWidth.en

        let el = this.$refs.frame.$refs.window
        el.scrollTop = el.offsetHeight;

        let promptRect = this.$refs.terminalInputPrompt.getBoundingClientRect()
        this.inputBoxParam.promptWidth = promptRect.width
        this.inputBoxParam.promptHeight = promptRect.height

        this.keydownListener = event => {
            if (this.cursorConf.show) {
                if (event.key.toLowerCase() === 'tab') {
                    if (this.tabKeyHandler == null) {
                        this._fillCmd()
                    } else {
                        this.tabKeyHandler(event)
                    }
                    event.preventDefault()
                } else {
                    if (this.cursorConf.show && document.activeElement !== this.$refs.cmdInput) {
                        this.$refs.cmdInput.focus()
                    }
                }
                this.$emit('onKeydown', event, this.name)
            }
        }
        window.addEventListener('keydown', this.keydownListener);

        this.$emit('initComplete', this.name)
    },
    destroyed() {
        this.$emit('destroyed', this.name)
        window.removeEventListener('keydown', this.keydownListener)
        TerminalApi.unregister(this.name)
    },
    watch: {
        terminalLog() {
            this._jumpToBottom()
        }
    },
    methods: {
        _getTerminalOptions() {
            return TerminalApi.getOptions()
        },
        _triggerClick(key) {
            this.$emit('onClick', key, this.name)
        },
        _resetSearchKey() {
            this.searchCmd.item = null
        },
        _searchCmd(key) {
            if (!this.autoHelp) {
                return;
            }
            let cmd = key
            if (cmd == null) {
                cmd = this.command.split(' ')[0]
            }
            if (_isEmpty(cmd)) {
                this._resetSearchKey()
            } else if (cmd.trim().indexOf(" ") < 0) {
                let reg = new RegExp(cmd, 'i')
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
                        this.searchCmd.item = null
                        return
                    }
                }
                this.searchCmd.item = target
                this._jumpToBottom()
            }
        },
        _fillCmd() {
            if (this.searchCmd.item != null) {
                this.command = this.searchCmd.item.key
            }
        },
        _focus() {
            this.$nextTick(() => {
                if (this.ask.open && this.$refs.askInput) {
                    this.$refs.askInput.focus()
                } else {
                    if (document.activeElement.localName !== 'select') {
                        //  没有被选中
                        if (_getSelection().isCollapsed) {
                            if (this.$refs.cmdInput) {
                                this.$refs.cmdInput.focus()
                            }
                        } else {
                            this.cursorConf.show = true
                        }
                    }
                }
            })

        },
        _getCharWidth(str) {
            if (str) {
                let width = 0
                for (let char of str) {
                    width += (_getByteLen(char) === 1 ? this.charWidth.en : this.charWidth.cn)
                }
                return width
            } else {
                return this.charWidth
            }
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
            this._saveCurCommand();
            if (_nonEmpty(this.command)) {
                try {
                    let split = this.command.split(" ")
                    let cmdKey = split[0];
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
                                        type: 'normal', class: 'error', content: message
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
            if (message instanceof Array) return this._pushMessageBatch(message, ignoreCheck)

            this._filterMessageType(message)

            this.terminalLog.push(message);
            if (!ignoreCheck) {
                this._checkTerminalLog()
            }
            if (message.type === 'json') {
                setTimeout(() => {
                    this._jumpToBottom()
                }, 80)
            }
        },
        _pushMessageBatch(messages, ignoreCheck = false) {
            for (let m of messages) {
                this._filterMessageType(m)
                this.terminalLog.push(m);
            }
            if (!ignoreCheck) {
                this._checkTerminalLog()
            }
        },
        _jumpToBottom() {
            this.$refs.frame._jumpToBottom()
        },
        _checkTerminalLog() {
            let count = this.terminalLog.length
            if (this.warnLogCountLimit > 0
                && count > this.warnLogCountLimit
                && Math.floor(count / this.warnLogCountLimit) !== this.perfWarningRate.count) {
                this.perfWarningRate.count = Math.floor(count / this.warnLogCountLimit)
                this._pushMessage({
                    content: `Terminal log count exceeded <strong style="color: red">${count}/${this.warnLogCountLimit}</strong>. If the log content is too large, it may affect the performance of the browser. It is recommended to execute the "clear" command to clear it.`,
                    class: 'system',
                    type: 'normal'
                }, true)
            }
        },
        _saveCurCommand() {
            if (_nonEmpty(this.command)) {
                historyStore.pushCmd(this.name, this.command)
            }
            this.terminalLog.push({
                type: "cmdLine",
                content: `${this.context} > ${this._commandFormatter(this.command)}`
            });
        },
        _doClear(args) {
            if (args.length === 1) {
                this.terminalLog = [];
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
                    class: 'error', type: 'normal', content: "Invalid website url"
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

            let lineWidth = this.$refs.terminalInputBox.getBoundingClientRect().width

            let pos = {left: 0, top: 0}
            //  当前字符长度
            let charWidth = this.cursorConf.defaultWidth
            //  前一个字符的长度
            let preWidth = this.inputBoxParam.promptWidth
            let domStyle = this.$refs.frame.domStyle
            //  先找到被覆盖字符的位置
            for (let i = 0; i <= idx; i++) {
                charWidth = this._getCharWidth(command[i])
                pos.left += preWidth
                preWidth = charWidth
                if (pos.left > lineWidth) {
                    //  行高是20px
                    pos.top += domStyle.windowLineHeight
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
            let cmdLog = historyStore.getLog(this.name)
            let cmdIdx = historyStore.getIdx(this.name)
            if (cmdLog.length !== 0 && cmdIdx > 0) {
                cmdIdx -= 1;
                this.command = cmdLog[cmdIdx] == null ? [] : cmdLog[cmdIdx];
            }
            this._resetCursorPos()
            historyStore.setIdx(this.name, cmdIdx)
            this._searchCmd(this.command.trim().split(" ")[0])
        },
        _switchNextCmd() {
            let cmdLog = historyStore.getLog(this.name)
            let cmdIdx = historyStore.getIdx(this.name)
            if (cmdLog.length !== 0 && cmdIdx < cmdLog.length - 1) {
                cmdIdx += 1;
                this.command = cmdLog[cmdIdx] == null ? [] : cmdLog[cmdIdx];
            } else {
                cmdIdx = cmdLog.length;
                this.command = '';
            }
            this._resetCursorPos()
            historyStore.setIdx(this.name, cmdIdx)
            this._searchCmd(this.command.trim().split(" ")[0])
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
            })
        },
        _checkInputCursor() {
            let eIn = this.$refs['cmdInput']
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
        _nonEmpty(obj) {
            return _nonEmpty(obj)
        },
        _commandFormatter(cmd) {
            if (this.commandFormatter != null) {
                return this.commandFormatter(cmd)
            }
            return _commandFormatter(cmd)
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
        }
    }
}
