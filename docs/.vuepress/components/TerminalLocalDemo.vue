<script setup>
import {onMounted, reactive, ref} from "vue";
import LocalTerminal from "./local-terminal/LocalTerminal.vue";
import {useClientData, usePageLang} from "@vuepress/client";
import languages from '../languages.json'

String.prototype.format = function () {
  if (arguments.length === 0) {
    return this;
  }
  const arg0 = arguments[0]
  let s = this;
  for (const i in arg0) {
    s = s.replace(new RegExp("\\{" + i + "\\}", "g"), arg0[i]);
  }
  return s;
};

const languageText = ref({})
const language = ref('en-US')
const theme = ref('dark')

onMounted(() => {
  console.log(useClientData())
  language.value = usePageLang().value
  languageText.value = languages[language.value]
})

const getText = (key) => {
  return languageText.value[key] || ''
}

const showEditor = ref(false)
const terminals = reactive({
  default: {
    show: false,
    name: 'vue-web-terminal [default]',
    context: '/vue-web-terminal/default',
    localInitCmd: null,
    showHeader: true,
    dragConf: null
  },
  fullscreen: {
    show: false,
    name: 'vue-web-terminal [fullscreen]',
    context: '/vue-web-terminal/fullscreen',
    localInitCmd: null,
    showHeader: true,
    dragConf: null
  },
  bottom: {
    show: false,
    name: 'vue-web-terminal [bottom]',
    context: '/vue-web-terminal/bottom',
    localInitCmd: null,
    showHeader: true,
    dragConf: null
  },
  list: []
})
const multiSeq = ref(1)
const releaseSeq = ref([])

const _getQuery = () => {
  let search = location.search.replace('?', '')
  let query = {}
  if (search.length > 0) {
    let kvArr = search.split("&")
    for (let kvs of kvArr) {
      let kv = kvs.split("=")
      query[kv[0]] = decodeURIComponent(kv[1])
    }
  }
  return query
}

onMounted(() => {
  let defaultTerminal
  if (document.body.clientWidth > 960) {
    showEditor.value = true
    defaultTerminal = terminals.default
  } else {
    defaultTerminal = terminals.fullscreen
    defaultTerminal.name = 'vue-web-terminal'
    defaultTerminal.context = '/vue-web-terminal'
    defaultTerminal.style = "position:fixed;"
  }
  let query = _getQuery()
  if (query.cmd && query.cmd.trim().length > 0) {
    defaultTerminal.localInitCmd = query.cmd
  }

  defaultTerminal.dragConf = initWindowSize()
  defaultTerminal.show = true
})

const emits = defineEmits(['close'])

const initWindowSize = () => {
  let dragConf = {
    pinned: false
  }
  let width = document.body.clientWidth
  if (width < 960) {
    dragConf = null
  } else if (width >= 960 && width < 1264) {
    dragConf.width = 800
    dragConf.height = 600
  } else if (width >= 1264) {
    dragConf.width = 950
    dragConf.height = 700
  }
  if (showEditor.value && dragConf) {
    let height = document.body.clientHeight
    dragConf.init = {
      x: (width - 500 - dragConf.width) / 2,
      y: (height - dragConf.height) / 2
    }
  }
  return dragConf
}

const showDemo = (type) => {
  for (let t in terminals) {
    if (t !== 'list') {
      terminals[t].show = t === type
    }
  }
  if (type === 'list') {
    createNew()
  } else {
    resetList()
  }
}

const resetList = () => {
  terminals.list = []
  releaseSeq.value = []
  multiSeq.value = 1
}

const createNew = () => {
  let seq
  if (releaseSeq.value.length === 0) {
    seq = parseInt(multiSeq.value.toString())
  } else {
    seq = releaseSeq.value[0]
  }
  terminals.list.push({
    show: true,
    name: `vue-web-terminal [multi-${multiSeq.value}]`,
    context: `/vue-web-terminal/multi-${multiSeq.value}`,
    localInitCmd: null,
    showHeader: true,
    dragConf: {
      zIndex: 100,
      width: 700,
      height: 500,
      init: {
        x: 100 + seq * 50,
        y: 70 + seq * 30
      },
      pinned: false
    }
  })
  if (releaseSeq.value.length !== 0) {
    releaseSeq.value.splice(0, 1)
  }
  multiSeq.value++
}

const closeWindow = (key, name) => {
  if (key === 'list') {
    let idx = -1
    for (let i in terminals.list) {
      if (terminals.list[i].name === name) {
        idx = i;
        break
      }
    }
    if (idx >= 0) {
      releaseSeq.value.push(idx)
      terminals.list[idx].show = false
    }

    if (releaseSeq.value.length === terminals.list.length) {
      resetList()
    }
  } else {
    terminals[key].show = false
  }
  if (!showEditor.value) {
    emits('close')
  }
}

const onActive = (key, name) => {
  if (key === 'list') {
    for (const item of terminals.list) {
      if (item.dragConf) {
        if (item.name === name) {
          item.dragConf.zIndex = 101
        } else {
          item.dragConf.zIndex = 100
        }
      }
    }
  }
}

const goHome = () => {
  let base = '/vue-web-terminal'
  document.location.href = base + (language.value === 'en-US' ? '/' : '/zh/')
}

</script>

<template>
  <div class="terminal-container">
    <div class="window-container">
      <div v-for="(item,key) in terminals" :key="key">
        <div v-if="key === 'default' && item.show">
          <LocalTerminal :name="item.name"
                         :context="item.context"
                         :init-cmd="item.localInitCmd"
                         :show-header="item.showHeader"
                         :drag-conf="item.dragConf"
                         :theme="theme"
                         @on-active="onActive(key, $event)"
                         @close="closeWindow(key, item.name)">
          </LocalTerminal>
        </div>
        <div v-else-if="key === 'bottom' && item.show" class="bottom-container">
          <LocalTerminal :name="item.name"
                         :context="item.context"
                         :init-cmd="item.localInitCmd"
                         :show-header="item.showHeader"
                         :drag-conf="item.dragConf"
                         :theme="theme"
                         @on-active="onActive(key, $event)"
                         @close="closeWindow(key, item.name)">
          </LocalTerminal>
        </div>
        <div v-else-if="key === 'fullscreen' && item.show" class="fullscreen-container">
          <LocalTerminal :name="item.name"
                         :context="item.context"
                         :init-cmd="item.localInitCmd"
                         :show-header="item.showHeader"
                         :drag-conf="item.dragConf"
                         :theme="theme"
                         :style="item.style"
                         @on-active="onActive(key, $event)"
                         @close="closeWindow(key, item.name)"/>
        </div>
        <div v-else-if="item.length > 0">
          <div v-for="(it,k) in item" :key="k">
            <LocalTerminal v-show="it.show"
                           :name="it.name"
                           :context="it.context"
                           :init-cmd="it.localInitCmd"
                           :show-header="it.showHeader"
                           :drag-conf="it.dragConf"
                           :theme="theme"
                           @on-active="onActive(key, $event)"
                           @close="closeWindow(key, it.name)"/>
          </div>
        </div>
      </div>
    </div>
    <div class="editor-container" v-if="showEditor">
      <div class="editor-body">
        <div style="display: flex;justify-content: center;">
          <img style="width: 200px" src="/images/vue-web-terminal.png" alt="vue-web-terminal">
        </div>
        <div class="editor-icon">
          <div>
            <a href="https://github.com/tzfun/vue-web-terminal/tree/vue2"><img
                src="https://shields.io/github/package-json/v/tzfun/vue-web-terminal/vue2" alt="vue2"></a>
            <a href="https://github.com/tzfun/vue-web-terminal/tree/vue3" style="margin-left: 15px;"><img
                src="https://shields.io/github/package-json/v/tzfun/vue-web-terminal/vue3" alt="vue3"></a>
          </div>
        </div>
        <div class="editor-navbar">
          <button class="btn" @click="goHome">{{ getText('DEMO_NAVBAR_GO_HOME') }}</button>
          <div>
            <div :class="'btn btn-merged btn-merged-left ' + (theme === 'dark' ? 't-btn-active' : 'btn-default')"
                  @click="theme = 'dark'">Dark</div>
            <div :class="'btn btn-merged btn-merged-right ' + (theme === 'light' ? 't-btn-active' : 'btn-default')"
                 @click="theme = 'light'">Light</div>
          </div>
        </div>
        <div class="demo-btn">
          <button :class="'btn ' + (terminals.default.show ? 't-btn-active' :'btn-default')"
                  @click="showDemo('default')">{{ getText('DEMO_BTN_1') }}
          </button>
        </div>
        <div class="demo-btn">
          <button :class="'btn ' + (terminals.bottom.show ? 't-btn-active' :'btn-default')"
                  @click="showDemo('bottom')">{{ getText('DEMO_BTN_2') }}
          </button>
        </div>
        <div class="demo-btn">
          <button :class="'btn ' + (terminals.fullscreen.show ? 't-btn-active' :'btn-default')"
                  @click="showDemo('fullscreen')">{{ getText('DEMO_BTN_3') }}
          </button>
        </div>
        <div class="demo-btn">
          <button :class="'btn ' + (terminals.list.length > 0 ? 't-btn-active' :'btn-default')"
                  @click="showDemo('list')"
                  v-html="getText('DEMO_BTN_4')">
          </button>
        </div>

        <div class="help-container">
          <h2 class="help-title" style="margin: 5px;">{{ getText('DEMO_USAGE_TIPS') }}</h2>
          <ul class="help-list">
            <li>{{ getText('DEMO_USAGE_1') }}</li>
            <li>{{ getText('DEMO_USAGE_2') }}</li>
            <li>{{ getText('DEMO_USAGE_3') }}</li>
            <li>{{ getText('DEMO_USAGE_4') }}</li>
            <li>{{ getText('DEMO_USAGE_5') }}</li>
            <li>{{ getText('DEMO_USAGE_6') }}</li>
            <li>{{ getText('DEMO_USAGE_7') }}</li>
            <li>{{ getText('DEMO_USAGE_8') }}</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

.btn {
  margin: 15px;
  padding: 0.5em 1.5em;
  font-size: 1em;
  border-radius: var(--doc-btn-border-radius);
  border: none;
  box-shadow: 1px 1px 15px rgb(0 0 0 / 20%);
  transition: background-color .1s ease;
  box-sizing: border-box;
  cursor: pointer;
  font-weight: bold;
}

.btn:hover {
  background: #63e5aa;
  color: white;
}

.btn-merged {
  box-shadow: none;
  margin-left: 0;
  margin-right: 0;
  display: inline-block;
}

.btn-merged-left {
  border-radius: var(--doc-btn-border-radius) 0 0 var(--doc-btn-border-radius);
}

.btn-merged-right {
  border-radius: 0 var(--doc-btn-border-radius) var(--doc-btn-border-radius) 0;
}

.editor-navbar {
  display: flex;
  justify-content: center;
}

.terminal-container {
  position: fixed;
  z-index: 100;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}

.terminal-container {
  display: flex;
  height: 100%;
}

.window-container {
  width: calc(100% - 500px);
  position: relative;
}

.editor-container {
  width: 500px;
  background-color: #41b883;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bottom-container {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 500px;
}

.fullscreen-container {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 200;
}

.demo-btn-list {
  display: flex;
  justify-content: center;
}

.demo-btn {
  display: flex;
  justify-content: center;
  width: 100%;
}

.demo-btn .btn {
  width: 70%;
}

.help-container {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
}

.help-title {
  text-align: center;
  border-bottom: none;
}

.help-title, .help-list {
  color: white;
  width: 100%;
}

.help-list {
  margin-left: 20px;
  list-style: decimal;
  font-size: 1em;
  padding-top: 0;
  margin-top: 0;
}

.help-list li {
  margin: 10px 15px;
}

.editor-icon {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 20px;
}
</style>

<style>
:root {
  --doc-btn-border-radius: 5px;
}

.btn-default {
  color: #3eaf7c;
  background-color: #ffffff;
}

.t-btn-active {
  background-color: #70d095;
  color: white;
}
</style>
