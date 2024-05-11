export function terminalHeaderProps() {
    return {
        //  终端标题
        title: {
            type: String, default: 'vue-web-terminal'
        }
    }
}

export function terminalViewerProps() {
    return {
        item: {
            type: Object,
            default: () => {
                return {
                    class: null,
                    type: 'normal',
                    content: null,
                    tag: null
                }
            }
        },
        idx: Number | String
    }
}

export function terminalProps() {
    return {
        ...terminalHeaderProps(),
        name: {
            type: String,
            default: ''
        },
        //  初始化日志内容
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
                    content: "Welcome to vue web terminal! If you are using for the first time, you can use the <span class='t-cmd-key'>help</span> command to learn.Thanks for your star support: <a class='t-a' target='_blank' href='https://github.com/tzfun/vue-web-terminal'>https://github.com/tzfun/vue-web-terminal</a>"
                }]
            }
        },
        //  上下文
        context: {
            type: String,
            default: '/vue-web-terminal'
        },
        //  上下文后缀
        contextSuffix: {
            type: String,
            default: ' > '
        },
        //  命令行搜索以及help指令用
        commandStore: {
            type: Array
        },
        //   命令行排序方式
        commandStoreSort: {
            type: Function
        },
        //  自动搜索帮助
        autoHelp: {
            type: Boolean,
            default: true
        },
        //  显示终端头部
        showHeader: {
            type: Boolean,
            default: true
        },
        //  是否开启命令提示
        enableExampleHint: {
            type: Boolean,
            default: true
        },
        //  输入过滤器
        inputFilter: {
            type: Function
        },
        /**
         * 拖拽配置
         *                 {
         *                     width: 700,
         *                     height: 500,
         *                     zIndex: 100,
         *                     init: {
         *                         x: null,
         *                         y: null
         *                     },
         *                     pinned: false
         *                 }
         */
        dragConf: {
            type: Object
        },
        //  命令格式化显示函数
        commandFormatter: {
            type: Function
        },
        /**
         * 按下Tab键处理函数
         * @param event 键盘事件
         * @param rewriteCallback 修改当前正在输入的命令回调，需传入一个 string
         */
        tabKeyHandler: {
            type: Function
        },
        /**
         * 用户自定义命令搜索提示实现
         *
         * @param commandStore 命令集合
         * @param key   目标key
         * @param callback 搜索结束回调，回调格式如下：
         * <pre>
         *                 {
         *                     key: 'help',
         *                     title: 'Help',
         *                     group: 'local',
         *                     usage: 'help [pattern]',
         *                     description: 'Show command document.',
         *                     example: [
         *                         {
         *                             des: "Get all commands.",
         *                             cmd: 'help'
         *                         }
         *                     ]
         *                 }
         * </pre>
         */
        searchHandler: {
            type: Function
        },
        //  滚动条滚动模式
        scrollMode: {
            type: String,
            default: 'smooth'
        },
        /**
         * 在 push 消息之前触发的钩子函数，只能对message对象的属性进行修改
         *
         * @param message 命令对象
         * @param name terminal name
         */
        pushMessageBefore: Function,
        //  日志条数限制，命令行也算一条日志
        logSizeLimit: {
            type: Number,
            default: 200
        },
        //  是否开启内部默认指令，例如 help、open等
        enableDefaultCommand: {
            type: Boolean,
            default: true
        },
        //  行高，单位px
        lineHeight: {
            type: Number,
            default: 20
        },
        /**
         * 光标样式，可选值：
         * - block
         * - underline
         * - bar
         * - none
         */
        cursorStyle: {
            type: String,
            default: () => "block"
        },
        //  光标闪烁开关
        cursorBlink: {
            type: Boolean,
            default: () => true
        }
    }
}
