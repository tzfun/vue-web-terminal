<script setup lang="ts">
import {onMounted, PropType, ref, watch} from "vue";
import {EditorConfig} from "../types";

const props = defineProps({
  config: Object as PropType<EditorConfig>,
  modelValue: String
})
const emits = defineEmits(['update:modelValue', 'close'])
const content = ref()
const textEditorRef = ref()
onMounted(() => {
  content.value = props.modelValue
})

watch(
    () => content,
    (v) => {
      emits('update:modelValue', v)
    }
)

const _focus = () => {
  textEditorRef.value.focus()
}

const _close = (flag) => {
  emits('close', flag)
}

defineExpose({
  focus:_focus
})
</script>

<template>
  <div class="t-editor">
    <textarea name="editor"
              ref="textEditorRef"
              class="t-text-editor"
              v-model="content"
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