import 'vue-json-viewer/style.css'
import sizeof from 'object-sizeof'
import {_dateFormat, _isEmpty, _nonEmpty, _sleep} from "./Util.js";
import historyStore from "./HistoryStore.js";

export default {
    name: 'Terminal',
    data() {
        return {
            command: "",
            commandLog: [],
            cmdChange: false,
            cursorConf: {
                defaultWidth: 6, width: 6, left: 0, idx: 0, show: false
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
            allCommandStore: [{
                key: 'clear',
                title: 'Clear logs',
                group: 'local',
                usage: 'clear [history]',
                description: 'Clear screen or history.',
                example: [{
                    cmd: 'clear', des: 'Clear all records on the current screen.'
                }, {
                    cmd: 'clear history', des: 'Clear command history'
                }]
            }, {
                key: 'refresh',
                title: 'Refresh page',
                group: 'local',
                usage: 'refresh',
                description: 'Refresh current page.',
                example: null
            }, {
                key: 'open',
                title: 'Open page',
                group: 'local',
                usage: 'open <url>',
                description: 'Open a specified page.',
                example: [{
                    cmd: 'open blog.beifengtz.com'
                }]
            }]
        }
    },
    props: {
        name: {
            type: String, default: 'terminal'
        }, //  终端标题
        title: {
            type: String, default: 'vue-web-terminal'
        }, //  初始化日志内容
        initLog: {
            type: Array, default: () => {
                return [{
                    content: "Terminal Initializing ..."
                }, {
                    content: "Current login time: " + new Date().toLocaleString()
                }, {
                    content: "Welcome to vue web terminal! If you are using for the first time, you can use the <span class='teach'>help</span> command to learn."
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
        }, //  命令行搜索以及help指令用
        commandStore: {
            type: Array
        }, //  记录大小超出此限制会发出警告，单位byte
        warnLogByteLimit: {
            type: Number, default: 1024 * 1024 * 10
        }, //  记录条数超出此限制会发出警告
        warnLogCountLimit: {
            type: Number, default: 200
        }, //  记录限制警告开关
        warnLogLimitEnable: {
            type: Boolean,
            default: true
        }, //  自动搜索帮助
        autoHelp: {
            type: Boolean,
            default: true
        },
        //  显示终端头部
        showHeader: {
            type: Boolean,
            default: true
        }
    },
    created() {
        this.$terminal.register(this.name, (type, options) => {
            if (type === 'pushMessage') {
                this._pushMessage(options)
            } else if (type === 'updateContext') {
                this.$emit("update:context", options)
            } else {
                console.error("Unsupported event type: " + type)
            }
        })

        if (this.initLog != null) {
            this._pushMessageBatch(this.initLog, this.initLogDelay).then(() => {
            })
        }

        if (this.commandStore != null) {
            this.allCommandStore = this.allCommandStore.concat(this.commandStore)
        }
    },
    mounted() {
        this.byteLen = {
            en: document.getElementById("terminal-en-flag").getBoundingClientRect().width / 2,
            cn: document.getElementById("terminal-cn-flag").getBoundingClientRect().width / 2
        }
        this.$nextTick(() => {
            let el = document.getElementsByClassName("terminal-window")[0]
            if (el != null) {
                document.documentElement.scrollTop = el.offsetHeight;
            }
        })

        this.keydownListener = event => {
            if (event.key.toLowerCase() === 'tab') {
                this._fillCmd()
                event.preventDefault()
            }
            if (this.cursorConf.show) {
                this.$emit('onKeydown', event)
            }
        }
        window.addEventListener('keydown', this.keydownListener);
    }, destroyed() {
        window.removeEventListener('keydown', this.keydownListener)
        this.$terminal.unregister(this.name)
    }, watch: {
        command(val, oldVal) {
            if (!this.cmdChange) {
                let changeStr = this.getDifferent(val, oldVal)
                let increase = val.length > oldVal.length;
                if (increase) {
                    this.cursorConf.idx += changeStr.length;
                } else {
                    this.cursorConf.idx -= changeStr.length;
                }
            } else {
                this.cmdChange = false;
            }
        },
    },
    methods: {
        _triggerClick(key) {
            this.$emit('triggerClick', key)
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
        _activeCursor() {
            this.$nextTick(function () {
                this.$refs.inputCmd.focus()
            })
        },
        _printHelp() {
            let content = {
                head: ['KEY', 'GROUP', 'DETAIL'],
                rows: []
            }
            this.allCommandStore.forEach(command => {
                let row = []
                row.push(command.key)
                row.push(command.group)

                let detail = ''
                if (_nonEmpty(command.description)) {
                    detail += `Description: ${command.description}<br>`
                }
                if (_nonEmpty(command.usage)) {
                    detail += `Usage: <code>${command.usage}</code><br>`
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
                        <div style="float:left;width: calc(100% - 30px);display: flex">
                          <ul class="example-ul">
                            <li class="example-li"><code>${eg.cmd}</code></li>
                            <li class="example-li"><span></span></li>
                    `

                        if (_nonEmpty(eg.des)) {
                            detail += `<li class="example-li"><span>${eg.des}</span></li>`
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
        execute() {
            this._resetSearchKey()
            if (this.command.trim() !== "") {
                let split = this.command.split(" ")
                let cmdKey = split[0];
                this.saveCurCommand();
                this.$emit("beforeExecCmd", cmdKey, this.command)
                switch (cmdKey) {
                    case 'refresh':
                        location.reload()
                        break;
                    case 'help':
                        this._printHelp()
                        break;
                    case 'clear':
                        this._doClear(split);
                        break;
                    case 'open':
                        this.openUrl(split[1]);
                        break;
                    default: {
                        this.showInputLine = false
                        let success = (message) => {
                            this._pushMessage(message)
                            this.showInputLine = true
                            this._endExecCallBack()
                        }

                        let failed = (message = 'Failed to execute.') => {
                            this._pushMessage({
                                time: this._curTime(), type: 'normal', class: 'error', content: message
                            })
                            this.showInputLine = true
                            this._endExecCallBack()
                        }

                        this.$emit("execCmd", cmdKey, this.command, success, failed)
                        return
                    }
                }
            }
            this._activeCursor()
            this._endExecCallBack()
        },
        _endExecCallBack() {
            this.command = ""
            this.cursorConf = {
                idx: 0,
                left: 0,
                width: this.cursorConf.defaultWidth,
                show: true,
            }
            this._activeCursor()
        },
        parseToJson(obj) {
            if (typeof obj === 'object' && obj) {
                return obj;
            } else if (typeof obj === 'string') {
                try {
                    return JSON.parse(obj);
                } catch (e) {
                    return obj;
                }
            }
        }, /**
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
         * @private
         */
        _pushMessage(message) {
            if (this.showLogTime) {
                message.time = this._curTime()
            }

            this.terminalLog.push(message);
            this.terminalSize += sizeof(message)
            this.checkTerminalLog()

            //  为了修复某些情况下显示过慢无法实时获取到scrollTop的情况
            setTimeout(() => {
                this.$nextTick(() => {
                    let container = this.$refs['terminal-container']
                    container.scrollTop += 1000
                })
            }, 100)
        },
        async _pushMessageBatch(messages, time) {
            for (let m in messages) {
                this.terminalLog.push(messages[m]);
                this.terminalSize += sizeof(messages)
                if (time != null) {
                    await _sleep(time);
                }
            }
            this.checkTerminalLog()
        },
        checkTerminalLog() {
            if (!this.warnLogLimitEnable) {
                return
            }
            let length = this.terminalLog.length
            if (this.terminalSize > this.warnLogByteLimit) {
                this._pushMessage({
                    time: this._curTime(),
                    content: `Terminal log size exceeded <strong style="color: red">${this.warnLogByteLimit}(byte)</strong>. If the log content is too large, it may affect the performance of the browser. It is recommended to execute the "clear" command to clear it.`,
                    class: 'system',
                    type: 'normal'
                })
            } else if (length > this.warnLogCountLimit) {
                this._pushMessage({
                    time: this._curTime(),
                    content: `Terminal log count exceeded <strong style="color: red">${this.warnLogCountLimit}</strong>. If the log content is too large, it may affect the performance of the browser. It is recommended to execute the "clear" command to clear it.`,
                    class: 'system',
                    type: 'normal'
                })
            }
        },
        saveCurCommand() {
            historyStore.pushCmd(this.name, this.command)

            this.terminalLog.push({
                content: `${this.context} > ${this.command}`, type: "cmdLine"
            });
        },
        _curTime() {
            return _dateFormat("YYYY-mm-dd HH:MM:SS", new Date())
        },
        switchPreCmd() {
            let cmdLog = historyStore.getLog(this.name)
            let cmdIdx = historyStore.getIdx(this.name)
            if (cmdLog.length !== 0 && cmdIdx > 0) {
                cmdIdx -= 1;
                this.command = cmdLog[cmdIdx] == null ? [] : cmdLog[cmdIdx];
                this.cursorConf = {
                    idx: this.command.length, left: 0, width: this.cursorConf.defaultWidth, show: true
                }
                this.cmdChange = true;
            }
            historyStore.setIdx(this.name, cmdIdx)
            this._searchCmd(this.command.trim().split(" ")[0])
        },
        switchNextCmd() {
            let cmdLog = historyStore.getLog(this.name)
            let cmdIdx = historyStore.getIdx(this.name)
            if (cmdLog.length !== 0 && cmdIdx < cmdLog.length - 1) {
                cmdIdx += 1;
                this.command = cmdLog[cmdIdx] == null ? [] : cmdLog[cmdIdx];
                this.cursorConf.idx = this.command.length;
                this.cmdChange = true;
            } else {
                cmdIdx = cmdLog.length;
                this.command = '';
                this.cursorConf.idx = this.command.length;
                this.cmdChange = true;
            }
            historyStore.setIdx(this.name, cmdIdx)
            this._searchCmd(this.command.trim().split(" ")[0])
        },
        _doClear(args) {
            if (args.length === 1) {
                this.terminalLog = [];
                this.terminalSize = 0;
            } else if (args.length === 2 && args[1] === 'history') {
                historyStore.clearLog(this.name)
            }
        },
        openUrl(url) {
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
        onDownLeft() {
            if (this.cursorConf.idx > 0) {
                this.cursorConf.idx--;
                if (this.command[this.cursorConf.idx] != null) {
                    let wordByte = this.getByteLen(this.command[this.cursorConf.idx])
                    this.cursorConf.left -= (wordByte === 1 ? this.byteLen.en : this.byteLen.cn);
                    this.cursorConf.width = (wordByte === 1 ? this.byteLen.en : this.byteLen.cn);
                }
            }
        },
        onDownRight() {
            if (this.cursorConf.idx < this.command.length - 1) {
                let curWordByte = this.getByteLen(this.command[this.cursorConf.idx])
                this.cursorConf.idx++;
                let wordByte = this.getByteLen(this.command[this.cursorConf.idx])
                this.cursorConf.left += (curWordByte === 1 ? this.byteLen.en : this.byteLen.cn);
                this.cursorConf.width = (this.cursorConf.idx === this.command.length ? this.cursorConf.defaultWidth : (wordByte === 1 ? this.byteLen.en : this.byteLen.cn))
            } else {
                this.cursorConf.idx = this.command.length;
                this.cursorConf.left = 0;
                this.cursorConf.width = this.cursorConf.defaultWidth;
            }
        },
        getByteLen(val) {
            let len = 0;
            for (let i = 0; i < val.length; i++) {
                // eslint-disable-next-line no-control-regex
                if (val[i].match(/[^\x00-\xff]/ig) != null) //全角
                    len += 2; //如果是全角，占用两个字节
                else len += 1; //半角占用一个字节
            }
            return len;
        },
        /**
         * 获取两个连续字符串的不同部分
         *
         * @param one
         * @param two
         * @returns {string}
         */
        getDifferent(one, two) {
            if (one === two) {
                return '';
            }
            let i = 0, j = 0;
            let longOne = one.length > two.length ? one : two;
            let shortOne = one.length > two.length ? two : one;

            let diff = '', nextChar = '';
            let hasDiff = false;
            while (i < shortOne.length || j < longOne.length) {
                if (shortOne[i] === longOne[j]) {
                    if (hasDiff) {
                        break;
                    }
                    i++;
                    j++;
                } else {
                    if (i < shortOne.length - 1) {
                        nextChar = shortOne[i + 1]
                    }
                    if (longOne[j] === nextChar || j >= longOne.length) {
                        break;
                    } else {
                        diff += longOne[j];
                    }
                    j++;
                    hasDiff = true;
                }
            }
            return diff;
        },
        onKey(e) {
            let eIn = document.getElementById("command-input")
            if (eIn.selectionStart !== this.cursorConf.idx) {
                this.cursorConf.idx = eIn.selectionStart
                let idx = this.cursorConf.idx;

                if (this.command.length !== idx && this.command.length > 0) {
                    if (this.command[idx] != null) {
                        this.cursorConf.width = (this.getByteLen(this.command[idx]) === 1 ? this.byteLen.en : this.byteLen.cn)
                        let left = 0;
                        for (let i = this.command.length - 1; i >= idx; --i) {
                            let byteLen = this.getByteLen(this.command[i]);
                            left -= (byteLen === 1 ? this.byteLen.en : this.byteLen.cn)
                        }
                        this.cursorConf.left = left;
                    }
                } else {
                    this.cursorConf.width = this.cursorConf.defaultWidth;
                    this.cursorConf.left = 0;
                }
            }
            let reg = /^(\w|\d)?$/
            if (reg.test(e.key) || e.key.toLowerCase() === 'backspace') {
                if (_isEmpty(this.command)) {
                    this._resetSearchKey();
                } else {
                    this._searchCmd()
                }
            }
        }
    }
}