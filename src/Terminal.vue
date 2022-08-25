<template>
  <div class="terminal-container" ref="terminal-container" @click.self="_activeCursor">
    <div class="terminal">
      <div class="terminal-header" v-if="showHeader">
        <h4>
          <span @click="_triggerClick('title')" style="cursor: pointer">{{ title }}</span>
        </h4>
        <ul class="shell-dots">
          <li class="shell-dot-item shell-dots-red">
            <svg t="1645078279626"
                 class="shell-dot-icon"
                 viewBox="0 0 1024 1024"
                 version="1.1"
                 xmlns="http://www.w3.org/2000/svg"
                 p-id="1864"
                 width="10"
                 height="10" @click="_triggerClick('close')">
              <path
                  d="M544.448 499.2l284.576-284.576a32 32 0 0 0-45.248-45.248L499.2 453.952 214.624 169.376a32 32 0 0 0-45.248 45.248l284.576 284.576-284.576 284.576a32 32 0 0 0 45.248 45.248l284.576-284.576 284.576 284.576a31.904 31.904 0 0 0 45.248 0 32 32 0 0 0 0-45.248L544.448 499.2z"
                  p-id="1865" fill="#1413139c"></path>
            </svg>
          </li>
          <li class="shell-dot-item shell-dots-yellow">
            <svg t="1645078503601"
                 class="shell-dot-icon"
                 viewBox="0 0 1024 1024"
                 version="1.1"
                 xmlns="http://www.w3.org/2000/svg"
                 p-id="2762"
                 width="10"
                 height="10" @click="_triggerClick('minScreen')">
              <path d="M872 474H152c-4.4 0-8 3.6-8 8v60c0 4.4 3.6 8 8 8h720c4.4 0 8-3.6 8-8v-60c0-4.4-3.6-8-8-8z"
                    p-id="2763" fill="#1413139c"></path>
            </svg>
          </li>
          <li class="shell-dot-item shell-dots-green">
            <svg t="1645078604258"
                 class="shell-dot-icon"
                 viewBox="0 0 1024 1024"
                 version="1.1"
                 xmlns="http://www.w3.org/2000/svg"
                 p-id="9907"
                 width="10"
                 height="10" @click="_triggerClick('fullScreen')">
              <path
                  d="M188.373333 128H384c23.573333 0 42.666667-19.093333 42.666667-42.666667s-19.093333-42.666667-42.666667-42.666666H85.333333C61.76 42.666667 42.666667 61.76 42.666667 85.333333v298.666667c0 23.573333 19.093333 42.666667 42.666666 42.666667s42.666667-19.093333 42.666667-42.666667V188.373333L396.170667 456.533333a42.730667 42.730667 0 0 0 60.362666 0 42.741333 42.741333 0 0 0 0-60.362666L188.373333 128zM938.666667 597.002667c-23.573333 0-42.666667 19.093333-42.666667 42.666666v195.626667l-268.309333-268.16c-16.746667-16.64-43.893333-16.64-60.544 0s-16.650667 43.893333 0 60.533333L835.317333 896h-195.626666c-23.584 0-42.666667 19.093333-42.666667 42.666667s19.082667 42.666667 42.666667 42.666666h298.666666C961.92 981.333333 981.333333 961.92 981.333333 938.336v-298.666667c0-23.573333-19.093333-42.666667-42.666666-42.666666z"
                  p-id="9908" fill="#1413139c"></path>
            </svg>
          </li>
        </ul>
      </div>
      <div class="terminal-window" :style="`${showHeader ? '' : 'padding-top:20px'}`" ref="terminal-window"
           @click.self="_activeCursor">
        <div class="log-box" v-for="(item,idx) in terminalLog" v-bind:key="idx" @click.self="_activeCursor">
          <span v-if="item.type === 'cmdLine'" class="crude-font">
              <span class="prompt">{{ item.content }}</span>
          </span>
          <span v-else-if="item.type === 'splitLine'">
            <span style="line-height: 60px">====> {{ item.content }}</span>
          </span>
          <div v-else @click.self="_activeCursor">
            <span v-if="item.type === 'normal'" class="terminal-content-normal">
              <span v-show="showLogTime">{{ item.time == null ? "" : (item.time + " ") }}</span>
              <span :class="item.class"
                    style="margin-right: 10px">{{ item.tag == null ? item.class : item.tag }}</span>
              <span v-html="item.content"></span>
            </span>
            <span v-else-if="item.type === 'json'" style="position: relative">
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
            <div v-else-if="item.type === 'code'" class="t-code">
              <div v-if="terminalObj.getOptions().highlight">
                <highlightjs ref="highlightjs" autodetect :code="item.content"/>
              </div>
              <div v-else-if="terminalObj.getOptions().codemirror">
                <codemirror ref="codemirror" v-model="item.content" :options="terminalObj.getOptions().codemirror"/>
              </div>
              <div v-else style="background: rgb(39 50 58);">
                <pre style="padding: 1em;margin: 0"><code style="font-size: 15px" v-html="item.content"></code></pre>
              </div>
            </div>
            <div v-else-if="item.type === 'table'">
              <div class="t-table-container" @click.self="_activeCursor">
                <table class="t-table t-border-dashed">
                  <thead>
                  <tr class="t-border-dashed">
                    <td v-for="it in item.content.head" :key="it" class="t-border-dashed">{{ it }}</td>
                  </tr>
                  </thead>
                  <tbody>
                  <tr v-for="(row, idx) in item.content.rows" :key="idx" class="t-border-dashed">
                    <td v-for="(it, idx) in row" :key="idx" class="t-border-dashed">
                      <div v-html="it"></div>
                    </td>
                  </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div v-else-if="item.type === 'html'" v-html="item.content" @click.self="_activeCursor"></div>
          </div>
        </div>
        <p class="terminal-last-line crude-font" v-show="showInputLine" @click.self="_activeCursor">
          <span class="prompt">
            <span>{{ context }}</span>
            <span> > </span>
          </span><span v-html="require('./Util.js')._html(command)"></span><span v-show="cursorConf.show" class="cursor"
                                                                                 :style="`width:${cursorConf.width}px;margin-left:${cursorConf.left}px`">&nbsp;</span>
          <input type="text" autofocus="autofocus" id="command-input" v-model="command" @input="_onInput" class="input-box"
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
        <p class="help-msg" v-if="searchCmd.item != null" @click.self="_activeCursor">{{ searchCmd.item.usage }}</p>
      </div>
    </div>
    <div class="cmd-help" v-if="enableExampleHint && searchCmd.item != null && !(require('./Util.js'))._screenType().xs">
      <p class="text" v-if="searchCmd.item.description != null" style="margin: 15px 0"
         v-html="searchCmd.item.description"></p>
      <div v-if="searchCmd.item.example != null && searchCmd.item.example.length > 0">
        <div v-for="(it,idx) in searchCmd.item.example" :key="idx" class="text">
          <div v-if="searchCmd.item.example.length === 1">
            <span>Example: <code>{{ it.cmd }}</code> {{ it.des }}</span>
          </div>
          <div v-else>
            <div style="float:left;width: 30px;display:flex;font-size: 16px;line-height: 26px;">
              eg{{ (searchCmd.item.example.length > 1 ? (idx + 1) : '') }}:
            </div>
            <div style="float:left;width: calc(100% - 30px);display: flex">
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
import './css/style.css'
import 'vue-json-viewer/style.css'
import TerminalJs from './Terminal.js'

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

.shell-dot-icon {
  opacity: 0;
  transition: opacity 0.2s ease;
  -moz-transition: opacity 0.2s ease;
  -ms-transition: opacity 0.2s ease;
  -webkit-transition: opacity 0.2s ease;
  -o-transition: opacity 0.2s ease;
}

.shell-dots:hover .shell-dot-icon {
  opacity: 1;
}

.terminal-container {
  position: relative;
  width: 100%;
  min-height: 100%;
  margin: 0;
  padding: 0;
  background-color: #191b24;
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
  width: 16px;
  height: 16px;
  border-radius: 10px;
  margin-left: 6px;
  margin-top: 4px;
  line-height: 16px;
  cursor: pointer;
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
  background-color: #191b24;
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

/*手机*/
@media screen and (max-width: 768px ) {
  .terminal-window {
    padding: 40px 10px 10px 10px;
  }
}

/*平板*/
@media screen and (max-width: 992px) and (min-width: 768.1px) {

}

select:invalid {
  color: gray;
}

</style>

