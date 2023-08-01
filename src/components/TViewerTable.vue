<script setup lang="ts">
import {PropType} from "vue";
import {Message, MessageContentTable} from "~/types";

defineProps({
  message: Object as PropType<Message>,
  idx: [Number, String]
})
</script>

<template>
  <table class="t-table t-border-dashed">
    <thead>
    <tr class="t-border-dashed">
      <td v-for="it in (message.content as MessageContentTable).head" :key="it" class="t-border-dashed">{{ it }}</td>
    </tr>
    </thead>
    <tbody>
    <tr v-for="(row, idx) in (message.content as MessageContentTable).rows" :key="idx" class="t-border-dashed">
      <td v-for="(it, idx) in row" :key="idx" class="t-border-dashed">
        <div v-html="it"></div>
      </td>
    </tr>
    </tbody>
  </table>
</template>

<style scoped>

</style>