import Terminal from "vue-web-terminal"

export default {
    name: 'App',
    components: {Terminal},
    data() {
        return {
            show: true,
            name: 'my-terminal',
            context: '/hello',
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
            ],
            dragConf: {
                enable: true,
                width: 700,
                height: 500
            }
        }
    },
    mounted() {
        let clientWidth = document.body.clientWidth
        let clientHeight = document.body.clientHeight
        this.dragConf.width = clientWidth * 0.7
        this.dragConf.height = clientHeight * 0.7
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
            } else if (key === 'tag') {
                success({
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
            } else {
                let allClass = ['success', 'error', 'system', 'info', 'warning'];

                let clazz = allClass[Math.floor(Math.random() * allClass.length)];
                success({
                    type: 'normal',
                    class: clazz,
                    tag: '成功',
                    content: command
                })
            }
        },
        onClick(key) {
            console.log("trigger click: " + key)
            if (key === "close") {
                this.show = false
            } else {
                Terminal.$api.pushMessage(this.name, {content: `用户点击了 ${key}`})
            }
        },
        onKeydown() {
            // console.log(event)
        },
        inputFilter(data, value) {
            return value.replace(/[\u4e00-\u9fa5]/g, "")
        }
    }
}
