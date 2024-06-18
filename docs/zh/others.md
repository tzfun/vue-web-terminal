## 类型定义
<img src="https://shields.io/github/package-json/v/tzfun/vue-web-terminal/vue2" style="margin-right: 8px;">
<img src="https://shields.io/github/package-json/v/tzfun/vue-web-terminal/vue3" style="margin-right: 8px;">

### Message

```ts
type Message = {
    type?: 'normal' | 'json' | 'code' | 'table' | 'html' | 'ansi';
    content: string | number | object | MessageContentTable | Array<any>;
    class?: 'success' | 'error' | 'info' | 'warning' | 'system';
    tag?: string;
    depth?: number;
};
```

本插件定义了一个通用的消息结构，任何一个需要被以记录的形式显示在Terminal上的信息都是一个消息对象，[exec-cmd](./events#exec-cmd)事件的 `success()` 回调和[pushMessage](./api#pushmessage) api都会用到它。

| 属性      | 说明                             | 类型                       | 可选值                               |
|---------|--------------------------------|--------------------------|-----------------------------------|
| content | 必填，消息内容，不同消息格式的内容格式不一样，具体规则见下文 | string、json、object、array | /                                 |
| type    | 消息格式类型，默认值为`normal`            | string                   | normal、json、code、table、html、ansi  |
| class   | 消息级别，仅类型为`normal`有效            | string                   | success、error、system、info、warning |
| tag     | 标签，仅类型为`normal`有效              | string                   | /                                 |


#### normal 普通文本

普通文本字符串格式，type为`normal`，支持html标签。它支持slot重写样式，详情见[Slots](./slots)

::: tip
此处支持的html标签与 `html` 类型的消息区别在于：normal消息的父元素是行内元素，html的父元素是块级元素
:::

```json
{
  "type": "normal",
  "content": "This is a text message",
  "class": "success",
  "tag": "Tag success"
}
```

#### json
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

#### code

code类型消息可以更友好的显示代码和多行文本，type为`code`，content类型为字符串。它支持 **highlight** 和 **codemirror** 的高亮显示。

```json
{
  "type": "json",
  "content": "import Terminal from 'vue-web-terminal'\n\nVue.use(Terminal)"
}
```

##### highlight代码高亮
code类型消息支持`highlight.js`高亮显示，需要你在自己的工程中引入依赖并接入

首先你需要在 main.js 入口配置 Highlight.js，详细配置见[highlight.js in npm][highlight.js in npm]

::: code-tabs#js

@tab Vue2
```js
import {Terminal, configHighlight} from 'vue-web-terminal'
import hljs from 'highlight.js'
import java from 'highlight.js/lib/languages/java'
import vuePlugin from "@highlightjs/vue-plugin"
import 'highlight.js/styles/tomorrow-night-bright.css'

Vue.use(vuePlugin)
Vue.use(Terminal)

hljs.registerLanguage('java', java)
configHighlight(true)
```

@tab Vue3

```js
import {Terminal, configHighlight} from 'vue-web-terminal'
import hljs from 'highlight.js'
import java from 'highlight.js/lib/languages/java'
import vuePlugin from "@highlightjs/vue-plugin"
import 'highlight.js/styles/tomorrow-night-bright.css'

const app = createApp(App)
app.use(vuePlugin)
app.use(Terminal)

hljs.registerLanguage('java', java)
configHighlight(true)
```
:::

::: tip
vue2版本需要找对应的依赖版本，最新的适用于vue3不一定适用于vue2，下面是作者在测试时使用的对应Vue2的版本

```json
{
  "@highlightjs/vue-plugin": "^1.0.2",
  "highlight.js": "^10.7.3"
}
```
:::

##### codemirror代码高亮

code类型消息也支持 codemirror 高亮显示，详细配置见[codemirror.js in npm][codemirror.js in npm]

::: code-tabs#js

@tab Vue2
```js
import {Terminal, configCodemirror} from 'vue-web-terminal'
import VueCodemirror from 'vue-codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/darcula.css'
import 'codemirror/mode/clike/clike.js'
import 'codemirror/addon/edit/closebrackets.js'

Vue.use(VueCodemirror)
Vue.use(Terminal)

configCodemirror({
  tabSize: 4,
  mode: 'text/x-java',
  theme: "darcula",
  lineNumbers: true,
  line: true,
  smartIndent: true
})
```

@tab Vue3
```js
import {Terminal, configCodemirror} from 'vue-web-terminal'
import VueCodemirror from 'vue-codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/darcula.css'
import 'codemirror/mode/clike/clike.js'
import 'codemirror/addon/edit/closebrackets.js'

const app = createApp(App)
app.use(VueCodemirror)
app.use(Terminal)

configCodemirror({
  tabSize: 4,
  mode: 'text/x-java',
  theme: "darcula",
  lineNumbers: true,
  line: true,
  smartIndent: true
})
```
:::

::: tip
和 highlight.js 一样，codemirror在选择时也需要注意版本问题，vue2和vue3版本不一定兼容，作者在测试时使用的vue2版本：`"vue-codemirror": "^4.0.6"`
:::

##### 自定义高亮

如果你有自己的代码高亮显示实现，或者认为插件默认实现的 highlight 和 codemirror 不够灵活，可以选择使用 [插槽 Slots](./slots) 去重写它。

#### table

表格类型显示，type为`table`，content此时为表格配置，其中`head`为表头，`rows`为每行的数据，支持html标签

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

#### html

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

#### ansi

type为`ansi`时可以显示ANSI控制码样式，**目前仅支持着色控制，包含 *xterm-256color* 色系，其余控制码会被过滤**

```js
function execCmd(key, command, success) {
    // ...
    success({
        type: 'ansi',
        content: '\x1B[1;34mThis are some blue text.\x1B[0m\n\x1B[30;43mThis is a line of text with a background color.\x1B[0m\n\x1B[92;5mThis is blink text.\x1B[0m'
    })
    // ...
}
```

### Command

```ts
type Command = {
    key: string;
    title?: string;
    group?: string;
    usage?: string;
    description?: string;
    example?: Array<CommandExample>;
};
```

用于help和命令帮助搜索，这里的命令定义仅作为显示用，没有具体的执行逻辑，命令的执行逻辑你应该在 [exec-cmd](./events#exec-cmd) 事件中实现。

如果开启了命令帮助搜索功能，在实例化Terminal之前需要传入自定义命令库，传入的命令库为命令数组，以下是命令格式定义规则：

| 参数          | 说明                                       | 类型               |
|-------------|------------------------------------------|------------------|
| key         | 命令关键字，必填                                 | string           |
| title       | 显示标题                                     | string           |
| group       | 分组，可自定义，内置的`help`命令可以按照此字段进行筛选           | string           |
| usage       | 使用方法                                     | string           |
| description | 详细描述                                     | string           |
| example     | 使用示例，见[CommandExample](#CommandExample)  | CommandExample[] |

### CommandExample

```ts
type CommandExample = {
    des?: string,
    cmd?: string
}
```

示例
```json
{
    "des": "获取所有任务信息",
    "cmd": "task -o pack"
  }
```

### DragConfig
```ts
type DragConfig = {
    width: string | number;
    height: string | number;
    zIndex?: string;
    init?: Position;
    pinned: boolean;
};
```


### MessageContentTable

```ts
type MessageContentTable = {
    head: string[];
    rows: string[][];
};
```

### TerminalElementInfo

```ts
type TerminalElementInfo = {
    pos: Position,
    screenWidth: number,
    screenHeight: number,
    clientWidth: number,
    clientHeight: number,
    charWidth: CharWidth
}
```

### CharWidth

```ts
type CharWidth = {
    en: number,
    cn: number
}
```

### Position

```ts
type Position = {
    x: number,
    y: number
}
```

### EditorSetting

```ts
type EditorSetting = {
    content: string,
    onClose: Function,
}
```

## 内置命令

插件内置了几个命令，这些命令提供了一些基础的功能，如果它们和你的命令冲突了，可以使用 [enable-default-command](./attributes#enable-default-command) 
属性来关闭默认命令功能，然后在 [exec-cmd](./events#exec-cmd) 事件中自定义实现你的命令。

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

### help

插件内置的`help`命令可以方便使用者查看命令的使用方法，前提是这些命令已经提前定义好了，通过help命令可以查看命令的key、分组、解释样例信息。

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

### clear

插件内置的`clear`命令可以实现清除当前屏幕记录和清除历史命令记录

```shell
# 清除当前屏幕记录
clear

# 清除命令历史记录
clear history
```

### open

插件内置的`open`命令可以在浏览器中打开一个网页地址

```shell
# 打开谷歌
open www.google.com

# 打开作者GitHub主页
open https://github.com/tzfun
```

<CommentService></CommentService>


[highlight.js in npm]: https://www.npmjs.com/package/highlight.js
[codemirror.js in npm]: https://www.npmjs.com/package/vue-codemirror