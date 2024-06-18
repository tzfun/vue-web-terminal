# 插件属性

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
* **默认值**：略
* **说明**：Terminal初始化时显示的日志，是由消息对象 `Message` 组成的数组，设为 `null` 则不显示

## auto-help

* **类型**：`boolean`
* **默认值**：true
* **说明**：是否打开命令行自动搜索提示功能

## enable-example-hint

* **类型**：`boolean`
* **默认值**：true
* **说明**：是否显示右上角命令样例提示，前提是开启了 [auto-help](#auto-help)

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
* **说明**：是否生效默认[内置命令](./others#内置命令)开关

## line-space

* **类型**：`number`
* **默认值**：15
* **说明**：日志行高，单位px

## cursor-style

* **类型**：`string`
* **默认值**：block
* **说明**：光标样式，可选值：`block` | `underline` | `bar` | `none`

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

```ts
type CommandFormatterFunc = (cmd: string) => string;
```

## tab-key-handler

* **类型**：`TabKeyHandlerFunc`
* **默认值**：null
* **说明**：用户键入Tab键时的逻辑处理方法，可配合 `helpCmd` 这个slot来定义用户显示

```ts
type CommandModifyFunc = (cmd: string) => any;

type TabKeyHandlerFunc = (event: Event, rewrite: CommandModifyFunc) => undefined;
```

## search-handler

* **类型**：`SearchHandlerFunc`
* **默认值**：null
* **说明**：用户自定义命令搜索提示实现，搜索结果是一个[Command](./others#command)，通过callback回传给插件，可配合 `helpCmd` 这个slot来定义用户显示

```ts
type SearchHandlerCallbackFunc = (cmd: Command) => void;

type SearchHandlerFunc = (commands: Command[], key: string, callback: SearchHandlerCallbackFunc) => void;
```

## push-message-before

* **类型**：`PushMessageBeforeFunc`
* **默认值**：null
* **说明**：在推送消息显示之前触发的钩子函数

```ts
type PushMessageBeforeFunc = (message: Message, name: String) => void;
```

## command-store-sort

* **类型**：`CommandStoreSortFunc`
* **默认值**：null
* **说明**：命令行库排序，自定义命令库的显示排序规则

```ts
type CommandStoreSortFunc = (a: any, b: any) => number;
```

## input-filter

* **类型**：`InputFilterFunc`
* **默认值**：null
* **说明**：自定义输入过滤，返回值为过滤后的字符串，必须是纯文本，不能带html标签

```ts
type InputFilterFunc = (str1: string, str2: string, event: InputEvent) => string | null;
```

<CommentService></CommentService>
