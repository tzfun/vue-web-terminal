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
      <div class="t-cmd-line shell-log-container">
        <div class="shell-row t-cmd-line-content"
             v-for="(line, idx) in lines"
             :key="idx"
             v-html="line.join('')"
             :style="`height:${require('@/config.json').domStyle.windowLineHeight}px;`"
        ></div>

        <span v-if="showCursor"
              class="t-cursor disable-select"
              :style="_getCursorStyle()">&nbsp;</span>

        <input type="text" autofocus="autofocus" v-model="command"
               class="t-cmd-input disable-select shell-input"
               ref="cmdInput"
               autocomplete="off"
               auto-complete="new-password"
               @focusin="showCursor = true"
               @focusout="showCursor = false"
               @input="_onInput">
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
