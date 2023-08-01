<script setup lang="ts">

import {_nonEmpty} from "~/common/util.ts";
import {PropType} from "vue";
import {Message} from "~/types";
defineProps({
  message: Object as PropType<Message>,
  idx: [Number, String]
})

</script>

<template>
  <span class="t-content-normal">
    <span v-if="_nonEmpty(message.tag == null ? message.class : message.tag)"
          :class="message.class"
          style="margin-right: 10px">{{ message.tag == null ? message.class : message.tag }}</span>
    <span v-html="message.content"></span>
  </span>
</template>

<style scoped>

</style>