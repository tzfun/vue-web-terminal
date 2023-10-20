<script setup lang="ts">
import {PropType, ref} from "vue";
import {SearchResult} from "~/types";

defineProps({
  top: Number,
  result: Object as PropType<SearchResult>
})
const terminalHelpBoxRef = ref()
const getClientRect = (): DOMRect => {
  return terminalHelpBoxRef.value.getBoundingClientRect()
}

defineExpose({
  getClientRect
})
</script>

<template>
  <div class="t-cmd-help"
       ref="terminalHelpBoxRef"
       :style="`top: ${top}px;max-height: calc(100% - ${top}px);`">
    <p class="text"
       v-if="result.item.description"
       style="margin: 15px 0"
       v-html="result.item.description"/>
    <div v-if="result.item.example && result.item.example.length > 0">
      <div v-for="(it,idx) in result.item.example" :key="idx" class="text">
        <div v-if="result.item.example.length === 1">
          <span>Example: <code>{{ it.cmd }}</code> {{ it.des }}</span>
        </div>
        <div v-else>
          <div class="t-cmd-help-eg">
            eg{{ (result.item.example.length > 1 ? (idx + 1) : '') }}:
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
</template>

<style scoped>

</style>
