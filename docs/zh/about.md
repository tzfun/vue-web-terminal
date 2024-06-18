# vue-web-terminal
## 介绍

vue-web-terminal是一个由 Vue 构建的支持多种内容格式显示的网页端命令行窗口插件，它是一种命令式的仿真终端，由前端控制渲染结果，内置有用户问答、文本编辑、动画等高级功能，具有非常灵活的可自定义性。

## 功能支持

- 支持消息格式：普通文本、表格、json、代码/多行文本、html、ansi
- 支持内容实时回显、追加，可制作简单的动画效果
- 支持用户问答输入
- 支持在线文本编辑
- 支持`Highlight`、`Codemirror`代码高亮
- 支持窗口拖拽、固定
- 支持 ← → 光标键切换和 ↑ ↓ 键历史命令切换
- 支持一键全屏
- 支持命令搜索提示，`Tab` 键快捷填充
- 支持多种样式 Slot 插槽，可自定义样式
- 支持主题，默认内置暗色和亮色主题，也可自定义主题
- 提供丰富的JS API，几乎所有功能均可由API来模拟非人为操作
- 支持Vue2/Vue3

![vue-web-terminal.gif](/images/vue-web-terminal.gif)

## 它能做什么

vue-web-terminal 是一种命令式仿真终端，一切以命令执行的工具都可以用它来做，一切由**前端控制**的内容显示也可以由它来做：

- :ok_hand: 实现 MySQL 命令客户端
- :ok_hand: 实现 Redis 命令客户端
- :ok_hand: 实现 ETCD 命令客户端
- :ok_hand: 实现自定义的服务命令终端，比如游戏GM指令
- :ok_hand: 实现自定义的网页控制终端
- :ok_hand: 文件内容展示，比如日志文件打印
- :ok_hand: 接入 WebSocket 与服务器发送指令，服务器返回指定格式数据显示
- :ok_hand: **简单**的SSH命令执行（仅限指令模式），注意只是简单的，例如htop、vim等复杂指令不支持
- :ok_hand: 适用于**内容怎么显示是由前端控制，而不是服务器**的场景均可以由它实现......

::: important
**vue-web-terminal** 并不具备执行某个具体命令的能力，这个能力需要开发者自己去实现，它负责的事情是在网页上以终端界面的形式从用户那拿到想要执行的命令，然后交给开发者去实现，执行完之后再交给它展示给用户。
:::

## 它不能做什么

vue-web-terminal 是一个由前端模拟实现的终端，而并不是传统意义上真正的终端，在使用它之前你需要清楚终端的显示逻辑通常有两种：后端控制、前端控制

### 后端控制

终端内容如何显示由后端或者服务器控制，前端只需要解析后端的控制码来做相应样式的渲染，例如 Windows的cmd、Mac的terminal、各种SSH客户端等等，这类终端的显示都是由 ANSI Control Code来控制的

### 前端控制

终端内容如何显示由前端控制，后端只需要单纯地将数据发送给前端，具体怎么显示、以什么样的格式显示由前端决定，甚至可以实现同一个内容在不同条件下显示的格式不同，例如 MySQL、Redis、ETCD等的命令行客户端，这类终端可自定义性更高

**vue-web-terminal 属于前端控制类型的终端！** 因此后端控制类的终端实现场景并不适合它，请在选择方案前谨慎考虑

- :pensive: SSH终端，具有复杂控制码显示的场景：vim、htop等（插件只对ANSI控制码提供了**颜色控制**的实现，其余控制码会被自动过滤）
- :pensive: 服务器远程控制终端

## 联系作者

我是一名后端Coder，对前端仅会一点皮毛，因为个人兴趣开发了此插件，业余选手请多指教。

如果对代码优化或功能有好的想法并乐意贡献代码欢迎提交 [Pull Request][Github PR] ，对插件使用存在疑问或发现 bug 请提交 [issue][Github issue]。

这是我的联系方式：
> :email: [beifengtz@qq.com](mailto:beifengtz@qq.com)
> 
> ![](https://open.weixin.qq.com/zh_CN/htmledition/res/assets/res-design-download/icon16_wx_logo.png) **beifeng-tz**
> （添加请备注vue-web-terminal）

## 捐赠

本插件完全开源免费，创作不易，如果你觉得不错可以捐赠支持一下 :wink:

<div style="display: flex; justify-content: center;margin:30px 15px;">
    <img src="/images/pay-wechat.png" style="width: 50%"/>
    <img src="/images/pay-zhifubao.jpg" style="width: 50%"/>
</div>

感谢大家的支持，你们的支持就是作者的动力！（按捐赠时间顺序排序）
* [zhangpeng1314](https://gitee.com/zhangpeng1314) - 150元
* [lilqilie](https://github.com/lilqilie) - 20元
* [h1xa](https://ctf.show) - 66元

<CommentService></CommentService>

[Github PR]: https://github.com/tzfun/vue-web-terminal/pulls
[Github issue]: https://github.com/tzfun/vue-web-terminal/issues