<template>
  <div class="t-editor">
    <textarea name="editor" ref="textEditor" class="t-text-editor" v-model="config.value"
              @focus="config.onFocus" @blur="config.onBlur"></textarea>
    <div class="t-text-editor-floor" align="center">
      <button class="t-text-editor-floor-btn" @click="$emit('close')">Save & Close</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "TEditor",
  props: {
    config: Object
  },
  methods:{
    focus() {
      this.$refs.textEditor.focus()
    }
  }
}
</script>

<style scoped>
.t-editor {
  width: 100%;
  height: 100%;
}
</style>