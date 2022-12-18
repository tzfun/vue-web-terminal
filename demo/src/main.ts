import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import App from './App.vue';
import Terminal from 'vue-web-terminal';

import VueCodemirror from 'vue-codemirror';
import { createApp } from 'vue';

const extensions = [javascript(), oneDark];
createApp(App).use(VueCodemirror, {
    tabSize: 4,
    mode: 'javascript',
    theme: "darcula",
    lineNumbers: true,
    line: true,
    smartIndent: true,
    extensions
}).use(Terminal).mount('#app');
