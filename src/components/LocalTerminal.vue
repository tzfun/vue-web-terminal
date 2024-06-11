<template>
  <terminal
      :name="name"
      :title="name"
      :init-log="initLog"
      :input-filter="inputFilter"
      :context="context"
      :command-store="cmdStore"
      :warn-log-count-limit="200"
      :drag-conf="dragConf"
      :show-header="showHeader"
      :enable-hover-stripe="false"
      @exec-cmd="onExecCmd"
      @on-click="onClick"
      @on-keydown="onKeydown"
      @init-before="initBefore"
      @init-complete="initComplete"
      @on-active="onActive">
    <template #textEditor="{data}">
      <codemirror ref="customTextEditor" class="my-text-editor" v-model="data.value"
                  :options="codemirrorOptions"
                  @focus="data.onFocus"
                  @blur="data.onBlur"/>
      <div class="t-text-editor-floor" align="center">
        <button class="t-text-editor-floor-btn t-save-btn" @click="_textEditorClose(true)">Save & Close(Ctrl + S)
        </button>
        <button class="t-text-editor-floor-btn t-close-btn" @click="_textEditorClose(false)">Cancel</button>
      </div>
    </template>
  </terminal>
</template>

<script>
import LocalTerminalJs from "@/components/LocalTerminal.js";

export default LocalTerminalJs
</script>

<style>
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

.my-text-editor {
  height: calc(100% - 35px);
}

.my-text-editor .CodeMirror {
  height: 100% !important;
}
</style>
