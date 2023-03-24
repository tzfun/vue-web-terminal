<template>
  <table class="t-table t-border-dashed">
    <thead>
    <tr class="t-border-dashed">
      <td v-for="it in item.content.head" :key="it" class="t-border-dashed">{{ it }}</td>
    </tr>
    </thead>
    <tbody>
    <tr v-for="(row, idx) in item.content.rows" :key="idx" class="t-border-dashed">
      <td v-for="(it, idx) in row" :key="idx" class="t-border-dashed">
        <div v-html="it"></div>
      </td>
    </tr>
    </tbody>
  </table>
</template>

<script>
import {terminalViewerProps} from "@/js/TerminalAttribute";

export default {
  name: "TViewTable",
  props: terminalViewerProps()
}
</script>

<style scoped>

</style>