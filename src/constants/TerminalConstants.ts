import { InitLogType } from "../models/LogInterface"
import { CommandType, CursorConfType } from "../models/CommandInterface"
import { DragableConf } from "../models/DraggableInterface"
const InitLog: InitLogType = [
  {
    type: "normal",
    content: "Terminal Initializing ...",
  },
  {
    type: "normal",
    content: "Current login time: " + new Date().toLocaleString(),
  },
  {
    type: "normal",
    content:
      "Welcome to vue web terminal! If you are using for the first time, you can use the <span class='t-cmd-key'>help</span> command to learn.Thanks for your star support: <a class='t-a' target='_blank' href='https://github.com/tzfun/vue-web-terminal'>https://github.com/tzfun/vue-web-terminal</a>",
  },
]

const AllCommandStore: CommandType[] = [
  {
    key: "help",
    title: "Help",
    group: "local",
    usage: "help [pattern]",
    description: "Show command document.",
    example: [
      {
        des: "Get all commands.",
        cmd: "help",
      },
      {
        des: "Get help documentation for exact match commands.",
        cmd: "help refresh",
      },
      {
        des: "Get help documentation for fuzzy matching commands.",
        cmd: "help *e*",
      },
      {
        des: "Get help documentation for specified group, match key must start with ':'.",
        cmd: "help :groupA",
      },
    ],
  },
  {
    key: "clear",
    title: "Clear screen or history logs",
    group: "local",
    usage: "clear [history]",
    description: "Clear screen or history.",
    example: [
      {
        cmd: "clear",
        des: "Clear all records on the current screen.",
      },
      {
        cmd: "clear history",
        des: "Clear command history",
      },
    ],
  },
  {
    key: "open",
    title: "Open page",
    group: "local",
    usage: "open <url>",
    description: "Open a specified page.",
    example: [
      {
        cmd: "open blog.beifengtz.com",
      },
    ],
  },
]

const CursorConf: CursorConfType = {
  defaultWidth: 6,
  width: 6,
  left: "unset",
  top: 0,
  idx: 0, //  从0开始
  show: false,
}

const DragableConf: DragableConf = {
  width: 700,
  height: 500,
  zIndex: 100,
  init: {},
}

export const DataConstant = {
  CursorConf,
  ByteLen: {
    en: 8,
    cn: 13,
  },
  JsonViewDepth: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  AllCommandStore,
  InitLog,
  DragableConf,
}
