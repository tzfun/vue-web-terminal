# 高级功能

## 拖拽功能

插件提供了拖拽功能，开启后Terminal窗口将是一个 `fixed` 定位的容器，它的拖拽范围在整个浏览器窗口之内，同时还提供了窗口大小缩放和固定的功能，缩放触控区域在窗口的四个角上。

开启拖拽功能需要将 [show-header](./attributes#show-header) 设置为`true`并配置 [drag-conf](./attributes#drag-conf)，
你可以通过 [DragConfig](./others#dragconfig) 的 `width` 和 `height` 来配置窗口初始化大小，可以通过 `init` 控制窗口初始化位置，下面是一个简单的示例。

```vue
<terminal name="my-terminal"
          show-header
          :drag-conf="{width: 700, height: 500, init:{ x: 50, y: 50 }, pinned: false}">
</terminal>
```

[DragConfig](./others#dragconfig)的配置说明如下：

| 参数     | 说明                                            | 类型                            |
|--------|-----------------------------------------------|-------------------------------|
| width  | 拖拽窗口宽度，可以是数字（单位px）也可以是百分比（相对于浏览器窗口）           | number/string                 |
| height | 拖拽窗口高度，同宽度                                    | number/string                 |
| zIndex | 窗口层级，此值可以修改并被terminal监听，可用于多窗口层级的控制，默认100     | number                        |
| init   | 窗口初始化位置，如果不填则默认位置在浏览器窗口中央，其中x和y的单位为px         | [Position](./others#Position) |
| pinned | 固定窗口，固定后将无法拖拽，当点击按钮修改此值时会在`on-click`事件中触发 pin | boolean                       |

除了鼠标控制之外你还可以调用 [dragging](./api#dragging) API移动窗口位置

![dragging.gif](/images/dragging.gif)

## 实时回显

Terminal默认的消息都是以追加的模式显示，当你只需要显示执行的过程，执行结束后这些内容不想存在于记录中的时候，实时回显是不错的选择。 
例如`gradle`或`npm`下载依赖包时，下载进度条动画展示的过程。

在 [exec-cmd](./events.md#exec-cmd) 事件回调中，`success`回调函数支持传入实时回显的处理对象 **TerminalFlash**。

通过`new TerminalFlash()`创建一个flash对象，传入success回调中，flash对象提供两个方法：
- `flush(string)`: 更新当前显示的内容
- `finish()`: 结束执行

```js
import {TerminalFlash} from 'vue-web-terminal'

const onExecCmd = (key, command, success, failed) => {

    let flash = new TerminalFlash()
    success(flash)

    let count = 0
    let flashInterval = setInterval(() => {
        flash.flush(`This is flash content: ${count}`)

        if (++count >= 20) {
            clearInterval(flashInterval)
            flash.finish()
        }
    }, 200)
    
}
```

## 询问输入

当需要向用户询问时，使用此功能可以获取到用户输入的内容，例如登录时需要用户输入用户名密码的场景。

在 [exec-cmd](./events.md#exec-cmd) 事件回调中，`success`回调函数支持传入用户输入的处理对象 **TerminalAsk**。

通过 `new TerminalAsk()` 创建一个ask对象，传入success回调中，ask对象提供两个方法：

- `ask(options)`: 发起一个用户询问输入，options是一个对象，其属性解释如下：
  - `question`: string，询问的问题，或者可以理解为用户输入的前缀字串
  - `callback`: function，用户键入回车时的回调，参数值为用户输入的内容
  - `autoReview`: boolean，用户键入回车时是否自动追加当前的显示内容
  - `isPassword`: boolean，是否是密码输入
- `finish()`: 结束执行

```js
import {TerminalAsk} from 'vue-web-terminal'

const onExecCmd = (key, command, success, failed) => {
    let asker = new TerminalAsk()
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
}
```

## 文本编辑器

### 使用
当你需要在 Terminal 内编辑文本时，可以考虑使用内置的文本编辑器，它需要借助到两个 API：[textEditorOpen](./api.md#texteditoropen)、[textEditorClose](./api.md#texteditorclose) 

一个简单示例：

```js
const onExecCmd = (key, command, success, failed) => {
    TerminalApi.textEditorOpen('my-terminal', {
        content: 'Please edit this file',
        onClose: (value, options) => {
            console.log("用户编辑完成，文本结果：", value, "options:", options)
        }
    })
}

const closeEditor = () => {
    TerminalApi.textEditorClose('my-terminal', { fromUser: false })
}
```

### Slot自定义样式

如果你对默认样式不太喜欢，可以使用 [Slot](./slots.md) 自定义编辑器的样式，比如改为 Codemirror或者VS Code等带有高亮功能的编辑器，其中 slot 的data有三个属性时你需要关心的：
- `value`: 编辑的文本内容，你需要在你实现的编辑器中用`v-model`绑定它
- `onFocus`: 获取焦点事件，你需要在你实现的编辑器中绑定`@focus`事件
- `onBlur`: 失去焦点事件，你需要在你实现的编辑器中绑定`@blur`事件

### 自定义快捷键

插件提供了一个 `onKeydown` 事件，此事件是你控制 **活跃状态** 下Terminal快捷键最好的方法，这里以文本编辑器为例，设定用户按快捷键 `Ctrl + S` 就表示完成编辑并保存

```vue
<template>
  <terminal :name="name" @exec-cmd="onExecCmd" @on-keydown="onKeydown">
    <template #textEditor="{ data }">
      <textarea name="editor"
                class="t-text-editor"
                v-model="data.value"
                @focus="data.onFocus"
                @blur="data.onBlur"></textarea>

      <div class="t-text-editor-floor" align="center">
        <button class="t-text-editor-floor-btn" @click="_textEditorClose(false)">Cancel</button>
        <button class="t-text-editor-floor-btn" @click="_textEditorClose(true)">Save & Close</button>
      </div>

    </template>
  </terminal>
</template>

<script>
import { TerminalApi } from "vue-web-terminal";

export default {
  name: "TerminalDemo",
  data() {
    return {
      name: "my-terminal",
      enableTextEditor: false
    }
  },
  method: {
    onExecCmd(key, command, success, failed, name) {
      if (key === 'edit') {
        TerminalApi.textEditorOpen(this.name, {
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
        this._textEditorClose(true)
        event.preventDefault()
      }
    },
    _textEditorClose(option) {
      TerminalApi.textEditorClose(this.name, option)
    }
  }
}
</script>
```

<CommentService></CommentService>
