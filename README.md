# vue-web-terminal

一个由Vue构建的支持多内容类型显示的网页端命令行窗口插件，支持普通文本、json显示、代码显示（语法高亮），支持自定义命令行库，键入搜索提示示例等。

![vue-web-terminal](./public/vue-web-terminal.gif)

# 快速上手

npm安装vue-web-terminal
```shell
npm install vue-web-terminal --save 
```

入口函数调用`Vue.use()`
```js
import Terminal from 'vue-web-terminal'

Vue.use(Terminal)
```

App.vue 中使用
```vue
<template>
  <div id="app">
    <terminal name="my-terminal"
              @execCmd="onExecCmd"
              @triggerClick="onClick"
              @onKeydown="onKeydown"
              showLogTime
              warnLogLimitEnable></terminal>
  </div>
</template>

<script>

export default {
  name: 'App',
  methods: {
    /**
     * 当用户输入自定义命令时调用
     *
     * @param key     命令行key，用于唯一标识
     * @param command 命令行
     * @param success 成功回调
     * @param failed  失败回调
     */
    onExecCmd(key, command, success, failed) {
      if (key === 'fail') {
        failed('Something wrong!!!')
      } else if (key === 'json') {
        //  do something here
        success({
          type: 'json',
          class: 'success',
          content: {
            k1: 'welcome to vue-web-terminal',
            k2: 120,
            k3: ['h', 'e', 'l', 'l', 'o'],
            k4: {k41: 2, k42: '200'}
          }
        })
      } else if (key === 'code') {
        success({
          type: 'code',
          class: 'system',
          content: 'import Terminal from \'vue-web-terminal\'\n' +
              '\n' +
              'Vue.use(Terminal)'
        })
      } else {
        success({
          type: 'normal',
          class: 'success',
          tag: '成功',
          content: command
        })
      }
    },
    onClick(key) {
      console.log("trigger click: " + key)
    },
    onKeydown(event) {
      console.log(event)
    }
  }
}
</script>

<style>
body, html {
  margin: 0;
  padding: 0;
}
</style>
```