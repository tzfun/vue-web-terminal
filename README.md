# vue-web-terminal

一个由 Vue 构建的支持多内容格式显示的网页端命令行窗口插件，支持格式：普通文本、表格、json、代码/多行文本、自定义html，支持自定义命令行库、键入搜索提示等，支持⬆️、⬇️、⬅️、➡️
切换光标️。

在线体验：[https://tzfun.github.io/vue-web-terminal/](https://tzfun.github.io/vue-web-terminal/)

![vue-web-terminal](./public/vue-web-terminal.gif)

# 快速上手

npm安装vue-web-terminal

```shell
//  vue2安装
npm install vue-web-terminal@2.xx --save

//  vue3安装
npm install vue-web-terminal@3.xx --save 
```

main.js中载入 Terminal 插件

```js
import Terminal from 'vue-web-terminal'

// for vue2
Vue.use(Terminal)

// for vue3
const app = createApp(App)
app.use(Terminal)
```

使用示例

```vue

<template>
  <div id="app">
    <terminal name="my-terminal" @execCmd="onExecCmd"></terminal>
  </div>
</template>

<script>
import Terminal from "vue-web-terminal"

export default {
  name: 'App',
  components: {Terminal},
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
    }
  }
}
</script>

<style>
body, html, #app {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}
</style>
```

# 插件文档

## Select Attributes

terminal标签支持属性参数表

| 参数                 | 说明                                      | 类型       | 默认值                                                 |
|--------------------|-----------------------------------------|----------|-----------------------------------------------------|
| name               | Terminal实例名称，同一页面的name必须唯一，Api中使用也需用到此值 | string   | terminal                                            |
| context            | 初始化上下文文本                                | string   | /vue-web-terminal                                   |
| title              | header中显示的标题                            | string   | vue-web-terminal                                    |
| show-header        | 是否显示header                              | boolean  | true                                                |
| init-log           | Terminal初始化时显示的日志，是由[消息对象](#消息对象)组成的数组  | array    | 略                                                   |
| init-log-delay     | 初始化显示日志时每条日志之间的间隔时间，单位毫秒 ms             | number   | 150                                                 |
| show-log-time      | 当消息**type**为`normal`时是否显示时间             | boolean  | true                                                |
| warnLogByteLimit   | 当前Terminal日志占用内存大小超出此限制会发出警告，单位`byte`   | number   | 1024 * 1024 * 10                                    |
| warnLogCountLimit  | 当前Terminal日志条数超出此限制会发出警告                | number   | 200                                                 |
| warnLogLimitEnable | 是否开启日志限制警告                              | boolean  | true                                                |
| auto-help          | 是否打开命令行自动搜索提示功能                         | boolean  | true                                                |
| enableExampleHint  | 是否显示样例提示                                | boolean  | true                                                |
| command-store      | 自定义的命令库，见[命令定义格式](#命令定义)                | array    | [内置命令行](#内置命令行)                                     |
| command-store-sort | 命令行库排序                                  | function | function(a,b) {}                                    |
| inputFilter        | 自定义输入过滤，返回值为过滤后的字符串                     | function | function(当前输入字符char, 输入框内字符串value, input时间event) {} |
| dragConf           | 拖拽窗口配置项                                 | object   | 见[拖拽功能](#拖拽功能)                                      |

## Select Events

terminal标签支持事件表

| 事件名称           | 说明                                                                                                                    | 回调参数                                       |
|----------------|-----------------------------------------------------------------------------------------------------------------------|--------------------------------------------|
| execCmd        | 执行自定义命令时触发。`success`和`failed`为回调函数，**必须调用两个回调其中之一才会回显！**，其中`success`回调参数为一个[消息对象](#消息对象)或消息对象数组，`failed`回调参数为一个string | `(cmdKey, command, success, failed, name)` |
| beforeExecCmd  | 执行任意命令之前触发                                                                                                            | `(cmdKey, command, name)`                  |
| onKeydown      | 当获取光标焦点时，按下任意键盘触发                                                                                                     | `(event, name)`                            |
| onClick        | 用户点击按钮时触发，参数`key`为按钮唯一识别，已有按钮：close、minScreen、fullScreen、title                                                        | `(key, name)`                              |
| initBefore     | 生命周期函数，插件初始化之前触发                                                                                                      | `(name)`                                   |
| initComplete   | 生命周期函数，插件初始化完成之后触发                                                                                                    | `(name)`                                   |

## 拖拽功能

开启拖拽功能需要将`showHeader`设置为true并配置`dragConf`，你可以通过dragConf的`width`和`height`来配置窗口大小。

```vue
<terminal name="my-terminal" 
          show-header 
          :drag-conf="{width: 700, height: 500}"></terminal>
```

dragConf结构如下：

| 参数     | 说明                                                                | 类型            |
|--------|-------------------------------------------------------------------|---------------|
| width  | 拖拽窗口宽度，可以是数字（单位px）也可以是百分比（相对于浏览器窗口）                               | number/string |
| height | 拖拽窗口高度，同宽度                                                        | number/string |
| zIndex | 窗口层级，默认100                                                        | number        |
| init   | 窗口初始化位置，如果不填则默认位置在浏览器窗口中央，其中x和y的单位为px，``` {"x": 700, "y": 500}``` | object        |

![dragging.gif](public/dragging.gif)

除了鼠标控制之外你还可以[调用API模拟拖拽](#拖拽)

## Api

本插件提供了一些 Api 可以使用 Vue 主动向插件发起事件请求。

```js
import Terminal from "vue-web-terminal"

//  获取api
Terminal.$api
```

### 向Terminal推送一条消息

```js
let name = 'my-terminal'   //  每一个terminal都会定义一个name，详情见前面文档
let message = {
    type: 'normal',
    class: 'warning',
    content: 'This is a wanning message.'
}

Terminal.$api.pushMessage(name, message)
```

### 修改上下文

比如当前输入行`$ /vue-web-terminal/tzfun > `的 */vue-web-terminal/tzfun* 就是上下文，上下文文本可以由开发者自由设置
，但是需使用`.sync`绑定一个变量

```vue
<template>
  <div id="app">
    <terminal name="my-terminal" :context.sync="context"></terminal>
  </div>
</template>

<script>
import Terminal from "vue-web-terminal"

export default {
  name: 'App',
  data() {
    return {
      context: '/hello'
    }
  },
  methods: {
    _updateContext(newCtx) {
      Terminal.$api.updateContext("my-terminal", newCtx)
    }
  }
}
</script>
```

### Fullscreen

使当前terminal进入或退出全屏

```js
Terminal.$api.fullscreen('my-terminal')
```

判断当前是否处于全屏状态

```js
//  true or false
let fullscreen = Terminal.$api.isFullscreen('my-terminal')
```

### 拖拽

当开启[拖拽功能](#拖拽功能)时可以使用下面这种方式模拟拖拽来改变窗口位置，其中参数`x`
是terminal左边框到浏览器可视范围左边框的距离，单位px，`y`是terminal上边框到浏览器可视范围上边框的距离。

```js
Terminal.$api.dragging('my-terminal', {
    x: 100,
    y: 200
})
```

### 执行命令

可以使用api向Terminal执行一个命令，执行过程会回显在Terminal窗口中，这是一种用脚本模拟用户执行命令的方式

```js
Terminal.$api.execute('my-terminal', 'help :local')
```

### 获取位置

当处于拖拽模式时，此接口可获取窗口所在位置

```js
let pos = Terminal.$api.getPosition('my-terminal')
console.log(pos.x, pos.y)
```

## 消息对象

本插件定义了消息对象，任何消息需按照此格式定义才能正确显示。

| 属性      | 说明                          | 类型                       | 可选值                               |
|---------|-----------------------------|--------------------------|-----------------------------------|
| time    | 消息产生时间，仅类型为`normal`有效       | string                   | /                                 |
| class   | 消息类别                        | string                   | success、error、system、info、warning |
| tag     | 显示标签，仅类型为`normal`有效         | string                   | /                                 |
| type    | 消息格式类型，默认值为`normal`         | string                   | normal、json、code、table、html       |
| content | 具体内容，不同消息格式的内容类型不一样，具体规则见下文 | string、json、object、array | /                                 |

### normal 普通文本

content为字符串格式，支持html标签，time字段会在push时自动填充，content必填，其他选填

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
，在main.js入口安装，详细配置见[https://www.npmjs.com/package/highlight.js](https://www.npmjs.com/package/highlight.js)

```js
import Terminal from 'vue-web-terminal'
import hljs from 'highlight.js'
import java from 'highlight.js/lib/languages/java'
import vuePlugin from "@highlightjs/vue-plugin"
import 'highlight.js/styles/tomorrow-night-bright.css'

hljs.registerLanguage('java', java)
Vue.use(vuePlugin)
Vue.use(Terminal, {highlight: true})
```

vue2版本依赖推荐

```json
{
  "@highlightjs/vue-plugin": "^1.0.2",
  "highlight.js": "^10.7.3"
}
```

#### codemirror 代码高亮

code类型消息也支持 `codemirror`
高亮显示，详细配置见[https://www.npmjs.com/package/vue-codemirror](https://www.npmjs.com/package/vue-codemirror)

同样只需要在main.js入口安装即可，版本推荐：`"vue-codemirror": "^4.0.6"`

```js
import VueCodemirror from 'vue-codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/darcula.css'
import 'codemirror/mode/clike/clike.js'
import 'codemirror/addon/edit/closebrackets.js'

Vue.use(VueCodemirror)
Vue.use(Terminal, {
    codemirror: {
        tabSize: 4,
        mode: 'text/x-java',
        theme: "darcula",
        lineNumbers: true,
        line: true,
        smartIndent: true
    }
})
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

### html

type为`html`时可自定义内容格式，content为html标签构成

```js
execCmd(key, command, success)
{
    // ...
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
          `
    })
    // ...
}
```

## 命令定义

如果开启了命令帮助搜索功能，在实例化Terminal之前需要传入自定义命令库，传入的命令库为 N 个命令的数组，以下是命令格式定义规则：

| 参数          | 说明                      | 类型     |
|-------------|-------------------------|--------|
| key         | 命令关键字，必填                | string |
| title       | 显示标题                    | string |
| group       | 分组，可自定义，默认为 `local`     | string |
| usage       | 使用方法                    | string |
| description | 详细描述                    | string |
| example     | 使用示例，见[命令示例格式](#命令示例格式) | array  |

### 命令示例格式

示例格式比较简单，`des`为描述，`cmd`为具体的命令，json格式如下：

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

### 命令Help

插件内置了help命令可以方便使用者搜索命令库，通过help命令可以查看命令的key、分组、解释样例信息。

```shell

# 显示全部命令信息
help

# 模糊搜索命令，搜索build前缀的命令
help build*

# 模糊搜索名，搜索带有event的命令
help *event*

# 按分组搜索，搜索关键词需要以":"开头，搜索分组为server的所有命令
help :server

```

### 内置命令

Terminal默认内置有以下命令，且不可替代

```json
[
  {
    "key": "help",
    "title": "Help",
    "group": "local",
    "usage": "help [pattern]",
    "description": "Show command document.",
    "example": [
      {
        "des": "Get help documentation for exact match commands.",
        "cmd": "help refresh"
      },
      {
        "des": "Get help documentation for fuzzy matching commands.",
        "cmd": "help *e*"
      },
      {
        "des": "Get help documentation for specified group, match key must start with ':'.",
        "cmd": "help :groupA"
      }
    ]
  },
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
