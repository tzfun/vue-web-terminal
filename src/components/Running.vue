<template>
  <div class="code-box" id="display"></div>
</template>
<script>
import Vue from 'vue'
import 'vue-web-terminal/lib/theme/light.css'
import {_html} from "@/common/util";

export default {
  name: 'Running',
  data() {
    return {
      html: '',
      js: '',
      css: '',
      program: null
    }
  },
  methods: {
    getSource(source, type) {
      const regex = new RegExp(`<${type}[^>]*>`)
      let openingTag = source.match(regex)
      if (!openingTag) return ''
      else openingTag = openingTag[0]

      return source.slice(
          source.indexOf(openingTag) + openingTag.length,
          source.lastIndexOf(`</${type}>`)
      )
    },
    splitCode(code) {
      const script = this.getSource(code, 'script').replace(
          /export default/,
          'return '
      )
      const style = this.getSource(code, 'style')
      const template = this.getSource(code, 'template')
      this.js = script
      this.css = style
      this.html = template
    },
    buildDom(code) {
      try {
        this.splitCode(code)
        if (this.html === '' || this.js === '') {
          alert(`请输入有效的Vue代码${Math.floor(Math.random() * 1000)}`)
          return;
        }
        // eslint-disable-next-line no-new-func
        const common = new Function(this.js)()
        common.template = this.html
        const Template = Vue.extend(common)
        this.program = new Template()
        document.querySelector('#display').appendChild(this.program.$mount().$el)
        if (this.css !== '') {
          const styles = document.createElement('style')
          styles.type = 'text/css'
          styles.innerHTML = this.css
          document.getElementsByTagName('head')[0].appendChild(styles)
        }
      } catch (e) {
        document.querySelector('#display').innerHTML = '<div class="code-err">' + _html(e.stack) + '</div>'
      }
    },
    reset() {
      document.getElementById('display').innerHTML = ''
      if (this.program) {
        this.program.$destroy()
      }
      this.program = null
    }
  }
}
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
</style>