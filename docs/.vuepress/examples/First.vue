<template>
  <terminal name="my-terminal"
            @exec-cmd="onExecCmd"
            :drag-conf="dragConf" />
</template>
<script>
export default {
  name: 'App',
  data(){
    return {
      dragConf: {
        width: "50%",
        height: "70%",
        zIndex: 100,
        init: {
          x: 200,
          y: 200
        },
        pinned: false
      }
    }
  },
  methods: {
    onExecCmd(key, command, success, failed) {
      if (key === 'fail') {
        failed('Something wrong!!!')
      } else {
        let allClass = ['success', 'error', 'system', 'info', 'warning'];

        let clazz = allClass[Math.floor(Math.random() * allClass.length)];
        success({
          type: 'normal',
          class: clazz,
          tag: clazz,
          content: `Your command is '${command}'`
        })
      }
    }
  }
}
</script>
<style scoped>
</style>