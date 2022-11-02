import Terminal from "vue-web-terminal"

export default {
    name: 'App',
    components: {Terminal},
    data() {
        return {
            version: {
                vue2: '2.1.0',
                vue3: '3.1.0'
            },
            show: true,
            name: 'my-terminal',
            title: '👌vue-web-terminal',
            context: '/vue-web-terminal/demo',
            cmdStore: [
                {
                    "key": "fail",
                    "group": "demo",
                    "usage": 'fail',
                    "description": "模拟错误结果返回"
                },
                {
                    "key": "json",
                    "group": "demo",
                    "usage": 'json',
                    "description": "模拟json结果显示"
                },
                {
                    "key": "code",
                    "group": "demo",
                    "usage": 'code',
                    "description": "模拟code结果显示"
                },
                {
                    "key": "table",
                    "group": "demo",
                    "usage": 'table',
                    "description": "模拟表格结果显示"
                },
                {
                    "key": "html",
                    "group": "demo",
                    "usage": 'html',
                    "description": "模拟自定义html结果显示"
                },
                {
                    "key": "loop",
                    "group": "demo",
                    "usage": 'loop',
                    "description": "模拟批量结果显示"
                },
                {
                    "key": "context",
                    "group": "demo",
                    "usage": 'context <ctx>',
                    "description": "修改上下文",
                    "example": [
                        {
                            "cmd": "context /vue/terminal/dev",
                            "des": "修改上下文为'/vue/terminal/dev'"
                        }
                    ]
                },
                {
                    "key": "fullscreen",
                    "group": "demo",
                    "usage": 'fullscreen',
                    "description": "切换全屏模式"
                },
                {
                    "key": "drag",
                    "group": "demo",
                    "usage": 'drag <x> <y>',
                    "description": "模拟拖拽窗口，x为左边界，y为右边界，单位px",
                    "example": [
                        {
                            "cmd": "drag 20 100",
                            "des": "拖拽位置到（20,100）"
                        }
                    ]
                },
                {
                    "key": "info",
                    "group": "demo",
                    "usage": 'info',
                    "description": "获取当前窗口信息"
                },
                {
                    "key": "random",
                    "group": "demo",
                    "usage": 'random',
                    "description": "随机生成标签"
                },
                {
                    "key": "flash",
                    "group": "demo",
                    "usage": 'flash',
                    "description": "即时回显，模拟执行下载命令"
                },
                {
                    "key": "ask",
                    "group": "demo",
                    "usage": 'ask',
                    "description": "用户输入，模拟执行登录"
                }
            ],
            dragConf: {
                width: 700,
                height: 500
            },
            initLog: null,
            guide: {
                step: 0,
                command: null
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
    },
    mounted() {
        let width = document.body.clientWidth
        if (width < 960) {
            this.dragConf = null
        } else if (width >= 960 && width < 1264) {
            this.dragConf.width = "80%"
            this.dragConf.height = "80%"
        } else if (width >= 1264) {
            this.dragConf.width = "60%"
            this.dragConf.height = "65%"
        }
    },
    methods: {
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
                Terminal.$api.updateContext(this.name, command.split(" ")[1])
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
                Terminal.$api.fullscreen(this.name)
                success({
                    type: 'normal',
                    class: 'success',
                    content: "ok"
                })
            } else if (key === 'loop') {
                for (let i = 0; i < 10; i++) {
                    Terminal.$api.pushMessage(this.name, {
                        type: "normal",
                        content: "loop => " + i
                    })
                }
                success()
            } else if (key === 'drag') {
                let split = command.split(" ");
                Terminal.$api.dragging(this.name, {x: parseInt(split[1]), y: parseInt(split[2])})
                success()
            } else if (key === 'info') {
                let info = Terminal.$api.elementInfo(this.name)
                success({
                    type: 'json',
                    content: JSON.stringify(info)
                })
            } else if (key === 'random') {
                let allClass = ['success', 'error', 'system', 'info', 'warning'];

                let clazz = allClass[Math.floor(Math.random() * allClass.length)];
                success({
                    type: 'normal',
                    class: clazz,
                    tag: "random: " + clazz,
                    content: 'random number: ' + Math.floor(Math.random() * 10)
                })
            } else if (key === 'ask') {
                let arg = command.split(' ')
                if (arg.length >= 2 && arg[1] === 'guide') {
                    this.askGuide(key, command, success, failed)
                } else {
                    let asker = new Terminal.$Ask()
                    success(asker)
                    asker.ask({
                        question: '请输入用户名：',
                        autoReview: true,
                        callback: () => {
                            asker.ask({
                                question: '请输入密码：',
                                autoReview: true,
                                isPassword: true,
                                callback: () => {
                                    asker.finish()
                                    this.nextGuide()
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
            } else {
                failed("Unknown command")
            }
            this.nextGuide(success)
        },
        onClick(key) {
            if (key === "close") {
                this.show = false
            } else {
                Terminal.$api.pushMessage(this.name, {
                    tag: 'success',
                    class: 'system',
                    content: `User clicked <span class="t-cmd-key">${key}</span>`
                })
            }
        },
        onKeydown() {
            // console.log(event)
        },
        inputFilter(data, value) {
            // return value.replace(/[\u4e00-\u9fa5]/g, "")
            return value
        },
        initBefore() {

        },
        initComplete() {
            Terminal.$api.execute(this.name, 'ask guide')
        },
        askGuide(key, command, success) {
            let asker = new Terminal.$Ask()
            success(asker)

            asker.ask({
                question: '你是否需要引导？(Y/n)：',
                autoReview: true,
                callback: value => {
                    if (value === 'Y') {
                        this.guide.step = 1
                        this.nextGuide()
                    }
                    asker.finish()
                }
            })
            Terminal.$api.focus()
        },
        nextGuide() {
            if (this.guide.step === 0) {
                return;
            }
            let message = null
            if (this.guide.step === 1) {
                this.guide.command = 'random'
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
                message = `👉 [${this.guide.step}] 接下来是自定义html消息，你可以在此基础上构建任意你需要的样式，请输入<span class="t-cmd-key">${this.guide.command}</span>`
            } else if (this.guide.step === 7) {
                this.guide.command = 'flash'
                message = `👉 [${this.guide.step}] 如果你想展示执行过程动画可以使用插件Flash功能，请输入<span class="t-cmd-key">${this.guide.command}</span>`
            } else if (this.guide.step === 8) {
                this.guide.command = 'ask'
                message = `👉 [${this.guide.step}] 如果你想获取到用户输入可以使用插件Ask功能，请输入<span class="t-cmd-key">${this.guide.command}</span>`
            } else if (this.guide.step === 9) {
                this.guide.command = null
                message = `🎉 恭喜你完成了所有的引导，上面已为你展示本Demo支持的所以命令，另外插件还支持拖拽、全屏等功能也可在Demo中体验。
                        <br>🤗 更多关于插件的内容请前往 <a class='t-a' target='_blank' href="https://github.com/tzfun/vue-web-terminal">https://github.com/tzfun/vue-web-terminal</a> 查看，如果你觉得做的不错给个⭐️支持一下吧~`
                Terminal.$api.execute(this.name, 'help')
                this.guide.step = 0
            } else {
                return
            }
            this.guide.step++

            Terminal.$api.pushMessage(this.name, {
                content: message
            })

        },
        showFlash(success) {
            let flash = new Terminal.$Flash()
            success(flash)
            let info = Terminal.$api.elementInfo(this.name)
            Terminal.$api.pushMessage(this.name, {content: "⭐ ️Prepare to simulate downloading resources..."})
            let start = new Date().getTime()

            this.mockLoading(flash, info, 'vue', () => {
                this.mockLoading(flash, info, 'core.js', () => {
                    this.mockLoading(flash, info, 'vue-web-terminal', () => {
                        this.mockLoading(flash, info, 'highlight.js', () => {
                            flash.finish()
                            let useTime = ((new Date().getTime() - start) / 1000).toFixed(2)
                            Terminal.$api.pushMessage(this.name, {
                                content: `🎉 Download <span style="color:green;">successful</span>! use ${useTime} s`
                            })
                            this.nextGuide()
                        })
                    })
                })
            })
        },
        mockLoading(flash, info, suffix, finish) {
            let countMax = Math.floor(info.clientWidth / info.charWidth.en) - 6 - suffix.length
            let count = 0
            let str = '[' + suffix + '-'.repeat(countMax) + '  0%]'
            str = str.split('')

            let flashInterval = setInterval(() => {
                ++count
                str[suffix.length + count] = '='
                let percent = count * 100 / countMax
                let t = Math.floor(percent / 100)
                str[str.length - 5] = t === 0 ? ' ' : t
                percent %= 100
                t = Math.floor(percent / 10)
                str[str.length - 4] = t === 0 ? '0' : t
                t = Math.floor(percent % 10)
                str[str.length - 3] = t > 9 ? '0' : t

                let s = str.join('').replace(suffix, '<span style="color: aqua">' + suffix + '</span>')
                flash.flush(s)
                if (count >= countMax) {
                    clearInterval(flashInterval)
                    Terminal.$api.pushMessage(this.name, {content: s})
                    finish()
                }
            }, Math.random() * 20)
        }
    }
}
