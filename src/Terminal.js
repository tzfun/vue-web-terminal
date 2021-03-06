import sizeof from 'object-sizeof'
import {_dateFormat, _html, _isEmpty, _nonEmpty, _sleep, _unHtml} from "./Util.js";
import historyStore from "./HistoryStore.js";
import TerminalObj from './TerminalObj.js'

export default {
    name: 'Terminal',
    data() {
        return {
            terminalObj: TerminalObj,
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
                key: 'help',
                title: 'Help',
                group: 'local',
                usage: 'help [pattern]',
                description: 'Show command document.',
                example: [
                    {
                        des: "Get help documentation for exact match commands.",
                        cmd: 'help refresh'
                    },
                    {
                        des:"Get help documentation for fuzzy matching commands.",
                        cmd: 'help *e*'
                    }
                ]
            }, {
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
        }, //  ????????????
        title: {
            type: String, default: 'vue-web-terminal'
        }, //  ?????????????????????
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
                    content: "Welcome to vue web terminal! If you are using for the first time, you can use the <span class='t-teach'>help</span> command to learn.Thanks for your star support: <a class='t-a' target='_blank' href='https://github.com/tzfun/vue-web-terminal'>https://github.com/tzfun/vue-web-terminal</a>"
                }]
            }
        },
        //  ?????????
        context: {
            type: String,
            default: '/vue-web-terminal'
        },
        //  ????????????????????????????????????????????????
        initLogDelay: {
            type: Number, default: 150
        },
        //  ?????????????????????????????????
        showLogTime: {
            type: Boolean,
            default: true
        }, //  ?????????????????????help?????????
        commandStore: {
            type: Array
        }, //   ?????????????????????
        commandStoreSort: {
            type: Function
        }, //  ???????????????????????????????????????????????????byte
        warnLogByteLimit: {
            type: Number, default: 1024 * 1024 * 10
        }, //  ??????????????????????????????????????????
        warnLogCountLimit: {
            type: Number, default: 200
        }, //  ????????????????????????
        warnLogLimitEnable: {
            type: Boolean,
            default: true
        }, //  ??????????????????
        autoHelp: {
            type: Boolean,
            default: true
        },
        //  ??????????????????
        showHeader: {
            type: Boolean,
            default: true
        },
        helpStyle: {
            type: String,
            default: ''
        }
    },
    created() {
        TerminalObj.register(this.name, (type, options) => {
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
            if (this.commandStoreSort != null) {
                this.commandStore.sort(this.commandStoreSort)
            }
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
        TerminalObj.unregister(this.name)
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
            this.$emit('onClick', key)
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
        _printHelp(regExp) {
            let content = {
                head: ['KEY', 'GROUP', 'DETAIL'],
                rows: []
            }
            this.allCommandStore.forEach(command => {
                if (!regExp.test(command.key)) {
                    return
                }
                let row = []
                row.push(`<span class='t-teach'>${command.key}</span>`)
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
                try {
                    let split = this.command.split(" ")
                    let cmdKey = split[0];
                    this.saveCurCommand();
                    this.$emit("beforeExecCmd", cmdKey, this.command)
                    switch (cmdKey) {
                        case 'refresh':
                            location.reload()
                            break;
                        case 'help': {
                            let reg = `^${split.length > 1 && _nonEmpty(split[1]) ? split[1] : "*"}$`
                            reg = reg.replace(/\*/g, ".*")
                            this._printHelp(new RegExp(reg, "i"))
                            break;
                        }
                        case 'clear':
                            this._doClear(split);
                            break;
                        case 'open':
                            this.openUrl(split[1]);
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

                            this.$emit("execCmd", cmdKey, this.command, success, failed)
                            return
                        }
                    }
                } catch (e) {
                    console.error(e)
                    this._pushMessage({
                        type: 'normal',
                        class: 'error',
                        content: _html(_unHtml(e.stack)),
                        tag: 'Console Error'
                    })
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
        },
        isValidType(type) {
            let valid = /^(normal|html|code|table|json)$/.test(type)
            if (!valid) {
                console.warn("Invalid terminal message type: " + type)
            }
            return valid
        },
        /**
         * message?????????
         *
         * time: ????????????
         * class: ?????????????????????success???error???system???info???warning
         * type: ?????????????????????normal???json???code???table???cmdLine???splitLine
         * content: ????????????????????????????????????????????????
         * tag: ?????????????????????normal??????
         *
         * ??? type ??? table ??? content ????????????
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
            if (!this.isValidType(message.type)) {
                return
            }
            if (this.showLogTime) {
                message.time = this._curTime()
            }

            this.terminalLog.push(message);
            this.terminalSize += sizeof(message)
            this.checkTerminalLog()

            //  ????????????????????????????????????????????????????????????scrollTop?????????
            setTimeout(() => {
                this.$nextTick(() => {
                    let container = this.$refs['terminal-container']
                    container.scrollTop += 1000
                })
            }, 100)
        },
        async _pushMessageBatch(messages, time) {
            for (let m of messages) {
                if (!this.isValidType(m.type)) {
                    continue
                }
                this.terminalLog.push(m);
                this.terminalSize += sizeof(m)
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
                if (val[i].match(/[^\x00-\xff]/ig) != null) //??????
                    len += 2; //????????????????????????????????????
                else len += 1; //????????????????????????
            }
            return len;
        },
        /**
         * ??????????????????????????????????????????
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