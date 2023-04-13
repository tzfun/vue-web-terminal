<template>
  <div class="t-editor">
    <textarea name="editor" ref="textEditor" class="t-text-editor" v-model="value"
              @focus="config.onFocus" @blur="config.onBlur"></textarea>
    <div class="t-text-editor-floor" align="center">
      <button class="t-text-editor-floor-btn t-close-btn"
              @click="$emit('close', false)"
              title="Cancel Edit">Cancel</button>
      <button class="t-text-editor-floor-btn t-save-btn"
              @click="$emit('close', true)"
              title="Save And Close">Save & Close</button>
    </div>
  </div>
</template>

<script>
import {ref} from "vue";

export default {
  name: "TEditor",
  data() {
    return {
      value: ''
    }
  },
  props: {
    config: Object,
    modelValue: String
  },
  watch: {
    value: {
      handler(newVal) {
        this.$emit("update:modelValue", newVal)
      }
    }
  },
  setup() {
    const textEditor = ref(null)
    return {
      textEditor
    }
  },
  mounted() {
    this.value = this.config.value
  },
  methods: {
    focus() {
      this.textEditor.focus()
    }
  }
}
</script>

<style>
.t-editor {
  width: 100%;
  height: 100%;
}
.t-close-btn {
  color: #bba9a9;
}
.t-close-btn:hover {
  color: #00ffff;
}

.t-save-btn {
  color:#00b10e;
}
.t-save-btn:hover {
  color: #befcff;
}
</style>