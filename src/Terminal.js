// import 'vue-json-viewer/style.css'
import {codemirror} from "vue-codemirror";
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/darcula.css'
import 'codemirror/mode/clike/clike.js'
import 'codemirror/addon/edit/closebrackets.js'
import sizeof from 'object-sizeof'
import {_dateFormat, _isEmpty, _nonEmpty, _sleep} from "./Util.js";
import elementResizeDetectorMaker from 'element-resize-detector'

const MSG_TYPE = {
    SUCCESS: 'success',
    ERROR: 'error',
    SYSTEM: 'system',
    INFO: 'info',
    WARNING: 'warning',
    GRAYSCALE: 'grayscale'
}

export default {
    name: 'Terminal',
    props: {
        msg: String
    },
    data() {
        return {
            showHelpDialog: false,
            projectName: "Leocool@ProjectX",
            command: "",
            commandLog: [],
            cmdChange: false,
            cursorConf: {
                defaultWidth: 6,
                width: 6,
                left: 0,
                idx: 0,
                show: false
            },
            byteLen: {
                en: 8,
                cn: 13
            },
            jsonViewDepth: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            showInputLine: true,
            terminalLog: [],
            terminalSize: 0,
            cmOptions: {
                tabSize: 4,
                mode: 'text/x-java',
                theme: "darcula",
                lineNumbers: true,
                line: true,
                smartIndent: true,
                // viewportMargin:'Infinity',
                // collapseIdentical: false,
            },
            keydownListener: null,
            searchCmd: {
                item: null
            },
            config:{}
        }
    },
    components: {
        codemirror
    },
    created() {
        this._pushMessageBatch([
            {
                message: "Terminal Initializing ..."
            }, {
                message: `System version number: Update time: xxx`
            }, {
                message: "Current login time: " + new Date().toLocaleString()
            }, {
                message: "Welcome to LEOCOOL GAMES terminal! If you are using for the first time, you can use the <span class='teach'>help</span> to learn this terminal."
            }
        ], 150)
    },
    mounted() {
        this.byteLen = {
            en: document.getElementById("en-flag").getBoundingClientRect().width / 2,
            cn: document.getElementById("cn-flag").getBoundingClientRect().width / 2
        }
        this.$nextTick(() => {
            let el = document.getElementsByClassName("terminal-window")[0]
            if (el != null) {
                document.documentElement.scrollTop = el.offsetHeight;
            }
        })

        this.eventBus.$on('onCtrlAltRight', () => {
            this.showHelpDialog = !this.showHelpDialog
        })
        this.keydownListener = event => {
            if (event.key.toLowerCase() === 'tab') {
                this._fillCmd()
                event.preventDefault()
            }
        }
        window.addEventListener('keydown', this.keydownListener);

        //  Terminal窗口发生变化时自动定位到底部
        const erd = elementResizeDetectorMaker()
        let ele = document.getElementById("terminalWindow")
        let lastScrollPos = 0;
        erd.listenTo(ele, (element) => {
            if (element.offsetHeight >= document.documentElement.offsetHeight) {
                this.$nextTick(() => {
                    let target = document.getElementById("terminal-container")

                    if (target.scrollTop - lastScrollPos > 50) {
                        target.scrollTop = element.offsetHeight;
                        lastScrollPos = target.scrollTop
                    }
                })
            }
        })
    },
    destroyed() {
        window.removeEventListener('keydown', this.keydownListener)
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
        "$store.state.gameAddress"(val) {
            console.log(val)
        },
    },
    methods: {
        _resetSearchKey() {
            this.searchCmd = {
                item: null
            }
        },
        _searchCmd(key) {
            let cmd = key
            if (key == null) {
                cmd = this.command
            }
            if (_isEmpty(cmd)) {
                this._resetSearchKey()
            } else if (cmd.trim().indexOf(" ") < 0) {
                for (let i in this.config.commandHelp) {
                    let o = this.config.commandHelp[i]
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
        _searchCmdLog(e) {
            console.log(e)
            return false
        },
        execute: function () {
            this._resetSearchKey()
            if (this.command.trim() !== "") {
                let split = this.command.split(" ")
                let cmdKey = split[0];
                this.saveCurCommand();
                switch (cmdKey) {
                    case 'refresh':
                        location.reload()
                        break;
                    case 'help':
                        this.showHelpDialog = true
                        break;
                    case 'clear':
                        this._doClear(split);
                        break;
                    case 'open':
                        this.openUrl(split[1]);
                        break;
                    case 'exit':
                        // this.$store.commit('clearLogin')
                        // this.$router.push({name: 'login'})
                        this._exit()
                        break;
                    case 'region':
                        if (split.length > 1) {
                            this._showRegion(split[1])
                        } else {
                            this._showRegion("");
                        }
                        break
                    default: {
                        let viewJson = false;
                        if (this.arrayContains(split, "-V")) {
                            viewJson = true;
                        }
                        this._execServerCmd(this.command.replace(" -V", ""), viewJson);
                    }
                }
            }
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
        },
        _execServerCmd(cmd, viewJson) {
            if (_isEmpty(this.$store.state.gameAddress) && this.$store.state.gameIds.length === 0) {
                this._pushMessage({
                    time: this.genCurTime(),
                    type: MSG_TYPE.SYSTEM,
                    message: "未选择任何Game服务器，请打开服务器配置面板选择，打开方式可使用 <span class='teach'>help</span> 命令查看",
                })
                return
            }
            this.showInputLine = false;
            console.log(viewJson)
        },
        _showRegion(pattern) {
            this.showInputLine = false;
            let result;
            result = this.$parent._getRegionDetail(pattern)

            result.then((resData) => {
                if (resData != null) {
                    this._pushMessage({
                        time: this.genCurTime(),
                        type: MSG_TYPE.SUCCESS,
                        message: resData,
                        viewJson: true,
                        depth: 1
                    })
                }
            }).catch((err) => {
                this.pushErrorMsg(err.message)
            }).finally(() => {
                this.showInputLine = true;
                this._activeCursor()
            })
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
        _pushMessage(message) {
            this.terminalLog.push(message);
            this.terminalSize += sizeof(message)
            this.checkTerminalLog()

            //  为了修复json创建过慢无法实时获取到scrollTop的情况
            if (message.viewJson) {
                setTimeout(() => {
                    this.$nextTick(() => {
                        document.getElementById("terminal-container").scrollTop += 50
                    })
                }, 200)
            }
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
            let length = this.terminalLog.length
            if (this.terminalSize > 1024 * 1024 * 10) {
                this.$notify({
                    title: '警告',
                    dangerouslyUseHTMLString: true,
                    duration: 10000,
                    message: 'Terminal消息大小已超出<strong style="color: red">10MB</strong>，消息内容太大可能会影响浏览器运行性能，请执行“clear”命令进行清理',
                    type: 'warning',
                    position: 'bottom-right'
                });
            } else if (length > 600) {
                this.$notify({
                    title: '警告',
                    duration: 10000,
                    dangerouslyUseHTMLString: true,
                    message: 'Terminal消息已超出<strong style="color: red">600条</strong>，消息内容太大可能会影响浏览器运行性能，请执行“clear”命令进行清理',
                    type: 'warning',
                    position: 'bottom-right'
                });
            } else if (length > 1000 || this.terminalSize > 1024 * 1024 * 10) {
                this.terminalLog.splice(0, this.terminalLog.length - 500)
                this.$notify.info({
                    title: '提示',
                    duration: 10000,
                    dangerouslyUseHTMLString: true,
                    message: 'Terminal消息已超出<strong style="color: red">1000条</strong>  或  <strong style="color: red">10MB</strong>，已强制清理前500条记录',
                    position: 'bottom-right'
                });
            }
        },
        saveCurCommand() {
            this.$store.commit("pushCommandLog", this.command)

            let cmdLine = ""
            cmdLine += (this.projectName + " ")

            if (_nonEmpty(this.$store.state.gameAddress)) {
                cmdLine += this.$store.state.gameAddress
            } else {
                for (let i in this.$parent.$store.state.gameIds) {
                    cmdLine += ("/" + this.$parent.$store.state.gameIds[i])
                }
            }

            this.terminalLog.push({
                message: `${cmdLine} [${this.$store.getters.getProxy}] > ${this.command}`,
                cmdLine: true
            });
        },
        genCurTime() {
            return _dateFormat("YYYY-mm-dd HH:MM:SS", new Date())
        },
        switchPreCmd() {
            let cmdLog = this.$store.state.cmdLog
            let cmdIdx = this.$store.state.cmdIdx
            if (cmdLog.length !== 0 && cmdIdx > 0) {
                cmdIdx -= 1;
                this.command = cmdLog[cmdIdx] == null ? [] : cmdLog[cmdIdx];
                this.cursorConf = {
                    idx: this.command.length,
                    left: 0,
                    width: this.cursorConf.defaultWidth,
                    show: true
                }
                this.cmdChange = true;
            }
            this.$store.commit('updateCmdIdx', cmdIdx)
            this._searchCmd(this.command.trim().split(" ")[0])
        },
        switchNextCmd() {
            let cmdLog = this.$store.state.cmdLog
            let cmdIdx = this.$store.state.cmdIdx
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
            this.$store.commit('updateCmdIdx', cmdIdx)
            this._searchCmd(this.command.trim().split(" ")[0])
        },
        _doClear(args) {
            if (args.length === 1) {
                this.terminalLog = [];
                this.terminalSize = 0;
            } else if (args.length === 2 && args[1] === 'log') {
                this.$store.commit('clearCmdLog')
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
                    time: this.genCurTime(),
                    type: MSG_TYPE.ERROR,
                    message: "Invalid website url"
                })
            }
        },
        arrayContains(array, target) {
            for (let i in array) {
                if (array[i] === target) {
                    return true;
                }
            }
            return false;
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
                this.cursorConf.width = (this.cursorConf.idx === this.command.length
                    ? this.cursorConf.defaultWidth
                    : (wordByte === 1 ? this.byteLen.en : this.byteLen.cn))
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
                else
                    len += 1; //半角占用一个字节
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
        pushErrorMsg(msg, viewJson) {
            this._pushMessage({
                time: this.genCurTime(),
                type: MSG_TYPE.ERROR,
                message: msg,
                viewJson: (viewJson == null ? false : viewJson),
                depth: 1
            })
        },
        _exit() {
            this.$router.push('/')
        }
    }
}