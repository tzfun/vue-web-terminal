import Terminal from "./Terminal.vue";
import TerminalObj from "./TerminalObj.js";
import JsonViewer from "vue-json-viewer";
import TerminalFlash from "./TerminalFlash";
import TerminalAsk from "./TerminalAsk";
import { App } from "vue";
import { TerminalPluginOption } from "./TerminalObj";

Terminal.install = (app: App, options: TerminalPluginOption) => {
  app.use(JsonViewer);
  let confHljs = false;
  let confCodemirror = false;
  if (options != null) {
    TerminalObj.setOptions(options);
    if (options.highlight) {
      confHljs = true;
    }
    if (options.codemirror) {
      confCodemirror = true;
    }
  }
  if (!confHljs) {
    app.component("highlightjs", {
      template: `<div></div>`,
    });
  }
  if (!confCodemirror) {
    app.component("codemirror", {
      template: `<div></div>`,
    });
  }
};

Terminal.$api = TerminalObj;
Terminal.$Flash = TerminalFlash;
Terminal.$Ask = TerminalAsk;

export default Terminal;
