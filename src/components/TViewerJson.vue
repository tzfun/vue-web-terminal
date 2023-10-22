<script setup lang="ts">
import {PropType, reactive} from "vue";
import {_parseToJson} from "~/common/util.ts";
import {Message} from "~/types";
import JsonViewer from 'vue-json-viewer'

defineProps({
  message: Object as PropType<Message>,
  idx: [Number, String]
})

const jsonViewDepth = reactive([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])

</script>

<template>
  <span style="position: relative" class="t-json-container">
    <json-viewer :expand-depth="message.depth"
                 sort
                 copyable
                 expanded
                 :key="idx + '_' + message.depth"
                 :value="_parseToJson(message.content)">
    </json-viewer>
    <select class="t-json-deep-selector" v-model="message.depth">
      <option value="" disabled selected hidden label="Choose a display deep"></option>
      <option
          v-for="i in jsonViewDepth"
          :key="i"
          :label="`Deep ${i}`"
          :value="i">
      </option>
    </select>
  </span>
</template>

<style scoped>

</style>
