<template>
  <div class="t-cmd-help"
       ref="terminalHelpBox"
       :style="showHeader ? 'top: 40px;max-height: calc(100% - 60px);' : 'top: 15px;max-height: calc(100% - 40px);'"
       v-if="result && result.item && !_screenType().xs">
    <p class="text" v-if="result.item.description != null" style="margin: 15px 0"
       v-html="result.item.description"></p>
    <div v-if="result.item.example != null && result.item.example.length > 0">
      <div v-for="(it,idx) in result.item.example" :key="idx" class="text">
        <div v-if="result.item.example.length === 1">
          <span>Example: <code>{{ it.cmd }}</code> {{ it.des }}</span>
        </div>
        <div v-else>
          <div class="t-cmd-help-eg">
            eg{{ (result.item.example.length > 1 ? (idx + 1) : '') }}:
          </div>
          <div class="t-cmd-help-example">
            <ul class="t-example-ul">
              <li class="t-example-li"><code>{{ it.cmd }}</code></li>
              <li class="t-example-li"><span v-if="it.des != null" class="t-cmd-help-des">{{ it.des }}</span></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import {_screenType} from "@/js/Util";
import {ref} from "vue";

export default {
  name: "THelpBox",
  props: {
    showHeader: Boolean,
    result: Object
  },
  setup(){
    let terminalHelpBox = ref(null)
    return {
      terminalHelpBox
    }
  },
  methods: {
    _screenType() {
      return _screenType()
    },
    getBoundingClientRect() {
      let e = this.terminalHelpBox
      if (e) {
        return e.getBoundingClientRect()
      }
    }
  }
}
</script>

<style scoped>

</style>
