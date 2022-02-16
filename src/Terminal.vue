<template>
  <div class="terminal-container" ref="terminal-container" @click.self="_activeCursor">
    <div class="terminal">
      <div class="terminal-header">
        <h4>
          <span @click="_triggerClick('title')" style="cursor: pointer">{{ title }}</span>
        </h4>
        <ul class="shell-dots">
          <li class="shell-dots-red">
            <i class="el-icon-close page-close" @click="_triggerClick('close')"></i>
          </li>
          <li class="shell-dots-yellow">
            <i class="el-icon-close page-close" @click="_triggerClick('minScreen')"></i>
          </li>
          <li class="shell-dots-green">
            <i class="el-icon-close page-close" @click="_triggerClick('fullScreen')"></i>
          </li>
        </ul>
      </div>
      <div class="terminal-window" id="terminalWindow" @click.self="_activeCursor">
        <div class="log-box" v-for="(item,idx) in terminalLog" v-bind:key="idx" @click.self="_activeCursor">
          <span v-if="item.type === 'cmdLine'" class="crude-font">
              <span class="prompt">{{ item.content }}</span>
          </span>
          <span v-else-if="item.type === 'splitLine'">
            <span style="line-height: 60px">====> {{ item.content }}</span>
          </span>
          <div v-else>
            <span @click.self="_activeCursor" class="terminal-content-normal">
              <span v-show="showLogTime">{{ item.time == null ? "" : (item.time + " ") }}</span>
              <span v-show="item.type === 'normal'"
                    :class="item.class"
                    style="margin-right: 10px">{{ item.tag == null ? item.class : item.tag }}</span>
            </span>
            <span v-if="item.type === 'json'" style="position: relative">
                <json-viewer :expand-depth="item.depth"
                             sort boxed copyable expanded
                             :key="idx + '_' + item.depth"
                             :value="parseToJson(item.content)">
                </json-viewer>
                <select class="json-deep-selector" v-model="item.depth">
                  <option value="" disabled selected hidden label="Choose a display deep"></option>
                  <option
                      v-for="i in jsonViewDepth"
                      :key="i"
                      :label="`Deep ${i}`"
                      :value="i">
                  </option>
                </select>
            </span>
            <div v-else-if="item.type === 'code'" style="position: relative;max-height: 500px;overflow: auto;font-size: 20px" v-highlight>
              <pre style="margin:0 0 0 30px"><code v-html="item.content"></code></pre>
            </div>
            <span v-else v-html="item.content" @click="_activeCursor"></span>
          </div>
        </div>
        <p class="terminal-last-line crude-font" v-show="showInputLine" @click.self="_activeCursor">
          <span class="prompt">
            <span>{{ context }}</span>
            <span> > </span>
          </span><span v-html="require('./Util.js')._html(command)"></span><span v-show="cursorConf.show" class="cursor"
                :style="`width:${cursorConf.width}px;margin-left:${cursorConf.left}px`">&nbsp</span>
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
                 @keydown.left.exact="onDownLeft"
                 @keydown.right.exact="onDownRight">
          <span id="terminal-en-flag" @click.self="_activeCursor">aa</span>
          <span id="terminal-cn-flag" @click.self="_activeCursor">你好</span>
        </p>
        <p class="help-msg" v-if="searchCmd.item != null">{{ searchCmd.item.usage }}</p>
      </div>
    </div>
    <div class="cmd-help" v-if="searchCmd.item != null && !(require('./Util.js'))._screenType().xs">
      <p class="text" v-if="searchCmd.item.description != null" style="margin: 15px 0"
         v-html="searchCmd.item.description"></p>
      <div v-if="searchCmd.item.example != null && searchCmd.item.example.length > 0">
        <div v-for="(it,idx) in searchCmd.item.example" :key="idx" class="text">
          <div v-if="searchCmd.item.example.length === 1">
            <span>Example: <code>{{ it.cmd }}</code> {{ it.des }}</span>
          </div>
          <div v-else>
            <div style="float:left;width: 8.5%;display:flex;font-size: 16px;line-height: 26px;">
              eg{{ (searchCmd.item.example.length > 1 ? (idx + 1) : '') }}：
            </div>
            <div style="float:left;width: 91.5%;display: flex">
              <ul class="example-ul">
                <li class="example-li"><code>{{ it.cmd }}</code></li>
                <li class="example-li"><span v-if="it.des != null">{{ it.des }}</span></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import TerminalJs from './Terminal.js'
import './style.css'

export default TerminalJs

</script>

<style scoped>

.log-box {
  display: block;
  margin-block-start: 1em;
  margin-block-end: 1em;
  margin-inline-start: 0;
  margin-inline-end: 0;
}

.terminal-container {
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
}

.terminal-window p, .terminal-window div {
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

.terminal-content-normal .success {
  padding: 2px 3px;
  background: #27ae60;
}

.terminal-content-normal .error {
  padding: 2px 3px;
  background: #c0392b;
}

.terminal-content-normal .warning {
  padding: 2px 3px;
  background: #f39c12;
}

.terminal-content-normal .info {
  padding: 2px 3px;
  background: #2980b9;
}

.terminal-content-normal .system {
  padding: 2px 3px;
  background: #8697a2;
}

.crude-font {
  font-weight: 600;
}

#terminal-en-flag, #terminal-cn-flag {
  opacity: 0;
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

select:invalid { color: gray; }

</style>

