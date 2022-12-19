const version = {
  vue2: "2.1.3",
  vue3: "3.1.3",
}
const cmdStore = [
  {
    key: "fail",
    group: "demo",
    usage: "fail",
    description: "模拟错误结果返回",
  },
  {
    key: "json",
    group: "demo",
    usage: "json",
    description: "模拟json结果显示",
  },
  {
    key: "code",
    group: "demo",
    usage: "code",
    description: "模拟code结果显示",
  },
  {
    key: "table",
    group: "demo",
    usage: "table",
    description: "模拟表格结果显示",
  },
  {
    key: "html",
    group: "demo",
    usage: "html",
    description: "模拟自定义html结果显示",
  },
  {
    key: "loop",
    group: "demo",
    usage: "loop",
    description: "模拟批量结果显示",
  },
  {
    key: "context",
    group: "demo",
    usage: "context <ctx>",
    description: "修改上下文",
    example: [
      {
        cmd: "context /vue/terminal/dev",
        des: "修改上下文为'/vue/terminal/dev'",
      },
    ],
  },
  {
    key: "fullscreen",
    group: "demo",
    usage: "fullscreen",
    description: "切换全屏模式",
  },
  {
    key: "drag",
    group: "demo",
    usage: "drag <x> <y>",
    description: "模拟拖拽窗口，x为左边界，y为右边界，单位px",
    example: [
      {
        cmd: "drag 20 100",
        des: "拖拽位置到（20,100）",
      },
    ],
  },
  {
    key: "info",
    group: "demo",
    usage: "info",
    description: "获取当前窗口信息",
  },
  {
    key: "random",
    group: "demo",
    usage: "random",
    description: "随机生成标签",
  },
  {
    key: "flash",
    group: "demo",
    usage: "flash",
    description: "即时回显，模拟执行下载命令",
  },
  {
    key: "ask",
    group: "demo",
    usage: "ask",
    description: "用户输入，模拟执行登录",
  },
  {
    key: "edit",
    group: "demo",
    usage: "edit",
    description: "打开文本编辑器",
  },
]
const initLog = [
  {
    content: "Terminal initializing...",
  },
  {
    content:
      "Welcome to vue-web-terminal! If you are using for the first time, you can use the <span class='t-cmd-key'>help</span> command to learn.",
  },
  {
    type: "html",
    content: `
      <div class='demo-init-box'>
          <p>Hello vue-web-terminal! ✋</p>
          <p>Demo version: vue2(<span class="t-cmd-key">${version.vue2}</span>), vue3(<span class="t-cmd-key">${version.vue3}</span>)</p>
          <p>⭐️Github: <a class='t-a' target='_blank' href='https://github.com/tzfun/vue-web-terminal'>https://github.com/tzfun/vue-web-terminal</a></p>
      </div>
      `,
  },
]
export const LocalTerminalConstants = {
  version,
  cmdStore,
  initLog,
}
