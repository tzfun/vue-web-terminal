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
                         @on-active="onActive(key, $event)"
                         @close="closeWindow(key, item.name)">
          </LocalTerminal>
        </div>
        <div v-else-if="item.length > 0">
          <div v-for="(it,k) in item" :key="k">
            <LocalTerminal v-if="it.show"
                           :name="it.name"
                           :context="it.context"
                           :init-cmd="it.localInitCmd"
                           :show-header="it.showHeader"
                           :drag-conf="it.dragConf"
                           @on-active="onActive(key, $event)"
                           @close="closeWindow(key, it.name)">
            </LocalTerminal>
          </div>
        </div>
      </div>
    </div>
    <div class="editor-container">
      <button @click="terminals.default.show = !terminals.default.show">关闭 / 打开 示例 1</button>
      <button @click="terminals.bottom.show = !terminals.bottom.show">关闭 / 打开 示例 2</button>
      <button @click="terminals.fullscreen.show = !terminals.fullscreen.show">关闭 / 打开 示例 3</button>
      <button @click="createNew">新建一个窗口</button>
    </div>

  </div>
</template>

<script>

import TerminalPageJs from "@/components/TerminalPage.js";

export default TerminalPageJs;

</script>

<style scoped>
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
  background-color: #2c3e50;
}

.bottom-container {
  border-top: 1px solid blueviolet;
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

</style>