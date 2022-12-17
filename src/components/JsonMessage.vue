<script setup lang="ts">
import { DataConstant } from '@/constants/TerminalConstants';
import { reactive } from 'vue';
import { MessageType } from '../models/MessageInterface';
defineProps<{
  key: string
  message: MessageType
}>()

const jsonViewDepth = reactive(DataConstant.JsonViewDepth)

const parseToJson = (obj: object | string) => {
  if (typeof obj === "object" && obj) {
    return obj;
  } else if (typeof obj === "string") {
    try {
      return JSON.parse(obj);
    } catch (e) {
      return obj;
    }
  }
}
</script>

<template>
  <span style="position: relative">
    <json-viewer :expand-depth="message.depth" sort boxed copyable expanded :key="key"
      :value="parseToJson(message.content)">
    </json-viewer>
    <select class="t-json-deep-selector" v-model="message.depth">
      <option value="" disabled selected hidden label="Choose a display deep"></option>
      <option v-for="i in jsonViewDepth" :key="i" :label="`Deep ${i}`" :value="i">
      </option>
    </select>
  </span>
</template>