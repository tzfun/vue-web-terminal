<template>
  <div class="edit-box">
    <div class="btn-box">
      <button @click="run">运行代码</button>
    </div>
    <div class="style-box">
      <codemirror ref="customTextEditor"
                  class="my-text-editor"
                  v-model="currentValue"
                  :options="codemirrorOptions"
                  @update="valueChange"/>
    </div>
  </div>
</template>
<script>
export default {
  name: "CodeEditor",
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      currentValue: this.value,
      disabled: false,
      codemirrorOptions: {
        tabSize: 4,
        mode: 'javascript',
        theme: "vibrant-ink",
        lineNumbers: true,
        line: true,
        smartIndent: true,
        collapseIdentical: false,
        scrollbarStyle: "null"
      }
    }
  },
  methods: {
    run() {
      this.$emit('running')
    },
    valueChange() {
      this.$emit('input', this.currentValue)
    }
  }
}
</script>

<style scoped>
button {
  width: 200px;
  height: 38px;
  background: #e22626;
  border: none;
  outline: none;
  color: #fff;
  border-radius: 4px;
}
</style>