<script setup lang="ts">
import {computed, PropType} from "vue";
import {Message} from "~/types";
import {getOptions} from "~/common/api";

defineProps({
  message: Object as PropType<Message>
})

const getHighlight = computed(() => {
  let options = getOptions()
  if (options) {
    return options.highlight
  }
})

const getCodemirror = computed(() => {
  let options = getOptions()
  if (options) {
    return options.codemirror
  }
})

</script>

<template>
  <div class="t-code">
    <div v-if="getHighlight" class="t-vue-highlight">
      <highlightjs ref="highlightjs"
                   autodetect
                   :code="message.content"/>
    </div>
    <div v-else-if="getCodemirror" class="t-vue-codemirror">
      <codemirror ref="codemirror"
                  v-model="message.content"
                  :options="getCodemirror"/>
    </div>
    <div v-else class="t-code-default">
      <pre style="padding: 1em;margin: 0"><code style="font-size: 15px">{{ message.content }}</code></pre>
    </div>
  </div>
</template>

<style scoped>

</style>
