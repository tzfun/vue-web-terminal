# Quick Start

You can experience some of the sample functions written by the author in [Online Demo][Online Demo].

You can also edit the code and run the experience online in [CodeSandbox][Online Demo CodeSandbox].

## Install

You need to understand the plugin version number rules：
- `2.x.x` corresponds to Vue2 version
- `3.x.x` corresponds to Vue3 version

It is recommended to go to [releases][Github Releases] to find the latest version of the corresponding vue version, and then replace 2.x.x or 3.x.x in the example command below to install it.

::: code-tabs#shell
@tab npm

```shell
# for vue2
npm install vue-web-terminal@2.x.x

# for vue3
npm install vue-web-terminal@3.x.x
```

@tab yarn

```shell
# for vue2
yarn add vue-web-terminal@2.x.x

# for vue3
yarn add vue-web-terminal@3.x.x
```

@tab pnpm

```shell
# for vue2
pnpm install vue-web-terminal@2.x.x

# for vue3
pnpm install vue-web-terminal@3.x.x
```

:::

## Register

Register the plugin in main.js

::: code-tabs#js

@tab Vue2

```js
import Terminal from 'vue-web-terminal'
//  This style needs to be introduced in versions 3.2.0 and 2.1.13 later, and no theme style is needed in previous versions
//  Light theme: vue-web-terminal/lib/theme/light.css
import 'vue-web-terminal/lib/theme/dark.css'

Vue.use(Terminal)
```

@tab Vue3

```js
import Terminal from 'vue-web-terminal'
//  This style needs to be introduced in versions 3.2.0 and 2.1.13 later, and no theme style is needed in previous versions
//  Light theme: vue-web-terminal/lib/theme/light.css
import 'vue-web-terminal/lib/theme/dark.css'

createApp(App).use(Terminal)
```
:::

## Your first vue-web-terminal

```vue
<template>
  <terminal name="my-terminal"
            @exec-cmd="onExecCmd"
            :drag-conf="dragConf" />
</template>
<script>
  export default {
    name: 'App',
    data(){
      return {
        dragConf: {
          width: "50%",
          height: "70%",
          zIndex: 100,
          init: {
            x: 200,
            y: 200
          },
          pinned: false
        }
      }
    },
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
            tag: clazz,
            content: `Your command is '${command}'` 
          })
        }
      }
    }
  }
</script>
<style scoped>
</style>
```

After starting your project, if a draggable terminal window appears on the page, congratulations on your first terminal application!

You can enter *any command* in the window and press Enter, and different levels of content will be randomly prompted.

[Online Demo]: https://tzfun.github.io/vue-web-terminal/
[Online Demo CodeSandbox]: https://codesandbox.io/s/silly-scooby-l8wk9b
[Github Releases]: https://github.com/tzfun/vue-web-terminal/releases

<CommentService></CommentService>