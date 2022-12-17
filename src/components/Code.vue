<script setup lang="ts">
import { MessageType } from '../models/MessageInterface';
const props = defineProps<{
  highlight: boolean,
  codemirrorOptions: any,
  message: MessageType
}>()
</script>

<template>
  <div class="t-code">
    <div v-if="highlight">
      <highlightjs ref="highlightjs" autodetect :code="message.content" />
    </div>
    <div v-else-if="codemirrorOptions">
      <codemirror :value="message.content" :options="codemirrorOptions" />
    </div>
    <div v-else style="background: rgb(39 50 58);">
      <pre style="padding: 1em;margin: 0">
      <code style="font-size: 15px" v-html="message.content"></code></pre>
    </div>
  </div>
</template>