<template>
  <span style="position: relative" class="t-json-container">
    <json-viewer :expand-depth="item.depth"
                 sort copyable expanded
                 :key="idx + '_' + item.depth"
                 :value="_parseToJson(item.content)">
    </json-viewer>
    <select class="t-json-deep-selector" v-model="item.depth">
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

<script>
import {_parseToJson} from "@/js/Util";
import {terminalViewerProps} from "@/js/TerminalAttribute";

export default {
  name: "TViewJson",
  data() {
    return {
      jsonViewDepth: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    }
  },
  props: terminalViewerProps(),
  methods: {
    _parseToJson(obj) {
      return _parseToJson(obj)
    }
  }
}
</script>

<style scoped>

</style>