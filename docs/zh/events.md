# 插件事件
<img src="https://shields.io/github/package-json/v/tzfun/vue-web-terminal/vue2" style="margin-right: 8px;">
<img src="https://shields.io/github/package-json/v/tzfun/vue-web-terminal/vue3" style="margin-right: 8px;">

## exec-cmd

- **回调参数**：`(commandKey, command, success, failed, name)`
  - commandKey: `string`，命令key
  - command: `string`，用户输入的完整命令行
  - success: `(message?: Message | Array<Message> | string | TerminalFlash | TerminalAsk) => void; `，成功回调函数
  - failed: `(message: string) => void;`，失败回调函数
  - name: `string`，Terminal实例的名称
- **说明**：执行自定义命令时触发此事件，**当该事件触发之后必须调用 success 或 failed其中一个回调才认为是本次执行结束，否则命令输入行将不会回显**。

::: tip

success回调参数支持多种数据类型，不同数据类型执行逻辑也会不同：
- 不传任何参数，立即结束本次执行
- 传入一个消息对象 [Message](./others#Message) ，将会向记录中追加一条消息，并立即结束本次执行
- 传入一个消息对象数组 [Message](./others#Message)[] ，将会向记录中追加多条消息，并立即结束本次执行
- 传入一个 `TerminalFlash` 对象，将会进入实时回显处理逻辑，本次执行并不会结束，直到调用 `finish()`
- 传入一个 `TerminalAsk` 对象，将会进入用户询问输入处理逻辑，本次执行并不会结束，直到调用 `finish()`

:::

## before-exec-cmd

- **回调参数**：`(commandKey, command, name)`
  - commandKey: `string`，命令key
  - command: `string`，用户输入的完整命令行
  - name: `string`，Terminal实例的名称
- **说明**：用户敲下回车之后，在真正执行命令之前触发

## init-before

- **回调参数**：`(name)`
- **说明**：生命周期函数，插件初始化之前触发

## init-complete

- **回调参数**：`(name)`
- **说明**：生命周期函数，插件初始化完成之后触发

## on-keydown

- **回调参数**：`(event, name)`
  - event: `KeyboardEvent`，原生键盘事件
  - name: `string`，Terminal实例的名称
- **说明**：在获取命令输入光标焦点时，按下任意键后触发

## on-click

- **回调参数**：`(key, name)`
  - key: `string`，按钮名
  - name: `string`，Terminal实例的名称
- **说明**：用户点击按钮时触发，参数key为按钮唯一识别，已有按钮：`close | minScreen | fullScreen | title | pin`

## on-active

- **回调参数**：`(name)`
- **说明**：窗口活跃时触发

## on-inactive

- **回调参数**：`(name)`
- **说明**：窗口由活跃状态变为不活跃状态时触发

## on-resize

- **回调参数**：`(elementInfo, name)`
  - elementInfo: [TerminalElementInfo](./others.md#terminalelementinfo)，窗口信息
  - name: `string`，Terminal实例的名称
- **说明**：窗口大小变化时触发

<CommentService></CommentService>
