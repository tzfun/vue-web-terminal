[中文版](./README_ZH.md) | English

# vue-web-terminal

<a href="https://npmcharts.com/compare/vue-web-terminal?minimal=true"><img src="https://img.shields.io/npm/dm/vue-web-terminal.svg" alt="Downloads"></a>
<a href="https://npmcharts.com/compare/vue-web-terminal?minimal=true"><img src="https://img.shields.io/npm/dt/vue-web-terminal.svg" alt="Downloads"></a>
<a href="https://npmcharts.com/compare/vue-web-terminal?minimal=true"><img src="https://img.shields.io/npm/v/vue-web-terminal.svg" alt="Version"></a>

A web-side command line plugin built by `Vue`, supports multiple message formats such as tables, json, and codes, supports custom message styles, command line libraries, typing search prompts, etc., and simulates native terminal support ← → cursor toggle and ↑ ↓ history command toggle.

## Feature Support

* Supported message formats: `text`, `table`, `json`, `code`/multiline text, `html`
* Support [Flash](#Flash) real-time echo
* Support user input
* `Highlight.js`, `Codemirror.js` code highlighting
* ← → key cursor switch
* ↑ ↓ key history command toggle
* Full-screen display
* Window drag
* Custom command library
* User inputting filter
* Command search prompt, use the `Tab` key to quickly fill
* Multiple lots support custom styles
* Support API interface: execute command, push message, simulate drag and drop, get position, full screen, modify context, etc.

![vue-web-terminal](./public/vue-web-terminal.gif)

> It does not have the ability to execute a specific command. This ability needs to be implemented by the developer. What it is responsible for is to get the command to be executed from the user in the form of an interface, and then hand it over to the developer to implement and execute. After that, hand it over to show it to the user

# Online Experience

Demo：[https://tzfun.github.io/vue-web-terminal/](https://tzfun.github.io/vue-web-terminal/)

[![Edit Vue Template](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/silly-scooby-l8wk9b)

# Quick Start

Install vue-web-terminal by npm

```shell
//  install for vue2
npm install vue-web-terminal@2.xx --save

//  install for vue3
npm install vue-web-terminal@3.xx --save 
```

Use Terminal plugin in `main.js`

```js
import Terminal from 'vue-web-terminal'

// for vue2
Vue.use(Terminal)

// for vue3
const app = createApp(App)
app.use(Terminal)
```

Example:

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

# Document

## Attributes

Terminal tag supports attribute parameter table.

| Argument                | Description                                                                                                                                                  | Type     | Default                                          |
|-------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|--------------------------------------------------|
| name                    | Terminal instance name, the name of the same vue instance must be unique, this value is also used in Api.                                                    | string   | terminal                                         |
| context                 | Initialize context text.                                                                                                                                     | string   | /vue-web-terminal                                |
| title                   | The title displayed in the header.                                                                                                                           | string   | vue-web-terminal                                 |
| show-header             | Whether to display the header, this switch will affect the drag and drop function.                                                                           | boolean  | true                                             |
| init-log                | The log displayed when Terminal is initialized. It is an array composed of [Message](#Message), `null` is not displayed.                                     | array    | /                                                |
| init-log-delay          | The interval between each log when initializing the display log, in milliseconds.                                                                            | number   | 150                                              |
| ~~show-log-time~~       | Whether to display the time when the message **type** is `normal`. **`2.0.14` and `3.0.13` versions have been removed**.                                     | boolean  | true                                             |
| ~~warn-log-byte-limit~~ | The current Terminal log occupied memory size exceeds this limit will issue a warning, the unit `byte`. **`2.1.0` and `3.1.0` versions have been removed**.  | number   | 1024 * 1024 * 10                                 |
| warn-log-count-limit    | If the current Terminal log number exceeds this limit, a warning will be issued.                                                                             | number   | 200                                              |
| warn-log-limit-enable   | Whether to enable log limit warning.                                                                                                                         | boolean  | true                                             |
| auto-help               | Whether to enable the command line automatic search prompt function.                                                                                         | boolean  | true                                             |
| enable-example-hint     | Whether to show sample prompts.                                                                                                                              | boolean  | true                                             |
| command-store           | Customized command library, the search prompt function will scan this library, see [Command Definition](#Command)                                            | array    | [Local Commands](#Local)                         |
| command-store-sort      | Command line library sorting function.                                                                                                                       | function | function(a,b)                                    |
| input-filter            | Custom input filter, the return value is the filtered string.                                                                                                | function | function(当前输入字符char, 输入框内字符串value, input事件event) |
| drag-conf               | Drag and drop window configuration items.                                                                                                                    | object   | [Drag](#Drag)                                    |
| command-formatter       | Command display formatting function, pass in the current command and return a new command, support html                                                      | function | function(cmd)                                    |
## Events

Terminal tag support event table

| Event name    | Description                                                                                                                                                                                                                                                          | Callback arguments                         |
|---------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------|
| execCmd       | Fired when a custom command is executed. `success` and `failed` are callback functions, **must call one of the two callbacks before echoing!**, the meaning of the `success` callback parameter is described below, and the `failed` callback parameter is a string. | `(cmdKey, command, success, failed, name)` |
| beforeExecCmd | Triggered before the user presses Enter to execute the command.                                                                                                                                                                                                      | `(cmdKey, command, name)`                  |
| onKeydown     | When the cursor focus is obtained, press any keyboard to trigger.                                                                                                                                                                                                    | `(event, name)`                            |
| onClick       | Triggered when the user clicks the button, the parameter `key` is the unique identification of the button, there are buttons: `close`, `minScreen`, `fullScreen`, `title`.                                                                                           | `(key, name)`                              |
| initBefore    | Lifecycle function, triggered before plugin initialization.                                                                                                                                                                                                          | `(name)`                                   |
| initComplete  | Lifecycle function, triggered after plugin initialization is complete.                                                                                                                                                                                               | `(name)`                                   |

**Special note**: The `success` callback parameter of `execCmd` supports multiple data types, and the execution logic of different data types will be different:

* If no parameters are passed, the execution will end immediately
* Passing in a [Message](#Message) will append a message to the record and end the execution immediately
* Pass in a [Message](#Message) array, which will append multiple messages to the record and end the execution immediately
* Pass in a `Terminal.$Flash` object, it will enter the processing logic of [Real-time-echo(Flash)](#Flash), this execution will not end until `finish()` is called
* Pass in a `Terminal.$Ask` object, it will enter the processing logic of [user-input](#User-input), this execution will not end until `finish()` is called

## Slots

Terminal supports the following custom slots, this feature is supported in `2.0.11` and `3.0.8` versions and later.

| Slot name | Arguments            | Description                                                         |
|-----------|----------------------|---------------------------------------------------------------------|
| header    | /                    | Customize the header style, still retain the drag area.             |
| helpBox   | { showHeader, item } | Custom command search result prompt box, item is the search result. |
| normal    | { message }          | Custom `normal` type message.                                       |
| json      | { message }          | Custom `json` type message.                                         |
| table     | { message }          | Custom `table` type message.                                        |
| code      | { message }          | Custom `code` type message.                                         |
| html      | { message }          | Custom `html` type message.                                         |
| flash     | { content }          | Custom flash style                                                  |

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
</terminal>
```

## Api

This plugin provides some APIs that can use Vue to actively initiate event requests to the plugin.

PS：**All api calls require the name of the terminal.**

```js
import Terminal from "vue-web-terminal"

//  det api
Terminal.$api
```

### pushMessage()

```js
//  Each terminal will define a name, see the previous document for details
let name = 'my-terminal'
let message = {
    type: 'normal',
    class: 'warning',
    content: 'This is a wanning message.'
}

Terminal.$api.pushMessage(name, message)
```

### updateContext()

For example, */vue-web-terminal/tzfun* in the current input line `$ /vue-web-terminal/tzfun > ` is the context, and the context text can be freely set by the developer, but you need to use `.sync` to bind a variable.

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

### fullscreen()

Make the current terminal enter or exit full screen.

```js
Terminal.$api.fullscreen('my-terminal')
```

### isFullscreen()

Determine if the current state is full screen.

```js
//  true or false
let fullscreen = Terminal.$api.isFullscreen('my-terminal')
```

### dragging()

When [Feature Drag](#Drag) is enabled, you can use the following method to simulate drag to change the window position, where the parameter `x` is the distance from the left border of the terminal to the left border of the browser's visible range, in px, `y ` is the distance from the upper border of the terminal to the upper border of the browser's visible range.

```js
Terminal.$api.dragging('my-terminal', {
    x: 100,
    y: 200
})
```

### execute()

You can use the api to execute a command to the Terminal, and the execution process will be echoed in the Terminal window. This is a way to use a script to simulate the user executing the command.

```js
Terminal.$api.execute('my-terminal', 'help :local')
```

### ~~getPosition()~~

**This api has been removed after `2.0.14` and `3.0.13` version, please use `elementInfo()`**

When in drag mode, this interface can get the position of the window.

```js
let pos = Terminal.$api.getPosition('my-terminal')
console.log(pos.x, pos.y)
```

### focus()

Get input focus
```js
Terminal.$api.focus('my-terminal')
```

### elementInfo()

Get the DOM information of the terminal window. You can use this api to get the terminal's screen width and height, the width and height of the displayed content, the location, the width of a single character, etc. The unit is px.

```js
let info = Terminal.$api.elementInfo('my-terminal')
```

The info data structure is as follows:

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

The following image clearly describes what these values mean:

![ele-info.png](public/ele-info.png)

## Message

This plugin defines a message object, any message must be defined in this format to display correctly.

| Prop    | Description                                                                                                          | Type                     | Options                           |
|---------|----------------------------------------------------------------------------------------------------------------------|--------------------------|-----------------------------------|
| class   | Message class.                                                                                                       | string                   | success、error、system、info、warning |
| tag     | Display label, only valid for type `normal`.                                                                         | string                   | /                                 |
| type    | Message format type, default is `normal`.                                                                            | string                   | normal、json、code、table、html       |
| content | The specific content, the content type of different message formats is different, the specific rules are as follows. | string、json、object、array | /                                 |

### normal

The content is in string format and supports html tags. The content is required, and the others are optional.

```json
{
  "time": "2022-02-17 18:12:20",
  "class": "success",
  "type": "normal",
  "content": "This is a text message",
  "tag": "Tag success"
}
```

### json

When type is `json`, content needs to pass a json object.

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

When type is `code`, the content type is a string, and you can directly pass in text or code.

```json
{
  "type": "json",
  "content": "import Terminal from 'vue-web-terminal'\n\nVue.use(Terminal)"
}
```

#### highlight.js

`code` type messages support `highlight.js` highlighting.

First you need to configure **Highlight.js**, install it at the main.js entry, see [https://www.npmjs.com/package/highlight.js](https://www.npmjs.com/ package/highlight.js)

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

vue2 version dependency recommendation:

```json
{
  "@highlightjs/vue-plugin": "^1.0.2",
  "highlight.js": "^10.7.3"
}
```

#### codemirror.js

`code` type messages also support `codemirror` highlighting. For detailed configuration, see [https://www.npmjs.com/package/vue-codemirror](https://www.npmjs.com/package/vue-codemirror)

It also only needs to be installed at the main.js entry. Recommended version: `"vue-codemirror": "^4.0.6"`

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

When type is `table`, content is the table configuration, `head` is the table header, `rows` is the data of each row, and html tags are supported.

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

When type is `html`, the content format can be customized, and content is composed of html tags.

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

## Command

If the command help search function is enabled, you need to pass in a custom command library before instantiating Terminal. The incoming command library is an array of N commands. The following are the rules for defining the command format:

| Prop        | Description                                                  | Type   |
|-------------|--------------------------------------------------------------|--------|
| key         | Command keyword, required.                                   | string |
| title       | Display title.                                               | string |
| group       | grouping, customizable, defaults to `local`.                 | string |
| usage       | How to use the command.                                      | string |
| description | Detailed description of the command.                         | string |
| example     | For usage examples, see[Command example](#CommandExample)    | array  |

### CommandExample

The format of the example is relatively simple, `des` is a description, `cmd` is a specific command, and the json format is as follows:

```json
[
  {
    "des": "Get all network information",
    "cmd": "netstat -a"
  },
  {
    "des": "Open a website",
    "cmd": "open blog.beifengtz.com"
  }
]
```

### Help

The plugin has a built-in help command to facilitate users to search the command library. Through the help command, you can view the key, grouping, and explanation sample information of the command.

```shell

# Show all command information
help

# Fuzzy search command, search for build prefixed commands
help build*

# Fuzzy search name, search for commands with build
help *build*

# Search by group, search keywords need to start with ":", search for all commands grouped as build
help :build

```

### Local

Terminal has the following built-in commands by default and cannot be replaced.

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

## Advanced Features

### Drag

To enable drag and drop, you need to set `showHeader` to true and configure `dragConf`. You can configure the window size through `width` and `height` of dragConf.

```vue
<terminal name="my-terminal" 
          show-header 
          :drag-conf="{width: 700, height: 500}"></terminal>
```

The dragConf structure is as follows:

| Prop   | Description                                                                                                                                                      | type          |
|--------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------|
| width  | The width of the drag window, which can be a number (in px) or a percentage (relative to the browser window).                                                    | number/string |
| height | Drag window height, which can be a number (in px) or a percentage (relative to the browser window).                                                              | number/string |
| zIndex | Window level, default 100.                                                                                                                                       | number        |
| init   | Window initialization position, if not filled, the default position is in the center of the browser window, where x and y are in px. ``` {"x": 700, "y": 500}``` | object        |

![dragging.gif](public/dragging.gif)

In addition to mouse control, you can also [call API to simulate dragging](#dragging())

### Flash

The default messages of Terminal are displayed in append mode. When you need to display only the execution process, 
this process is only seen during execution. When the content does not want to exist in the record after the execution, 
Flash is a good choice. For example, when `gradle` or `npm` download dependencies, the process of downloading the progress bar animation.

In the `execCmd` event callback of [Events](#Events), the `success` callback function supports the incoming Flash processing object.

Create a new flash object through `new Terminal.$Flash()` and pass it into the success callback. The flash object provides two methods:

* `flush(string)`: Update what is currently displayed
* `finish()`: End execution

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

### User-input

When you need to ask the user, you can use this function to get the content entered by the user, 
such as the scenario where the user needs to enter the username and password when logging in.

In the `execCmd` event callback of [Events](#Events), the `success` callback function supports incoming user input processing objects.

Create a new ask object through `new Terminal.$Ask()` and pass it into the success callback. The ask object provides two methods:

* `ask(options)`: Initiate a user to ask for input, options is an object, and its properties are explained as follows (* indicates required):
    * *`question`: string, The question to ask, or a prefix string that can be understood as user input
    * *`callback`: function, The callback when the user types an enter key, the parameter value is the content entered by the user
    * `autoReview`: bool, Whether to automatically append the current display content when the user types an enter key
    * `isPassword`: bool, Whether it is a password input
* `finish()`: End execution

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
      callback:() => {
          //    do something
        asker.finish()
      }
    })
  }
})
```

# About the author

I am a Java Coder, and I only know a little bit about the web(js, vue). I developed this plugin because of my interest and work needs.
When you see the poor source code of this plugin, please understand that.

If you have good ideas for code optimization or functions and are willing to contribute code, please submit [PR](https://github.com/tzfun/vue-web-terminal/pulls),
If you have any questions about the use of the plugin or find bugs, please submit[issue](https://github.com/tzfun/vue-web-terminal/issues).

> Contact
>
> 📮 *beifengtz@qq.com*
>
> ![](https://open.weixin.qq.com/zh_CN/htmledition/res/assets/res-design-download/icon16_wx_logo.png) *beifeng-tz* (Add please note vue-web-terminal)

# License

[Apache License 2.0](LICENSE)
