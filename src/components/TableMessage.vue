<script setup lang="ts">
import type { MessageType } from '../models/MessageInterface'
defineProps<{
  message: MessageType
}>()
</script>

<template>
  <div class="t-table-container">
    <table class="t-table t-border-dashed">
      <thead>
        <tr class="t-border-dashed">
          <td v-for="it in message.content.head" :key="it" class="t-border-dashed">
            {{ it }}
          </td>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, idx) in message.content.rows" :key="idx" class="t-border-dashed">
          <td v-for="(it, idx) in row" :key="idx" class="t-border-dashed">
            <div v-html="it" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
