/// <reference types="vite/client" />

import '@vue/runtime-core'

export {}

declare module '@vue/runtime-core' {
  export interface GlobalComponents {
    THeader: typeof import("~/components/THeader.vue")['default']
    TEditor: typeof import("~/components/TEditor.vue")['default']
    THelpBox: typeof import("~/components/THelpBox.vue")['default']
    TViewerCode: typeof import("~/components/TViewerCode.vue")['default']
    TViewerJson: typeof import("~/components/TViewerJson.vue")['default']
    TViewerNormal: typeof import("~/components/TViewerNormal.vue")['default']
    TViewerTable: typeof import("~/components/TViewerTable.vue")['default']
    JsonViewer: typeof import("vue-json-viewer")['default']
    Terminal: typeof import("~/Terminal.vue")['default']
  }
}

declare module "*.vue" {
  import { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
