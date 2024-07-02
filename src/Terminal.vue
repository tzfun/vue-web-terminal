<template>
  <div :class="'t-container ' + (isActive() ? '' : 't-disable-select')"
       :style="_getContainerStyle()"
       ref="terminalContainer">
    <div v-if="isDraggable()">
      <div class="t-point t-point-lt" ref="resizeLT"></div>
      <div class="t-point t-point-rt" ref="resizeRT"></div>
      <div class="t-point t-point-lb" ref="resizeLB"></div>
      <div class="t-point t-point-rb" ref="resizeRB"></div>
    </div>

    <div class="terminal">
      <div class="t-header-container" ref="terminalHeader" v-if="showHeader"
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
           :style="`${showHeader ? `height:calc(100% - ${headerHeight}px);margin-top: ${headerHeight}px;` : 'height:100%'};${enableFold ? 'padding:0 10px 0 20px;' : 'padding:5px 10px;'}`"
           ref="terminalWindow"
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
        <div v-if="flash.open && flash.content" :style="`margin-top:${lineSpace}px;`">
          <slot name="flash" :content="flash.content">
            <div v-html="flash.content"></div>
          </slot>
        </div>
        <div v-if="ask.open && ask.question" :style="`margin-top:${lineSpace}px;`">
          <div v-html="ask.question" style="display: inline-block"></div>
          <input :type="ask.isPassword ? 'password' : 'text'"
                 ref="terminalAskInput"
                 v-model="ask.input"
                 class="t-ask-input"
                 autocomplete="off"
                 auto-complete="new-password"
                 @keyup.enter="_onAskInput">
        </div>
        <p class="t-last-line t-crude-font t-cmd-line" ref="terminalInputBox" v-show="showInputLine" :style="`margin-top:${lineSpace}px;`">
          <span class="prompt t-cmd-line-content t-disable-select" ref="terminalInputPrompt">
            <span>{{ context }}</span>
            <span>{{ contextSuffix }}</span>
          </span><span class="t-cmd-line-content" v-html="_commandFormatter(command)"></span><span
            v-show="cursorConf.show" :class="`t-cursor t-disable-select t-cursor-${cursorStyle} ${cursorBlink ? 't-cursor-blink' : ''}`" ref="terminalCursor"
            :style="`width:${cursorConf.width}px;left:${cursorConf.left};top:${cursorConf.top};`">&nbsp;</span>
          <input type="text"
                 autofocus="autofocus"
                 v-model="command"
                 class="t-cmd-input t-disable-select"
                 ref="terminalCmdInput"
                 autocomplete="off"
                 auto-complete="new-password"
                 @keydown="_onInputKeydown"
                 @keyup="_onInputKeyup"
                 @input="_onInput"
                 @focusin="cursorConf.show = true"
                 @keyup.up.exact="_switchPreCmd"
                 @keyup.down.exact="_switchNextCmd"
                 @keyup.enter="_execute">
        </p>
        <slot name="helpCmd" :item="searchCmdResult.item">
          <p class="t-help-msg">
            {{ searchCmdResult.item ? searchCmdResult.item.usage : '' }}
          </p>
        </slot>
      </div>
    </div>
    <div v-if="enableExampleHint">
      <slot name="helpBox" :showHeader="showHeader" :item="searchCmdResult.item">
        <t-help-box ref="terminalHelpBox"
                    :top="headerHeight + 10"
                    :result="searchCmdResult"
                    v-show="searchCmdResult.show"></t-help-box>
      </slot>
    </div>

    <div class="t-text-editor-container" v-if="textEditor.open"
         :style="`${showHeader ? `height:calc(100% - ${headerHeight}px);margin-top: ${headerHeight}px;` : 'height:100%'};`">
      <slot name="textEditor" :data="textEditor">
        <t-editor :config="textEditor" @close="_textEditorClose" ref="terminalTextEditor"></t-editor>
      </slot>
    </div>
    <span class="t-flag t-crude-font t-disable-select">
      <span class="t-cmd-line-content" ref="terminalEnFlag">aaaaaaaaaa</span>
      <span class="t-cmd-line-content" ref="terminalCnFlag">你你你你你你你你你你</span>
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

