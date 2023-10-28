<script setup lang="ts">
import TerminalInterface from "~/common/interface.ts";
import {PropType} from "vue";
import {Message} from "~/types";

defineProps({
  message: Object as PropType<Message>,
  idx: [Number, String]
})

</script>

<template>
  <div class="t-code">
    <div v-if="TerminalInterface.getOptions().highlight" class="t-vue-highlight">
      <highlightjs ref="highlightjs"
                   autodetect
                   :code="message.content"/>
    </div>
    <div v-else-if="TerminalInterface.getOptions().codemirror" class="t-vue-codemirror">
      <codemirror ref="codemirror"
                  v-model="message.content"
                  :options="TerminalInterface.getOptions().codemirror"/>
    </div>
    <div v-else class="t-code-default">
      <pre style="padding: 1em;margin: 0"><code style="font-size: 15px">{{ message.content }}</code></pre>
    </div>
  </div>
</template>

<style scoped>

</style>
