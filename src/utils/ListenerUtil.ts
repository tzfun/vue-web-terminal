import { ref, onMounted, onUnmounted } from "vue";

export const useKeydownListener = (onKeydown: (e: KeyboardEvent) => void) => {
  // TODO vueuse中是否可替换
  const keydownListener = ref<(e: KeyboardEvent) => void>(() => {});
  onMounted(() => {
    keydownListener.value = onKeydown;
    window.addEventListener("keydown", keydownListener.value);
  });
  onUnmounted(() => {
    window.removeEventListener("keydown", keydownListener.value);
  });
};
