<template>
  <div class="code-box" :id="domId"/>
</template>
<script setup>
import {createApp, ref} from 'vue'
import 'vue-web-terminal/lib/theme/dark.css'
import Terminal from 'vue-web-terminal'

const genUniqueID = (length) => {
  let idStr = Date.now().toString(36)
  idStr += Math.random().toString(36).substring(2, 2 + length)
  return idStr
}

const html = ref('')
const js = ref('')
const css = ref('')
const program = ref({})
const domId = ref(genUniqueID(5))

const parseHtml = (str) => {
  return String(str)
      .replace(/&(?!\w+;)/g, '&amp;')
      .replace(/ /g, '&nbsp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
      .replace(/\n/g, '<br>')
      .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
}

const getSource = (source, type) => {
  const regex = new RegExp(`<${type}[^>]*>`)
  let openingTag = source.match(regex)
  if (!openingTag) return ''
  else openingTag = openingTag[0]

  return source.slice(
      source.indexOf(openingTag) + openingTag.length,
      source.lastIndexOf(`</${type}>`)
  )
}

const splitCode = (code) => {
  const script = getSource(code, 'script').replace(
      /export default/,
      'return '
  )
  const style = getSource(code, 'style')
  const template = getSource(code, 'template')
  js.value = script
  css.value = style
  html.value = template
}

const buildDom = (code) => {
  try {
    splitCode(code)
    if (html.value === '' || js.value === '') {
      alert(`请输入有效的Vue代码${Math.floor(Math.random() * 1000)}`)
      return;
    }
    const common = new Function(js.value)()
    common.template = html.value
    let app = createApp(common)
    app.use(Terminal)
    app.mount("#" + domId.value)

    program.value = app
    if (css.value !== '') {
      const styles = document.createElement('style')
      styles.innerHTML = css.value
      document.getElementsByTagName('head')[0].appendChild(styles)
    }
  } catch (e) {
    document.querySelector('#' + domId.value).innerHTML = '<div class="code-err">' + parseHtml(e.stack) + '</div>'
    console.error(e)
  }
}

const reset = () => {
  document.getElementById(domId.value).innerHTML = ''
  if (program.value && program.value.unmount) {
    console.log(program.value)
    program.value.unmount()
  }
  program.value = null
}

defineExpose({
  reset,
  buildDom
})
</script>
<style scoped>
.code-box {
  width: 100%;
  height: 100%;
}
</style>
<style>
.code-err {
  width: 100%;
  height: 100%;
  background: #1C1D21;
  color: white;
  padding: 20px 15px;
}

.terminal h4 {
  margin-bottom: 5px !important;
  padding-top: unset !important;
}
</style>