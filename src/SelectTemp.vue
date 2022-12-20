<script setup lang="ts">
import { reactive, ref } from 'vue'
import { DataConstant } from './constants/TerminalConstants'

const defaultDepth = 1
const depth = ref(defaultDepth)

const jsonViewDepth = reactive(DataConstant.JsonViewDepth)
</script>

<template>
  <select class="t-json-deep-selector" v-model="depth">
    <!-- <option disabled selected label="Choose a display deep" value=""></option> -->
    <option v-for="i in jsonViewDepth" :key="i" :label="`Deep ${i}`" :value="i">
    </option>
  </select>
</template>