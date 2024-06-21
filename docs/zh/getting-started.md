# 快速上手
<img src="https://shields.io/github/package-json/v/tzfun/vue-web-terminal/vue2" style="margin-right: 8px;">
<img src="https://shields.io/github/package-json/v/tzfun/vue-web-terminal/vue3" style="margin-right: 8px;">

你可以 [在线体验](./demo.md) 一部分作者写好的示例功能，也可以在 [CodeSandbox][Online Demo CodeSandbox] 编辑代码并运行体验。

在你打算正式使用此插件之前希望你已经阅读 [关于插件](./about.md) 并充分了解此插件支持的功能以及它的局限性。

## 安装

你需要了解插件的版本号规则：
- `2.x.x`对应Vue2版本
- `3.x.x`对应Vue3版本

建议前往 [releases][Github Releases] 寻找对应Vue版本最新的版本，
然后替换掉下面示例命令中的 2.x.x 或 3.x.x 进行安装。

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

## Vue注册

在main.js中注册插件

::: code-tabs#js

@tab Vue2

```js
import Terminal from 'vue-web-terminal'
//  3.2.0 及 2.1.13 以后版本需要引入此样式，之前版本无需引入主题样式
//  亮色主题：vue-web-terminal/lib/theme/light.css
import 'vue-web-terminal/lib/theme/dark.css'

Vue.use(Terminal)
```

@tab Vue3

```js
import Terminal from 'vue-web-terminal'
//  3.2.0 及 2.1.13 以后版本需要引入此样式，之前版本无需引入主题样式
//  亮色主题：vue-web-terminal/lib/theme/light.css
import 'vue-web-terminal/lib/theme/dark.css'

createApp(App).use(Terminal)
```
:::

## 你的第一个vue-web-terminal

@[code vue](@src/examples/First.vue)

启动你的工程之后，如果在页面中出现一个可拖拽的终端窗口，那么恭喜你的第一个terminal应用实现了！
你可以在窗口中输入*任意命令*然后回车，会随机提示不同的级别的内容。

[Online Demo CodeSandbox]: https://codesandbox.io/s/silly-scooby-l8wk9b
[Github Releases]: https://github.com/tzfun/vue-web-terminal/releases

<CommentService></CommentService>