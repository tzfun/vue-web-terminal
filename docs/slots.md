# Slots

The plugin provides some slots. If you are not satisfied with the default style or the default implementation does 
not meet your needs, you can use these slots to customize this part of the display.

## Slots

| Slot name    | Arguments            | Description                                                         |
|--------------|----------------------|---------------------------------------------------------------------|
| header       | /                    | Customize the header style, still retain the drag area.             |
| helpBox      | { showHeader, item } | Custom command search result prompt box, item is the search result. |
| normal       | { message }          | Custom `normal` type message.                                       |
| json         | { message }          | Custom `json` type message.                                         |
| table        | { message }          | Custom `table` type message.                                        |
| code         | { message }          | Custom `code` type message.                                         |
| html         | { message }          | Custom `html` type message.                                         |
| flash        | { content }          | Custom flash style.                                                 |
| helpCmd      | { item }             | Custom command search prompt style.                                 |
| textEditor   | { data }             | Custom text editor style.                                           |


## Example

```html
<terminal :name="name" @exec-cmd="onExecCmd">
    <!--  Custom header style  -->
    <template #header>
      This is my custom header
    </template>

    <!--  Customize JSON format message style  -->
    <template #json="data">
      {{ data.message }}
    </template>

    <!--  Customize the help prompt box style  -->
    <template #helpBox="{showHeader, item}">
      {{ item }}
    </template>

    <!--  Customize text editor style  -->
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
