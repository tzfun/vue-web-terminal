import terminal from './Terminal.vue'
import terminalObj from './TerminalObj.js'
import Vue from "vue";
import JsonViewer from 'vue-json-viewer'
import Highlight from './Highlight.js'

Vue.use(Highlight);
Vue.use(JsonViewer)
Vue.prototype.$terminal = terminalObj

export default terminal
