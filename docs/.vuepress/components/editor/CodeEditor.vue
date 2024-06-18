<script setup>
import {computed, ref} from "vue";
import jsLanguage from "./lang/js";
import {barf} from "./themes";

const props = defineProps({
  value: {
    type: String
  },
  language: {
    type: String,
    required: true
  },
  autofocus: {
    type: Boolean
  }
})
const emits = defineEmits(["input", 'focus', 'blur'])

const code = ref(props.value)
const codeEditorRef = ref(null)

const extensions = computed(() => {
  const result = []
  //  language
  switch (props.language) {
    case 'js':
      result.push(jsLanguage())
      break
  }
  //  theme
  result.push(barf)
  return result
})

const valueChange = () => {
  emits('input', code.value)
}

const onFocus = (event) => {
  emits('focus', event)
}

const onBlur = (event) => {
  emits('blur', event)
}

defineExpose({
  focus
})
</script>
<template>
  <codemirror ref="codeEditorRef"
              v-model="code"
              class="code-editor"
              :extensions="extensions"
              :autofocus="autofocus"
              indent-with-tab
              :tab-size="4"
              @update="valueChange"
              @focus="onFocus"
              @blur="onBlur"/>
</template>
<style scoped>
.code-editor {
  width: 100%;
  font-size: 15px;
  background-color: #fff;
  color: #333;
}
</style>
<style>
.code-editor .cm-editor {
  height: inherit;
}

.ͼ1.cm-focused {
  outline: none;
}

.cm-scroller::-webkit-scrollbar
{
  width: 8px;
  height: 8px;
}

.cm-scroller::-webkit-scrollbar-button
{
  width: 0;
  height: 0;
  display: none;
}

.cm-scroller::-webkit-scrollbar-thumb
{
  border-radius: 6px;
  border-style: dashed;
  border-color: transparent;
  border-width: 2px;
  background-color: rgba(157, 165, 183, 0.4);
  background-clip: padding-box;
}

.cm-scroller::-webkit-scrollbar-thumb:hover
{
  background: rgba(157, 165, 183, 0.7);
  cursor: pointer;
}

.cm-scroller::-webkit-scrollbar-track
{
  border-radius: 6px;
}


</style>