# API
<img src="https://shields.io/github/package-json/v/tzfun/vue-web-terminal/vue2" style="margin-right: 8px;">
<img src="https://shields.io/github/package-json/v/tzfun/vue-web-terminal/vue3" style="margin-right: 8px;">

本插件提供了一些JS API，可以主动触发或捕获插件的行为，也可以通过这些API模拟用户的部分行为。

## 调用方法

要调用API接口你需要先指定到某一个Terminal实例，再调用相应的API方法，在同一个页面中可能会有多个Terminal实例，
插件区分这些不同的实例就是通过[name](./attributes#name)属性来实现的，因此 name 属性应该是全局唯一的。

有两种方法可以调用对应实例的接口：全局调用、Ref调用

### 全局调用

这种方法可以在任何地方调用到任何一个 name 的Terminal，相比于`Ref调用`它不需要依赖于Vue的引用传递，相对来说更灵活，但调用它的前提是需要有指定Terminal的name。

使用方法是通过引入全局API `TerminalApi` 调用接口，所有接口入参的第一个都是Terminal的name值，之后的参数就是对应接口的参数值。

```vue
<template>
  <terminal name="my-terminal"></terminal>
</template>

<script>
  import { TerminalApi } from 'vue-web-terminal';
  
  export default {
    methods: {
        invokeApi() {
            TerminalApi.pushMessage('my-terminal', "hello world!");
        }
    }  
  }
</script>
```



### Ref调用

这种调用方式依赖于Vue中的 Ref 引用，获取到指定Dom的Ref即可调用插件的API，且无需传递Terminal的name值

::: code-tabs#vue
@tab Vue2

```vue
<template>
  <terminal name="my-terminal" ref="myTerminalRef"></terminal>
</template>

<script>
  export default {
    methods: {
        invokeApi() {
            this.$refs.myTerminalRef.pushMessage("hello world!")
        }
    }  
  }
</script>
```

@tab Vue3

```vue
<template>
  <terminal name="my-terminal" ref="myTerminalRef"></terminal>
</template>

<script setup>
const myTerminalRef = ref(null)

const invokeApi = () => {
  myTerminalRef.pushMessage("hello world!")
}
</script>
```
:::

## 接口方法

### pushMessage

- **说明**：向Terminal推送一条或多条消息
- **定义**：
```ts:no-line-numbers
type pushMessage = (message: string | Message | Message[]) => void;
```
- **示例**：

```js
//  推送一条文本
TerminalApi.pushMessage('my-terminal', 'Hello world!')

//  推送一条消息
TerminalApi.pushMessage('my-terminal', {
    class: 'warning',
    tag: 'WARN',
    content: 'This is warning message!'
})

//  推送多条消息
TerminalApi.pushMessage('my-terminal', [
    {content: 'message 1'},
    {content: 'message 2', class: 'info'},
    {content: 'message 3', class: 'success'},
])
```
- **引用**：
  - [Message](./others#message)

### appendMessage

- **说明**：向最后一条消息追加内容。仅当最后一条消息存在，且其消息类型为 `normal`、`ansi`、`code`、`html`其中一个时才会追加，否则推送一条新消息。
- **定义**：
```ts:no-line-numbers
type appendMessage = (msg: string) => void;
```
- **示例**：
```js
TerminalApi.appendMessage('my-terminal', "This is additional content")
```

### fullscreen

- **说明**：切换全屏状态
- **定义**：
```ts:no-line-numbers
type fullscreen = () => void;
```
- **示例**：
```js
TerminalApi.fullscreen('my-terminal')
```

### isFullscreen

- **说明**：判断当前窗口是否处于全屏状态
- **定义**：
```ts:no-line-numbers
type isFullscreen = () => boolean;
```
- **示例**：
```js
let isFullscreen = TerminalApi.isFullscreen('my-terminal')
console.log(isFullscreen)
```

### dragging

- **说明**：当开启拖拽功能时可以使用这种方式来改变窗口位置，其中参数`x`是terminal左边框到浏览器可视范围左边框的距离，`y`是terminal上边框到浏览器可视范围上边框的距离，单位px。
- **定义**：
```ts:no-line-numbers
type dragging = (pos: Position) => void;
```
- **示例**：
```js
TerminalApi.dragging('my-terminal', { x: 100, y: 200 })
```
- **引用**：
  - [Position](./others.md#position)

### execute

- **说明**：向Terminal执行一个命令，执行过程会回显在Terminal窗口中，这是一种用JS模拟用户执行命令的方式
- **定义**：
```ts:no-line-numbers
type execute = (cmd: string) => void;
```
- **示例**：
```js
TerminalApi.execute('my-terminal', 'help :local')
```

### focus

- **说明**：获取Terminal输入焦点，插件内有三处输入点：
  - 命令行输入，focus方法传入 true 则表示强制获取输入焦点，否则只会获得光标焦点并使terminal触发on-active事件。
  - Ask用户输入，当处于ask模式下获取相应的输入焦点
  - 文本编辑器输入，当处于文本编辑模式下获取相应的输入框焦点，如果你用了slot来自定义实现，需要在slot中提供focus事件的入口
- **定义**：
```ts:no-line-numbers
type focus = (enforceFocus?: boolean | MouseEvent) => void;
```
- **示例**：
```js
TerminalApi.focus('my-terminal', true)
```

### elementInfo

- **说明**：获取Terminal窗口DOM信息，你可以通过此 API 获取Terminal的窗口宽度高度、显示内容的宽度高度、所在位置、单字符宽度等，单位为px

::: tip 注意
如果你的窗口已创建但未显示在页面（比如用了v-show控制显示），可能会出现部分信息失效的问题。
:::

- **定义**：
```ts:no-line-numbers
type elementInfo = () => TerminalElementInfo;
```
- **示例**：
```js
let info = TerminalApi.elementInfo('my-terminal')
console.log(info)
```
- **结果示例**：
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
- **引用**：
  - [Position](./others#position)
  - [CharWidth](./others#charwidth)
  - [TerminalElementInfo](./others#terminalelementinfo)


下面这张图清晰地描述了这些值的含义：
![terminal-ele-info](/images/ele-info.png)

### textEditorOpen

- **说明**：打开文本编辑器，打开时可以传入初始文本内容，并定义关闭事件回调。`content`是打开编辑器时预置的内容，如果你不想预置任何内容可以不填此参数，当用户点击Close或主动调用 `textEditorClose()` 方法时会触发`onClose`回调，参数value为当前编辑器内的文本内容和传入参数选项。
- **定义**：
```ts:no-line-numbers
type textEditorOpen = (setting: EditorSetting) => any;
```
- **示例**：
```js
TerminalApi.textEditorOpen('my-terminal', {
    content: 'This is the preset content',
    onClose: (value, options) => {
        console.log('Final content: ', value, "options:", options)
    }
})
```
- **引用**：
  - [EditorSetting](./others#editorsetting)

### textEditorClose

- **说明**：关闭当前打开的文本编辑器，调用后会触发打开时的onClose回调，options值会作为参数传给回调函数。
- **定义**：
```ts:no-line-numbers
type textEditorClose = (options: any) => string;
```
- **示例**：
```js
TerminalApi.textEditorClose('my-terminal', true)

TerminalApi.textEditorClose('my-terminal', 'hello! this is close options')
```

### clearLog

- **说明**：清除当前屏幕日志，如果传入参数为 true 则同时清除历史指令记录
- **定义**：
```ts:no-line-numbers
type clearLog = (clearCommandHistory?: boolean) => void;
```
- **示例**：
```js
//  clear screen log
TerminalApi.clearLog('my-terminal')

//  clear command history log
TerminalApi.clearLog('my-terminal', true)
```

### getCommand

- **说明**：获取当前正在输入的指令
- **定义**：
```ts:no-line-numbers
type getCommand = () => string;
```
- **示例**：
```js
TerminalApi.getCommand('my-terminal')
```

### setCommand

- **说明**：修改当前正在输入的指令
- **定义**：
```ts:no-line-numbers
type setCommand = (command: string) => void;
```
- **示例**：
```js
TerminalApi.setCommand('my-terminal', "customCmd -a hello")
```

### switchAllFoldState

- **说明**：折叠或展开所有命令分组
- **定义**：
```ts:no-line-numbers
type switchAllFoldState = (name: string, state: boolean) => number;
```
- **示例**：
```js
// 折叠所有命令分组
TerminalApi.switchAllFoldState('my-terminal', true)

// 展开所有命令分组
TerminalApi.switchAllFoldState('my-terminal', false)
```

<CommentService></CommentService>
