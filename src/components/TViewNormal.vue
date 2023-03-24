<template>
  <span class="t-content-normal">
    <span v-if="_nonEmpty(item.tag == null ? item.class : item.tag)"
          :class="item.class"
          style="margin-right: 10px">{{ item.tag == null ? item.class : item.tag }}</span>
    <span v-html="item.content"></span>
  </span>
</template>

<script>
import {_nonEmpty} from "@/js/Util";
import {terminalViewerProps} from "@/js/TerminalAttribute";

export default {
  name: "TViewNormal",
  props: terminalViewerProps(),
  methods: {
    _nonEmpty(value) {
      return _nonEmpty(value)
    }
  }
}
</script>

<style scoped>

</style>