<template>
  <div id="app">
    <button v-show="!show" @click="show=true" class="btn">打开Terminal</button>
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
        show-header
        @initBefore="initBefore"
        @initComplete="initComplete"
    >
    </terminal>
  </div>
</template>

<script>
import AppJs from './App.js'

export default AppJs
</script>

<style scoped>
.btn {
  position: fixed;
  margin: auto;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  width: 300px;
  height: 70px;
  line-height: 70px;
  padding: 0;
  font-size: 25px;
  border-radius: 10px;
  background: #4cb24c;
  color: #ffffff;
  border: none;
  box-shadow: 1px 1px 15px rgb(0 0 0 / 20%);
  cursor: pointer;
}

.btn:hover {
  background: #67cc67;
  color: #ffffff;
}
</style>
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
