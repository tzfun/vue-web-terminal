<script setup>
import {ref} from "vue";
import CodeEditor from "../components/editor/CodeEditor.vue";
import Running from "../components/Running.vue";

const code = ref('')
const runRef = ref(null)

const run = () => {
  runRef.value.reset()
  runRef.value.buildDom(code.value)
}

</script>

<template>
  <div class="box">
    <div class="edit-area">
      <button class="btn" @click="run">运行</button>
      <code-editor v-model="code" language="xml"/>
    </div>
    <div class="run-area">
      <running ref="runRef"/>
    </div>
  </div>
</template>

<style scoped>
.box {
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  justify-content: space-between;
}

.run-area, .edit-area {
  width: 50%;
  height: 100%;
}
</style>