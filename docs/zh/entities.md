
## 配置类型

### Command
```ts
type Command = {
    key: string;
    title?: string;
    group?: string;
    usage?: string;
    description?: string;
    example?: Array<CommandExample>;
};
```

### DragConfig
```ts
type DragConfig = {
    width: string | number;
    height: string | number;
    zIndex?: string;
    init?: Position;
    pinned: boolean;
};
```

## 内置命令
```json
[
  {
    "key": "help",
    "title": "Help",
    "group": "local",
    "usage": "help [pattern]",
    "description": "Show command document.",
    "example": [
      {
        "des": "Get help documentation for exact match commands.",
        "cmd": "help open"
      },
      {
        "des": "Get help documentation for fuzzy matching commands.",
        "cmd": "help *e*"
      },
      {
        "des": "Get help documentation for specified group, match key must start with ':'.",
        "cmd": "help :groupA"
      }
    ]
  },
  {
    "key": "clear",
    "title": "Clear logs",
    "group": "local",
    "usage": "clear [history]",
    "description": "Clear screen or history.",
    "example": [
      {
        "cmd": "clear",
        "des": "Clear all records on the current screen."
      },
      {
        "cmd": "clear history",
        "des": "Clear command history."
      }
    ]
  },
  {
    "key": "open",
    "title": "Open page",
    "group": "local",
    "usage": "open <url>",
    "description": "Open a specified page.",
    "example": [
      {
        "cmd": "open blog.beifengtz.com"
      }
    ]
  }
]
```