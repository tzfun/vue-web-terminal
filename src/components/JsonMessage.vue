<script setup lang="ts">
import { reactive, ref, watchEffect } from 'vue'
import { JsonViewer } from "vue3-json-viewer"
import "vue3-json-viewer/dist/index.css"
import { MessageType } from '../models/MessageInterface'
import { DataConstant } from '@/constants/TerminalConstants'

const props = defineProps<{
  message: MessageType
}>()

const defaultDepth = 1
const depth = ref(props.message.depth ?? defaultDepth)
watchEffect(() => {
  depth.value = props.message.depth ?? defaultDepth
})

const jsonViewDepth = reactive(DataConstant.JsonViewDepth)

const parseToJson = (obj: object | string) => {
  if (typeof obj === "object" && obj) {
    return obj
  } else if (typeof obj === "string") {
    try {
      return JSON.parse(obj)
    } catch (e) {
      return obj
    }
  }
}
</script>

<template>
  <span style="position: relative">
    <span>cur depth: {{ depth }}</span>
    <json-viewer :expand-depth="message.depth ?? defaultDepth" sort boxed copyable expanded :value="parseToJson(message.content)">
    </json-viewer>
    <select class="t-json-deep-selector" v-model="depth">
      <option v-for="i in jsonViewDepth" :key="i" :label="`Deep ${i}`" :value="i">
      </option>
    </select>
  </span>
</template>