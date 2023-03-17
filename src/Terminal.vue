<template>
  <div class="t-container"
       :style="_draggable() ? _getDragStyle() : 'width:100%;height:100%;border-radius:0;'"
       ref="terminalContainer">
    <div class="terminal">
      <div class="t-header-container" ref="terminalHeader" v-if="showHeader"
           :style="_draggable() ? 'cursor: move;' : ''" @dblclick="_fullscreen">
        <slot name="header">
          <div class="t-header">
            <h4>
              <span @click="_triggerClick('title')" class="t-disable-select" style="cursor: pointer;">{{ title }}</span>
            </h4>
            <ul class="t-shell-dots">
              <li class="shell-dot-item t-shell-dots-red">
                <svg @click="_triggerClick('close')"><use xlink:href="#close"></use></svg>
              </li>
              <li class="shell-dot-item t-shell-dots-yellow">
                <svg @click="_triggerClick('minScreen')"><use xlink:href="#min"></use></svg>
              </li>
              <li class="shell-dot-item t-shell-dots-green">
                <svg @click="_triggerClick('fullScreen')"><use xlink:href="#max"></use></svg>
              </li>
            </ul>
          </div>
        </slot>
      </div>
      <div class="t-window" :style="`${showHeader ? 'height:calc(100% - 34px);margin-top: 34px;' : 'height:100%'}`"
           ref="terminalWindow" @click="_focus">
        <div class="t-log-box" v-for="(item,idx) in terminalLog" v-bind:key="idx">
          <span v-if="item.type === 'cmdLine'" class="t-crude-font t-cmd-line">
              <span class="prompt t-cmd-line-content"><span v-html="item.content"></span></span>
          </span>
          <div v-else>
            <span v-if="item.type === 'normal'">
              <slot name="normal" :message="item">
                <span class="t-content-normal">
                  <span v-if="_nonEmpty(item.tag == null ? item.class : item.tag)"
                        :class="item.class"
                        style="margin-right: 10px">{{ item.tag == null ? item.class : item.tag }}</span>
                  <span v-html="item.content"></span>
                </span>
              </slot>
            </span>
            <div v-else-if="item.type === 'json'">
              <slot name="json" :message="item">
                <span style="position: relative"  class="t-json-container">
                  <json-viewer :expand-depth="item.depth"
                               sort copyable expanded
                               :key="idx + '_' + item.depth"
                               :value="_parseToJson(item.content)">
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
            </div>
            <div v-else-if="item.type === 'code'" class="t-code-container">
              <slot name="code" :message="item">
                <div class="t-code">
                  <div v-if="terminalObj.getOptions().highlight" class="t-vue-highlight">
                    <highlightjs ref="highlightjs" autodetect :code="item.content"/>
                  </div>
                  <div v-else-if="terminalObj.getOptions().codemirror" class="t-vue-codemirror">
                    <codemirror ref="codemirror" v-model="item.content" :options="terminalObj.getOptions().codemirror"/>
                  </div>
                  <div v-else style="background: rgb(39 50 58);">
                    <pre style="padding: 1em;margin: 0"><code style="font-size: 15px"
                                                              v-html="item.content"></code></pre>
                  </div>
                </div>
              </slot>
            </div>
            <div v-else-if="item.type === 'table'">
              <slot name="table" :message="item">
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
                 ref="askInput"
                 v-model="ask.input"
                 class="t-ask-input"
                 autocomplete="off"
                 auto-complete="new-password"
                 @keyup.enter="_onAskInput">
        </div>
        <p class="t-last-line t-crude-font t-cmd-line" ref="terminalInputBox" v-show="showInputLine">
          <span class="prompt t-cmd-line-content t-disable-select" ref="terminalInputPrompt">
            <span>{{ context }}</span>
            <span> > </span>
          </span><span class="t-cmd-line-content" v-html="_commandFormatter(command)"></span><span
            v-show="cursorConf.show" class="cursor t-disable-select"
            :style="`width:${cursorConf.width}px;left:${cursorConf.left};top:${cursorConf.top};`">&nbsp;</span>
          <input type="text" autofocus="autofocus" v-model="command"
                 class="t-cmd-input t-disable-select"
                 ref="cmdInput"
                 autocomplete="off"
                 auto-complete="new-password"
                 @keydown="_onInputKeydown"
                 @keyup="_onInputKeyup"
                 @input="_onInput"
                 @focusin="cursorConf.show = true"
                 @focusout="cursorConf.show = false"
                 @keyup.up.exact="_switchPreCmd"
                 @keyup.down.exact="_switchNextCmd"
                 @keyup.enter="_execute">
          <span class="t-flag t-cmd-line t-disable-select">
            <span class="t-cmd-line-content" ref="terminalEnFlag">aa</span>
            <span class="t-cmd-line-content" ref="terminalCnFlag">你好</span>
          </span>
        </p>
        <slot name="helpCmd" :item="searchCmd">
          <p class="t-help-msg">
            {{ searchCmd.item ? searchCmd.item.usage : '' }}
          </p>
        </slot>
      </div>
    </div>
    <div v-if="enableExampleHint">
      <slot name="helpBox" :showHeader="showHeader" :item="searchCmd.item">
        <div class="t-cmd-help"
             :style="showHeader ? 'top: 40px;max-height: calc(100% - 60px);' : 'top: 15px;max-height: calc(100% - 40px);'"
             v-if="searchCmd.item != null && !(require('./Util.js'))._screenType().xs">
          <p class="text" v-if="searchCmd.item.description != null" style="margin: 15px 0"
             v-html="searchCmd.item.description"></p>
          <div v-if="searchCmd.item.example != null && searchCmd.item.example.length > 0">
            <div v-for="(it,idx) in searchCmd.item.example" :key="idx" class="text">
              <div v-if="searchCmd.item.example.length === 1">
                <span>Example: <code>{{ it.cmd }}</code> {{ it.des }}</span>
              </div>
              <div v-else>
                <div class="t-cmd-help-eg">
                  eg{{ (searchCmd.item.example.length > 1 ? (idx + 1) : '') }}:
                </div>
                <div class="t-cmd-help-example">
                  <ul class="t-example-ul">
                    <li class="t-example-li"><code>{{ it.cmd }}</code></li>
                    <li class="t-example-li"><span v-if="it.des != null" class="t-cmd-help-des">{{ it.des }}</span></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </slot>
    </div>
    <div class="t-text-editor-container" v-if="textEditor.open"
         :style="`${showHeader ? 'height:calc(100% - 34px);margin-top: 34px;' : 'height:100%'}`">
      <slot name="textEditor" :data="textEditor">
        <textarea name="editor" ref="textEditor" class="t-text-editor" v-model="textEditor.value"
                  @focus="textEditor.onFocus" @blur="textEditor.onBlur"></textarea>
        <div class="t-text-editor-floor" align="center">
          <button class="t-text-editor-floor-btn" @click="_textEditorClose">Save & Close</button>
        </div>
      </slot>
    </div>
  </div>
</template>

<script>
import './css/scrollbar.css'
import './css/json.css'
import './css/style.css'
import 'vue-json-viewer/style.css'
import TerminalJs from './Terminal.js'

export default TerminalJs

</script>

<style scoped>

</style>

