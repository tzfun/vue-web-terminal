# Events

<img src="https://shields.io/github/package-json/v/tzfun/vue-web-terminal/vue2" style="margin-right: 8px;">
<img src="https://shields.io/github/package-json/v/tzfun/vue-web-terminal/vue3" style="margin-right: 8px;">

## exec-cmd

- **Parameters**: `(commandKey, command, success, failed, name)`
  - commandKey: `string`, command key.
  - command: `string`, the complete command line entered by the user.
  - success: `(message?: Message | Array<Message> | string | TerminalFlash | TerminalAsk) => void; `, success callback function.
  - failed: `(message: string) => void;`, failure callback function.
  - name: `string`, the name of the Terminal instance.
- **Description**: This event is triggered when a custom command is executed. **After this event is triggered, one of the success or failed callbacks must be called to consider the execution completed, otherwise the command input line will not be echoed**.

::: tip

The success callback parameter supports multiple data types, and the execution logic of different data types will be different:
- Without passing any parameters, the execution ends immediately.
- Passing a message object [Message](./others#Message) will append a message to the log and immediately terminate the execution.
- Passing an array of message objects [Message](./others#Message)[] will append multiple messages to the log and immediately terminate the execution.
- Passing a `TerminalFlash` object will enter the real-time echo processing logic. This execution will not end until `finish()` is called.
- Passing a `TerminalAsk` object will enter the user query input processing logic. This execution will not end until `finish()` is called.

:::

## before-exec-cmd

- **Parameters**: `(commandKey, command, name)`
  - commandKey: `string`, command key.
  - command: `string`, the complete command line entered by the user.
  - name: `string`, the name of the Terminal instance.
- **Description**: Triggered after the user presses Enter, before the command is actually executed.

## on-keydown

- **Parameters**: `(event, name)`
  - event: `KeyboardEvent`, native keyboard events.
  - name: `string`, the name of the Terminal instance.
- **Description**: Triggered when any key is pressed while obtaining the command input cursor focus.

## on-click

- **Parameters**: `(key, name)`
  - key: `string`, button name.
  - name: `string`, the name of the Terminal instance.
- **Description**: Triggered when the user clicks a button. The parameter key is the unique identifier of the button. Here are some existing buttons: `close | minScreen | fullScreen | title | pin`

## init-before

- **Parameters**: `(name)`
- **Description**: Lifecycle function, triggered before the plugin is initialized.

## init-complete

- **Parameters**: `(name)`
- **Description**: Lifecycle function, triggered after the plugin is initialized.

## on-active

- **Parameters**: `(name)`
- **Description**: Triggered when the window becomes active.

## on-inactive

- **Parameters**: `(name)`
- **Description**: Triggered when the window changes from active to inactive.

<CommentService></CommentService>
