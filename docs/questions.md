---
sidebarDepth: 0
---

# Q & A
<img src="https://shields.io/github/package-json/v/tzfun/vue-web-terminal/vue2" style="margin-right: 8px;">
<img src="https://shields.io/github/package-json/v/tzfun/vue-web-terminal/vue3" style="margin-right: 8px;">

[[toc]]

For more questions, please go to [issue][Github issues] to raise them or find answers.

## Can it be used with WebSocket?

Yes, the terminal plugin is just a tool responsible for display processing, it belongs to the "display layer", 
WebSocket is a communication protocol, it belongs to the "network layer", they do not conflict, you can use any 
network protocol with the plug-in, Http, WebSocket, custom RPC and so on.

## Can an SSH client be implemented?

**Unfortunately, this cannot be fully implemented.** This plugin is a tool displayed 
by [front-end control](./about.md#front-end-control), SSH belongs to [back-end control](./about.md#back-end-control), 
and their underlying implementation logic is different.

However, if your usage scenario is just a simple command mode, such as executing `ls` to get the results from the 
server and then displaying static data, this is possible. The plug-in implements the processing of static 
[ANSI](./others.md#ansi) color control codes. If it is htop, vim, etc. with other ANSI control codes of keyboard, mouse, 
and window behaviors, this plug-in cannot support it. Such dynamic control codes will be filtered out by the plugin.

## Why does it not work after setting the attribute or event name to hump-case?

* **Issue**: [#41][issues#41]
* **Reason**: Vue officially does not recommend using hump case names when emitting events. In order to unify the code style of Vue2 and Vue3, the plugin removes all external camel case names.
* **Solution**: Use `kebab-case` naming conventions, e.g., change `@execCmd` to `@exec-cmd`

## Undefined appears when pushing messages, and the content cannot be displayed normally

* **Issue**: [#43][issues#43]
* **Reason**: This is caused by the official modification of vue's `slotRender` in `2.6.13` version. For details, see: [vuejs/vue#12153][vuejs/vue#12153]. This terminal plug-in is compiled in the `2.6.14` environment. If you use vue and vue-template-compiler lower than this version in your project, the slot position will be undefined.
* **Solution**: Upgrade the versions of vue and vue-template-compiler in the project to 2.6.13 or above, such as 2.6.14

## Can't paste the clipboard contents with the right mouse button?

Right-click to read the clipboard contents and paste them into Terminal. Your web page must meet all of the following conditions:
1. The protocol of the webpage is `https`, or the domain name of the webpage is `localhost` or `127.0.0.1`.
2. Obtain user consent to read the clipboard.
3. The browser allows the execution of javascript scripts (usually enabled)

If your web page does not meet the above conditions for some reason, you can use the native shortcut `ctrl/command + v` to paste the contents of the clipboard.

<CommentService></CommentService>

[issues#43]: https://github.com/tzfun/vue-web-terminal/issues/43
[issues#41]: https://github.com/tzfun/vue-web-terminal/issues/41
[vuejs/vue#12153]: https://github.com/vuejs/vue/issues/12153
[Github issues]: https://github.com/tzfun/vue-web-terminal/issues