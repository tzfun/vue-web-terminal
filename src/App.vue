<template>
  <div id="app">
    <button v-show="!show" @click="show=true" class="btn">打开Terminal</button>
    <terminal
        v-if="show"
        :name="name"
        :title="title"
        :init-log="initLog"
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
        style="position: fixed"
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
  background-color: #b3ffff;
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

.demo-init-box {
  border-radius: 5px;
  border: 1px yellow solid;
  border-left: 1px dashed yellow;
  border-right: 1px dashed yellow;
  color: white;
  align-content: center;
  text-align: center;
  padding: 40px 15px;
  width: 400px;
  margin: 30px 0;
}

@media screen and (max-width: 768px) {
  .demo-init-box {
    width: 92%;
  }
}

.t-a {
  color: #77cfff;
}

.loading-flash {
  position: relative;
  display: inline-block;
  width: 15px;
  height: 15px;
  transform: rotate(0deg);
  top: 3px;
  left: -3px;
}

.loading-flash:before {
  content: '';
  position: absolute;
  width: 10.606px;
  height: 10.606px;
  border: 2px solid rgba(240, 236, 236, 0.3);
  border-left-color: #a4eac8;
  border-radius: 50%;
}
</style>
