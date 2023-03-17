import LocalTerminal from "@/components/LocalTerminal.vue";
import {getQuery} from "@/common/util";

export default {
    name: "TerminalPage",
    components: {LocalTerminal},
    data() {
        return {
            terminals: {
                default: {
                    show: true,
                    name: 'vue-web-terminal [default]',
                    context: '/vue-web-terminal/default',
                    localInitCmd: null,
                    showHeader: true,
                    dragConf: {
                        width: 500,
                        height: 500
                    }
                },
                fullscreen: {
                    show: false,
                    name: 'vue-web-terminal [fullscreen]',
                    context: '/vue-web-terminal/fullscreen',
                    localInitCmd: null,
                    showHeader: true,
                    dragConf: null
                },
                bottom: {
                    show: false,
                    name: 'vue-web-terminal [bottom]',
                    context: '/vue-web-terminal/bottom',
                    localInitCmd: null,
                    showHeader: true,
                    dragConf: null
                },
                list: []
            },

            showDefault: false,
            localInitCmd: null
        }
    },
    created() {
        let defaultTerminal = this.terminals.default
        this.initWindowSize(defaultTerminal.dragConf)
        let query = getQuery()
        if (query.cmd && query.cmd.trim().length > 0) {
            defaultTerminal.localInitCmd = query.cmd
            defaultTerminal.show = true
        }
    },
    methods: {
        initWindowSize(dragConf) {
            let width = document.body.clientWidth
            if (width < 960) {
                dragConf = null
            } else if (width >= 960 && width < 1264) {
                dragConf.width = 800
                dragConf.height = 600
            } else if (width >= 1264) {
                dragConf.width = 900
                dragConf.height = 700
            }
        },
        createNew() {
            let seq = this.terminals.list.length + 1
            this.terminals.list.push({
                show: true,
                name: `vue-web-terminal [multi-${seq}]`,
                context: `/vue-web-terminal/multi-${seq}`,
                localInitCmd: null,
                showHeader: true,
                dragConf: {
                    zIndex: 100,
                    width: 700,
                    height: 500,
                    init: {
                        x: 100 + seq * 50,
                        y: 70 + seq * 30
                    }
                }
            })
        },
        closeWindow(key, name) {
            if (key === 'list') {
                for (const item of this.terminals.list) {
                    if (item.name === name) {
                        item.show = false
                        break
                    }
                }
            } else {
                this.terminals[key].show = false
            }
        },
        onActive(key, name) {
            if (key === 'list') {
                for (const item of this.terminals.list) {
                    if (item.dragConf) {
                        if (item.name === name) {
                            item.dragConf.zIndex = 101
                        } else {
                            item.dragConf.zIndex = 100
                        }
                    }
                }
            }
        }
    }
}