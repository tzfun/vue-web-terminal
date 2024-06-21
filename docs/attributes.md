# Attributes

<img src="https://shields.io/github/package-json/v/tzfun/vue-web-terminal/vue2" style="margin-right: 8px;">
<img src="https://shields.io/github/package-json/v/tzfun/vue-web-terminal/vue3" style="margin-right: 8px;">

This plugin provides rich properties to make it more flexible.

## name

* **Type**: string
* **Default**: terminal
* **Description**: Terminal instance name. This property is also required in the API.

::: tip
Multiple Terminal instances can be created on the same page, but their name attributes must be different and globally unique.
:::

## context

* **Type**: `string`
* **Default**: /vue-web-terminal
* **Description**: Context content, supports special characters

## context-suffix

* **Type**: `string`
* **Default**: ` > `
* **Description**: Contextual suffix symbol, used to separate from user input.

## show-header

* **Type**: `boolean`
* **Default**: true
* **Description**: Whether to display the window header

::: tip
This switch will affect the drag function. The default drag function can only be used when the header is displayed.
:::

## title

* **Type**: `string`
* **Default**: vue-web-terminal
* **Description**: The title displayed in the window header. This property will only take effect after the [show-header](#show-header) property is enabled.

## drag-conf

* **Type**: `DragConfig`
* **Default**: null
* **Description**: Drag window configuration [DragConfig](./others#dragconfig)。

::: tip
This configuration is only effective when [show-header](#show-header) is turned on.

If this property is not configured, the window width and height will fill the parent element 100%, 
and the window width and height are equal to the parent element width and height.
:::

## init-log

* **Type**: `Message[] | null`
* **Default**: Omit
* **Description**: The log displayed when the Terminal is initialized is an array of message objects `Message`. If it is set to `null`, it will not be displayed.

## auto-help

* **Type**: `boolean`
* **Default**: true
* **Description**: Whether to enable the command line automatic search prompt function.

## enable-example-hint

* **Type**: `boolean`
* **Default**: true
* **Description**: Whether to display the command sample prompt in the upper right corner, provided that [auto-help](#auto-help) is turned on.

## command-store

* **Type**: `Command[]`
* **Default**: [Internal Commands](./others#internal-commands)
* **Description**: A [Command](./others#command) array, a custom command library, the search prompt function will scan this library


## log-size-limit

* **Type**: `number`
* **Default**: 200
* **Description**: Limit the maximum number of logs displayed.

## enable-default-command

* **Type**: `boolean`
* **Default**: true
* **Description**: Whether to enable the default [Internal Commands](./others#internal-commands) switch

## line-space

* **Type**: `number`
* **Default**: 15
* **Description**: Log line height, in px

## cursor-style

* **Type**: `string`
* **Default**: block
* **Description**: Cursor style, optional values: `block` | `underline` | `bar` | `none`

## cursor-blink

* **Type**: `boolean`
* **Default**: true
* **Description**: Whether to turn on cursor blinking.

## enable-fold

* **Type**: `boolean`
* **Default**: true
* **Description**: Whether to enable the log folding function.

## enable-hover-stripe

* **Type**: `boolean`
* **Default**: false
* **Description**: Whether the logs in the same group are highlighted when the mouse hovers.

## scroll-mode

* **Type**: `string`
* **Default**: smooth
* **Description**: Window scroll bar mode, native CSS property value

## command-formatter

* **Type**: `CommandFormatterFunc`
* **Default**: null
* **Description**: Command display formatting function, generally used to highlight input commands, pass in the current command and return a new command, supports HTML. If not set, the internally defined highlight style will be used

```ts:no-line-numbers
type CommandFormatterFunc = (cmd: string) => string;
```

## tab-key-handler

* **Type**: `TabKeyHandlerFunc`
* **Default**: null
* **Description**: The logical processing method when the user presses the Tab key can be used with the `helpCmd` slot to define the user display

```ts:no-line-numbers
type CommandModifyFunc = (cmd: string) => any;

type TabKeyHandlerFunc = (event: Event, rewrite: CommandModifyFunc) => undefined;
```

## search-handler

* **Type**: `SearchHandlerFunc`
* **Default**: null
* **Description**: User-defined command search prompt is implemented. The search result is a [Command](./others#command), which is passed back to the plugin through callback. It can be used with the `helpCmd` slot to define the user display

```ts:no-line-numbers
type SearchHandlerCallbackFunc = (cmd: Command) => void;

type SearchHandlerFunc = (commands: Command[], key: string, callback: SearchHandlerCallbackFunc) => void;
```

## push-message-before

* **Type**: `PushMessageBeforeFunc`
* **Default**: null
* **Description**: Hook function triggered before the push message is displayed.

```ts:no-line-numbers
type PushMessageBeforeFunc = (message: Message, name: String) => void;
```

## command-store-sort

* **Type**: `CommandStoreSortFunc`
* **Default**: null
* **Description**: Command line library sorting, custom command library display sorting rules.

```ts:no-line-numbers
type CommandStoreSortFunc = (a: any, b: any) => number;
```

## input-filter

* **Type**: `InputFilterFunc`
* **Default**: null
* **Description**: Custom input filtering, the return value is the filtered string, must be plain text, no html tags.

```ts:no-line-numbers
type InputFilterFunc = (str1: string, str2: string, event: InputEvent) => string | null;
```

<CommentService></CommentService>
