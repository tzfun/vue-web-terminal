import Terminal from "vue-web-terminal"

export default {
    name: 'App',
    components: {Terminal},
    data() {
        return {
            version:{
                vue2: '2.0.9',
                vue3: '3.0.7'
            },
            show: true,
            name: 'my-terminal',
            context: '/vue-web-terminal/demo',
            cmdStore: [
                {
                    "key": "fail",
                    "group": "demo",
                    "usage":'fail',
                    "description":"模拟错误结果返回"
                },
                {
                    "key":"json",
                    "group": "demo",
                    "usage":'json',
                    "description":"模拟json结果显示"
                },
                {
                    "key":"code",
                    "group": "demo",
                    "usage":'code',
                    "description":"模拟code结果显示"
                },
                {
                    "key":"table",
                    "group": "demo",
                    "usage":'table',
                    "description":"模拟表格结果显示"
                },
                {
                    "key":"html",
                    "group": "demo",
                    "usage":'html',
                    "description":"模拟自定义html结果显示"
                },
                {
                    "key":"loop",
                    "group": "demo",
                    "usage":'loop <n>',
                    "description":"模拟批量结果显示",
                    "example":[
                        {
                            "cmd":"loop 10",
                            "des":"模拟批量返回10条消息"
                        }
                    ]
                },
                {
                    "key":"context",
                    "group": "demo",
                    "usage":'context <ctx>',
                    "description":"修改上下文",
                    "example":[
                        {
                            "cmd":"context /vue/terminal/dev",
                            "des":"修改上下文为'/vue/terminal/dev'"
                        }
                    ]
                },
                {
                    "key":"fullscreen",
                    "group": "demo",
                    "usage":'fullscreen',
                    "description":"切换全屏模式"
                },
                {
                    "key":"drag",
                    "group": "demo",
                    "usage":'drag <x> <y>',
                    "description":"模拟拖拽窗口，x为左边界，y为右边界，单位px",
                    "example":[
                        {
                            "cmd":"drag 20 100",
                            "des":"拖拽位置到（20,100）"
                        }
                    ]
                },
                {
                    "key":"pos",
                    "group": "demo",
                    "usage":'pos',
                    "description":"获取当前窗口位置"
                },
                {
                    "key":"random",
                    "group": "demo",
                    "usage":'random',
                    "description":"随机生成标签"
                },
            ],
            dragConf: {
                width: 700,
                height: 500
            }
        }
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
            this.dragConf.height = "60%"
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
            } else if (key === 'html' || key === 'ls') {
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
                let loop = parseInt(command.split(" ")[1])
                for (let i = 0; i < loop; i++) {
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
            } else if (key === 'pos') {
                let pos = Terminal.$api.getPosition(this.name)
                success({content: JSON.stringify(pos)})
            } else if (key === 'random') {
                let allClass = ['success', 'error', 'system', 'info', 'warning'];

                let clazz = allClass[Math.floor(Math.random() * allClass.length)];
                success({
                    type: 'normal',
                    class: clazz,
                    tag: "随机标签：" + clazz,
                    content: 'random number: ' + Math.floor(Math.random() * 10)
                })
            } else {
                failed("Unknown command")
            }
        },
        onClick(key) {
            if (key === "close") {
                this.show = false
            } else {
                Terminal.$api.pushMessage(this.name, {
                    tag: 'success',
                    class: 'system',
                    content: `用户点击了 ${key}`
                })
            }
        },
        onKeydown() {
            // console.log(event)
        },
        inputFilter(data, value) {
            return value.replace(/[\u4e00-\u9fa5]/g, "")
        },
        initBefore() {

        },
        initComplete() {
            Terminal.$api.execute(this.name, "help help")

            Terminal.$api.pushMessage(this.name,{
                content: `Current demo version: vue2(${this.version.vue2}), vue3(${this.version.vue3})`
            })
            Terminal.$api.pushMessage(this.name,{
                content: `当前Demo输入规则已加入禁止中文输入`
            })
        }
    }
}
