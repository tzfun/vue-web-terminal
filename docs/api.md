# API
<img src="https://shields.io/github/package-json/v/tzfun/vue-web-terminal/vue2" style="margin-right: 8px;">
<img src="https://shields.io/github/package-json/v/tzfun/vue-web-terminal/vue3" style="margin-right: 8px;">

This plugin provides some JS APIs that can actively trigger or capture the behavior of the plug-in, and can also simulate some user behaviors through these APIs.

## Calling Methods

To call the API interface, you need to specify a Terminal instance first, and then call the corresponding API method.
There may be multiple Terminal instances on the same page. The plugin distinguishes these different instances through 
the [name](./attributes#name) attribute, so the name attribute should be globally unique.

There are two ways to call the interface of the corresponding instance: `Global Call` and `Ref Call`

### Global Call

This method can call any Terminal with a given name anywhere. Compared with `Ref Call`, it does not need to rely on 
Vue's reference passing and is relatively more flexible. However, the prerequisite for calling it is to specify the Terminal's name.


The method of use is to introduce the global API `TerminalApi` to call the interface. The first parameter of all 
interface inputs is the name value of Terminal, and the subsequent parameters are the parameter values of the corresponding interface.

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

### Ref Call

This calling method relies on the reference in Vue. Once the Ref of the specified Dom is obtained, the plug-in API 
can be called without passing the name value of the Terminal.

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

## Interfaces

### pushMessage

- **Description**: Push one or more messages to terminal.
- **Definition**: 
```ts
type pushMessage = (message: string | Message | Message[]) => void;
```
- **Example**: 

```js
//  Push a text message
TerminalApi.pushMessage('my-terminal', 'Hello world!')

//  push a message
TerminalApi.pushMessage('my-terminal', {
    class: 'warning',
    tag: 'WARN',
    content: 'This is warning message!'
})

//  Push multiple messages
TerminalApi.pushMessage('my-terminal', [
    {content: 'message 1'},
    {content: 'message 2', class: 'info'},
    {content: 'message 3', class: 'success'},
])
```
- **References**: 
  - [Message](./others#message)

### appendMessage

- **Description**: Append content to the last message. This will only be done if the last message exists and its message type is one of `normal`, `ansi`, `code`, `html`, otherwise a new message will be pushed.
- **Definition**: 
```ts
type appendMessage = (msg: string) => void;
```
- **Example**: 
```js
TerminalApi.appendMessage('my-terminal', "This is additional content")
```

### fullscreen

- **Description**: Toggle full screen mode
- **Definition**: 
```ts
type fullscreen = () => void;
```
- **Example**: 
```js
TerminalApi.fullscreen('my-terminal')
```

### isFullscreen

- **Description**: Determine whether the current window is in full screen mode.
- **Definition**: 
```ts
type isFullscreen = () => boolean;
```
- **Example**: 
```js
let isFullscreen = TerminalApi.isFullscreen('my-terminal')
console.log(isFullscreen)
```

### dragging

- **Description**: When the drag function is turned on, you can use this method to change the window position, where the parameter `x` is the distance from the left border of the terminal to the left border of the browser's visible range, and `y` is the distance from the top border of the terminal to the top border of the browser's visible range, in px.
- **Definition**: 
```ts
type dragging = (pos: Position) => void;
```
- **Example**: 
```js
TerminalApi.dragging('my-terminal', { x: 100, y: 200 })
```
- **References**:
  - [Position](./others.md#position)

### execute

- **Description**: Execute a command to the terminal, and the execution process will be echoed in the Terminal window. This is a way to use JS to simulate the user's execution of commands.
- **Definition**: 
```ts
type execute = (cmd: string) => void;
```
- **Example**: 
```js
TerminalApi.execute('my-terminal', 'help :local')
```

### focus

- **Description**: Get the terminal input focus. There are three input points in the plugin:
  - For command line input, passing true to the focus method means forcibly obtaining the input focus. Otherwise, it only obtains the cursor focus and causes the terminal to trigger the on-active event.
  - Ask user input, get the corresponding input focus when in ask mode.
  - Text editor input, when in text editing mode, get the corresponding input box focus. If you use slot to customize the implementation, you need to provide the entry of focus event in the slot.
- **Definition**: 
```ts
type focus = (enforceFocus?: boolean | MouseEvent) => void;
```
- **Example**: 
```js
TerminalApi.focus('my-terminal', true)
```

### elementInfo

- **Description**: Get the Terminal window DOM information. You can use this API to get the Terminal window width and height, the width and height of the displayed content, the location, the width of a single character, etc. The unit is px.

::: tip Notice
If your window has been created but not displayed on the page (for example, if v-show is used to control the display), some information may become invalid.
:::

- **Definition**: 
```ts
type elementInfo = () => TerminalElementInfo;
```
- **Example**: 
```js
let info = TerminalApi.elementInfo('my-terminal')
console.log(info)
```
- **Result Example**：
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
- **References**: 
  - [Position](./others#position)
  - [CharWidth](./others#charwidth)
  - [TerminalElementInfo](./others#terminalelementinfo)


The following diagram clearly describes what these values mean:
![terminal-ele-info](/images/ele-info.png)

### textEditorOpen

- **Description**: Open the text editor. When opening, you can pass in the initial text content and define the close event callback. `content` is the preset content when opening the editor. If you don't want to preset any content, you can leave this parameter blank. When the user clicks Close or actively calls the `textEditorClose()` method, the `onClose` callback will be triggered. The parameter value is the text content in the current editor and the passed parameter options.
- **Definition**: 
```ts
type textEditorOpen = (setting: EditorSetting) => any;
```
- **Example**: 
```js
TerminalApi.textEditorOpen('my-terminal', {
    content: 'This is the preset content',
    onClose: (value, options) => {
        console.log('Final content: ', value, "options:", options)
    }
})
```
- **References**: 
  - [EditorSetting](./others#editorsetting)

### textEditorClose

- **Description**: Close the currently opened text editor. This call will trigger the onClose callback when it is opened, and the options value will be passed to the callback function as a parameter.
- **Definition**: 
```ts
type textEditorClose = (options: any) => string;
```
- **Example**: 
```js
TerminalApi.textEditorClose('my-terminal', true)

TerminalApi.textEditorClose('my-terminal', 'hello! this is close options')
```

### clearLog

- **Description**: Clear the current screen log. If the passed parameter is true, the historical command record will also be cleared.
- **Definition**: 
```ts
type clearLog = (clearCommandHistory?: boolean) => void;
```
- **Example**: 
```js
//  clear screen log
TerminalApi.clearLog('my-terminal')

//  clear command history log
TerminalApi.clearLog('my-terminal', true)
```

### getCommand

- **Description**: Get the command currently being entered.
- **Definition**: 
```ts
type getCommand = () => string;
```
- **Example**: 
```js
TerminalApi.getCommand('my-terminal')
```

### setCommand

- **Description**: Modify the command currently being entered.
- **Definition**: 
```ts
type setCommand = (command: string) => void;
```
- **Example**: 
```js
TerminalApi.setCommand('my-terminal', "customCmd -a hello")
```

<CommentService></CommentService>
