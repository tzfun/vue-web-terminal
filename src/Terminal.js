import {ref, nextTick} from 'vue'
import sizeof from 'object-sizeof'
import {_dateFormat, _html, _isEmpty, _isSafari, _nonEmpty, _sleep, _unHtml} from "./Util.js";
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
            allCommandStore: [
                {
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
                            des: "Get help documentation for fuzzy matching commands.",
                            cmd: 'help *e*'
                        },
                        {
                            des: "Get help documentation for specified group, match key must start with ':'.",
                            cmd: 'help :groupA'
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
                }
            ],
            fullscreen: false,
            perfWarningRate: {
                size: 0,
                count: 0
            }
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
        }, //   命令行排序方式
        commandStoreSort: {
            type: Function
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
        },
        enableExampleHint: {
            type: Boolean,
            default: true
        },
        inputFilter: {
            type: Function
        },
        dragConf: {
            type: Object,
            default: () => {
                return {
                    width: 700,
                    height: 500,
                    zIndex: 100,
                    init: {
                        x: null,
                        y: null
                    }
                }
            }
        }
    },
    emits: ["update:context", "onKeydown", "onClick", "beforeExecCmd", "execCmd"],
    setup() {
        const terminalContainer = ref(null)
        const terminalHeader = ref(null)
        const terminalWindow = ref(null)
        const inputCmd = ref(null)
        const terminalObj = TerminalObj

        return {
            terminalContainer,
            terminalHeader,
            terminalWindow,
            inputCmd,
            terminalObj
        }
    },
    created() {
        TerminalObj.register(this.name, (type, options) => {
            if (type === 'pushMessage') {
                this._pushMessage(options)
            } else if (type === 'updateContext') {
                this.$emit("update:context", options)
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
                    this.execute()
                }
            } else if (type === 'getPosition') {
                if (this._draggable()) {
                    let box = this.terminalContainer
                    return {x: parseInt(box.style.left), y: parseInt(box.style.top)}
                } else {
                    return {x: 0, y: 0}
                }
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
    },
    mounted() {
        // this.byteLen = {
        //     en: this.terminalEnFlag.value.getBoundingClientRect().width / 2,
        //     cn: this.terminalCnFlag.value.getBoundingClientRect().width / 2
        // }
        nextTick(() => {
            if (this.terminalWindow != null) {
                document.documentElement.scrollTop = this.terminalWindow.offsetHeight;
            }
        }).then(() => {
        })

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
    destroyed() {
        this.$emit('destroyed', this.name)
        window.removeEventListener('keydown', this.keydownListener)
        TerminalObj.unregister(this.name)
    },
    watch: {
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
        execute() {
            this._resetSearchKey()
            if (this.command.trim() !== "") {
                try {
                    let split = this.command.split(" ")
                    let cmdKey = split[0];
                    this.saveCurCommand();
                    this.$emit("beforeExecCmd", cmdKey, this.command, this.name)
                    switch (cmdKey) {
                        case 'refresh':
                            location.reload()
                            break;
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
        filterMessageType(message) {
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

            this.filterMessageType(message)

            if (this.showLogTime) {
                message.time = this._curTime()
            }

            this.terminalLog.push(message);
            this.terminalSize += sizeof(message)
            if (!ignoreCheck) {
                this.checkTerminalLog()
            }

            //  为了修复某些情况下显示过慢无法实时获取到scrollTop的情况
            setTimeout(() => {
                this.$nextTick(() => {
                    let container = this.$refs['t-window']
                    container.scrollTop += 1000
                })
            }, 100)
        },
        async _pushMessageBatch(messages, time, ignoreCheck = false) {
            for (let m of messages) {
                this.filterMessageType(m)
                this.terminalLog.push(m);
                this.terminalSize += sizeof(m)
                if (time != null) {
                    await _sleep(time);
                }
            }
            if (!ignoreCheck) {
                this.checkTerminalLog()
            }
        },
        checkTerminalLog() {
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
            this.perfWarningRate.size = 0
            this.perfWarningRate.count = 0
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
        },
        _fullscreen() {
            let fullArea = this.$refs['t-container']
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
        }
    }
}
