import TerminalObj from "@/TerminalObj";

export function terminalData() {
    return {
        terminalObj: TerminalObj,
        command: "",
        commandLog: [],
        cursorConf: {
            defaultWidth: 6,
            width: 6,
            left: 'unset',
            top: 'unset',
            idx: 0, //  从0开始
            show: false
        },
        byteLen: {
            init: false,
            en: 8,
            cn: 13
        },
        jsonViewDepth: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        showInputLine: true,
        terminalLog: [],
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
                        des: "Get all commands.",
                        cmd: 'help'
                    }, {
                        des: "Get help documentation for exact match commands.",
                        cmd: 'help refresh'
                    }, {
                        des: "Get help documentation for fuzzy matching commands.",
                        cmd: 'help *e*'
                    }, {
                        des: "Get help documentation for specified group, match key must start with ':'.",
                        cmd: 'help :groupA'
                    }
                ]
            }, {
                key: 'clear',
                title: 'Clear screen or history logs',
                group: 'local',
                usage: 'clear [history]',
                description: 'Clear screen or history.',
                example: [
                    {
                        cmd: 'clear',
                        des: 'Clear all records on the current screen.'
                    }, {
                        cmd: 'clear history',
                        des: 'Clear command history'
                    }
                ]
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
        _fullscreenState: false,
        perfWarningRate: {
            count: 0
        },
        inputBoxParam: {
            boxWidth: 0,
            boxHeight: 0,
            promptWidth: 0,
            promptHeight: 0
        },
        flash: {
            open: false,
            content: null
        },
        ask: {
            open: false,
            question: null,
            isPassword: false,
            callback: null,
            autoReview: false,
            input: ''
        },
        textEditor: {
            open: false,
            focus: false,
            value: '',
            onClose: null,
            onFocus: () => {
                this.textEditor.focus = true
            },
            onBlur: () => {
                this.textEditor.focus = false
            }
        },
        terminalListener: null,
    }
}

export function terminalProps() {
    return {
        name: {
            type: String,
            default: ''
        },
        //  终端标题
        title: {
            type: String, default: 'vue-web-terminal'
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
        //  命令行搜索以及help指令用
        commandStore: {
            type: Array
        },
        //   命令行排序方式
        commandStoreSort: {
            type: Function
        },
        //  记录条数超出此限制会发出警告
        warnLogCountLimit: {
            type: Number, default: 200
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
        //  拖拽配置
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
        },
        //  命令格式化显示函数
        commandFormatter: {
            type: Function
        },
        //  按下Tab键处理函数
        tabKeyHandler: {
            type: Function
        },
        /**
         * 用户自定义命令搜索提示实现
         *
         * @param commandStore 命令集合
         * @param key   目标key
         *
         * @return 命令项，格式如下：
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
         */
        searchHandler: {
            type: Function
        }
    }
}