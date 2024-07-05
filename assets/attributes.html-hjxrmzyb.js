import{_ as r,r as l,o as p,c,d as n,e as s,a as e,w as o,b as a}from"./app-DQqPtVNh.js";const d={},u=a('<h1 id="attributes" tabindex="-1"><a class="header-anchor" href="#attributes"><span>Attributes</span></a></h1><img src="https://shields.io/github/package-json/v/tzfun/vue-web-terminal/vue2" style="margin-right:8px;"><img src="https://shields.io/github/package-json/v/tzfun/vue-web-terminal/vue3" style="margin-right:8px;"><p>This plugin provides rich properties to make it more flexible.</p><h2 id="name" tabindex="-1"><a class="header-anchor" href="#name"><span>name</span></a></h2><ul><li><strong>Type</strong>: string</li><li><strong>Default</strong>: terminal</li><li><strong>Description</strong>: Terminal instance name. This property is also required in the API.</li></ul><div class="hint-container tip"><p class="hint-container-title">Tips</p><p>Multiple Terminal instances can be created on the same page, but their name attributes must be different and globally unique.</p></div><h2 id="context" tabindex="-1"><a class="header-anchor" href="#context"><span>context</span></a></h2><ul><li><strong>Type</strong>: <code>string</code></li><li><strong>Default</strong>: /vue-web-terminal</li><li><strong>Description</strong>: Context content, supports special characters</li></ul><h2 id="context-suffix" tabindex="-1"><a class="header-anchor" href="#context-suffix"><span>context-suffix</span></a></h2><ul><li><strong>Type</strong>: <code>string</code></li><li><strong>Default</strong>: <code>&gt;</code></li><li><strong>Description</strong>: Contextual suffix symbol, used to separate from user input.</li></ul><h2 id="show-header" tabindex="-1"><a class="header-anchor" href="#show-header"><span>show-header</span></a></h2><ul><li><strong>Type</strong>: <code>boolean</code></li><li><strong>Default</strong>: true</li><li><strong>Description</strong>: Whether to display the window header</li></ul><div class="hint-container tip"><p class="hint-container-title">Tips</p><p>This switch will affect the drag function. The default drag function can only be used when the header is displayed.</p></div><h2 id="title" tabindex="-1"><a class="header-anchor" href="#title"><span>title</span></a></h2><ul><li><strong>Type</strong>: <code>string</code></li><li><strong>Default</strong>: vue-web-terminal</li><li><strong>Description</strong>: The title displayed in the window header. This property will only take effect after the <a href="#show-header">show-header</a> property is enabled.</li></ul><h2 id="drag-conf" tabindex="-1"><a class="header-anchor" href="#drag-conf"><span>drag-conf</span></a></h2><ul><li><strong>Type</strong>: <code>DragConfig</code></li><li><strong>Default</strong>: null</li><li><strong>Description</strong>: Drag window configuration <a href="./others#dragconfig">DragConfig</a>。</li></ul><div class="hint-container tip"><p class="hint-container-title">Tips</p><p>This configuration is only effective when <a href="#show-header">show-header</a> is turned on.</p><p>If this property is not configured, the window width and height will fill the parent element 100%, and the window width and height are equal to the parent element width and height.</p></div><h2 id="init-log" tabindex="-1"><a class="header-anchor" href="#init-log"><span>init-log</span></a></h2>',20),h=n("li",null,[n("strong",null,"Type"),s(": "),n("code",null,"Message[] | null")],-1),g=n("li",null,[n("strong",null,"Default"),s(": null")],-1),m=n("strong",null,"Description",-1),k=n("code",null,"null",-1),f=a('<h2 id="command-store" tabindex="-1"><a class="header-anchor" href="#command-store"><span>command-store</span></a></h2><ul><li><strong>Type</strong>: <code>Command[]</code></li><li><strong>Default</strong>: <a href="./others#internal-commands">Internal Commands</a></li><li><strong>Description</strong>: A <a href="./others#command">Command</a> array, a custom command library, the search prompt function will scan this library</li></ul><h2 id="log-size-limit" tabindex="-1"><a class="header-anchor" href="#log-size-limit"><span>log-size-limit</span></a></h2><ul><li><strong>Type</strong>: <code>number</code></li><li><strong>Default</strong>: 200</li><li><strong>Description</strong>: Limit the maximum number of logs displayed.</li></ul><h2 id="enable-default-command" tabindex="-1"><a class="header-anchor" href="#enable-default-command"><span>enable-default-command</span></a></h2>',5),b=n("li",null,[n("strong",null,"Type"),s(": "),n("code",null,"boolean")],-1),y=n("li",null,[n("strong",null,"Default"),s(": true")],-1),v=n("strong",null,"Description",-1),x=n("a",{href:"./others#internal-commands"},"Internal Commands",-1),w=a(`<h2 id="line-space" tabindex="-1"><a class="header-anchor" href="#line-space"><span>line-space</span></a></h2><ul><li><strong>Type</strong>: <code>number</code></li><li><strong>Default</strong>: 15</li><li><strong>Description</strong>: Log line space, in px</li></ul><h2 id="cursor-style" tabindex="-1"><a class="header-anchor" href="#cursor-style"><span>cursor-style</span></a></h2><ul><li><strong>Type</strong>: <code>string | TerminalCursorStyle</code></li><li><strong>Default</strong>: block</li><li><strong>Description</strong>: Cursor style, optional values: <code>block</code> | <code>underline</code> | <code>bar</code> | <code>none</code></li></ul><div class="language-typescript" data-highlighter="prismjs" data-ext="ts" data-title="ts"><pre class="language-typescript"><code><span class="line"><span class="token keyword">type</span> <span class="token class-name">TerminalCursorStyle</span> <span class="token operator">=</span> <span class="token string">&#39;block&#39;</span> <span class="token operator">|</span> <span class="token string">&#39;underline&#39;</span> <span class="token operator">|</span> <span class="token string">&#39;bar&#39;</span> <span class="token operator">|</span> <span class="token string">&#39;none&#39;</span></span>
<span class="line"></span></code></pre></div><h2 id="enable-cursor-blink" tabindex="-1"><a class="header-anchor" href="#enable-cursor-blink"><span>enable-cursor-blink</span></a></h2><ul><li><strong>Type</strong>: <code>boolean</code></li><li><strong>Default</strong>: true</li><li><strong>Description</strong>: Whether to turn on cursor blinking.</li></ul><h2 id="enable-fold" tabindex="-1"><a class="header-anchor" href="#enable-fold"><span>enable-fold</span></a></h2><ul><li><strong>Type</strong>: <code>boolean</code></li><li><strong>Default</strong>: true</li><li><strong>Description</strong>: Whether to enable the log folding function.</li></ul><h2 id="enable-hover-stripe" tabindex="-1"><a class="header-anchor" href="#enable-hover-stripe"><span>enable-hover-stripe</span></a></h2><ul><li><strong>Type</strong>: <code>boolean</code></li><li><strong>Default</strong>: false</li><li><strong>Description</strong>: Whether the logs in the same group are highlighted when the mouse hovers.</li></ul><h2 id="scroll-mode" tabindex="-1"><a class="header-anchor" href="#scroll-mode"><span>scroll-mode</span></a></h2><ul><li><strong>Type</strong>: <code>string</code></li><li><strong>Default</strong>: smooth</li><li><strong>Description</strong>: Window scroll bar mode, native CSS property value</li></ul><h2 id="command-formatter" tabindex="-1"><a class="header-anchor" href="#command-formatter"><span>command-formatter</span></a></h2><ul><li><strong>Type</strong>: <code>CommandFormatterFunc</code></li><li><strong>Default</strong>: null</li><li><strong>Description</strong>: Command display formatting function, generally used to highlight input commands, pass in the current command and return a new command, supports HTML. If not set, the internally defined highlight style will be used</li></ul><div class="language-typescript" data-highlighter="prismjs" data-ext="ts" data-title="ts"><pre class="language-typescript"><code><span class="line"><span class="token keyword">type</span> <span class="token class-name">CommandFormatterFunc</span> <span class="token operator">=</span> <span class="token punctuation">(</span>cmd<span class="token operator">:</span> <span class="token builtin">string</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token builtin">string</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre></div><h2 id="enable-input-tips" tabindex="-1"><a class="header-anchor" href="#enable-input-tips"><span>enable-input-tips</span></a></h2><ul><li><strong>Type</strong>：<code>boolean</code></li><li><strong>Default</strong>：true</li><li><strong>Description</strong>：Whether to enable the command input prompt function.</li></ul><h2 id="enable-help-box" tabindex="-1"><a class="header-anchor" href="#enable-help-box"><span>enable-help-box</span></a></h2><ul><li><strong>Type</strong>：<code>boolean</code></li><li><strong>Default</strong>：true</li><li><strong>Description</strong>：Whether to open the command sample prompt panel in the upper right corner of the window.</li></ul><h2 id="input-tips-select-handler" tabindex="-1"><a class="header-anchor" href="#input-tips-select-handler"><span>input-tips-select-handler</span></a></h2><ul><li><strong>Type</strong>：<code>InputTipsSelectHandlerFunc</code></li><li><strong>Default</strong>：null</li><li><strong>Description</strong>：Customize the logic processing function when the user selects an output prompt item.</li></ul><div class="language-typescript" data-highlighter="prismjs" data-ext="ts" data-title="ts"><pre class="language-typescript"><code><span class="line"><span class="token doc-comment comment">/**</span>
<span class="line"> * Input prompt selection processing function</span>
<span class="line"> *</span>
<span class="line"> * <span class="token keyword">@param</span> <span class="token parameter">command</span>       The complete command line entered by the current user</span>
<span class="line"> * <span class="token keyword">@param</span> <span class="token parameter">cursorIndex</span>   Current cursor position</span>
<span class="line"> * <span class="token keyword">@param</span> <span class="token parameter">item</span>          User selection prompt</span>
<span class="line"> * <span class="token keyword">@param</span> <span class="token parameter">callback</span>      After filling, this function needs to be called to return a new command line</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">type</span> <span class="token class-name">InputTipsSelectHandlerFunc</span> <span class="token operator">=</span> <span class="token punctuation">(</span>command<span class="token operator">:</span> <span class="token builtin">string</span><span class="token punctuation">,</span> cursorIndex<span class="token operator">:</span> <span class="token builtin">number</span><span class="token punctuation">,</span> item<span class="token operator">:</span> InputTipItem<span class="token punctuation">,</span> <span class="token function-variable function">callback</span><span class="token operator">:</span> <span class="token punctuation">(</span>cmd<span class="token operator">:</span> <span class="token builtin">string</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token keyword">void</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token keyword">void</span></span>
<span class="line"></span></code></pre></div><h2 id="input-tips-search-handler" tabindex="-1"><a class="header-anchor" href="#input-tips-search-handler"><span>input-tips-search-handler</span></a></h2><ul><li><strong>Type</strong>：<code>InputTipsSearchHandlerFunc</code></li><li><strong>Default</strong>：null</li><li><strong>Description</strong>：Customize the processing function of the search prompt content when the user enters.</li></ul><div class="language-typescript" data-highlighter="prismjs" data-ext="ts" data-title="ts"><pre class="language-typescript"><code><span class="line"><span class="token doc-comment comment">/**</span>
<span class="line"> * Implementation of user-defined command search prompt</span>
<span class="line"> *</span>
<span class="line"> * <span class="token keyword">@param</span> <span class="token parameter">command</span>       The complete command line entered by the current user</span>
<span class="line"> * <span class="token keyword">@param</span> <span class="token parameter">cursorIndex</span>   Current cursor position</span>
<span class="line"> * <span class="token keyword">@param</span> <span class="token parameter">commandStore</span>  Command collection</span>
<span class="line"> * <span class="token keyword">@param</span> <span class="token parameter">callback</span>      Search end callback, the callback format is an array</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">type</span> <span class="token class-name">InputTipsSearchHandlerFunc</span> <span class="token operator">=</span> <span class="token punctuation">(</span>command<span class="token operator">:</span> <span class="token builtin">string</span><span class="token punctuation">,</span> cursorIndex<span class="token operator">:</span> <span class="token builtin">number</span><span class="token punctuation">,</span> commandStore<span class="token operator">:</span> Command<span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">,</span> <span class="token function-variable function">callback</span><span class="token operator">:</span> <span class="token punctuation">(</span>tips<span class="token operator">:</span> InputTipItem<span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">,</span> openTips<span class="token operator">?</span><span class="token operator">:</span> <span class="token builtin">boolean</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token keyword">void</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token keyword">void</span></span>
<span class="line"></span></code></pre></div><h2 id="push-message-before" tabindex="-1"><a class="header-anchor" href="#push-message-before"><span>push-message-before</span></a></h2><ul><li><strong>Type</strong>: <code>PushMessageBeforeFunc</code></li><li><strong>Default</strong>: null</li><li><strong>Description</strong>: Hook function triggered before the push message is displayed. In this function, you can modify the properties of the message object.</li></ul><div class="language-typescript" data-highlighter="prismjs" data-ext="ts" data-title="ts"><pre class="language-typescript"><code><span class="line"><span class="token keyword">type</span> <span class="token class-name">PushMessageBeforeFunc</span> <span class="token operator">=</span> <span class="token punctuation">(</span>message<span class="token operator">:</span> Message<span class="token punctuation">,</span> name<span class="token operator">:</span> String<span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token keyword">void</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre></div><h2 id="command-sort-handler" tabindex="-1"><a class="header-anchor" href="#command-sort-handler"><span>command-sort-handler</span></a></h2><ul><li><strong>Type</strong>: <code>CommandSortHandlerFunc</code></li><li><strong>Default</strong>: null</li><li><strong>Description</strong>: Command line library sorting, custom command library display sorting rules.</li></ul><div class="language-typescript" data-highlighter="prismjs" data-ext="ts" data-title="ts"><pre class="language-typescript"><code><span class="line"><span class="token keyword">type</span> <span class="token class-name">CommandSortHandlerFunc</span> <span class="token operator">=</span> <span class="token punctuation">(</span>a<span class="token operator">:</span> <span class="token builtin">any</span><span class="token punctuation">,</span> b<span class="token operator">:</span> <span class="token builtin">any</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token builtin">number</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre></div><h2 id="input-filter" tabindex="-1"><a class="header-anchor" href="#input-filter"><span>input-filter</span></a></h2><ul><li><strong>Type</strong>: <code>InputFilterFunc</code></li><li><strong>Default</strong>: null</li><li><strong>Description</strong>: Custom input filtering, the return value is the filtered string, must be plain text, no html tags.</li></ul><div class="language-typescript" data-highlighter="prismjs" data-ext="ts" data-title="ts"><pre class="language-typescript"><code><span class="line"><span class="token keyword">type</span> <span class="token class-name">InputFilterFunc</span> <span class="token operator">=</span> <span class="token punctuation">(</span>str1<span class="token operator">:</span> <span class="token builtin">string</span><span class="token punctuation">,</span> str2<span class="token operator">:</span> <span class="token builtin">string</span><span class="token punctuation">,</span> event<span class="token operator">:</span> InputEvent<span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token builtin">string</span> <span class="token operator">|</span> <span class="token keyword">null</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre></div>`,35);function T(D,_){const t=l("RouteLink"),i=l("CommentService");return p(),c("div",null,[u,n("ul",null,[h,g,n("li",null,[m,s(": The log displayed when the Terminal is initialized is an array of message objects "),e(t,{to:"/others.html#message"},{default:o(()=>[s("Message")]),_:1}),s(". If it is set to "),k,s(", it will not be displayed.")])]),f,n("ul",null,[b,y,n("li",null,[v,s(": Whether to enable the default "),x,s(" switch. If you need to customize the logic of these commands, you can turn this switch off. The functions of the default commands can also be implemented through the "),e(t,{to:"/api.html"},{default:o(()=>[s("API")]),_:1}),s(".")])]),w,e(i)])}const I=r(d,[["render",T],["__file","attributes.html.vue"]]),S=JSON.parse('{"path":"/attributes.html","title":"Attributes","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"name","slug":"name","link":"#name","children":[]},{"level":2,"title":"context","slug":"context","link":"#context","children":[]},{"level":2,"title":"context-suffix","slug":"context-suffix","link":"#context-suffix","children":[]},{"level":2,"title":"show-header","slug":"show-header","link":"#show-header","children":[]},{"level":2,"title":"title","slug":"title","link":"#title","children":[]},{"level":2,"title":"drag-conf","slug":"drag-conf","link":"#drag-conf","children":[]},{"level":2,"title":"init-log","slug":"init-log","link":"#init-log","children":[]},{"level":2,"title":"command-store","slug":"command-store","link":"#command-store","children":[]},{"level":2,"title":"log-size-limit","slug":"log-size-limit","link":"#log-size-limit","children":[]},{"level":2,"title":"enable-default-command","slug":"enable-default-command","link":"#enable-default-command","children":[]},{"level":2,"title":"line-space","slug":"line-space","link":"#line-space","children":[]},{"level":2,"title":"cursor-style","slug":"cursor-style","link":"#cursor-style","children":[]},{"level":2,"title":"enable-cursor-blink","slug":"enable-cursor-blink","link":"#enable-cursor-blink","children":[]},{"level":2,"title":"enable-fold","slug":"enable-fold","link":"#enable-fold","children":[]},{"level":2,"title":"enable-hover-stripe","slug":"enable-hover-stripe","link":"#enable-hover-stripe","children":[]},{"level":2,"title":"scroll-mode","slug":"scroll-mode","link":"#scroll-mode","children":[]},{"level":2,"title":"command-formatter","slug":"command-formatter","link":"#command-formatter","children":[]},{"level":2,"title":"enable-input-tips","slug":"enable-input-tips","link":"#enable-input-tips","children":[]},{"level":2,"title":"enable-help-box","slug":"enable-help-box","link":"#enable-help-box","children":[]},{"level":2,"title":"input-tips-select-handler","slug":"input-tips-select-handler","link":"#input-tips-select-handler","children":[]},{"level":2,"title":"input-tips-search-handler","slug":"input-tips-search-handler","link":"#input-tips-search-handler","children":[]},{"level":2,"title":"push-message-before","slug":"push-message-before","link":"#push-message-before","children":[]},{"level":2,"title":"command-sort-handler","slug":"command-sort-handler","link":"#command-sort-handler","children":[]},{"level":2,"title":"input-filter","slug":"input-filter","link":"#input-filter","children":[]}],"git":{"updatedTime":1720188474000,"contributors":[{"name":"tzfun","email":"beifengtz@qq.com","commits":6}]},"filePathRelative":"attributes.md"}');export{I as comp,S as data};
