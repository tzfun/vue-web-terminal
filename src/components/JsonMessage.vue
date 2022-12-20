<script setup lang="ts">
import { JsonViewer } from "vue3-json-viewer"
import "vue3-json-viewer/dist/index.css"
import { MessageType } from '../models/MessageInterface'


defineProps<{
  message: MessageType
}>()

const defaultDepth = 1
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
    <json-viewer :expand-depth="message.depth ?? defaultDepth" sort boxed copyable expanded :value="parseToJson(message.content)">
    </json-viewer>
  </span>
</template>