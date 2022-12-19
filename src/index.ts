import type { TerminalProps } from "./VueTerminal.vue";
import type { ElementInfo } from "./TerminalObj";
import _Terminal from "./VueTerminal.vue";
import TerminalObj from "./TerminalObj";
import JsonViewer from "vue-json-viewer";
import TerminalFlash from "./TerminalFlash";
import TerminalAsk from "./TerminalAsk";
import type { App } from "vue";

const Terminal = Object.assign(_Terminal, {
  install: (app: App) => {
    app.use(JsonViewer);
  },
  $api: TerminalObj,
  $Flash: TerminalFlash,
  $Ask: TerminalAsk,
});

export default Terminal;

export { TerminalAsk, TerminalFlash, TerminalObj };
export type { TerminalProps, ElementInfo };
