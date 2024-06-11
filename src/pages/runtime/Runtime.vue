<template>
  <div class="box">
    <div class="edit-area">
      <code-editor v-model="code" @running="running"/>
    </div>
    <div class="run-area">
      <running ref="run"/>
    </div>
  </div>
</template>
<script>
import RuntimeJs from "./Runtime.js";

export default RuntimeJs;
</script>
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