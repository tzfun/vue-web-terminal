## Type Definition
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

This plugin defines a common message structure. Any information that needs to be displayed on the Terminal in the form of a record is a message object.
The `success()` callback of the [exec-cmd](./events#exec-cmd) event and the [pushMessage](./api#pushmessage) api will use it.

| Prop    | Description                                                                                                                    | Type                          | Options                           |
|---------|--------------------------------------------------------------------------------------------------------------------------------|-------------------------------|-----------------------------------|
| content | Required. The specific content, the content type of different message formats is different, the specific rules are as follows. | string、json、object、array、ansi | /                                 |
| type    | Message format type, default is `normal`.                                                                                      | string                        | normal、json、code、table、html       |
| class   | Message level, only valid for type `normal`.                                                                                   | string                        | success、error、system、info、warning |
| tag     | Display label, only valid for type `normal`.                                                                                   | string                        | /                                 |


#### normal

Normal text string format, type is `normal`, supports html tags. It supports slot rewriting style, see [Slots](./slots) for details

::: tip
The difference between the html tags supported here and the `html` type messages is that the parent element of normal messages is an inline element, while the parent element of html is a block-level element.
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
Messages of type json will be displayed as a json editing window, type is `json`, and content needs to pass a json object.

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

Code type messages can display code and multi-line text more friendly, type is `code`, content type is string. It supports **highlight** and **codemirror** highlighting.

```json
{
  "type": "json",
  "content": "import Terminal from 'vue-web-terminal'\n\nVue.use(Terminal)"
}
```

##### highlight

`code` type messages support highlighting with `highlight.js`. You need to introduce dependencies and connect to it in your project.

First you need to configure Highlight.js in the main.js entry. For detailed configuration, see [highlight.js in npm][highlight.js in npm]

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
The vue2 version needs to find the corresponding dependency version.
The latest version applicable to vue3 may not be applicable to vue2. 
The following is the corresponding Vue2 version used by the author during testing.

```json
{
  "@highlightjs/vue-plugin": "^1.0.2",
  "highlight.js": "^10.7.3"
}
```
:::

##### codemirror

`code` type messages also support codemirror highlighting, see [codemirror.js in npm][codemirror.js in npm] for detailed configuration

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
Like highlight.js, you also need to pay attention to the version issue when choosing codemirror. 
Vue2 and Vue3 versions are not necessarily compatible. 
The author used the Vue2 version during testing: `"vue-codemirror": "^4.0.6"`
:::

##### Custom highlight

If you have your own code highlighting implementation, or think that the default implementation of highlight and 
codemirror is not flexible enough, you can choose to use [slots](./slots) to rewrite it.

#### table

Table type display, type is `table`, content is table configuration, where `head` is the table header, 
`rows` is the data of each row, and html tags are supported.

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

When type is `html`, you can customize the content format, and content is composed of html tags.

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

When type is `ansi`, ANSI control code style can be displayed. 
**Currently only color control is supported, including *xterm-256color* color system, other control codes will be filtered**

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

Used for help and command help search. The command definition here is only for display and has no specific execution logic. 
You should implement the command execution logic in the [exec-cmd](./events#exec-cmd) event.

If the command help search function is enabled, you need to pass in a custom command library before instantiating Terminal. 
The command library passed in is a command array. The following are the command format definition rules:

| Prop        | Description                                                                   | Type               |
|-------------|-------------------------------------------------------------------------------|--------------------|
| key         | Command keyword, required.                                                    | string             |
| title       | Display title.                                                                | string             |
| group       | grouping, customizable, The built-in `help` command can filter by this field. | string             |
| usage       | How to use the command.                                                       | string             |
| description | Detailed description of the command.                                          | string             |
| example     | For usage examples, see [CommandExample](#CommandExample)                     | CommandExample[]   |

### CommandExample

```ts
type CommandExample = {
    des?: string,
    cmd?: string
}
```

Example:

```json
{
    "des": "Get all task information",
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

### InputTipsItem

```ts
type InputTipItem = {
    content: string,
    description?: string,
    command?: Command
}
```

## Internal Commands

The plugin has several built-in commands that provide some basic functions. 
If they conflict with your commands, you can use the [enable-default-command](./attributes#enable-default-command) 
attribute to disable the default command function, and then customize your command in the [exec-cmd](./events#exec-cmd) event.

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

The built-in `help` command of the plugin can help users view the usage of commands, 
provided that these commands have been defined in advance. Through the help command, users can view the command key, grouping, 
and explanation sample information.

```shell:no-line-numbers
# Show all command information
help

# Fuzzy search command, search for commands with the build prefix
help build*

# Fuzzy search name, search for commands with event
help *event*

# Search by group. The search keyword needs to start with ":" to search for all commands grouped as server
help :server
```

### clear

The internal `clear` command of the plugin can clear the current screen record and clear the historical command record.

```shell:no-line-numbers
# Clear current screen record
clear

# Clear command history
clear history
```

### open

The plugin's built-in `open` command can open a web address in the browser.

```shell:no-line-numbers
# Open Google
open www.google.com

# Open the author's GitHub homepage
open https://github.com/tzfun
```

<CommentService></CommentService>


[highlight.js in npm]: https://www.npmjs.com/package/highlight.js
[codemirror.js in npm]: https://www.npmjs.com/package/vue-codemirror
