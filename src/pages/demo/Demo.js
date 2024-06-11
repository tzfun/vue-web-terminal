import LocalTerminal from "@/components/LocalTerminal.vue";
import {getQuery} from "@/common/util";

export default {
    name: "TerminalPage",
    components: {LocalTerminal},
    data() {
        return {
            showEditor: false,
            terminals: {
                default: {
                    show: false,
                    name: 'vue-web-terminal [default]',
                    context: '/vue-web-terminal/default',
                    localInitCmd: null,
                    showHeader: true,
                    dragConf: null
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
            multiSeq: 1,
            releaseSeq: []
        }
    },
    mounted() {
        let defaultTerminal
        if (document.body.clientWidth > 960) {
            this.showEditor = true
            defaultTerminal = this.terminals.default
        } else {
            defaultTerminal = this.terminals.fullscreen
            defaultTerminal.name = 'vue-web-terminal'
            defaultTerminal.context = '/vue-web-terminal'
            defaultTerminal.style = "position:fixed;"
        }
        let query = getQuery()
        if (query.cmd && query.cmd.trim().length > 0) {
            defaultTerminal.localInitCmd = query.cmd
        }

        defaultTerminal.dragConf = this.initWindowSize()
        defaultTerminal.show = true
    },
    methods: {
        initWindowSize() {
            let dragConf = {
                pinned: false
            }
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
            if (this.showEditor && dragConf) {
                let height = document.body.clientHeight
                dragConf.init = {
                    x: (width - 500 - dragConf.width) / 2,
                    y: (height - dragConf.height) / 2
                }
            }
            return dragConf
        },
        showDemo(type) {
            for(let t in this.terminals) {
                if (t !== 'list') {
                    this.terminals[t].show = t === type
                }
            }
            if (type === 'list') {
                this.createNew()
            } else {
                this.resetList()
            }
        },
        resetList() {
            this.terminals.list = []
            this.releaseSeq = []
            this.multiSeq = 1
        },
        createNew() {
            let seq
            if (this.releaseSeq.length === 0) {
                seq = parseInt(this.multiSeq.toString())
            } else {
                seq = this.releaseSeq[0]
            }
            this.terminals.list.push({
                show: true,
                name: `vue-web-terminal [multi-${this.multiSeq}]`,
                context: `/vue-web-terminal/multi-${this.multiSeq}`,
                localInitCmd: null,
                showHeader: true,
                dragConf: {
                    zIndex: 100,
                    width: 700,
                    height: 500,
                    init: {
                        x: 100 + seq * 50,
                        y: 70 + seq * 30
                    },
                    pinned: false
                }
            })
            if (this.releaseSeq.length !== 0) {
                this.releaseSeq.splice(0, 1)
            }
            this.multiSeq++
        },
        closeWindow(key, name) {
            if (key === 'list') {
                let idx = -1
                for (let i in this.terminals.list) {
                    if (this.terminals.list[i].name === name) {
                        idx = i;
                        break
                    }
                }
                if (idx >= 0) {
                    this.releaseSeq.push(idx)
                    this.terminals.list[idx].show = false
                }

                if (this.releaseSeq.length === this.terminals.list.length) {
                    this.resetList()
                }
            } else {
                this.terminals[key].show = false
            }
            if (!this.showEditor) {
                this.$emit("close")
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
