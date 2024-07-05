# 插件属性
<img src="https://shields.io/github/package-json/v/tzfun/vue-web-terminal/vue2" style="margin-right: 8px;">
<img src="https://shields.io/github/package-json/v/tzfun/vue-web-terminal/vue3" style="margin-right: 8px;">

本插件提供了丰富的属性，让它变得更加灵活。

## name

* **类型**：string
* **默认值**：terminal
* **说明**：Terminal实例名称，API中使用也需用到此属性

::: tip
同一个页面内支持创建多个 Terminal 实例，但它们的 name 属性必须互不相同，且全局唯一
:::

## context

* **类型**：`string`
* **默认值**：/vue-web-terminal
* **说明**：上下文内容，支持特殊字符

## context-suffix

* **类型**：`string`
* **默认值**： > 
* **说明**：上下文后缀符号，用于和用户输入隔开

## show-header

* **类型**：`boolean`
* **默认值**：true
* **说明**：是否显示窗口头部

::: tip
此开关会影响拖拽功能，只有显示头部才能使用默认提供的拖拽功能
:::

## title

* **类型**：`string`
* **默认值**：vue-web-terminal
* **说明**：窗口头部显示的标题，此属性需要 [show-header](#show-header) 属性开启之后才会生效

## drag-conf

* **类型**：`DragConfig`
* **默认值**：null
* **说明**：拖拽窗口配置项 [DragConfig](./others#dragconfig)。

::: tip
此项配置需要在 [show-header](#show-header) 开启的情况下才有效。

如果不配置该属性，窗口宽高将会100%填充父元素，窗口宽高等同于父元素宽高
:::

## init-log

* **类型**：`Message[] | null`
* **默认值**：null
* **说明**：Terminal初始化时显示的日志，是由消息对象 [Message](./others.md#message) 组成的数组，设为 `null` 则不显示

## command-store

* **类型**：`Command[]`
* **默认值**：[内置命令](./others#内置命令)
* **说明**：一个[Command](./others#command)数组，自定义的命令库，搜索提示功能会扫描此库

## log-size-limit

* **类型**：`number`
* **默认值**：200
* **说明**：限制显示日志的最大条数

## enable-default-command

* **类型**：`boolean`
* **默认值**：true
* **说明**：是否生效默认[内置命令](./others#内置命令)，如果你需要自定义这些命令的逻辑，可以关闭此开关，默认命令的功能也可通过 [API](./api.md) 实现

## line-space

* **类型**：`number`
* **默认值**：15
* **说明**：日志行间距，单位px

## cursor-style

* **类型**：`string | TerminalCursorStyle`
* **默认值**：block
* **说明**：光标样式，可选值：`block` | `underline` | `bar` | `none`

```ts:no-line-numbers
type TerminalCursorStyle = 'block' | 'underline' | 'bar' | 'none'
```

## enable-cursor-blink

* **类型**：`boolean`
* **默认值**：true
* **说明**：是否打开光标闪烁

## enable-fold

* **类型**：`boolean`
* **默认值**：true
* **说明**：是否打开日志折叠功能

## enable-hover-stripe

* **类型**：`boolean`
* **默认值**：false
* **说明**：同一组的日志在鼠标hover时是否高亮显示

## scroll-mode

* **类型**：`string`
* **默认值**：smooth
* **说明**：窗口滚动条模式，原生css属性值

## command-formatter

* **类型**：`CommandFormatterFunc`
* **默认值**：null
* **说明**：命令显示格式化函数，一般用于输入命令高亮显示，传入当前命令返回新的命令，支持html。如果不设置将使用内部定义的高亮样式

```ts:no-line-numbers
type CommandFormatterFunc = (cmd: string) => string;
```

## enable-input-tips

* **类型**：`boolean`
* **默认值**：true
* **说明**：是否打开命令输入提示功能

## enable-help-box

* **类型**：`boolean`
* **默认值**：true
* **说明**：是否打开窗口右上角命令样例提示面板

## input-tips-select-handler

* **类型**：`InputTipsSelectHandlerFunc`
* **默认值**：略
* **说明**：自定义用户选择某一个输出提示项时的逻辑处理函数

```ts:no-line-numbers
/**
 * 输入提示选择处理函数
 *
 * @param command       当前用户输入的完整命令行
 * @param cursorIndex   当前光标所处位置
 * @param item          用户选择提示项
 * @param callback      填充结束后需调用此函数返回新的命令行
 */
type InputTipsSelectHandlerFunc = (command: string, cursorIndex: number, item: InputTipItem, callback: (cmd: string) => void) => void
```

## input-tips-search-handler

* **类型**：`InputTipsSearchHandlerFunc`
* **默认值**：略
* **说明**：自定义用户输入时搜索提示内容的处理函数

```ts:no-line-numbers
/**
 * 用户自定义命令搜索提示实现
 *
 * @param command       当前用户输入的完整命令行
 * @param cursorIndex   当前光标所处位置
 * @param commandStore  命令集合
 * @param callback      搜索结束回调，回调格式为一个数组
 */
type InputTipsSearchHandlerFunc = (command: string, cursorIndex: number, commandStore: Command[], callback: (tips: InputTipItem[], openTips?: boolean) => void) => void
```

## push-message-before

* **类型**：`PushMessageBeforeFunc`
* **默认值**：null
* **说明**：在推送消息显示之前触发的钩子函数，在此函数中可以对message对象的属性进行修改

```ts:no-line-numbers
type PushMessageBeforeFunc = (message: Message, name: String) => void;
```

## command-sort-handler

* **类型**：`CommandSortHandlerFunc`
* **默认值**：null
* **说明**：命令行库排序，自定义命令库的显示排序规则

```ts:no-line-numbers
type CommandSortHandlerFunc = (a: any, b: any) => number;
```

## input-filter

* **类型**：`InputFilterFunc`
* **默认值**：null
* **说明**：自定义输入过滤，返回值为过滤后的字符串，必须是纯文本，不能带html标签

```ts:no-line-numbers
type InputFilterFunc = (str1: string, str2: string, event: InputEvent) => string | null;
```

<CommentService></CommentService>
