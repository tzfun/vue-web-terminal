export default {
  data() {
    return {
      keydownListener: null,
    };
  },
  created() {
    TerminalObj.register(this.name, (type, options) => {
      if (type === "pushMessage") {
        this._pushMessage(options);
      } else if (type === "fullscreen") {
        this._fullscreen();
      } else if (type === "isFullscreen") {
        return this.fullscreen;
      } else if (type === "dragging") {
        if (this._draggable()) {
          this._dragging(options.x, options.y);
        } else {
          console.warn("Terminal is not draggable");
        }
      } else if (type === "execute") {
        if (_nonEmpty(options)) {
          this.command = options;
          this._execute();
        }
      } else if (type === "elementInfo") {
        let windowRect = this.terminalWindow.getBoundingClientRect();
        let containerRect = this.terminalContainer.getBoundingClientRect();
        let hasScroll =
          this.terminalWindow.scrollHeight > this.terminalWindow.clientHeight ||
          this.terminalWindow.offsetHeight > this.terminalWindow.clientHeight;
        return {
          pos: this._getPosition(), //  窗口所在位置
          screenWidth: containerRect.width, //  窗口整体宽度
          screenHeight: containerRect.height, //  窗口整体高度
          clientWidth: hasScroll
            ? windowRect.width - 48
            : windowRect.width - 40, //  可显示内容范围高度，减去padding值，如果有滚动条去掉滚动条宽度
          clientHeight: windowRect.height, //  可显示内容范围高度
          charWidth: {
            en: this.byteLen.en, //  单个英文字符宽度
            cn: this.byteLen.cn, //  单个中文字符宽度
          },
        };
      } else if (type === "focus") {
        this._focus();
      } else if (type === "textEditorOpen") {
        let opt = options || {};
        this.textEditorData.value = opt.content;
        this.textEditorData.open = true;
        this.textEditorData.onClose = opt.onClose;
        this._focus();
      } else if (type === "textEditorClose") {
        return this._textEditorClose();
      } else {
        console.error("Unsupported event type: " + type);
      }
    });
  },
  async mounted() {
    this.$emit("initBefore", this.name);

    if (this.initLog != null) {
      await this._pushMessageBatch(this.initLog, true);
    }

    if (this.commandStore != null) {
      if (this.commandStoreSort != null) {
        this.commandStore.sort(this.commandStoreSort);
      }
      this.allCommandStore = this.allCommandStore.concat(this.commandStore);
    }
    this.byteLen = {
      en: this.terminalEnFlag.getBoundingClientRect().width / 2,
      cn: this.terminalCnFlag.getBoundingClientRect().width / 2,
    };
    this.cursorConf.defaultWidth = this.byteLen.en;

    if (this.terminalWindow != null) {
      this.terminalWindow.scrollTop = this.terminalWindow.offsetHeight;
    }

    //  计算context的宽度和行高，用于跨行时定位光标位置
    let promptRect = this.terminalInputPrompt.getBoundingClientRect();
    this.inputBoxParam.promptHeight = promptRect.height;
    this.inputBoxParam.promptWidth = promptRect.width;

    this.keydownListener = (event) => {
      if (this._isActive()) {
        if (this.cursorConf.show) {
          if (event.key.toLowerCase() === "tab") {
            if (this.tabKeyHandler == null) {
              this._fillCmd();
            } else {
              this.tabKeyHandler(event);
            }
            event.preventDefault();
          } else if (document.activeElement !== this.$refs.cmdInput) {
            this.$refs.cmdInput.focus();
          }
        }
        this.$emit("onKeydown", event, this.name);
      }
    };
    window.addEventListener("keydown", this.keydownListener);
    this._initDrag();
    this.$emit("initComplete", this.name);
  },
  unmounted() {
    this.$emit("destroyed", this.name);
    window.removeEventListener("keydown", this.keydownListener);
    TerminalObj.unregister(this.name);
  },
  watch: {
    terminalLog: {
      handler() {
        this._jumpToBottom();
      },
      deep: true,
    },
    context: {
      handler() {
        nextTick(() => {
          this.inputBoxParam.promptWidth =
            this.terminalInputPrompt.getBoundingClientRect().width;
        }).then(() => {});
      },
    },
  },
  methods: {
    
  },
};
