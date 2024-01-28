<script setup lang="ts">
import {PropType, ref} from "vue";
import {EditorConfig} from "../types";

const props = defineProps({
  config: Object as PropType<EditorConfig>,
  modelValue: String
})
const emits = defineEmits(['update:modelValue', 'close'])
const textEditorRef = ref()

const _focus = () => {
  textEditorRef.value.focus()
}

const _close = (flag) => {
  emits('close', flag)
}

const _updateModelValue = (event:InputEvent) => {
  emits('update:modelValue', (event.target as HTMLInputElement).value)
}

defineExpose({
  focus:_focus
})
</script>

<template>
  <div class="t-editor">
    <textarea name="editor"
              ref="textEditorRef"
              autofocus
              class="t-text-editor"
              @input="_updateModelValue"
              :value="props.modelValue"
              @focus="(config as EditorConfig).onFocus"
              @blur="(config as EditorConfig).onBlur"/>
    <div class="t-text-editor-floor" align="center">
      <button class="t-text-editor-floor-btn t-close-btn"
              @click="_close(false)"
              title="Cancel Edit">Cancel
      </button>
      <button class="t-text-editor-floor-btn t-save-btn"
              @click="_close(true)"
              title="Save And Close">Save & Close
      </button>
    </div>
  </div>
</template>

<style scoped>
.t-editor {
  width: 100%;
  height: 100%;
}
</style>
