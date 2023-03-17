import {api as TerminalApi, Ask as TerminalAsk, Flash as TerminalFlash, Terminal} from "vue-web-terminal"
import {exampleCode} from "@/demo/Demo";
import {commands} from "@/components/LocalTerminalData";

export default {
    name: 'LocalTerminal',
    components: {Terminal},
    data() {
        return {
            version: {
                vue2: '2.1.7',
                vue3: '3.1.3'
            },
            cmdStore: [],
            initLog: null,
            guide: {
                step: 0,
                command: null
            },
            enableTextEditor: false,
            codemirrorOptions: {
                tabSize: 4,
                mode: 'javascript',
                theme: "vibrant-ink",
                lineNumbers: true,
                line: true,
                smartIndent: true,
                collapseIdentical: false,
                scrollbarStyle: "null"
            }
        }
    },
    props: {
        name: String,
        context: {
            type: String,
            default: '/vue-web-terminal/demo'
        },
        initCmd: {
            type: String,
            default: null
        },
        showHeader: {
            type: Boolean,
            default: true
        },
        dragConf: {
            type: Object,
            default: () => {
                return {
                    dragConf: {
                        width: 700,
                        height: 500
                    }
                }
            }
        }
    },
    created() {
        this.initLog = [
            {
                content: 'Terminal initializing...'
            },
            {
                content: "Welcome to vue-web-terminal! If you are using for the first time, you can use the <span class='t-cmd-key'>help</span> command to learn."
            },
            {
                type: 'html',
                content: `
                <div class='demo-init-box'>
                    <p>Hello vue-web-terminal! ✋</p>
                    <p>Demo version: vue2(<span class="t-cmd-key">${this.version.vue2}</span>), vue3(<span class="t-cmd-key">${this.version.vue3}</span>)</p>
                    <p>⭐️Github: <a class='t-a' target='_blank' href='https://github.com/tzfun/vue-web-terminal'>https://github.com/tzfun/vue-web-terminal</a></p>
                </div>
                `
            }
        ]
        this.cmdStore = this.cmdStore.concat(commands)
    },
    methods: {
        onActive(name) {
            this.$emit('on-active', name)
        },
        /**
         * 当用户输入自定义命令时调用
         *
         * @param key     命令行key，用于唯一标识
         * @param command 命令行
         * @param success 成功回调
         * @param failed  失败回调
         */
        onExecCmd(key, command, success, failed) {
            if (this.guide.step > 0 && this.guide.command && key !== 'exit' && key !== this.guide.command) {
                failed(`请按照引导输入命令 <span class="t-cmd-key">${this.guide.command}</span> 或输入 <span class="t-cmd-key">exit</span> 退出引导`)
                return
            }
            if (key === 'fail') {
                failed('Something wrong!!!')
            } else if (key === 'json') {
                //  do something here
                success({
                    type: 'json',
                    class: 'success',
                    content: {
                        k1: 'welcome to vue-web-terminal',
                        k2: 120,
                        k3: ['h', 'e', 'l', 'l', 'o'],
                        k4: {k41: 2, k42: '200'}
                    }
                })
            } else if (key === 'code') {
                success({
                    type: 'code',
                    content: "import Vue from 'vue'\n" +
                        "import App from './App.vue'\n" +
                        "import Terminal from 'vue-web-terminal'\n" +
                        "import Highlight from './Highlight.js'\n" +
                        "\n" +
                        "Vue.use(Highlight)\n" +
                        "Vue.use(Terminal, { highlight: true })\n" +
                        "Vue.config.productionTip = false\n" +
                        "\n" +
                        "new Vue({\n" +
                        "    render: h => h(App),\n" +
                        "}).$mount('#app')\n"
                })
            } else if (key === 'table') {
                success({
                    type: 'table',
                    content: {
                        head: ['title1', 'title2', 'title3', 'title4'],
                        rows: [
                            ['name1', 'hello world', 'this is a test1', 'xxxxxxxx'],
                            ['name2', 'hello world', 'this is a test2 test2', 'xxxxxxxx']
                        ]
                    }
                })
            } else if (key === 'context') {
                this.context = command.split(" ")[1]
                success({
                    type: 'normal',
                    class: 'success',
                    content: "ok"
                })
            } else if (key === 'html') {
                success({
                    type: 'html',
                    content: `
                            <div class='demo-init-box'>
                                <p>Hello vue-web-terminal! ✋</p>
                                <p>Demo version: vue2(<span class="t-cmd-key">${this.version.vue2}</span>), vue3(<span class="t-cmd-key">${this.version.vue3}</span>)</p>
                                <p>⭐️Github: <a class='t-a' target='_blank' href='https://github.com/tzfun/vue-web-terminal'>https://github.com/tzfun/vue-web-terminal</a></p>
                            </div>
                            `
                })
            } else if (key === 'ls') {
                success({
                    type: 'html',
                    content: `
                              <ul class="custom-content">
                                <li class="t-dir">目录1</li>
                                <li class="t-dir">目录2</li>
                                <li class="t-dir">目录3</li>
                                <li class="t-file">文件1</li>
                                <li class="t-file">文件2</li>
                                <li class="t-file">文件3</li>
                              </ul>
                              <br>
                              `
                })
            } else if (key === 'fullscreen') {
                TerminalApi.fullscreen(this.name)
                success({
                    type: 'normal',
                    class: 'success',
                    content: "ok"
                })
            } else if (key === 'loop') {
                for (let i = 0; i < 10; i++) {
                    TerminalApi.pushMessage(this.name, {
                        type: "normal",
                        content: "loop => " + i
                    })
                }
                success()
            } else if (key === 'drag') {
                let split = command.split(" ");
                TerminalApi.dragging(this.name, {x: parseInt(split[1]), y: parseInt(split[2])})
                success()
            } else if (key === 'info') {
                let info = TerminalApi.elementInfo(this.name)
                success({
                    type: 'json',
                    content: JSON.stringify(info)
                })
            } else if (key === 'list') {
                let allClass = ['success', 'error', 'system', 'info', 'warning'];
                allClass.forEach(clazz => {
                    TerminalApi.pushMessage(this.name, {
                        type: 'normal',
                        class: clazz,
                        tag: clazz,
                        content: `这是 ${clazz} 级别的消息`
                    })
                })
                success()
            } else if (key === 'ask') {
                let arg = command.split(' ')
                if (arg.length >= 2 && arg[1] === 'guide') {
                    this.askGuide(key, command, success, failed)
                } else {
                    let asker = new TerminalAsk()
                    success(asker)
                    asker.ask({
                        question: '请输入用户名：',
                        autoReview: true,
                        callback: username => {
                            asker.ask({
                                question: '请输入密码：',
                                autoReview: true,
                                isPassword: true,
                                callback: password => {
                                    asker.finish()
                                    TerminalApi.pushMessage(this.name, [
                                        {
                                            class: "system",
                                            content: `用户输入的内容：`
                                        }, {
                                            content: `username: ${username}`
                                        }, {
                                            content: `password: ${password}`
                                        }
                                    ])
                                    setTimeout(() => {
                                        this.nextGuide()
                                    }, 200)
                                }
                            })
                        }
                    })
                }
                return;
            } else if (key === 'flash') {
                this.showFlash(success)
                return;
            } else if (key === 'exit') {
                if (this.guide.step !== 0) {
                    this.guide.step = 0
                    this.guide.command = null
                    success({content: '你已退出引导'})
                } else {
                    success()
                }
            } else if (key === 'edit') {
                TerminalApi.textEditorOpen(this.name, {
                    content: exampleCode,
                    onClose: value => {
                        this.enableTextEditor = false
                        success([
                            {
                                class: 'success',
                                content: "Edit saved successfully!"
                            },
                            {
                                type: 'code',
                                content: value
                            }
                        ])
                        this.nextGuide()
                    }
                })
                this.enableTextEditor = true
                this.$nextTick(() => {
                    this.$refs.customTextEditor.codemirror.focus()
                })
                return;
            } else {
                failed("Unknown command")
            }
            this.nextGuide(success)
        },
        onClick(key) {
            if (key === "close") {
                this.$emit('close', this.name)
            }
        },
        onKeydown(event) {
            if (this.enableTextEditor && event.key === 's' && event.ctrlKey) {
                this._textEditorClose()
                event.preventDefault()
            }
        },
        inputFilter(data, value) {
            // return value.replace(/[\u4e00-\u9fa5]/g, "")
            return value
        },
        initBefore() {

        },
        initComplete() {
            if (this.initCmd) {
                TerminalApi.execute(this.name, this.initCmd)
            } else {
                TerminalApi.execute(this.name, 'ask guide')
            }
        },
        askGuide(key, command, success) {
            let asker = new TerminalAsk()
            success(asker)

            asker.ask({
                question: '为了帮助你对插件功能有个大概的了解，你是否需要引导？(y/n)：',
                autoReview: true,
                callback: value => {
                    if (value === 'y') {
                        this.guide.step = 1
                        this.nextGuide()
                    }
                    asker.finish()
                }
            })
            TerminalApi.focus()
        },
        nextGuide() {
            if (this.guide.step === 0) {
                return;
            }
            let message = null
            if (this.guide.step === 1) {
                this.guide.command = 'list'
                message = `👉 [${this.guide.step}] 首先带你认识一下支持的消息格式，默认的消息是普通文本格式，请输入<span class="t-cmd-key">${this.guide.command}</span>随机一条文本消息`
            } else if (this.guide.step === 2) {
                this.guide.command = 'json'
                message = `👉 [${this.guide.step}] 接下来是json格式数据，请输入<span class="t-cmd-key">${this.guide.command}</span>`
            } else if (this.guide.step === 3) {
                this.guide.command = 'code'
                message = `👉 [${this.guide.step}] 接下来是code格式数据，拓展可支持 highlight 和 codemirror 高亮显示，请输入<span class="t-cmd-key">${this.guide.command}</span>`
            } else if (this.guide.step === 4) {
                this.guide.command = 'table'
                message = `👉 [${this.guide.step}] 接下来是表格数据，请输入<span class="t-cmd-key">${this.guide.command}</span>`
            } else if (this.guide.step === 5) {
                this.guide.command = 'loop'
                message = `👉 [${this.guide.step}] Terminal支持批量插入多条消息，请输入<span class="t-cmd-key">${this.guide.command}</span>`
            } else if (this.guide.step === 6) {
                this.guide.command = 'html'
                message = `👉 [${this.guide.step}] 接下来是自定义html消息，你可以在此基础上构建任意你需要的消息样式，请输入<span class="t-cmd-key">${this.guide.command}</span>`
            } else if (this.guide.step === 7) {
                this.guide.command = 'flash'
                message = `👉 [${this.guide.step}] 如果你想展示执行过程动画可以使用插件实时回显功能，你可以把它当做Falsh使用，请输入<span class="t-cmd-key">${this.guide.command}</span>`
            } else if (this.guide.step === 8) {
                this.guide.command = 'edit'
                message = `👉 [${this.guide.step}] 如果你想编辑文本文件，插件也提供了简单的文本编辑器，请输入<span class="t-cmd-key">${this.guide.command}</span>`
            } else if (this.guide.step === 9) {
                this.guide.command = 'ask'
                message = `👉 [${this.guide.step}] 如果你想获取到用户输入可以使用插件Ask功能，请输入<span class="t-cmd-key">${this.guide.command}</span>`
            } else if (this.guide.step === 10) {
                this.guide.command = null
                message = `🎉 恭喜你完成了所有的引导，上面已为你展示本Demo支持的所以命令，另外插件还支持拖拽、全屏等功能也可在Demo中体验。
                        <br>🤗 更多关于插件的内容请前往 <a class='t-a' target='_blank' href="https://github.com/tzfun/vue-web-terminal">https://github.com/tzfun/vue-web-terminal</a> 查看，如果你觉得做的不错给个⭐️支持一下吧~`
                TerminalApi.execute(this.name, 'help')
                TerminalApi.pushMessage(this.name, {
                    content: message
                })
                this.guide.step = 0
                return
            } else {
                return
            }
            this.guide.step++

            TerminalApi.pushMessage(this.name, {
                content: message
            })

        },
        async showFlash(success) {
            TerminalApi.pushMessage(this.name, {
                content: '🔍︎ Comparing versions, the relevant dependency files will be downloaded soon...'
            })
            TerminalApi.pushMessage(this.name, {
                content: '🚚 Start downloading dependent files'
            })

            let flash = new TerminalFlash()
            success(flash)

            let terminalInfo = TerminalApi.elementInfo(this.name)
            let start = new Date().getTime()

            await this.mockLoading(flash, 'vue', terminalInfo)
            await this.mockLoading(flash, 'vue-web-terminal', terminalInfo)
            await this.mockLoading(flash, 'core.js', terminalInfo)

            let useTime = ((new Date().getTime() - start) / 1000).toFixed(2)
            TerminalApi.pushMessage(this.name, {
                content: `🎉 All dependencies has downloaded <span style="color:green;">successful</span>, done in ${useTime} s`
            })
            this.nextGuide()
            flash.finish()
        },
        mockLoading(flash, fileName, terminalInfo) {
            // 固定宽度 = 加载动画 + fileName + '[' + ']' + '100%'
            let fixedWidth = 15 + (6 + fileName.length) * terminalInfo.charWidth.en
            //  计算出进度条的 '-' 个数
            let processDots = (terminalInfo.clientWidth - fixedWidth) / terminalInfo.charWidth.en
            let prefix1 = '<span class="loading-flash" style="transform: rotate('
            let prefix2 = `deg)"></span><span style="color: aqua">${fileName}</span>[`

            return new Promise(resolve => {
                let startTime = new Date().getTime()
                let count = 0
                let flashInterval = setInterval(() => {
                    ++count

                    let percent = Math.floor(count * 100 / processDots)
                    if (percent < 10) {
                        percent = '  ' + percent
                    } else if (percent < 100) {
                        percent = ' ' + percent
                    }

                    let str = prefix1 + (90 * (count % 8)) + prefix2 + "#".repeat(count) + "-".repeat(processDots - count) + ']' + percent + '%';
                    //  更新显示当前进度
                    flash.flush(str)

                    if (count >= processDots) {
                        clearInterval(flashInterval)
                        let useTime = ((new Date().getTime() - startTime) / 1000).toFixed(2)
                        //  结束后向控制台追加成功日志
                        TerminalApi.pushMessage(this.name, {
                            content: `✔︎ <span style="color: aqua">${fileName}</span> download successful! use <span>${useTime}</span> s`
                        })
                        resolve()
                    }
                }, Math.random() * 20)
            })
        },
        _textEditorClose() {
            TerminalApi.textEditorClose(this.name)
        }
    }
}
