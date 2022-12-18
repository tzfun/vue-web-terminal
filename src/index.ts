import Terminal from "./VueTerminal.vue";
import TerminalObj from "./TerminalObj.js";
import JsonViewer from "vue-json-viewer";
import TerminalFlash from "./TerminalFlash";
import TerminalAsk from "./TerminalAsk";
import { App } from "vue";

export const install = (app: App) => {
  app.use(JsonViewer);
};
export const $api = TerminalObj;
export const $Ask = TerminalAsk;
export const $Flash = TerminalFlash;

export default Terminal;
