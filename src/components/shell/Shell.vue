<template>
  <TContainer shell
              :name="name"
              :title="title"
              :show-header="showHeader"
              :drag-conf="dragConf"
              ref="frame"
              @clickWindow="_focus"
              @onFullscreenSwitch="_onFullscreenSwitch">
    <template #header="data">
      <slot name="header" :title="data.title"></slot>
    </template>
    <template #window>
      <div class="shell-log t-cmd-line">
        <div class="shell-row t-cmd-line-content"
             v-for="(line, idx) in lines"
             :key="idx"
             v-html="line.join('')"
             :style="`height:${$refs.frame.domStyle.windowLineHeight}px;line-height:${$refs.frame.domStyle.windowLineHeight}px; display:${(lines.length === 0 || idx === lines.length - 1 ? 'inline-block' : 'block')};`"
        ></div>

        <span class="t-cmd-line-content" v-html="_commandFormatter(command)"></span>
        <span v-show="cursorConf.show"
              class="t-cursor disable-select">&nbsp;</span>

        <input type="text" autofocus="autofocus" v-model="command"
               class="t-cmd-input disable-select"
               ref="cmdInput"
               autocomplete="off"
               auto-complete="new-password"
               @focusin="cursorConf.show = true"
               @focusout="cursorConf.show = false"
               @keyup.enter="_execute">
      </div>
    </template>
  </TContainer>
</template>

<script>
import '@/css/common.css'
import '@/css/shell.css'
import '@/css/ansi.css'
import ShellJs from '@/components/shell/Shell.js'

export default ShellJs
</script>

<style scoped>

</style>
