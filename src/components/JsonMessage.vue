<script setup lang="ts">
import { JsonViewer } from "vue3-json-viewer"
import "vue3-json-viewer/dist/index.css"
import { DataConstant } from '@/constants/TerminalConstants'
import { reactive, ref, watchEffect } from 'vue'
import { MessageType } from '../models/MessageInterface'


const props = defineProps<{
  message: MessageType
}>()

const defaultDepth = 1
const depth = ref(props.message.depth ?? defaultDepth)
// watchEffect(() => {
//   depth.value = props.message.depth ?? defaultDepth
// })

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
    <json-viewer :expand-depth="depth ?? ''" sort boxed copyable expanded :value="parseToJson(message.content)">
    </json-viewer>
    <select class="t-json-deep-selector" v-model="depth">
      <!-- <option disabled selected label="Choose a display deep" value=""></option> -->
      <option v-for="i in jsonViewDepth" :key="i" :label="`Deep ${i}`" :value="i">
      </option>
    </select>
  </span>
</template>