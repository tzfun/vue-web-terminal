<script setup lang="ts">
import { _nonEmpty } from '@/Util'
import { MessageType } from '../models/MessageInterface'
defineProps<{
  message: MessageType
}>()

</script>

<template>
  <span class="t-content-normal">
    <span v-if="_nonEmpty(message.tag ? message.tag : message.class)" :class="message.class"
      style="margin-right: 10px">{{
          message.tag ? message.tag : message.class
      }}</span>
    <span v-html="message.content"></span>
  </span>
</template>