<template>
  <div class="t-code">
    <div v-if="highlightjsConf()" class="t-vue-highlight">
      <highlightjs ref="highlightjs"
                   autodetect
                   :code="item.content"/>
    </div>
    <div v-else-if="codemirrorConf()" class="t-vue-codemirror">
      <codemirror ref="codemirror"
                  v-model="item.content"
                  :options="codemirrorConf()"/>
    </div>
    <div v-else class="t-code-default">
      <pre style="padding: 1em;margin: 0"><code style="font-size: 15px">{{ item.content }}</code></pre>
    </div>
  </div>
</template>

<script>
import {terminalViewerProps} from "@/js/TerminalAttribute";
import {getOptions} from "@/js/TerminalApi";

export default {
  name: "TViewCode",
  props: terminalViewerProps(),
  methods: {
    highlightjsConf() {
      return getOptions().highlight
    },
    codemirrorConf() {
      return getOptions().codemirror
    }
  }
}
</script>

<style scoped>

</style>
