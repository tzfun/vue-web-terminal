# Theme

<img src="https://shields.io/github/package-json/v/tzfun/vue-web-terminal/vue2" style="margin-right: 8px;">
<img src="https://shields.io/github/package-json/v/tzfun/vue-web-terminal/vue3" style="margin-right: 8px;">

Starting from `2.1.13` and `3.2.0` versions, the plugin has two built-in themes: `dark` and `light`, 
and extracts some css variables to provide the ability to customize the theme.

::: warning
After `2.3.1` and `3.3.1` (inclusive) versions, each instance can be set with a separate theme, 
and there is no need to import the built-in default theme css file.
:::

## Dark Theme

The dark theme is the default theme of the plugin, which is more in line with the usage habits of most users. 
Set the theme property to dark. If you don't set the property, it will take this value by default.

```vue title="MyTerminal.vue"
<template>
    <terminal name='my-terminal' theme='dark'></terminal>
</template>
```

Example:
![dark](/images/dark.jpg)

## Light Theme

The plugin has a built-in light theme, just set the theme property to `light`.

```vue title="MyTerminal.vue"
<template>
    <terminal name='my-terminal' theme='light'></terminal>
</template>
```

Example:
![dark](/images/light.jpg)

## Customize Theme

The plugin implements themes by modifying the colors of different elements or modules. These colors are specified 
through css variables, so you only need to define the corresponding css variables. 
The following is the color definition of the dark theme.

```css
:root {
    --t-main-background-color: #191b24;
    --t-main-font-color: #fff;
    --t-window-box-shadow: 0 0 40px 1px rgb(0 0 0 / 20%);
    --t-header-background-color: #959598;
    --t-header-font-color: white;
    --t-tag-font-color: #fff;
    --t-cursor-color: #fff;
    --t-cmd-key-color: yellow;
    --t-cmd-arg-color: #c0c0ff;
    --t-cmd-splitter-color: #808085;
    --t-link-color: antiquewhite;
    --t-link-hover-color: white;
    --t-table-border: 1px dashed #fff;
    --t-selection-font-color: black;
    --t-selection-background-color: white;
    --t-code-inline-font-color: #00b10e;
    --t-cmd-help-background-color: black;
    --t-cmd-help-code-background-color: rgba(0, 0, 0, 0);
    --t-cmd-help-box-shadow: 0px 0px 0px 4px rgb(255 255 255 / 20%);
    --t-text-editor-floor-background-color: rgb(72 69 69);
    --t-text-editor-floor-close-btn-color: #bba9a9;
    --t-text-editor-floor-save-btn-color: #00b10e;
    --t-text-editor-floor-btn-hover-color: #befcff;
    --t-json-background-color: rgba(0, 0, 0, 0);
    --t-json-value-obj-color: #bdadad;
    --t-json-value-bool-color: #cdc83c;
    --t-json-value-number-color: #f3c7fb;
    --t-json-ellipsis-background-color: #674848;
    --t-json-more-background-webkit: -webkit-linear-gradient(top, rgba(0, 0, 0, 0) 20%, rgb(255 255 255 / 10%) 100%);
    --t-json-more-background: linear-gradient(to bottom, rgba(0, 0, 0, 0) 20%, rgb(255 255 255 / 10%) 100%);
    --t-json-deep-selector-border-color: rgb(249 249 249 / 52%);
    --t-code-default-background-color: rgb(39 50 58);
    --t-log-box-hover-script-background-color: #2a2c34;
    --t-log-box-folded-background-color: #042f36;
    --t-log-box-folded-hover-background-color: #515157;
    --t-log-fold-icon-color: #4ca5c1;
    --t-log-fold-icon-background-color: #191b24;
    --t-log-fold-icon-border-color: #4ca5c1;
    --t-log-fold-icon-active-color: #191b24;
    --t-log-fold-icon-active-background-color: #4ca5c1;
    --t-log-fold-line-color: #4ca5c1;
    --t-cmd-tips-background-color: #544a4a;
    --t-cmd-tips-font-color: #fff;
    --t-cmd-tips-active-background-color: #5c6ec9;
    --t-cmd-tips-content-font-color: #fff;
    --t-cmd-tips-des-font-color: #cbb0b0;
    --t-cmd-tips-footer-font-color: #e3c2c2;
    --t-cmd-tips-footer-background-color: #546456;
}
```

If you need to implement your own theme style, create a new css file in your project, 
rewrite the above css variables in this file, and then configure your custom theme in `main.js`.
::: code-tabs#js

@tab Vue2

```js
import {Terminal, configTheme} from 'vue-web-terminal';

//  Export css file content to variables
import customTheme1 from '!!raw-loader!/your-style-dir/terminal-custom-theme1.css';
import customTheme2 from '!!raw-loader!/your-style-dir/terminal-custom-theme2.css';

configTheme('customTheme1', customTheme1);
configTheme('customTheme2', customTheme2);

Vue.use(Terminal);
```

@tab Vue3

```js
import {Terminal, configTheme} from 'vue-web-terminal';

//  Export css file content to variables
import customTheme1 from '/your-style-dir/terminal-custom-theme1.css?inline';
import customTheme2 from '/your-style-dir/terminal-custom-theme2.css?inline';

configTheme('customTheme1', customTheme1);
configTheme('customTheme2', customTheme2);

createApp(App).use(Terminal)
```
:::

Then use the custom theme in your code:
```vue title="MyTerminal.vue"
<template>
    <terminal name='my-terminal' theme='customTheme1'></terminal>
</template>
```

If you want to override the default `dark` and `light` themes, you can override the corresponding theme names when registering:
```js
configTheme('dark', customTheme1);
configTheme('light', customTheme2);
```

::: info 提示
The css file must be filled in the following format and no other content can be included. 
The css selector before `{}` can be arbitrary and will not be actually used.
```css
.anything {
    --t-main-background-color: #191b24;
    // ...
}
```
:::

## Modify the theme

The theme attribute value is two-way bound, and the theme can be dynamically modified by modifying the bound js variable.
```vue
<script setup>
  import Terminal from 'vue-web-terminal';

  const theme = ref('dark')

  //  Modify the current window theme
  const changeTheme = () => {
    if (theme.value === 'dark') {
      theme.value = 'light'
    } else {
      theme.value = 'dark'
    }
  }
</script>
<template>
  <terminal name='my-terminal' :theme='theme'></terminal>
</template>
```

## Welcome to co-create the theme

The default themes provided by the plugin are relatively general and may not suit your preferences. 
If you have a better theme design and are willing to share it, you are welcome to share your theme design with the 
author or submit a [Pull Request][Github PR]. Your design is likely to be selected as the default theme of the plugin 
and used by many developers~

[Github PR]: https://github.com/tzfun/vue-web-terminal/pulls

<CommentService></CommentService>
