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
            type: Array, default: () => null
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
        commandStore: Array,
        //   命令行排序方式
        commandSortHandler: Function,
        //  显示终端头部
        showHeader: {
            type: Boolean,
            default: true
        },
        //  是否开启命令帮助提示
        enableHelpBox: {
            type: Boolean,
            default: true
        },
        //  输入过滤器
        inputFilter: Function,
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
        dragConf: Object,
        //  命令格式化显示函数
        commandFormatter: Function,
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
        //  行间距，单位px
        lineSpace: {
            type: Number,
            default: 15
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
        enableCursorBlink: {
            type: Boolean,
            default: true
        },
        //  命令折叠开关
        enableFold: {
            type: Boolean,
            default: true
        },
        //  鼠标hover时分组高亮开关
        enableHoverStripe: {
            type: Boolean,
            default: false
        },
        //  命令提示开关
        enableInputTips: {
            type: Boolean,
            default: true
        },
        /**
         * 提示选择处理函数
         *
         * @param command       当前用户输入的完整命令行
         * @param cursorIndex   当前光标所处位置
         * @param item          用户选择提示项
         * @param callback      填充结束后需调用此函数返回新的命令行
         */
        inputTipsSelectHandler: Function,
        /**
         * 用户自定义命令搜索提示实现
         *
         * @param command       当前用户输入的完整命令行
         * @param cursorIndex   当前光标所处位置
         * @param commandStore  命令集合
         * @param callback      搜索结束回调，回调格式为一个数组，示例：
         * <pre>
         *     [
         *          {
         *              content: 'help',
         *              description: 'Show command document.',
         *              attach: {
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
         *          }
         *     ]
         * </pre>
         */
        inputTipsSearchHandler: Function,
        //  主题
        theme: {
            type: String,
            default: () => 'dark'
        }
    }
}
