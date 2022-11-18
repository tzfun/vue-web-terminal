import TContainer from "@/components/TContainer";
import {shellProps} from "@/components/TProps";
import ShellApi from "@/components/shell/ShellApi";
import {_getByteLen, _getSelection} from "@/tools/Util";
import Term from "@/components/shell/ansi/Term";

const config = require("@/config.json")

export default {
    name: "Shell",
    components: {TContainer},
    props: shellProps,
    getApi: (name) => {
        return ShellApi.getApi(name)
    },
    data() {
        return {
            command: '',
            showCursor: false,
            window: {
                cols: 0,
                rows: 0,
                width: 0,
                height: 0
            },
            ansiControl: {
                lines: [],
                styleFlag: [],
                attachStyle: '',
                //  光标的位置，从0开始
                rowNum: 0,
                colNum: 0,
                backup: {
                    lines: [],
                    rowNum: 0,
                    colNum: 0
                },
                //  0-normal, 1-application
                keypad: 0
            },
            keydownListener: null,
            term: null
        }
    },
    created() {
        this.term = new Term(this.ansiControl, this, this.name)
        // ShellApi.unregister(this.name)
        ShellApi.register(this.name, {
            output: str => {
                this._pushANSI(str)
            },
            clear: () => {
                this.term.clearScreen()
            },
            onResize: () => {
                return this._calculateWindowInfo()
            },
            getShellInfo: () => {
                return this.window
            }
        }, true)

        this.keydownListener = event => {
            if (this.showCursor) {
                if (this.showCursor && document.activeElement !== this.$refs.cmdInput) {
                    this.$refs.cmdInput.focus()
                }
                this.term.onInput(event)
            }
        }
        window.addEventListener('keydown', this.keydownListener);
    },
    mounted() {
        this._calculateWindowInfo()
        this._focus()
    },
    destroyed() {
        this.$emit('destroyed', this.name)
        window.removeEventListener('keydown', this.keydownListener)
        ShellApi.unregister(this.name)
    },
    methods: {
        _onInput(event) {
            if (event.data) {
                this.$emit('onInput', event.data, event, this.name)
            }
        },
        _getCharWidth(str) {
            let charWidth = config.domStyle.shellCharWidth
            if (str) {
                let width = 0
                for (let char of str) {
                    width += (_getByteLen(char) === 1 ? charWidth.en : charWidth.cn)
                }
                return width
            } else {
                return charWidth
            }
        },
        _calculateWindowInfo() {
            return new Promise(resolve => {
                this.$nextTick(() => {
                    let windowRect = this.$refs.frame.$refs.window.getBoundingClientRect()
                    this.window.width = windowRect.width - config.domStyle.windowPaddingLeftAndRight * 2
                    this.window.height = windowRect.height
                    this.window.cols = Math.floor(this.window.width / this._getCharWidth().en)
                    this.window.rows = Math.floor(this.window.height / config.domStyle.windowLineHeight)
                    resolve(this.window)
                })
            })
        },
        _onFullscreenSwitch() {
            this._calculateWindowInfo()
            this.$emit('onWindowChange', this.window)
        },
        _triggerClick(key) {
            this.$emit('onClick', key, this.name)
        },
        _focus() {
            this.$nextTick(() => {
                //  没有文本被选中
                if (_getSelection().isCollapsed) {
                    if (this.$refs.cmdInput) {
                        this.$refs.cmdInput.focus()
                    }
                } else {
                    this.showCursor = true
                }
            })
        },
        _scrollToBottom() {
            this.$refs.frame._scrollToBottom()
        },
        _scrollOffset(val) {
            this.$refs.frame._scrollOffset(val)
        },
        _getCursorStyle() {
            let charWidth = config.domStyle.shellCharWidth.en
            let charHeight = config.domStyle.windowLineHeight

            return `display: inline-block;
                    position: absolute;
                    width: ${charWidth}px;
                    height: ${charHeight};
                    left: ${this.ansiControl.colNum * charWidth}px;
                    top: ${this.ansiControl.rowNum * charHeight}px;`
        },
        /**
         *  ANSI码中的数值都是从1开始
         *
         * @param str   ANSI字符串
         * @private
         */
        _pushANSI: function (str) {
            this.term.onOutput(str)
        }
    }
}
