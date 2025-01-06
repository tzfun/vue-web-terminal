<script setup lang="ts">
import {Terminal, DragConfig, FailedFunc, SuccessFunc, TerminalMessageClass} from 'vue-web-terminal';
import {reactive} from "vue";

const dragConf = reactive<DragConfig>({
  width: "50%",
  height: "70%",
  zIndex: 100,
  init: {
    x: 200,
    y: 200
  },
  pinned: false
})

const onExecCmd = (key: string, command: string, success: SuccessFunc, failed: FailedFunc) => {
  if (key === 'fail') {
    failed('Something wrong!!!')
  } else {
    let allClass = ['success', 'error', 'system', 'info', 'warning'];

    let clazz = allClass[Math.floor(Math.random() * allClass.length)];
    success({
      type: 'normal',
      class: clazz as TerminalMessageClass,
      tag: clazz,
      content: `Your command is '${command}'`
    })
  }
}
</script>

<template>
  <terminal name="my-terminal"
            theme="dark"
            @exec-cmd="onExecCmd"
            :drag-conf="dragConf"
  />
</template>

<style scoped>
</style>
