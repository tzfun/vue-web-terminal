<script setup lang="ts">
import { MessageType } from '../models/MessageInterface';
defineProps<{
  message: MessageType
}>()
</script>

<template>
  <div class="t-code">
    <div style="background: rgb(39 50 58);">
      <pre style="padding: 1em;margin: 0">
      <code style="font-size: 15px" v-html="message.content"></code></pre>
    </div>
  </div>
</template>