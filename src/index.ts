import Terminal from "./VueTerminal.vue";
import TerminalObj from "./TerminalObj";
import JsonViewer from "vue-json-viewer";
import TerminalFlash from "./TerminalFlash";
import TerminalAsk from "./TerminalAsk";
import type { App, Plugin } from "vue";

Terminal.install = (app: App) => {
  app.use(JsonViewer);
};

Terminal.$api = TerminalObj;
Terminal.$Flash = TerminalFlash;
Terminal.$Ask = TerminalAsk;

type TerminalType = typeof Terminal &
  Plugin & {
    $api: typeof TerminalObj;
    $Flash: typeof TerminalFlash;
    $Ask: typeof TerminalAsk;
  };

export default Terminal as TerminalType;
