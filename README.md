[中文版](./README_ZH.md) | English

<div align=center>
<img src=public/logo.png/>
</div>

# vue-web-terminal

<a href="https://github.com/tzfun/vue-web-terminal/tree/vue2"><img src="https://shields.io/github/package-json/v/tzfun/vue-web-terminal/vue2"></a>
<a href="https://github.com/tzfun/vue-web-terminal/tree/vue3"><img src="https://shields.io/github/package-json/v/tzfun/vue-web-terminal/vue3"></a>
<a href="https://www.npmjs.com/package/vue-web-terminal"><img src="https://shields.io/bundlephobia/minzip/vue-web-terminal"></a>
<a href="https://npmcharts.com/compare/vue-web-terminal?minimal=true"><img src="https://img.shields.io/npm/dt/vue-web-terminal.svg" alt="Downloads"></a>
<a href="https://www.npmjs.com/package/vue-web-terminal"><img src="https://img.shields.io/npm/l/vue-web-terminal.svg" alt="Version"></a>

A web-side command line plugin built by `Vue`, supports multiple message formats such as tables, json, and codes, supports custom message styles, command line libraries, typing search prompts, etc., and simulates native terminal support ← → cursor toggle and ↑ ↓ history command toggle.

> :tada: The new document is now available. It's more detailed and more friendly, welcome to experience it: [https://tzfun.github.io/vue-web-terminal/](https://tzfun.github.io/vue-web-terminal/)

## Feature Support

* Supported message formats: plain text, table, json, code/multi-line text, html, ansi
* Supports real-time content display and appending, and can create simple animation effects
* Support user question and answer input
* Support online text editing
* Support Highlight, Codemirror code highlighting
* Support window dragging and fixing
* Support ← → cursor key switching and ↑ ↓ key history command switching
* Support fullscreen
* Support command input prompts
* Support logging group folding
* Supports multiple styles of slots, customizable styles
* Supports themes, with built-in dark and light themes by default, and you can also customize themes
* Provides a rich set of JS APIs, almost all functions can be simulated by APIs to simulate non-human operations
* Supports Vue2/Vue3

![vue-web-terminal](./public/vue-web-terminal.gif)

> Short description:
>
> It does not have the ability to execute a specific command. This ability needs to be implemented by the developer.
> What it is responsible for is to get the command to be executed from the user in the form of an interface, and then
> hand it over to the developer to implement and execute. After that, hand it over to show it to the user

# Online Experience

You can learn about some of the features of this plugin through the [Online Experience](https://tzfun.github.io/vue-web-terminal/demo.html), or try editing the code and previewing it on [![Edit Vue Template](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/silly-scooby-l8wk9b).

# Document

Please go to [Document](https://tzfun.github.io/vue-web-terminal/)

# Quick Start

Install vue-web-terminal by npm. The `2.x.x` version corresponds to vue2, and the `3.x.x` version corresponds to vue3.
It is recommended to download the latest version corresponding to the main version.

```shell
#  install for vue2
npm install vue-web-terminal@2.xx --save

#  install for vue3
npm install vue-web-terminal@3.xx --save 
```

Use Terminal plugin in `main.js`

```js
import Terminal from 'vue-web-terminal'

// for vue2
Vue.use(Terminal)

// for vue3
const app = createApp(App).use(Terminal)
```

Example:

```vue
<template>
  <div id="app">
    <terminal name="my-terminal" @exec-cmd="onExecCmd"></terminal>
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
            tag: 'success',
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

# Contact Author

I am a backend coder who happens to have some knowledge of frontend. I developed this plugin out of personal interest.

If you have good ideas for code optimization or functions and are willing to contribute code, please submit [PR](https://github.com/tzfun/vue-web-terminal/pulls),
If you have any questions about the use of the plugin or find bugs, please submit[issue](https://github.com/tzfun/vue-web-terminal/issues).

> Contact me (Add please note vue-web-terminal)
>
> 📮 Email: *beifengtz@qq.com*
>
> ![](https://open.weixin.qq.com/zh_CN/htmledition/res/assets/res-design-download/icon16_wx_logo.png) WeChat: *beifeng-tz*

# License

[Apache License 2.0](LICENSE)
