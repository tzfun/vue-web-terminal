# HELP
启动, 打包, 发布相关细节
## 1. 安装依赖
如果没有pnpm, 首先[安装pnpm](https://pnpm.io/installation)

一般这样安装:
```bash
npm i -g pnpm
```
之后用pnpm安装根目录和demo两个包的依赖
```bash
# 根目录执行
pnpm i
```

## 2. 打包并运行demo
首先确保`index.html`中使用
```html
<script type="module" src="/demo/src/main.ts"></script>
```
之后执行
```bash
pnpm run build; pnpm run dev
```

## 改造为vite后项目变化
### 1. demo调试实现
原先demo代码放在特定分支, 验证功能比较不方便, 现在使用pnpm-workspace+vite实现了在`vue3`分支即可调试

`index.html`中如果改为`/src/main.ts`, 则`pnpm run dev`可显示组件基本功能; 

如果改为`/demo/src/main.ts`, 则`pnpm run build; pnpm run dev`可显示demo的功能, 对demo进行调试; 
