import { createApp } from "vue";
import "./style.css";
import JsonViewer from "vue-json-viewer";
import "highlight.js/styles/stackoverflow-light.css";
import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import hljsVuePlugin from "@highlightjs/vue-plugin";
import codemirrorVuePlugin from "vue-codemirror";
import App from "./Terminal.vue";

hljs.registerLanguage("javascript", javascript);

createApp(App)
  .use(hljsVuePlugin)
  .use(JsonViewer)
  .use(codemirrorVuePlugin)
  .mount("#app");
