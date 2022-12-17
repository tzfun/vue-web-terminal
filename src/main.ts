import { createApp } from "vue";
import "./style.css";
import JsonViewer from "vue-json-viewer";
import App from "./Terminal.vue";

createApp(App)
  .use(JsonViewer)
  .component("highlightjs", {
    template: `<div></div>`,
  })
  .component("codemirror", {
    template: `<div></div>`,
  })
  .mount("#app");
