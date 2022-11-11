<template>
  <TContainer :name="name"
              :title="title"
              :show-header="showHeader"
              :drag-conf="dragConf"
              ref="frame">
    <template #header="data">
      <slot name="header" :title="data.title"></slot>
    </template>
    <template #window>

    </template>
  </TContainer>
</template>

<script>
import '@/css/common.css'
import '@/css/shell.css'
import TContainer from "@/components/TContainer";
import {shellProps} from "@/components/TProps";

export default {
  name: "Shell",
  components:{TContainer},
  props: shellProps,
  methods: {

  }
}
</script>

<style scoped>

</style>