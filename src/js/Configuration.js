export const DEFAULT_COMMANDS = [
    {
        key: 'help',
        title: 'Help',
        group: 'local',
        usage: 'help [pattern]',
        description: 'Show command document.',
        example: [
            {
                des: "Get all commands.",
                cmd: 'help'
            }, {
                des: "Get help documentation for exact match commands.",
                cmd: 'help refresh'
            }, {
                des: "Get help documentation for fuzzy matching commands.",
                cmd: 'help *e*'
            }, {
                des: "Get help documentation for specified group, match key must start with ':'.",
                cmd: 'help :groupA'
            }
        ]
    }, {
        key: 'clear',
        title: 'Clear screen or history logs',
        group: 'local',
        usage: 'clear [history]',
        description: 'Clear screen or history.',
        example: [
            {
                cmd: 'clear',
                des: 'Clear all records on the current screen.'
            }, {
                cmd: 'clear history',
                des: 'Clear command history'
            }
        ]
    }, {
        key: 'open',
        title: 'Open page',
        group: 'local',
        usage: 'open <url>',
        description: 'Open a specified page.',
        example: [{
            cmd: 'open blog.beifengtz.com'
        }]
    }
]

export const MESSAGE_TYPE = {
    CMD_LINE: 'cmdLine',
    NORMAL: 'normal',
    JSON: 'json',
    CODE: 'code',
    TABLE: 'table',
    HTML: 'html',
    ANSI: 'ansi'
}

export const MESSAGE_CLASS = {
    SUCCESS: 'success',
    ERROR: 'error',
    INFO: 'info',
    WARN: 'warning',
    SYSTEM: 'system'
}