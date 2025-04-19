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

Code type messages can display code and multi-line text more friendly, type is `code`, content type is string.

```json
{
  "type": "code",
  "content": "import Terminal from 'vue-web-terminal'\n\nVue.use(Terminal)"
}
```

##### Custom highlight

If you have your own code highlighting implementation, you can choose to use [slots](./slots) to rewrite it.

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

```ts
import {SuccessFunc} from "vue-web-terminal";

function execCmd(key: string, command: string, success: SuccessFunc) {
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

```ts
import {SuccessFunc} from "vue-web-terminal";

function execCmd(key: string, command: string, success: SuccessFunc) {
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
