---
sidebarDepth: 0
---

# 常见问题
<img src="https://shields.io/github/package-json/v/tzfun/vue-web-terminal/vue2" style="margin-right: 8px;">
<img src="https://shields.io/github/package-json/v/tzfun/vue-web-terminal/vue3" style="margin-right: 8px;">

[[toc]]

## 推送消息出现undefined，无法正常显示内容

* **issue**: [#43][issues#43]
* **原因**：Vue官方在`2.6.13`版本对vue的`slotRender`修改导致，详情见：[vuejs/vue#12153][vuejs/vue#12153]。本terminal插件是在`2.6.14`环境编译的，如果你的项目中使用低于此版本的 vue和 vue-template-compiler 就会出现slot位置为undefined的问题。
* **解决办法**：将项目中的 vue 和 vue-template-compiler 版本提升至 2.6.13 以上，比如 2.6.14

## 可以配合WebSocket使用吗？

可以的，Terminal插件只是一个负责显示处理的工具，它属于“显示层”，WebSocket是一种通讯协议，属于“网络层”，它们并不冲突，你可以使用任何网络协议与插件搭配，Http、WebSocket、自定义RPC等等。

## 可以实现SSH客户端吗？

**很遗憾，不可以完全实现。** 本插件是[前端控制](./about.md#前端控制)显示的工具，SSH属于[后端控制](./about.md#后端控制)，它们底层实现的逻辑不一样。

但是如果你的使用场景只是简单的命令模式，比如：执行 `ls` 从服务器拿到结果然后显示静态数据，这种是可以的，插件实现了处理静态 
[ANSI](./others.md#ansi) 颜色控制码，如果是 htop、vim等带有其他键盘、鼠标、窗口行为的 ANSI 控制码，此插件是无法支持的，这类动态控制码会被插件过滤掉。 

## 鼠标右键无法粘贴剪切板的内容？

鼠标右键读取剪切板内容并粘贴到 Terminal 中需要你的网页满足以下所有条件：
1. 网页的协议是 `https`，或者网页的域名是 `localhost` 或 `127.0.0.1`
2. 获得用户同意读取剪切板
3. 浏览器允许执行javascript脚本（一般都是开启的）

如果你的网页因为某些原因无法满足以上条件，可以使用原生快捷键 `ctrl/command + v` 来粘贴剪切板的内容。



<CommentService></CommentService>

[issues#43]: https://github.com/tzfun/vue-web-terminal/issues/43
[vuejs/vue#12153]: https://github.com/vuejs/vue/issues/12153