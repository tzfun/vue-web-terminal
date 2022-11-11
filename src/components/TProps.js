export const headerProps = {
    //  终端标题
    title: {
        type: String, default: 'vue-web-terminal'
    },
}

export const containerProps = {
    ...headerProps,
    name: {
        type: String, default: 'terminal'
    },
    //  显示终端头部
    showHeader: {
        type: Boolean,
        default: true
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
}

export const terminalProps = {
    ...containerProps,
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
    //  是否开启命令提示
    enableExampleHint: {
        type: Boolean,
        default: true
    },
    //  输入过滤器
    inputFilter: {
        type: Function
    },
    //  命令格式化显示函数
    commandFormatter: {
        type: Function
    },
    //  按下Tab键处理函数
    tabKeyHandler: {
        type:Function
    }
}

export const shellProps = {
    ...containerProps
}