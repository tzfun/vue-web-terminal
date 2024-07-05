<template>
  <div :class="'t-container ' + (isActive() ? '' : 't-disable-select')"
       :style="_getContainerStyle()"
       ref="terminalContainerRef">
    <div v-if="isDraggable()">
      <div class="t-point t-point-lt" ref="resizeLTRef"></div>
      <div class="t-point t-point-rt" ref="resizeRTRef"></div>
      <div class="t-point t-point-lb" ref="resizeLBRef"></div>
      <div class="t-point t-point-rb" ref="resizeRBRef"></div>
    </div>

    <div class="terminal">
      <div class="t-header-container" ref="terminalHeaderRef" v-if="showHeader"
           :style="isDraggable() ? 'cursor: move;' : ''" @dblclick="_fullscreen">
        <slot name="header">
          <t-header :title="title"
                    :pinned="isPinned()"
                    :draggable="isDraggable()"
                    :fullscreen-state="fullscreenState"
                    @on-click="_triggerClick"/>
        </slot>
      </div>
      <div class="t-window"
           :style="`${showHeader ? `height:calc(100% - ${headerHeight}px);margin-top: ${headerHeight}px;` : 'height:100%'};
           padding:${WINDOW_STYLE.PADDING_TOP}px ${WINDOW_STYLE.PADDING_RIGHT}px ${WINDOW_STYLE.PADDING_BOTTOM}px ${enableFold ? WINDOW_STYLE.PADDING_LEFT_FOLD : WINDOW_STYLE.PADDING_LEFT}px;`"
           ref="terminalWindowRef"
           @click="_focus"
           @dblclick="_focus(true)">
        <div v-for="(group, groupIdx) in terminalLog"
             :key="groupIdx"
             :class="`t-log-box t-log-fold-container ${enableHoverStripe && group.logs.length > 1 ? 't-log-box-hover-script' : ''} ${group.fold ? 't-log-box-folded' : ''}`"
             :style="`margin-top:${lineSpace}px;`">
          <span v-if="_enableFold(group)">
            <span class="t-log-fold-icon t-log-fold-icon-active"  v-if="group.fold" @click="_closeGroupFold(group)">+</span>
            <span class="t-log-fold-icon" v-else @click="group.fold = true">-</span>
            <span class="t-log-fold-line" v-if="!group.fold"/>
          </span>

          <div v-for="(item,idx) in group.logs"
               :key="idx"
               :style="`margin-top:${lineSpace}px;`"
               @click="_closeGroupFold(group)">
            <span v-if="item.type === 'cmdLine'"
                  class="t-crude-font t-cmd-line t-cmd-line-content"
                  v-html="item.content"/>
            <div v-else>
            <span v-if="item.type === 'normal'">
              <slot name="normal" :message="item">
                <t-view-normal :item="item"/>
              </slot>
            </span>
              <div v-else-if="item.type === 'json'">
                <slot name="json" :message="item">
                  <t-view-json :item="item" :idx="idx"/>
                </slot>
              </div>
              <div v-else-if="item.type === 'code'">
                <slot name="code" :message="item">
                  <t-view-code :item="item"/>
                </slot>
              </div>
              <div v-else-if="item.type === 'table'">
                <slot name="table" :message="item">
                  <t-view-table :item="item"/>
                </slot>
              </div>
              <div v-else-if="item.type === 'html'">
                <slot name="html" :message="item">
                  <div v-html="item.content"/>
                </slot>
              </div>
            </div>
          </div>
        </div>
        <div v-if="flash.open && flash.content" :style="`margin:${lineSpace}px 0;`">
          <slot name="flash" :content="flash.content">
            <div v-html="flash.content"></div>
          </slot>
        </div>
        <div v-if="ask.open && ask.question" :style="`margin:${lineSpace}px 0;`">
          <div v-html="ask.question" style="display: inline-block"></div>
          <input :type="ask.isPassword ? 'password' : 'text'"
                 ref="terminalAskInputRef"
                 v-model="ask.input"
                 class="t-ask-input"
                 autocomplete="off"
                 auto-complete="new-password"
                 @keyup.enter="_onAskInput">
        </div>
        <p class="t-last-line t-crude-font t-cmd-line" ref="terminalInputBoxRef" v-show="showInputLine" :style="`margin-top:${lineSpace}px;`">
          <span class="prompt t-cmd-line-content t-disable-select" ref="terminalInputPromptRef">
            <span>{{ context }}</span>
            <span>{{ contextSuffix }}</span>
          </span><span class="t-cmd-line-content" v-html="_commandFormatter(command)"></span><span
            v-show="cursorConf.show"
            :class="`t-cursor t-disable-select t-cursor-${cursorStyle} ${enableCursorBlink ? 't-cursor-blink' : ''}`"
            ref="terminalCursorRef"
            :style="`width:${cursorConf.width}px;left:${cursorConf.left};top:${cursorConf.top};`">&nbsp;</span>
          <input type="text"
                 autofocus="autofocus"
                 v-model="command"
                 class="t-cmd-input t-disable-select"
                 ref="terminalCmdInputRef"
                 autocomplete="off"
                 auto-complete="new-password"
                 @keydown="_onInputKeydown"
                 @keyup="_onInputKeyup"
                 @input="_onInput"
                 @focusin="cursorConf.show = true"
                 @keyup.up.exact="_inputKeyUp"
                 @keyup.down.exact="_inputKeyDown"
                 @keyup.enter="_execute">
        </p>
      </div>
    </div>
    <div v-if="isEnableHelpBox">
      <slot name="helpBox" :showHeader="showHeader" :item="selectedTipCommand">
        <t-help-box ref="terminalHelpBoxRef"
                    :top="headerHeight + 10"
                    :content="selectedTipCommand"
                    v-show="tips.helpBox.open && !_screenType().xs"/>
      </slot>
    </div>

    <div class="t-text-editor-container" v-if="textEditor.open"
         :style="`${showHeader ? `height:calc(100% - ${headerHeight}px);margin-top: ${headerHeight}px;` : 'height:100%'};`">
      <slot name="textEditor" :data="textEditor">
        <t-editor :config="textEditor" @close="_textEditorClose" ref="terminalTextEditorRef"></t-editor>
      </slot>
    </div>
    <div class="t-cmd-tips"
         v-if="tips.open"
         :style="`top: ${tips.style.top}px;left: ${tips.style.left}px;opacity: ${tips.style.opacity};`"
         ref="terminalCmdTipsRef">
      <div class="t-cmd-tips-items">
        <div v-for="(item,idx) in tips.items"
             :key="idx"
             @click="_clickTips(idx)"
             :class="'t-cmd-tips-item ' + (idx === tips.selectedIndex ? 't-cmd-tips-item-active ' : ' ') + (idx === 0 ? 't-cmd-tips-item-first ' : ' ')"
        >
          <span class="t-cmd-tips-content" v-html="item.content"></span>
          <span class="t-cmd-tips-des" v-html="item.description"></span>
        </div>
      </div>
      <div class="t-cmd-tips-footer">
        Press <strong>Tab</strong> to choose the selected suggestion.
      </div>
    </div>
    <span class="t-flag t-crude-font t-disable-select">
      <span class="t-cmd-line-content" ref="terminalEnFlagRef">aaaaaaaaaa</span>
      <span class="t-cmd-line-content" ref="terminalCnFlagRef">你你你你你你你你你你</span>
    </span>
  </div>
</template>

<script>
import './css/scrollbar.css'
import './css/ansi.css'
import './css/style.css'
import 'vue-json-viewer/style.css'
import TerminalJs from './Terminal.js'

export default TerminalJs
</script>

<style scoped>

</style>

