<script setup lang="ts">
defineProps<{
  title: string
  showHeader: boolean
  /** 是否全屏状态 */
  fullscreen: boolean
}>()
const emit = defineEmits<{
  (e: 'clickTitle'): void
  (e: 'close'): void
  (e: 'minScreen'): void
  (e: 'fullScreen'): void
}>()
</script>

<template>
  <div class="t-header">
    <h4>
      <span style="cursor: pointer;" @click="emit('clickTitle')">{{ title }}</span>
    </h4>
    <ul class="t-shell-dots">
      <li class="shell-dot-item t-shell-dots-red" @click="emit('close')">
        <svg
          t="1645078279626" class="t-shell-dot" viewBox="0 0 1024 1024" version="1.1"
          xmlns="http://www.w3.org/2000/svg" p-id="1864" width="10" height="10"
        >
          <path
            d="M544.448 499.2l284.576-284.576a32 32 0 0 0-45.248-45.248L499.2 453.952 214.624 169.376a32 32 0 0 0-45.248 45.248l284.576 284.576-284.576 284.576a32 32 0 0 0 45.248 45.248l284.576-284.576 284.576 284.576a31.904 31.904 0 0 0 45.248 0 32 32 0 0 0 0-45.248L544.448 499.2z"
            p-id="1865" fill="#1413139c"
          />
        </svg>
      </li>
      <li class="shell-dot-item t-shell-dots-yellow" @click="emit('minScreen')">
        <svg
          t="1645078503601" class="t-shell-dot" viewBox="0 0 1024 1024" version="1.1"
          xmlns="http://www.w3.org/2000/svg" p-id="2762" width="10" height="10"
        >
          <path
            d="M872 474H152c-4.4 0-8 3.6-8 8v60c0 4.4 3.6 8 8 8h720c4.4 0 8-3.6 8-8v-60c0-4.4-3.6-8-8-8z"
            p-id="2763" fill="#1413139c"
          />
        </svg>
      </li>
      <li class="shell-dot-item t-shell-dots-green" @click="emit('fullScreen')">
        <svg
          t=" 1645078604258" class="t-shell-dot" viewBox="0 0 1024 1024" version="1.1"
          xmlns="http://www.w3.org/2000/svg" p-id="9907" width="10" height="10"
        >
          <path
            d="M188.373333 128H384c23.573333 0 42.666667-19.093333 42.666667-42.666667s-19.093333-42.666667-42.666667-42.666666H85.333333C61.76 42.666667 42.666667 61.76 42.666667 85.333333v298.666667c0 23.573333 19.093333 42.666667 42.666666 42.666667s42.666667-19.093333 42.666667-42.666667V188.373333L396.170667 456.533333a42.730667 42.730667 0 0 0 60.362666 0 42.741333 42.741333 0 0 0 0-60.362666L188.373333 128zM938.666667 597.002667c-23.573333 0-42.666667 19.093333-42.666667 42.666666v195.626667l-268.309333-268.16c-16.746667-16.64-43.893333-16.64-60.544 0s-16.650667 43.893333 0 60.533333L835.317333 896h-195.626666c-23.584 0-42.666667 19.093333-42.666667 42.666667s19.082667 42.666667 42.666667 42.666666h298.666666C961.92 981.333333 981.333333 961.92 981.333333 938.336v-298.666667c0-23.573333-19.093333-42.666667-42.666666-42.666666z"
            p-id="9908" fill="#1413139c"
          />
        </svg>
      </li>
    </ul>
  </div>
</template>
