<template>
  <div :class="'t-container ' + (_isActive() ? '' : 't-disable-select')"
       :style="_getContainerStyle()"
       ref="terminalContainer">
    <div v-if="_draggable()">
      <div class="t-point t-point-lt" ref="resizeLT"></div>
      <div class="t-point t-point-rt" ref="resizeRT"></div>
      <div class="t-point t-point-lb" ref="resizeLB"></div>
      <div class="t-point t-point-rb" ref="resizeRB"></div>
    </div>

    <div class="terminal">
      <div class="t-header-container" ref="terminalHeader" v-if="showHeader"
           :style="_draggable() ? 'cursor: move;' : ''" @dblclick="_fullscreen">
        <slot name="header">
          <t-header :title="title"></t-header>
        </slot>
      </div>
      <div class="t-window"
           :style="`${showHeader ? `height:calc(100% - ${headerHeight}px);margin-top: ${headerHeight}px;` : 'height:100%'}`"
           ref="terminalWindow" @click="_focus" @dblclick="_focus(true)">
        <div class="t-log-box" v-for="(item,idx) in terminalLog" v-bind:key="idx">
          <span v-if="item.type === 'cmdLine'" class="t-crude-font t-cmd-line">
              <span class="prompt t-cmd-line-content"><span v-html="item.content"></span></span>
          </span>
          <div v-else>
            <span v-if="item.type === 'normal'">
              <slot name="normal" :message="item">
                <t-view-normal :item="item"></t-view-normal>
              </slot>
            </span>
            <div v-else-if="item.type === 'json'">
              <slot name="json" :message="item">
                <t-view-json :item="item" :idx="idx"></t-view-json>
              </slot>
            </div>
            <div v-else-if="item.type === 'code'">
              <slot name="code" :message="item">
                <t-view-code :item="item" :idx="idx"></t-view-code>
              </slot>
            </div>
            <div v-else-if="item.type === 'table'">
              <slot name="table" :message="item">
                <t-view-table :item="item" :idx="idx"></t-view-table>
              </slot>
            </div>
            <div v-else-if="item.type === 'html'">
              <slot name="html" :message="item">
                <div v-html="item.content"></div>
              </slot>
            </div>
          </div>
        </div>
        <div v-if="flash.open && flash.content">
          <slot name="flash" :content="flash.content">
            <div v-html="flash.content"></div>
          </slot>
        </div>
        <div v-if="ask.open && ask.question">
          <div v-html="ask.question" style="display: inline-block"></div>
          <input :type="ask.isPassword ? 'password' : 'text'"
                 ref="terminalAskInput"
                 v-model="ask.input"
                 class="t-ask-input"
                 autocomplete="off"
                 auto-complete="new-password"
                 @keyup.enter="_onAskInput">
        </div>
        <p class="t-last-line t-crude-font t-cmd-line" ref="terminalInputBox" v-show="showInputLine">
          <span class="prompt t-cmd-line-content t-disable-select" ref="terminalInputPrompt">
            <span>{{ context }}</span>
            <span>{{ contextSuffix }}</span>
          </span><span class="t-cmd-line-content" v-html="_commandFormatter(command)"></span><span
            v-show="cursorConf.show" class="cursor t-disable-select" ref="terminalCursor"
            :style="`width:${cursorConf.width}px;left:${cursorConf.left};top:${cursorConf.top};`">&nbsp;</span>
          <input type="text" autofocus="autofocus" v-model="command"
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
         :style="`${showHeader ? `height:calc(100% - ${headerHeight}px);margin-top: ${headerHeight}px;` : 'height:100%'}`">
      <slot name="textEditor" :data="textEditor">
        <t-editor :config="textEditor" @close="_textEditorClose" ref="terminalTextEditor"></t-editor>
      </slot>
    </div>
    <span class="t-flag t-crude-font t-cmd-line t-disable-select">
      <span class="t-cmd-line-content" ref="terminalEnFlag">a</span>
      <span class="t-cmd-line-content" ref="terminalCnFlag">你</span>
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

