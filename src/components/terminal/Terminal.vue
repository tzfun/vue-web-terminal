<template>
  <TContainer :name="name"
              :title="title"
              :show-header="showHeader"
              :drag-conf="dragConf"
              ref="frame"
              @clickWindow="_focus">
    <template #header="data">
      <slot name="header" :title="data.title"></slot>
    </template>
    <template #window>
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
                <span style="position: relative">
                  <json-viewer :expand-depth="item.depth"
                               sort boxed copyable expanded
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
          <div v-else-if="item.type === 'code'">
            <slot name="code" :message="item">
              <div class="t-code">
                <div v-if="_getTerminalOptions().highlight">
                  <highlightjs ref="highlightjs" autodetect :code="item.content"/>
                </div>
                <div v-else-if="_getTerminalOptions().codemirror">
                  <codemirror ref="codemirror" v-model="item.content" :options="_getTerminalOptions().codemirror"/>
                </div>
                <div v-else style="background: rgb(39 50 58);">
                  <pre style="padding: 1em;margin: 0"><code style="font-size: 15px" v-html="item.content"></code></pre>
                </div>
              </div>
            </slot>
          </div>
          <div v-else-if="item.type === 'table'">
            <slot name="table" :message="item">
              <div class="t-table-container">
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
          <span class="prompt t-cmd-line-content disable-select" ref="terminalInputPrompt">
            <span>{{ context }}</span>
            <span> > </span>
          </span><span class="t-cmd-line-content" v-html="_commandFormatter(command)"></span><span
          v-show="cursorConf.show" class="t-cursor disable-select"
          :style="`width:${cursorConf.width}px;left:${cursorConf.left};top:${cursorConf.top};`">&nbsp;</span>
        <input type="text" autofocus="autofocus" v-model="command"
               class="t-cmd-input disable-select"
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
      </p>
      <slot name="helpCmd" :item="searchCmd.item">
        <p class="t-help-msg">
          {{ searchCmd.item == null ? '' : searchCmd.item.usage }}
        </p>
      </slot>
      <div v-if="enableExampleHint">
        <slot name="helpBox" :showHeader="showHeader" :item="searchCmd.item">
          <div class="t-cmd-help"
               :style="showHeader ? 'top: 40px;max-height: calc(100% - 60px);' : 'top: 15px;max-height: calc(100% - 40px);'"
               v-if="searchCmd.item != null && !(require('../../tools/Util.js'))._screenType().xs">
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
                      <li class="t-example-li"><span v-if="it.des != null" class="t-cmd-help-des">{{ it.des }}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </slot>
      </div>
      <div class="fullscreen-editor" v-if="fullscreenEditor.open">
        <slot name="fullscreenEditor" :editor="fullscreenEditor">
          <textarea name="editor" v-model="fullscreenEditor.value" cols="30" rows="10"></textarea>
        </slot>
      </div>
    </template>
  </TContainer>
</template>

<script>
import '@/css/common.css'
import '@/css/terminal.css'
import 'vue-json-viewer/style.css'
import TerminalJs from './Terminal.js'

export default TerminalJs

</script>

<style scoped>

</style>

