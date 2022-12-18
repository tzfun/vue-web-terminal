import Terminal from "./Terminal.vue";
import TerminalObj from "./TerminalObj.js";
import JsonViewer from "vue-json-viewer";
import TerminalFlash from "./TerminalFlash";
import TerminalAsk from "./TerminalAsk";
import { App } from "vue";

Terminal.install = (app: App) => {
  app.use(JsonViewer);
};

Terminal.$api = TerminalObj;
Terminal.$Flash = TerminalFlash;
Terminal.$Ask = TerminalAsk;

export default Terminal;
