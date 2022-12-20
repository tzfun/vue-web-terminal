import type { TerminalProps } from "./VueTerminal.vue"
import type { ElementInfo } from "./TerminalObj"
import type { DragableConf } from "./models/DraggableInterface"
import type { MessageType } from "./models/MessageInterface"
import _Terminal from "./VueTerminal.vue"
import TerminalObj from "./TerminalObj"
import TerminalFlash from "./TerminalFlash"
import TerminalAsk from "./TerminalAsk"
import type { App } from "vue"

const Terminal = Object.assign(_Terminal, {
  install: (app: App) => {
    app.component("vue-web-terminal", _Terminal)
  },
  $api: TerminalObj,
  $Flash: TerminalFlash,
  $Ask: TerminalAsk,
})

export default Terminal

export type { TerminalAsk, TerminalFlash, TerminalObj }
export type { TerminalProps, ElementInfo, DragableConf, MessageType }
