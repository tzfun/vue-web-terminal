<template>
  <div id="terminal-container" @click.self="_activeCursor">
    <div class="terminal">
      <div class="terminal-header">
        <h4>
          <span @click="eventBus.$emit('showFloatDoor')" style="cursor: pointer">{{ projectName }}</span>
          <span v-if="$store.state.server != null" class="app-server">{{ $store.state.server.name }}</span>
        </h4>
        <ul class="shell-dots">
          <li class="shell-dots-red">
            <i class="el-icon-close page-close" @click="_exit"></i>
          </li>
          <li class="shell-dots-yellow"></li>
          <li class="shell-dots-green"></li>
        </ul>
      </div>
      <div class="terminal-window" id="terminalWindow" @click.self="_activeCursor">
        <p v-for="(item,idx) in terminalLog" v-bind:key="idx" @click.self="_activeCursor">
          <span v-if="item.cmdLine" class="crude-font">
              <span class="prompt">{{ item.message }}</span>
          </span>
          <span v-else-if="item.splitLine">
            <span style="line-height: 60px">====> {{ item.message }}</span>
          </span>
          <span v-else>
            <span @click.self="_activeCursor">
<!--              <span>{{ item.time == null ? "" : (item.time + " ") }}</span>-->
              <span v-show="item.type != null && !item.viewJson && !item.viewCode" :class="item.type"
                    style="margin-right: 10px">{{ item.tag == null ? item.type : item.tag }}</span>
            </span>
            <span v-if="item.viewJson" style="position: relative">
                <json-viewer :expand-depth="item.depth"
                             sort boxed copyable expanded
                             :key="idx + '_' + item.depth"
                             :value="parseToJson(item.message)">
                </json-viewer>
                <el-select class="json-deep-selector"
                           v-model="item.depth"
                           placeholder="选择显示层级">
                  <el-option
                      v-for="i in jsonViewDepth"
                      :key="i"
                      :label="'显示 '+ i +' 层'"
                      :value="i">
                  </el-option>
                </el-select>
            </span>
            <span v-else-if="item.viewCode" style="position: relative">
              <span class="code-viewer">
                <codemirror ref="codeViewer" v-model="item.message" :options="cmOptions"/>
              </span>
            </span>
            <span v-else v-html="item.message" @click="_activeCursor"></span>
          </span>
        </p>
        <p class="terminal-last-line crude-font" v-show="showInputLine" @click.self="_activeCursor">
          <span>
            <span class="prompt">{{ projectName }}
              <span v-if='require("@/common/extensions")._nonEmpty($store.state.gameAddress)'>
                {{ $store.state.gameAddress }}
              </span>
              <span v-else>
                <span>{{ $store.state.gameIds.join(',') }}</span>
              </span>
              <span>[{{ $store.getters.getProxy }}]</span>
              <span> > </span>
            </span>
          </span>
          <span v-html="require('@/common/extensions')._html(command)"></span>
          <span v-show="cursorConf.show" class="cursor"
                :style="'width:' + cursorConf.width + 'px;margin-left:' + cursorConf.left +'px'">&nbsp;</span>
          <input type="text" autofocus="autofocus" id="command-input" v-model="command" class="input-box"
                 ref="inputCmd"
                 autocomplete="off"
                 auto-complete="new-password"
                 @keyup="onKey"
                 @focusin="cursorConf.show = true"
                 @focusout="cursorConf.show = false"
                 @keyup.enter="execute"
                 @keyup.up.exact="switchPreCmd"
                 @keyup.down.exact="switchNextCmd"
                 @keydown.ctrl.82="_searchCmdLog"
                 @keydown.left.exact="onDownLeft"
                 @keydown.right.exact="onDownRight">
          <span id="en-flag" @click.self="_activeCursor">aa</span>
          <span id="cn-flag" @click.self="_activeCursor">你好</span>
        </p>
        <p class="help-msg" v-if="searchCmd.item != null">{{ searchCmd.item.usage }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import TerminalJs from './terminal.js'
export default TerminalJs

</script>

<style scoped>

#terminal-container {
  position: absolute;
  width: 100%;
  min-height: 100%;
  margin: 0;
  padding: 0;
  background-color: #030924;
  overflow: auto;
}

.terminal-header {
  position: absolute;
  z-index: 2;
  top: 0;
  right: 0;
  left: 0;
  background-color: #959598;
  text-align: center;
  padding: 2px;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}

.terminal-header h4 {
  font-size: 14px;
  margin: 5px;
  letter-spacing: 1px;
  color: white;
}

.terminal-header ul.shell-dots {
  position: absolute;
  top: 5px;
  left: 8px;
  padding-left: 0;
  margin: 0;
}

.terminal-header ul.shell-dots li {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 6px;
  margin-left: 6px;
}

.terminal-header ul .shell-dots-red {
  background-color: #c83030;
}

.terminal-header ul .shell-dots-yellow {
  background-color: #f7db60;
}

.terminal-header ul .shell-dots-green {
  background-color: #2ec971;
}

.terminal-window {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  overflow: auto;
  z-index: 1;
  max-height: none;
  background-color: #030924;
  min-height: 140px;
  padding: 50px 20px 20px 20px;
  font-weight: 400;
  font-family: Monaco, Menlo, Consolas, monospace;
  color: #fff;
}

.terminal-window .prompt:before {
  content: "$";
  margin-right: 10px;
}

.terminal-window p {
  overflow-wrap: break-word;
  word-break: break-all;
  font-size: 13px;
}

.terminal-window p .cmd {
  line-height: 24px;
}

.terminal-window .cursor {
  background-color: #fff;
  animation: step-end 1s infinite;
  -webkit-animation: step-end 1s infinite;
  -o-animation: step-end 1s infinite;
  -moz-animation: step-end 1s infinite;
  position: absolute;
  height: 16px;
  margin-top: 1px;
}

.input-box {
  position: relative;
  background: #030924;
  border: none;
  width: 1px;
  opacity: 0;
  cursor: default;
  /*user-select:none;*/
}

input[type="text" i] {
  padding: 1px 2px;
}

input {
  -webkit-writing-mode: horizontal-tb !important;
  text-rendering: auto;
  color: -internal-light-dark(black, white);
  letter-spacing: normal;
  word-spacing: normal;
  text-transform: none;
  text-indent: 0;
  text-shadow: none;
  display: inline-block;
  text-align: start;
  appearance: textfield;
  background-color: -internal-light-dark(rgb(255, 255, 255), rgb(59, 59, 59));
  -webkit-rtl-ordering: logical;
  cursor: text;
  margin: 0;
  font: 400 13.3333px Arial;
  padding: 1px 2px;
  border-width: 2px;
  border-style: inset;
  border-color: -internal-light-dark(rgb(118, 118, 118), rgb(195, 195, 195));
  border-image: initial;
}

.terminal-last-line {
  font-size: 0;
  word-spacing: 0;
  letter-spacing: 0;
  position: relative;
}

@keyframes step-end {
  0%, 100% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
}

.terminal-window p .success {
  padding: 2px 3px;
  background: #27ae60;
}

.terminal-window p .error {
  padding: 2px 3px;
  background: #c0392b;
}

.terminal-window p .warning {
  padding: 2px 3px;
  background: #f39c12;
}

.terminal-window p .info {
  padding: 2px 3px;
  background: #2980b9;
}

.terminal-window p .system {
  padding: 2px 3px;
  background: #8697a2;
}

.terminal-window p .grayscale {
  padding: 2px 3px;
  background: #27ae60;
  -webkit-filter: grayscale(100%);
  -moz-filter: grayscale(100%);
  -ms-filter: grayscale(100%);
  -o-filter: grayscale(100%);
  filter: grayscale(100%);
}

.crude-font {
  font-weight: 600;
}

#en-flag, #cn-flag {
  opacity: 0;
}

.code-viewer {
  display: block;
}

.help-msg {
  color: #ffffff87;
}

.page-close {
  color: white;
  font-size: 11px;
  position: absolute;
  left: 6px;
  top: 3px;
  text-shadow: 0 1px 6px black;
  cursor: pointer;
}

/*手机*/
@media screen and (max-width: 768px ) {
  .terminal-window {
    padding: 40px 10px 10px 10px;
  }
}

/*平板*/
@media screen and (max-width: 992px) and (min-width: 768.1px) {

}
</style>

<style>
.CodeMirror {
  height: 500px;
}

.CodeMirror-scrollbar-filler {
  opacity: 0;
}

.CodeMirror-lines {
  font-size: 20px;
}

.terminal-window p .teach {
  font-weight: 700;
  color: yellow;
}

.help-list {
  margin: 0;
  list-style: none;
  padding-left: 0;
  display: inline-grid;
  display: -moz-inline-grid;
  display: -ms-inline-grid;
}

.help-list li {
  margin: 3px 0;
}

.CodeMirror-scroll {
  max-height: 700px;
}

.tag-danger {
  background: red;
  margin: 0 8px;
  padding: 1px 8px;
  border-radius: 3px;
}

.json-deep-selector {
  margin-top: 5px;
  width: 140px;
}

.cmd-help {
  position: fixed;
  right: 10px;
  top: 40px;
  z-index: 99;
  background-color: black !important;
  max-width: 50%;
}

.cmd-help .el-card__body {
  padding: 5px;
  color: white;
}

.cmd-help code {
  color: white;
  background-color: rgba(0, 0, 0, 0) !important;
  border: none;
  padding: 0;
}
</style>

