<script setup lang="ts">
import {PropType, ref} from "vue";
import {Command} from "~/types";

defineProps({
  top: Number,
  content: Object as PropType<Command>
})
const terminalHelpBoxRef = ref()

const getBoundingClientRect = (): DOMRect => {
  return terminalHelpBoxRef.value.getBoundingClientRect()
}

defineExpose({
  getBoundingClientRect
})
</script>

<template>
  <div class="t-cmd-help"
       ref="terminalHelpBoxRef"
       :style="`top: ${top}px;max-height: calc(100% - ${top}px);`">
    <div class="t-cmd-help-des" v-if="content.description" v-html="content.description"/>
    <div v-if="content.example && content.example.length > 0">
      <div v-for="(it,idx) in content.example" :key="idx" class="text">
        <div v-if="content.example.length === 1">
          <span>Example: <code class="t-code-inline">{{ it.cmd }}</code> {{ it.des }}</span>
        </div>
        <div v-else>
          <div class="t-cmd-help-eg">
            eg{{ (content.example.length > 1 ? (idx + 1) : '') }}:
          </div>
          <div class="t-cmd-help-example">
            <ul class="t-example-ul">
              <li class="t-example-li"><code class="t-code-inline">{{ it.cmd }}</code></li>
              <li class="t-example-li"><span v-if="it.des != null" class="t-cmd-help-des-item">{{ it.des }}</span></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
