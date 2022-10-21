<template>
  <div id="app">
    <button v-show="!show" @click="show=true">打开Terminal</button>
    <terminal
        v-if="show"
        :name="name"
        @execCmd="onExecCmd"
        @onClick="onClick"
        @onKeydown="onKeydown"
        :inputFilter="inputFilter"
        :context.sync="context"
        :commandStore="cmdStore"
        :warnLogCountLimit="200"
        :showLogTime="true"
        :dragConf="dragConf"
        show-header>
    </terminal>
  </div>
</template>

<script>
import AppJs from './App.js'

export default AppJs
</script>

<style>
body, html, #app {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}

.custom-content {
  list-style: none;
  margin: 0;
  padding: 0;
}

.custom-content li {
  float: left;
  display: flex;
  margin: 0 5px;
}

.t-dir {
  color: cornflowerblue;
}

.t-file {
  color: greenyellow;
}
</style>
