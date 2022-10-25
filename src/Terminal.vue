<template>
  <div class="t-container"
       :style="_draggable() ? _getDragStyle() : 'width:100%;height:100%'"
       ref="t-container" @click.self="_activeCursor">
    <div class="terminal">
      <div class="t-header-container" ref="t-header" v-if="showHeader" :style="_draggable() ? 'cursor: move;' : ''">
        <slot name="header">
          <div class="t-header">
            <h4>
              <span @click="_triggerClick('title')" style="cursor: pointer;user-select: none;">{{ title }}</span>
            </h4>
            <ul class="t-shell-dots">
              <li class="shell-dot-item t-shell-dots-red">
                <svg t="1645078279626"
                     class="t-shell-dot"
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
              <li class="shell-dot-item t-shell-dots-yellow">
                <svg t="1645078503601"
                     class="t-shell-dot"
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
              <li class="shell-dot-item t-shell-dots-green">
                <svg t="1645078604258"
                     class="t-shell-dot"
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
        </slot>
      </div>
      <div class="t-window" :style="`${showHeader ? 'height:calc(100% - 34px);margin-top: 34px;' : 'height:100%'}`"
           ref="t-window"
           @click.self="_activeCursor">
        <div class="t-log-box" v-for="(item,idx) in terminalLog" v-bind:key="idx" @click.self="_activeCursor">
          <span v-if="item.type === 'cmdLine'" class="t-crude-font">
              <span class="prompt">{{ item.content }}</span>
          </span>
          <div v-else @click.self="_activeCursor">
            <slot name="normal" :message="item">
              <span v-if="item.type === 'normal'" class="t-content-normal">
                <span v-show="showLogTime">{{ item.time == null ? "" : (item.time + " ") }}</span>
                <span v-if="_nonEmpty(item.tag == null ? item.class : item.tag)"
                      :class="item.class"
                      style="margin-right: 10px">{{ item.tag == null ? item.class : item.tag }}</span>
                <span v-html="item.content"></span>
              </span>
            </slot>
            <slot name="json" :message="item">
              <span v-if="item.type === 'json'" style="position: relative">
                <json-viewer :expand-depth="item.depth"
                             sort boxed copyable expanded
                             :key="idx + '_' + item.depth"
                             :value="parseToJson(item.content)">
                </json-viewer>
                <select class="t-json-deep-selector" v-model="item.depth">
                  <option value="" disabled selected hidden label="Choose a display deep"></option>
                  <option
                      v-for="i in jsonViewDepth"
                      :key="i"
                      :label="`Deep ${i}`"
                      :value="i">
                  </option>
                </select>
              </span>
            </slot>
            <slot name="code" :message="item">
              <div v-if="item.type === 'code'" class="t-code">
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
            </slot>
            <slot name="table" :message="item">
              <div v-if="item.type === 'table'">
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
            </slot>
            <slot name="html" :message="item">
              <div v-if="item.type === 'html'" v-html="item.content" @click.self="_activeCursor"></div>
            </slot>
          </div>
        </div>
        <p class="t-last-line t-crude-font" v-show="showInputLine" @click.self="_activeCursor">
          <span class="prompt">
            <span>{{ context }}</span>
            <span> > </span>
          </span><span v-html="require('./Util.js')._html(command)"></span><span v-show="cursorConf.show" class="cursor"
                                                                                 :style="`width:${cursorConf.width}px;margin-left:${cursorConf.left}px`">&nbsp;</span>
          <input type="text" autofocus="autofocus" id="command-input" v-model="command" @input="_onInput"
                 class="t-input-box"
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
          <span id="t-en-flag" @click.self="_activeCursor">aa</span>
          <span id="t-cn-flag" @click.self="_activeCursor">你好</span>
        </p>
        <p class="t-help-msg" v-if="searchCmd.item != null" @click.self="_activeCursor">{{ searchCmd.item.usage }}</p>
      </div>
    </div>
    <div v-if="enableExampleHint">
      <slot name="helpBox" :showHeader="showHeader" :item="searchCmd.item">
        <div class="t-cmd-help"
             :style="showHeader ? 'top: 40px;' : 'top: 15px;'"
             v-if="searchCmd.item != null && !(require('./Util.js'))._screenType().xs">
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
                  <ul class="t-example-ul">
                    <li class="example-li"><code>{{ it.cmd }}</code></li>
                    <li class="example-li"><span v-if="it.des != null">{{ it.des }}</span></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </slot>
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

input[type="text" i] {
  padding: 1px 2px;
}

select:invalid {
  color: gray;
}

</style>

