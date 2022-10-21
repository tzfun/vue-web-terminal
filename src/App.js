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
                    "key": "task",
                    "belong": "game",
                    "onlineCheck": "withoutPack",
                    "title": "任务系统操作（非经营任务）",
                    "usage": "task -u <userId> -o <query|set|pack> [-id <taskId>] [-v <taskVal>] [-t <ctype>]",
                    "example": [
                        {
                            "des": "获取玩家所有任务信息",
                            "cmd": "task -u 11001 -o pack"
                        },
                        {
                            "des": "获取任务进度",
                            "cmd": "task -u 11001 -o query -id 1001"
                        },
                        {
                            "des": "设置任务进度，参数 -v 兼容大数值写法，但只能大数值统计类型的任务才能设置大数值",
                            "cmd": "task -u 11001 -o set -id 1001 -v 500"
                        },
                        {
                            "des": "重置所有任务",
                            "cmd": "task -u 11001 -o reset"
                        },
                        {
                            "des": "重置 ctype 为101（成长任务）的所有任务",
                            "cmd": "task -u 11001 -o reset -t 101"
                        }
                    ]
                }
            ],
            dragConf: {
                enable: true,
                width: 700,
                height: 500
            }
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
            } else if (key === 'html') {
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
