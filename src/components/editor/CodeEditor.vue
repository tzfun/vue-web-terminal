<template>
  <codemirror ref="codeEditor"
              v-model="code"
              class="code-editor"
              :extensions="extensions"
              autofocus
              indent-with-tab
              :tab-size="4"
              @update="valueChange"
              @focus="onFocus"
              @blur="onBlur"/>
</template>
<script setup>
import {Codemirror} from "vue-codemirror";
import {computed, ref} from "vue";
import xmlLanguage from "./lang/xml";
import {barf} from "./themes";

const props = defineProps({
  value: {
    type: String
  },
  language: {
    type: String,
    required: true
  }
})
const emits = defineEmits(["input", 'focus', 'blur'])

const code = ref(props.value)

const extensions = computed(() => {
  const result = []
  //  language
  switch (props.language) {
    case 'xml':
      result.push(xmlLanguage())
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
</script>

<style scoped>
.code-editor {
  width: 100%;
  height: 100%;
  font-size: 15px;
  background-color: #fff;
  color: #333;
}
</style>