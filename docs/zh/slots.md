# 插件插槽

插件提供了一些插槽，如果你对默认样式不满意，或者是默认实现无法满足你的需求，你可以使用这些插槽自定义这部分显示。

## Slots

| 插槽名称       | 参数                   | 说明                     |
|------------|----------------------|------------------------|
| header     | /                    | 自定义header样式，仍然会保留拖拽区域  |
| helpBox    | { showHeader, item } | 自定义命令搜索结果提示框，item为搜索结果 |
| normal     | { message }          | 自定义`normal`类型消息        |
| json       | { message }          | 自定义`json`类型消息          |
| table      | { message }          | 自定义`table`类型消息         |
| code       | { message }          | 自定义`code`类型消息          |
| html       | { message }          | 自定义`html`类型消息          |
| flash      | { content }          | 自定义实时回显样式              |
| helpCmd    | { item }             | 自定义命令搜索提示样式            |
| textEditor | { data }             | 自定义文本编辑器样式             |


## 示例

```html
<terminal :name="name" @exec-cmd="onExecCmd">
    <!--  自定义header样式  -->
    <template #header>
      This is my custom header
    </template>

    <!--  自定义json格式样式  -->
    <template #json="data">
      {{ data.message }}
    </template>

    <!--  自定义提示框样式  -->
    <template #helpBox="{showHeader, item}">
      {{ item }}
    </template>

    <!--  自定义文本编辑器样式  -->
    <template #textEditor="{data}">
        <textarea name="editor" 
                  class="t-text-editor" 
                  v-model="data.value" 
                  @focus="data.onFocus" 
                  @blur="data.onBlur"></textarea>
        <div class="t-text-editor-floor" align="center">
            <button class="t-text-editor-floor-btn" @click="_textEditorClose(false)">Cancel</button>
            <button class="t-text-editor-floor-btn" @click="_textEditorClose(true)">Save & Close(Ctrl + S)</button>
        </div>
    </template>
</terminal>
```

<CommentService></CommentService>
