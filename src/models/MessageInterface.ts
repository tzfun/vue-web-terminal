export interface MessageType {
  time?: any;
  class: "success" | "error" | "system" | "info" | "warning";
  type: "normal" | "json" | "code" | "table" | "cmdLine" | "splitLine" | "html";
  content: any;
  tag?: any;
}
