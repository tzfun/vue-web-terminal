<script setup lang="ts">
interface TextEditorType {
  open: boolean
  focus: boolean
  value: string
  onClose?: (content: string) => void
  onFocus?: () => void
  onBlur?: () => void
}

defineProps<{ showHeader: boolean }>()
const textEditor = ref<HTMLTextAreaElement>()

const textEditorData = reactive<TextEditorType>({
  open: false,
  focus: false,
  value: '',
  onClose: undefined,
  onFocus: () => {
    textEditorData.focus = true
  },
  onBlur: () => {
    textEditorData.focus = false
  },
})
const focus = () => {
  if (textEditorData.open && textEditor.value)
    textEditor.value?.focus()
}
const textEditorClose = () => {
  if (textEditorData.open) {
    textEditorData.open = false
    const content = textEditorData.value
    textEditorData.value = ''
    textEditorData.onClose?.(content)
    focus()
    return content
  }
}
const isActive = computed(() => textEditorData.open && textEditorData.focus)

defineExpose({
  textEditorData,
  textEditorClose,
  focus,
  isActive,
})
</script>

<template>
  <div
    v-if="textEditorData.open" class="text-editor-container"
    :style="`${showHeader ? 'height:calc(100% - 34px);margin-top: 34px;' : 'height:100%'}`"
  >
    <slot name="textEditor" :data="textEditorData">
      <textarea
        ref="textEditor" v-model="textEditorData.value" name="editor" class="text-editor"
        @focus="textEditorData.onFocus" @blur="textEditorData.onBlur"
      />
      <div class="text-editor-floor" align="center">
        <button class="text-editor-floor-btn" @click="textEditorClose">
          Save & Close
        </button>
      </div>
    </slot>
  </div>
</template>
