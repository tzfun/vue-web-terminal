# vue-web-terminal

一个由 Vue 构建的支持多内容格式显示的网页端命令行窗口插件，支持格式：普通文本、表格、json、代码/多行文本，支持自定义命令行库、键入搜索提示等，支持⬆️、⬇️、⬅️、➡️ 切换光标️。

![vue-web-terminal](./public/vue-web-terminal.gif)

# 快速上手

npm安装vue-web-terminal

```shell
npm install vue-web-terminal --save 
```

main.js中载入 Terminal 插件

```js
import Terminal from 'vue-web-terminal'

Vue.use(Terminal)
```

使用示例

```vue

<template>
  <div id="app">
    <terminal name="my-terminal"
              @execCmd="onExecCmd"
              @onClick="onClick"
              @onKeydown="onKeydown"
              show-log-time
              warnLogLimitEnable></terminal>
  </div>
</template>

<script>

export default {
  name: 'App',
  methods: {
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
          class: 'system',
          content: 'import Terminal from \'vue-web-terminal\'\n' +
              '\n' +
              'Vue.use(Terminal)'
        })
      } else {
        success({
          type: 'normal',
          class: 'success',
          tag: '成功',
          content: command
        })
      }
    },
    onClick(key) {
      console.log("trigger click: " + key)
    },
    onKeydown(event) {
      console.log(event)
    }
  }
}
</script>

<style>
body, html {
  margin: 0;
  padding: 0;
}
</style>
```

# 插件文档

## Select Attributes

| 参数                 | 说明                                      | 类型      | 默认值                |
|--------------------|-----------------------------------------|---------|--------------------|
| name               | Terminal实例名称，同一页面的name必须唯一，Api中使用也需用到此值 | string  | terminal           |
| context            | 初始化上下文文本                                | string  | /vue-web-terminal  |
| title              | header中显示的标题                            | string  | vue-web-terminal   |
| show-header        | 是否显示header                              | boolean | true               |
| init-log           | Terminal初始化时显示的日志，是由[消息对象](#消息对象)组成的数组  | array   | 略                  |
| init-log-delay     | 初始化显示日志时每条日志之间的间隔时间，单位毫秒 ms             | number  | 150                |
| show-log-time      | 当消息**type**为`normal`时是否显示时间             | boolean | true               |
| warnLogByteLimit   | 当前Terminal日志占用内存大小超出此限制会发出警告，单位`byte`   | number  | 1024 * 1024 * 10   |
| warnLogCountLimit  | 当前Terminal日志条数超出此限制会发出警告                | number  | 200                |
| warnLogLimitEnable | 是否开启日志限制警告                              | boolean | true               |
| auto-help          | 是否打开命令行自动搜索提示功能                         | boolean | true               |
| command-store      | 自定义的命令行库，见[命令行定义格式](#命令行定义)             | array   | [内置命令行](#内置命令行)    |

## Select Events

| 事件名称          | 说明                                                                                                             | 回调参数                                 |
|---------------|----------------------------------------------------------------------------------------------------------------|--------------------------------------|
| execCmd       | 执行自定义命令时触发。`success`和`failed`为回调函数，**必须调用两个回调其中之一才会回显！**，其中`success`回调参数为一个[消息对象](#消息对象)，`failed`回调参数为一个string | `(cmdKey, command, success, failed)` |
| beforeExecCmd | 执行任意命令之前触发                                                                                                     | `(cmdKey, command)`                  |
| onKeydown     | 当获取光标焦点时，按下任意键盘触发                                                                                              | `(event)`                            |
| onClick       | 用户点击按钮时触发，参数`key`为按钮唯一识别，已有按钮：close、minScreen、fullScreen、title                                                 | `(key)`                              |

## Api

本插件提供了一些 Api 可以使用 Vue 主动向插件发起事件请求。

Terminal在 Vue 的prototype中定义了一个变量可以获取Terminal对象
```js
this.$terminal

//  or

Vue.prototype.$terminal
```

### 向Terminal推送一条消息

```js
let name = 'my-terminal'   //  每一个terminal都会定义一个name，详情见前面文档
let message = {
    type: 'normal',
    class: 'warning',
    content: 'This is a wanning message.'
}

this.$terminal.pushMessage(name, message)
```

### 修改上下文

比如当前输入行`$ /vue-web-terminal/tzfun > `的 */vue-web-terminal/tzfun* 就是上下文，上下文文本可以由开发者自由设置 ，但是需使用`.sync`绑定一个变量

```vue
<template>
  <div id="app">
    <terminal name="my-terminal" :context.sync="context"></terminal>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      context: '/hello'
    }
  },
  methods: {
    _updateContext(newCtx) {
      this.$terminal.updateContext("my-terminal", newCtx)
    }
  }
}
</script>
```

## 消息对象

本插件定义了消息对象，任何消息需按照此格式定义才能正确显示。

| 属性      | 说明                          | 类型                       | 可选值                               |
|---------|-----------------------------|--------------------------|-----------------------------------|
| time    | 消息产生时间，仅类型为`normal`有效       | string                   | /                                 |
| class   | 消息类别                        | string                   | success、error、system、info、warning |
| tag     | 显示标签，仅类型为`normal`有效         | string                   | /                                 |
| type    | 消息格式类型                      | string                   | normal、json、code、table            |
| content | 具体内容，不同消息格式的内容类型不一样，具体规则见下文 | string、json、object、array | /                                 |

### 初始化日志

初始化日志比较特殊，只需要传`content`即可，格式为字符串

```json
{
  "content": "这是一条欢迎日志"
}
```

### 普通文本

content为字符串格式，支持html标签，time字段会在push时自动填充，class、content、type必填，其他选填

```json
{
  "time": "2022-02-17 18:12:20",
  "class": "success",
  "type": "normal",
  "content": "这是一条普通文本消息",
  "tag": "Tag success"
}
```

### json

type为`json`时content需传一个json对象

```json
{
  "type": "json",
  "content": {
    "key": "value",
    "num": 1
  }
}
```

### code

type为`code`时content类型为字符串，直接传入文本或代码即可

```json
{
  "type": "json",
  "content": "import Terminal from 'vue-web-terminal'\n\nVue.use(Terminal)"
}
```

#### highlight.js 代码高亮

code类型消息支持 `highlight.js` 高亮显示

首先你需要配置 **Highlight.js**
```js
import Hljs from 'highlight.js';
import 'highlight.js/styles/tomorrow-night-bright.css';

let Highlight = {};
Highlight.install = function (Vue) {
    Vue.directive('highlight', {
        inserted: function (el) {
            let blocks = el.querySelectorAll('pre code');
            blocks.forEach(block => {
                let ul = document.createElement("ul");
                let rowCount = block.outerHTML.split('\n').length;
                for (let i = 1; i <= rowCount; i++) {
                    let li = document.createElement("li")
                    let text = document.createTextNode(i)
                    li.appendChild(text)
                    ul.appendChild(li)
                }
                ul.className = 'pre-numbering'
                block.parentNode.appendChild(ul)
                Hljs.highlightBlock(block)
            })
        },
        componentUpdated: function (el) {
            let blocks = el.querySelectorAll('pre code');
            for (let i = 0; i < blocks.length; i++) {
                Hljs.highlightBlock(blocks[i]);
            }
        }
    })
};

export default Highlight;
```

然后在载入 Terminal 的入口修改配置就可以高亮显示了
```js
import Terminal from 'vue-web-terminal'
import Hljs from '@/Highlight.js'

Vue.use(Hljs)
Vue.use(Terminal, { highlight:true })
```

### table

type为`table`时content为表格配置，`head`为表头，`rows`为每行的数据，支持html标签

```json
{
  "type": "table",
  "content": {
    "head": [
      "title1",
      "title2",
      "title3",
      "title4"
    ],
    "rows": [
      [
        "name1",
        "hello world",
        "this is a test1",
        "xxxxxxxx"
      ],
      [
        "name2",
        "hello world",
        "this is a test2 test2",
        "xxxxxxxx"
      ]
    ]
  }
}
```

## 命令行定义

如果开启了命令行帮助搜索功能，在实例化Terminal之前需要传入自定义命令行库，传入的命令行库为 N 个命令行的数组，以下是命令行格式定义规则：

| 参数          | 说明                        | 类型     |
|-------------|---------------------------|--------|
| key         | 命令行关键字，必填                 | string |
| title       | 显示标题                      | string |
| group       | 分组，可自定义，默认为 `local`       | string |
| usage       | 使用方法                      | string |
| description | 详细描述                      | string |
| example     | 使用示例，见[命令行示例格式](#命令行示例格式) | array  |

### 命令行示例格式

示例格式比较简单，`des`为描述，`cmd`为具体的命令行，json格式如下：

```json
[
  {
    "des": "获取所有任务信息",
    "cmd": "task -u 11001 -o pack"
  },
  {
    "des": "获取任务进度",
    "cmd": "task -u 11001 -o query -id 1001"
  }
]
```

### 内置命令行

Terminal默认内置有以下命令，且不可替代

```json
[
  {
    "key": "clear",
    "title": "Clear logs",
    "group": "local",
    "usage": "clear [history]",
    "description": "Clear screen or history.",
    "example": [
      {
        "cmd": "clear",
        "des": "Clear all records on the current screen."
      },
      {
        "cmd": "clear history",
        "des": "Clear command history."
      }
    ]
  },
  {
    "key": "refresh",
    "title": "Refresh page",
    "group": "local",
    "usage": "refresh",
    "description": "Refresh current page."
  },
  {
    "key": "open",
    "title": "Open page",
    "group": "local",
    "usage": "open <url>",
    "description": "Open a specified page.",
    "example": [
      {
        "cmd": "open blog.beifengtz.com"
      }
    ]
  }
]
```