<script setup lang="ts">
import { MessageType } from '../models/MessageInterface';
import TerminalObj from '../TerminalObj'
const terminalObj = TerminalObj
defineProps<{
  message: MessageType
}>()
</script>

<template>
  <div class="t-code">
    <div v-if="terminalObj.getOptions().highlight">
      <highlightjs ref="highlightjs" autodetect :code="message.content" />
    </div>
    <div v-else-if="terminalObj.getOptions().codemirror">
      <codemirror :value="message.content" :options="terminalObj.getOptions().codemirror" />
    </div>
    <div v-else style="background: rgb(39 50 58);">
      <pre style="padding: 1em;margin: 0">
      <code style="font-size: 15px" v-html="message.content"></code></pre>
    </div>
  </div>
</template>