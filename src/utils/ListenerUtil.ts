import { ref, onMounted, onUnmounted } from 'vue';

export const useKeydownListener = (onKeydown: (e) => void) => {
  // TODO vueuse中是否可替换
  const keydownListener = ref<(e) => void>(() => {})
  onMounted(() => {
    keydownListener.value = (event) => {
      
    };
    window.addEventListener("keydown", keydownListener.value);
  })
  onUnmounted(() => {
    window.removeEventListener("keydown", keydownListener.value);
  })
}