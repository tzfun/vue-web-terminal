
export const commands = {
    'zh-CN': [
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
            "key": "list",
            "group": "demo",
            "usage": 'list',
            "description": "列出所有级别消息"
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
        },
        {
            "key": "edit",
            "group": "demo",
            "usage": 'edit',
            "description": "打开文本编辑器"
        }
    ],
    "en-US": [
        {
            "key": "fail",
            "group": "demo",
            "usage": 'fail',
            "description": "Simulate error result return"
        },
        {
            "key": "json",
            "group": "demo",
            "usage": 'json',
            "description": "Simulate json result display"
        },
        {
            "key": "code",
            "group": "demo",
            "usage": 'code',
            "description": "Simulate code results display"
        },
        {
            "key": "table",
            "group": "demo",
            "usage": 'table',
            "description": "Simulate table results display"
        },
        {
            "key": "html",
            "group": "demo",
            "usage": 'html',
            "description": "Simulate custom HTML result display"
        },
        {
            "key": "loop",
            "group": "demo",
            "usage": 'loop',
            "description": "Simulate batch result display"
        },
        {
            "key": "context",
            "group": "demo",
            "usage": 'context <ctx>',
            "description": "Modify context",
            "example": [
                {
                    "cmd": "context /vue/terminal/dev",
                    "des": "Modify the context to '/vue/terminal/dev'"
                }
            ]
        },
        {
            "key": "fullscreen",
            "group": "demo",
            "usage": 'fullscreen',
            "description": "Toggle full screen mode"
        },
        {
            "key": "drag",
            "group": "demo",
            "usage": 'drag <x> <y>',
            "description": "Simulate dragging the window, x is the left border, y is the right border, unit is px",
            "example": [
                {
                    "cmd": "drag 20 100",
                    "des": "Drag the position to (20,100)"
                }
            ]
        },
        {
            "key": "info",
            "group": "demo",
            "usage": 'info',
            "description": "Get current window information"
        },
        {
            "key": "list",
            "group": "demo",
            "usage": 'list',
            "description": "List all level messages"
        },
        {
            "key": "flash",
            "group": "demo",
            "usage": 'flash',
            "description": "Instant echo, simulate the execution of download commands"
        },
        {
            "key": "ask",
            "group": "demo",
            "usage": 'ask',
            "description": "User input, simulate execution login"
        },
        {
            "key": "edit",
            "group": "demo",
            "usage": 'edit',
            "description": "Open a text editor"
        }
    ]
}