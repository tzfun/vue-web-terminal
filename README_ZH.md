中文版 | [English](./README.md)

# vue-web-terminal

<a href="https://github.com/tzfun/vue-web-terminal/tree/vue2"><img src="https://shields.io/github/package-json/v/tzfun/vue-web-terminal/vue2"></a>
<a href="https://github.com/tzfun/vue-web-terminal/tree/vue3"><img src="https://shields.io/github/package-json/v/tzfun/vue-web-terminal/vue3"></a>
<a href="https://www.npmjs.com/package/vue-web-terminal"><img src="https://shields.io/bundlephobia/minzip/vue-web-terminal"></a>
<a href="https://npmcharts.com/compare/vue-web-terminal?minimal=true"><img src="https://img.shields.io/npm/dt/vue-web-terminal.svg" alt="Downloads"></a>
<a href="https://www.npmjs.com/package/vue-web-terminal"><img src="https://img.shields.io/npm/l/vue-web-terminal.svg" alt="Version"></a>

一个由 Vue 构建的支持多内容格式显示的网页端命令行窗口插件，支持表格、json、代码等多种消息格式，支持自定义消息样式、命令行库、键入搜索提示等，模拟原生终端窗口支持 ← → 光标切换和 ↑ ↓ 历史命令切换。

## 功能支持

* 支持消息格式：文本、表格、json、代码/多行文本、html
* 支持内容[实时回显](#实时回显)
* 支持[用户问答输入](#用户询问输入)
* 支持`Highlight.js`、`Codemirror.js`代码高亮
* 支持 ← → 键光标切换
* 支持 ↑ ↓ 键历史命令切换
* 支持Fullscreen全屏显示
* 支持窗口拖拽
* 支持多行文本编辑
* 支持自定义命令库和命令搜索提示，Tab键快捷填充
* 支持用户输入过滤
* 提供方便的API方法：执行命令、推送消息、模拟拖拽、获取DOM信息、全屏等
* 提供多个Slots插槽支持自定义样式

![vue-web-terminal](./public/vue-web-terminal.gif)

> 一句话描述：
>
> 它并不具备执行某个具体命令的能力，这个能力需要开发者自己去实现，它负责的事情是在网页上以界面的形式从用户那拿到想要执行的命令，然后交给开发者去实现，执行完之后再交给它展示给用户。

# 在线体验

在线Demo：[https://tzfun.github.io/vue-web-terminal/](https://tzfun.github.io/vue-web-terminal/)

[![Edit Vue Template](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/silly-scooby-l8wk9b)

# 快速上手

npm安装vue-web-terminal，`2.x.x`版本对应vue2，`3.x.x`版本对应vue3，建议下载对应大版本的最新版。

```shell
#  install for vue2
npm install vue-web-terminal@2.xx --save

#  install for vue3
npm install vue-web-terminal@3.xx --save 
```

main.js中载入 Terminal 插件

```js
import Terminal from 'vue-web-terminal'

// for vue2
Vue.use(Terminal)

// for vue3
const app = createApp(App).use(Terminal)
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

## Attributes

terminal标签支持的属性参数表

| 参数                        | 说明                                                           | 类型       | 默认值                                              |
|---------------------------|--------------------------------------------------------------|----------|--------------------------------------------------|
| name                      | Terminal实例名称，同一页面的name必须唯一，Api中使用也需用到此值                      | string   | terminal                                         |
| context                   | 上下文内容                                                        | string   | /vue-web-terminal                                |
| title                     | header中显示的标题                                                 | string   | vue-web-terminal                                 |
| show-header               | 是否显示header，此开关会影响[拖拽功能](#拖拽功能)                               | boolean  | true                                             |
| init-log                  | Terminal初始化时显示的日志，是由[消息对象](#消息对象)组成的数组，设为`null`则不显示          | array    | 略                                                |
| warn-log-count-limit      | 当前Terminal显示的日志条数超出此限制会发出警告，设一个`<= 0`的值将不发出警告                | number   | 200                                              |
| auto-help                 | 是否打开命令行自动搜索提示功能                                              | boolean  | true                                             |
| enable-example-hint       | 是否显示右上角命令样例提示，前提是开启了`auto-help`                              | boolean  | true                                             |
| command-store             | 自定义的命令库，搜索提示功能会扫描此库，见[命令定义格式](#命令定义)                         | array    | [内置命令](#内置命令)                                    |
| command-store-sort        | 命令行库排序，自定义命令库的显示排序规则                                         | function | function(a,b)                                    |
| input-filter              | 自定义输入过滤，返回值为过滤后的字符串，必须是纯文本，不能带html标签                         | function | function(当前输入字符char, 输入框内字符串value, input事件event) |
| drag-conf                 | 拖拽窗口配置项，**如果不配置此项宽高将会100%填充父元素，窗口宽高等同于父元素宽高**                | object   | 见[拖拽功能](#拖拽功能)                                   |
| command-formatter         | 命令显示格式化函数，一般用于输入命令高亮显示，传入当前命令返回新的命令，支持html。如果不设置将使用内部定义的高亮样式 | function | function(cmd)                                    |

> 下面是已移除属性
>
> * ~~**show-log-time**~~: `2.0.14`和`3.0.13`版本之后移除
> * ~~**warn-log-byte-limit**~~: `2.1.0`和`3.1.0`版本之后移除
> * ~~**warn-log-limit-enable**~~: `2.1.1`和`3.1.1`版本之后移除
> * ~~**init-log-delay**~~: `2.1.1`和`3.1.1`版本之后移除

## Events

terminal标签支持的事件表

| 事件名称            | 说明                                                                                                    | 回调参数                                       |
|-----------------|-------------------------------------------------------------------------------------------------------|--------------------------------------------|
| execCmd         | 执行自定义命令时触发。`success`和`failed`为回调函数，**必须调用两个回调其中之一才会回显！**，其中`success`回调参数含义见下方说明，`failed`回调参数为一个string | `(cmdKey, command, success, failed, name)` |
| beforeExecCmd   | 用户敲下回车之后执行命令之前触发                                                                                      | `(cmdKey, command, name)`                  |
| onKeydown       | 当获取命令输入光标焦点时，按下任意键触发                                                                                  | `(event, name)`                            |
| onClick         | 用户点击按钮时触发，参数`key`为按钮唯一识别，已有按钮：close、minScreen、fullScreen、title                                        | `(key, name)`                              |
| initBefore      | 生命周期函数，插件初始化之前触发                                                                                      | `(name)`                                   |
| initComplete    | 生命周期函数，插件初始化完成之后触发                                                                                    | `(name)`                                   |
| tabKeyHandler   | 用户键入Tab键时的逻辑处理方法，可配合`helpCmd`这个slot使用                                                                 | `(event)`                                  |

**特别说明**：execCmd的`success`回调参数支持多种数据类型，不同数据类型执行逻辑也会不同：

* 不传任何参数，立即结束本次执行
* 传入一个[消息对象](#消息对象)，将会向记录中追加一条消息，并立即结束本次执行
* 传入一个[消息对象](#消息对象)数组，将会向记录中追加多条消息，并立即结束本次执行
* 传入一个`Terminal.$Flash`对象，将会进入[实时回显](#实时回显)处理逻辑，本次执行并不会结束，直到调用`finish()`
* 传入一个`Terminal.$Ask`对象，将会进入[用户询问输入](#用户询问输入)处理逻辑，本次执行并不会结束，直到调用`finish()`

## Slots

Terminal支持以下自定义插槽，此功能在`2.0.11`和`3.0.8`版本及之后支持。

| 插槽名称        | 参数                   | 说明                                         |
|-------------|----------------------|--------------------------------------------|
| header      | /                    | 自定义header样式，仍然会保留拖拽区域                      |
| helpBox     | { showHeader, item } | 自定义命令搜索结果提示框，item为搜索结果                     |
| normal      | { message }          | 自定义`normal`类型消息                            |
| json        | { message }          | 自定义`json`类型消息                              |
| table       | { message }          | 自定义`table`类型消息                             |
| code        | { message }          | 自定义`code`类型消息                              |
| html        | { message }          | 自定义`html`类型消息                              |
| flash       | { content }          | 自定义实时回显样式                                  |
| helpCmd     | { item }             | 自定义命令搜索提示样式                                |
| textEditor  | { data }             | 自定义文本编辑器样式，更多关于文本编辑器的使用方法见[文本编辑器](#文本编辑器)  |

example:

```vue
<terminal :name="name" @execCmd="onExecCmd">
  <template #header>
    This is my custom header
  </template>
  
  <template #json="data">
    {{ data.message }}
  </template>
  
  <template #helpBox="{showHeader, item}">
    {{ item }}
  </template>

  <template #textEditor="{data}">
      <textarea name="editor" class="text-editor" v-model="data.value"
                @focus="data.onFocus" @blur="data.onBlur"></textarea>
    <div class="text-editor-floor" align="center">
      <button class="text-editor-floor-btn" @click="_textEditorClose">Save & Close(Ctrl + S)</button>
    </div>
  </template>
</terminal>
```

## Api

本插件提供了一些 Api 可以使用 Js 主动向插件发起事件请求。

注意：**所有的API接口调用都需要用到Terminal的`name`**

```js
import Terminal from "vue-web-terminal"

//  获取api
Terminal.$api
```

> 已移除api
>
> * ~~**getPosition**~~: `2.0.14`和`3.0.13`版本之后移除，请使用`elementInfo()`
> * ~~**updateContext**~~: `2.1.3`和`3.1.3`版本之后移除，直接修改绑定的 context 变量即可修改上下文

### pushMessage()

[在线Demo演示](https://tzfun.github.io/vue-web-terminal/?cmd=loop)

向Terminal推送一条或多条消息

```js
//  推送一条消息
let message = {
  class: 'warning',
  content: 'This is a wanning message.'
}
Terminal.$api.pushMessage('my-terminal', message)

//  推送多条消息
let messages = [
  {content: "message 1"},
  {content: "message 2"},
  {content: "message 3"}
]
Terminal.$api.pushMessage('my-terminal', messages)
```

### fullscreen()

使当前terminal进入或退出全屏

```js
Terminal.$api.fullscreen('my-terminal')
```

### isFullscreen()

判断当前是否处于全屏状态

```js
//  true or false
let fullscreen = Terminal.$api.isFullscreen('my-terminal')
```

### dragging()

当开启[拖拽功能](#拖拽功能)时可以使用下面这种方式来改变窗口位置，其中参数`x`是terminal左边框到浏览器可视范围左边框的距离，`y`是terminal上边框到浏览器可视范围上边框的距离，单位px。

```js
Terminal.$api.dragging('my-terminal', {
  x: 100,
  y: 200
})
```

### execute()

可以使用api向Terminal执行一个命令，执行过程会回显在Terminal窗口中，这是一种用脚本模拟用户执行命令的方式

```js
Terminal.$api.execute('my-terminal', 'help :local')
```

### focus()

获取Terminal输入焦点。插件内有两处输入点，一是命令行输入，一是[Ask用户输入](#用户询问输入)

```js
Terminal.$api.focus('my-terminal')
```

### elementInfo()

[在线Demo演示](https://tzfun.github.io/vue-web-terminal/?cmd=info)

获取Terminal窗口DOM信息，你可以通过此api获取Terminal的窗口宽度高度、显示内容的宽度高度、所在位置、单字符宽度等，单位为px

```js
let info = Terminal.$api.elementInfo('my-terminal')
```

info数据结构如下：

```json
{
  "pos": {
    "x": 100,
    "y": 100
  },
  "screenWidth": 700,
  "screenHeight": 500,
  "clientWidth": 690,
  "clientHeight": 490,
  "charWidth": {
    "en": 7.2,
    "cn": 14
  }
}
```

下面这张图清晰地描述了这些值的含义：

![ele-info.png](public/ele-info.png)

### textEditorOpen()

此API调用后将会打开文本编辑器，使用示例：

```js
Terminal.$api.textEditorOpen('my-terminal', {
  content: 'This is the preset content',
  onClose: value => {
    console.log('Final content: ', value)
  }
})
```

content是打开编辑器时预置的内容，如果你不想预置任何内容可以不填此参数，当用户点击Close或主动调用`textEditorClose()`方法时会触发`onClose`回调，参数value为当前编辑器内的文本内容。

更多关于文本编辑器的使用方法见[文本编辑器](#文本编辑器)

### textEditorClose()

此方法用于关闭当前打开的文本编辑器，调用后会触发打开时的`onClose`回调。

```js
Terminal.$api.textEditorClose('my-terminal')
```

## 消息对象

本插件定义了消息对象，任何一个需要被以记录的形式显示在Terminal上的信息都是一个消息对象，`execCmd`事件的`success()`回调和`pushMessage`api都会用到它。

| 属性      | 说明                             | 类型                       | 可选值                               |
|---------|--------------------------------|--------------------------|-----------------------------------|
| content | 必填，消息内容，不同消息格式的内容格式不一样，具体规则见下文 | string、json、object、array | /                                 |
| type    | 消息格式类型，默认值为`normal`            | string                   | normal、json、code、table、html       |
| class   | 消息级别，仅类型为`normal`有效            | string                   | success、error、system、info、warning |
| tag     | 标签，仅类型为`normal`有效              | string                   | /                                 |

### normal 普通文本

content为字符串格式，支持html标签。它支持slot重写样式，详情见[Slots](#Slots)

> 此处支持的html标签与`html`类型的消息区别在于：`normal`消息的父元素是行内元素，`html`的父元素是块级元素

```json
{
  "type": "normal",
  "content": "This is a text message",
  "class": "success",
  "tag": "Tag success"
}
```

### json

[在线Demo演示](https://tzfun.github.io/vue-web-terminal/?cmd=json)

json类型的消息会被显示为json编辑窗口，type为`json`，content需传一个json对象。

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

[在线Demo演示](https://tzfun.github.io/vue-web-terminal/?cmd=code)

code类型消息可以更友好的显示代码和多行文本，type为`code`，content类型为字符串。它支持highlight和codemirror的高亮显示。

```json
{
  "type": "json",
  "content": "import Terminal from 'vue-web-terminal'\n\nVue.use(Terminal)"
}
```

#### highlight.js 代码高亮

code类型消息支持 `highlight.js` 高亮显示。

首先你需要配置 **Highlight.js**，在main.js入口安装，详细配置见[https://www.npmjs.com/package/highlight.js](https://www.npmjs.com/package/highlight.js)

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

vue2版本依赖推荐，vue3使用最新的版本即可

```json
{
  "@highlightjs/vue-plugin": "^1.0.2",
  "highlight.js": "^10.7.3"
}
```

#### codemirror 代码高亮

code类型消息也支持 `codemirror`
高亮显示，详细配置见[https://www.npmjs.com/package/vue-codemirror](https://www.npmjs.com/package/vue-codemirror)

同样只需要在main.js入口安装即可，vue2版本推荐：`"vue-codemirror": "^4.0.6"`

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

[在线Demo演示](https://tzfun.github.io/vue-web-terminal/?cmd=table)

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

[在线Demo演示](https://tzfun.github.io/vue-web-terminal/?cmd=ls)

type为`html`时可自定义内容格式，content为html标签构成

```js
function execCmd(key, command, success) {
  // ...
  success({
    type: 'html',
    content: `
          <ul class="custom-content">
            <li class="t-dir">dir 1</li>
            <li class="t-dir">dir 2</li>
            <li class="t-dir">dir 3</li>
            <li class="t-file">file 1</li>
            <li class="t-file">file 2</li>
            <li class="t-file">file 3</li>
          </ul>
          `
  })
  // ...
}
```

## 命令定义

用于help和命令帮助搜索，这里的命令定义仅作为显示用，没有具体的执行逻辑，命令的执行逻辑你应该在[Events](#Events)的`execCmd`事件中实现。

如果开启了命令帮助搜索功能，在实例化Terminal之前需要传入自定义命令库，传入的命令库为命令数组，以下是命令格式定义规则：

| 参数          | 说明                              | 类型     |
|-------------|---------------------------------|--------|
| key         | 命令关键字，必填                        | string |
| title       | 显示标题                            | string |
| group       | 分组，可自定义，内置的`help`命令可以按照此字段进行筛选  | string |
| usage       | 使用方法                            | string |
| description | 详细描述                            | string |
| example     | 使用示例，见[命令示例格式](#命令示例格式)         | array  |

### 命令示例格式

示例格式比较简单，它是一个json数组，json对象的`des`为描述，`cmd`为具体的命令，json格式如下：

```json
[
  {
    "des": "获取所有任务信息",
    "cmd": "task -o pack"
  },
  {
    "des": "获取任务进度",
    "cmd": "task -o query"
  }
]
```

### 命令Help

[在线Demo演示](https://tzfun.github.io/vue-web-terminal/?cmd=help%20open)

插件内置了help命令可以方便使用者查看命令的使用方法，前提是这些命令已经提前[定义](#命令定义)好了，通过help命令可以查看命令的key、分组、解释样例信息。

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
        "cmd": "help open"
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

## 高级功能

### 拖拽功能

开启拖拽功能需要将`showHeader`设置为true并配置`dragConf`，你可以通过dragConf的`width`和`height`来配置窗口大小，可以通过`init`控制窗口初始化位置，下面是一个简单的示例。

```vue

<terminal name="my-terminal"
          show-header
          :drag-conf="{width: 700, height: 500, init:{ x: 50, y: 50 }}">
</terminal>
```

dragConf完整配置结构如下：

| 参数     | 说明                                                                | 类型            |
|--------|-------------------------------------------------------------------|---------------|
| width  | 拖拽窗口宽度，可以是数字（单位px）也可以是百分比（相对于浏览器窗口）                               | number/string |
| height | 拖拽窗口高度，同宽度                                                        | number/string |
| zIndex | 窗口层级，默认100                                                        | number        |
| init   | 窗口初始化位置，如果不填则默认位置在浏览器窗口中央，其中x和y的单位为px，``` {"x": 700, "y": 500}``` | object        |

![dragging.gif](public/dragging.gif)

除了鼠标控制之外你还可以[调用API移动窗口位置](#dragging())

### 实时回显

[在线Demo演示](https://tzfun.github.io/vue-web-terminal/?cmd=flash)

Terminal默认的消息都是以追加的模式显示，当你只需要显示执行的过程，执行结束后这些内容不想存在于记录中的时候，实时回显是不错的选择。
例如`gradle`或`npm`下载依赖包时，下载进度条动画展示的过程。

在[Events](#Events)的`execCmd`事件回调中，`success`回调函数支持传入实时回显的处理对象。

通过`new Terminal.$Flash()`创建一个flash对象，传入success回调中，flash对象提供两个方法：

* `flush(string)`: 更新当前显示的内容
* `finish()`: 结束执行

```js
let flash = new Terminal.$Flash()
success(flash)

let count = 0
let flashInterval = setInterval(() => {
  flash.flush(`This is flash content: ${count}`)

  if (++count >= 20) {
    clearInterval(flashInterval)
    flash.finish()
  }
}, 200)
```

### 用户询问输入

[在线Demo演示](https://tzfun.github.io/vue-web-terminal/?cmd=ask)

当需要向用户询问时，使用此功能可以获取到用户输入的内容，例如登录时需要用户输入用户名密码的场景。

在[Events](#Events)的`execCmd`事件回调中，`success`回调函数支持传入用户输入的处理对象。

通过`new Terminal.$Ask()`创建一个新的ask对象，传入success回调中，ask对象提供两个方法：

* `ask(options)`: 发起一个用户询问输入，options是一个对象，其属性解释如下（*号表示必填）：
  * `question`: string，询问的问题，或者可以理解为用户输入的前缀字串
  * `callback`: function，用户键入回车时的回调，参数值为用户输入的内容
  * `autoReview`: bool，用户键入回车时是否自动追加当前的显示内容
  * `isPassword`: bool，是否是密码输入
* `finish()`: 结束执行

```js
let asker = new Terminal.$Ask()
success(asker)

asker.ask({
  question: 'Please input github username: ',
  autoReview: true,
  callback: value => {
    console.log(value)
    asker.ask({
      question: 'Please input github password: ',
      autoReview: true,
      isPassword: true,
      callback: () => {
        //    do something
        asker.finish()
      }
    })
  }
})
```

### 文本编辑器

[在线Demo演示](https://tzfun.github.io/vue-web-terminal/?cmd=edit)

#### 使用API
当要对多行文本编辑时可以使用API：`textEditorOpen()`、`textEditorClose()`，具体介绍详情请见[API](#Api)部分，下面是一个简单的示例：

```js
Terminal.$api.textEditorOpen(this.name, {
  content: 'Please edit this file',
  onClose: (value) => {
    console.log("用户编辑完成，文本结果：", value)
  }
})
```

#### Slot自定义样式

如果你对默认样式不太喜欢，可以使用Slot自定义编辑器的样式（比如改成 Codemirror或者VS Code ?），参数为data，其中data有三个属性是你需要关心的：

* `value`：编辑的文本内容，你需要在你实现的编辑器中用`v-model`绑定它
* `onFoucs`：获取焦点事件，你需要在你实现的编辑器中绑定`@focus`事件
* `onBlur`：失去焦点事件，你需要在你实现的编辑器中绑定`@blur`事件

**自定义快捷键**

插件提供了一个`onKeydown`事件，此事件是你控制**活跃状态**下Terminal快捷键最好的方法，这里以文本编辑器为例，设定用户按快捷键`Ctrl + S`就表示完成编辑并保存

```vue
<template>
  <terminal :name="name" @execCmd="onExecCmd" @onKeydown="onKeydown">
    <template #textEditor="{ data }">
      <textarea name="editor" 
                class="text-editor" 
                v-model="data.value"
                @focus="data.onFocus" 
                @blur="data.onBlur"></textarea>
      
      <div class="text-editor-floor" align="center">
        <button class="text-editor-floor-btn" @click="_textEditorClose">Save & Close</button>
      </div>
      
    </template>
  </terminal>
</template>

<script>
import Terminal from "vue-web-terminal";

export default {
  name: "TerminalOldDemo",
  components: {Terminal},
  data() {
    return {
      name: "my-terminal",
      enableTextEditor: false
    }
  },
  method: {
    onExecCmd(key, command, success, failed) {
      if (key === 'edit') {
        Terminal.$api.textEditorOpen(this.name, {
          content: 'Please edit this file',
          onClose: (value) => {
            this.enableTextEditor = false
            success({
              type: "code",
              content: value
            })
          }
        })
        this.enableTextEditor = true
      }
    },
    onKeydown(event) {
      if (this.enableTextEditor && event.key === 's' && event.ctrlKey) {
        this._textEditorClose()
        event.preventDefault()
      }
    },
    _textEditorClose() {
      Terminal.$api.textEditorClose(this.name)
    }
  }
}
</script>
```

# 关于作者

我是一名后端Coder，对前端仅会一点皮毛，因为兴趣以及工作需要开发了此插件，当你看到此插件拙劣的源码时还请轻喷。

如果对代码优化或功能有好的想法并乐意贡献代码欢迎提交[PR](https://github.com/tzfun/vue-web-terminal/pulls)，对插件使用存在疑问或发现bug请提交[issue](https://github.com/tzfun/vue-web-terminal/issues)。

> 联系
>
> 📮 *beifengtz@qq.com*
>
> ![](https://open.weixin.qq.com/zh_CN/htmledition/res/assets/res-design-download/icon16_wx_logo.png) *beifeng-tz*（添加请备注vue-web-terminal）

# License

[Apache License 2.0](LICENSE)
