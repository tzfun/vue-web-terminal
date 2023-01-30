import type { CSSProperties } from 'vue'

export const defaultContainerStyle: CSSProperties = {
  zIndex: 100,
  position: 'fixed',
}

export const fullScreenStyle: CSSProperties = {
  position: 'fixed',
  width: '100%',
  height: '100%',
  left: '0',
  top: '0',
  backgroundColor: 'black',
}
