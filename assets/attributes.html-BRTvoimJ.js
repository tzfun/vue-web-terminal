import{_ as i,r as l,o as p,c,d as n,e as s,a,w as o,b as e}from"./app-DQqPtVNh.js";const d={},u=e('<h1 id="插件属性" tabindex="-1"><a class="header-anchor" href="#插件属性"><span>插件属性</span></a></h1><img src="https://shields.io/github/package-json/v/tzfun/vue-web-terminal/vue2" style="margin-right:8px;"><img src="https://shields.io/github/package-json/v/tzfun/vue-web-terminal/vue3" style="margin-right:8px;"><p>本插件提供了丰富的属性，让它变得更加灵活。</p><h2 id="name" tabindex="-1"><a class="header-anchor" href="#name"><span>name</span></a></h2><ul><li><strong>类型</strong>：string</li><li><strong>默认值</strong>：terminal</li><li><strong>说明</strong>：Terminal实例名称，API中使用也需用到此属性</li></ul><div class="hint-container tip"><p class="hint-container-title">提示</p><p>同一个页面内支持创建多个 Terminal 实例，但它们的 name 属性必须互不相同，且全局唯一</p></div><h2 id="context" tabindex="-1"><a class="header-anchor" href="#context"><span>context</span></a></h2><ul><li><strong>类型</strong>：<code>string</code></li><li><strong>默认值</strong>：/vue-web-terminal</li><li><strong>说明</strong>：上下文内容，支持特殊字符</li></ul><h2 id="context-suffix" tabindex="-1"><a class="header-anchor" href="#context-suffix"><span>context-suffix</span></a></h2><ul><li><strong>类型</strong>：<code>string</code></li><li><strong>默认值</strong>： &gt;</li><li><strong>说明</strong>：上下文后缀符号，用于和用户输入隔开</li></ul><h2 id="show-header" tabindex="-1"><a class="header-anchor" href="#show-header"><span>show-header</span></a></h2><ul><li><strong>类型</strong>：<code>boolean</code></li><li><strong>默认值</strong>：true</li><li><strong>说明</strong>：是否显示窗口头部</li></ul><div class="hint-container tip"><p class="hint-container-title">提示</p><p>此开关会影响拖拽功能，只有显示头部才能使用默认提供的拖拽功能</p></div><h2 id="title" tabindex="-1"><a class="header-anchor" href="#title"><span>title</span></a></h2><ul><li><strong>类型</strong>：<code>string</code></li><li><strong>默认值</strong>：vue-web-terminal</li><li><strong>说明</strong>：窗口头部显示的标题，此属性需要 <a href="#show-header">show-header</a> 属性开启之后才会生效</li></ul><h2 id="drag-conf" tabindex="-1"><a class="header-anchor" href="#drag-conf"><span>drag-conf</span></a></h2><ul><li><strong>类型</strong>：<code>DragConfig</code></li><li><strong>默认值</strong>：null</li><li><strong>说明</strong>：拖拽窗口配置项 <a href="./others#dragconfig">DragConfig</a>。</li></ul><div class="hint-container tip"><p class="hint-container-title">提示</p><p>此项配置需要在 <a href="#show-header">show-header</a> 开启的情况下才有效。</p><p>如果不配置该属性，窗口宽高将会100%填充父元素，窗口宽高等同于父元素宽高</p></div><h2 id="init-log" tabindex="-1"><a class="header-anchor" href="#init-log"><span>init-log</span></a></h2>',20),h=n("li",null,[n("strong",null,"类型"),s("："),n("code",null,"Message[] | null")],-1),g=n("li",null,[n("strong",null,"默认值"),s("：null")],-1),m=n("strong",null,"说明",-1),k=n("code",null,"null",-1),b=e('<h2 id="command-store" tabindex="-1"><a class="header-anchor" href="#command-store"><span>command-store</span></a></h2><ul><li><strong>类型</strong>：<code>Command[]</code></li><li><strong>默认值</strong>：<a href="./others#%E5%86%85%E7%BD%AE%E5%91%BD%E4%BB%A4">内置命令</a></li><li><strong>说明</strong>：一个<a href="./others#command">Command</a>数组，自定义的命令库，搜索提示功能会扫描此库</li></ul><h2 id="log-size-limit" tabindex="-1"><a class="header-anchor" href="#log-size-limit"><span>log-size-limit</span></a></h2><ul><li><strong>类型</strong>：<code>number</code></li><li><strong>默认值</strong>：200</li><li><strong>说明</strong>：限制显示日志的最大条数</li></ul><h2 id="enable-default-command" tabindex="-1"><a class="header-anchor" href="#enable-default-command"><span>enable-default-command</span></a></h2>',5),f=n("li",null,[n("strong",null,"类型"),s("："),n("code",null,"boolean")],-1),v=n("li",null,[n("strong",null,"默认值"),s("：true")],-1),x=n("strong",null,"说明",-1),y=n("a",{href:"./others#%E5%86%85%E7%BD%AE%E5%91%BD%E4%BB%A4"},"内置命令",-1),_=e(`<h2 id="line-space" tabindex="-1"><a class="header-anchor" href="#line-space"><span>line-space</span></a></h2><ul><li><strong>类型</strong>：<code>number</code></li><li><strong>默认值</strong>：15</li><li><strong>说明</strong>：日志行间距，单位px</li></ul><h2 id="cursor-style" tabindex="-1"><a class="header-anchor" href="#cursor-style"><span>cursor-style</span></a></h2><ul><li><strong>类型</strong>：<code>string | TerminalCursorStyle</code></li><li><strong>默认值</strong>：block</li><li><strong>说明</strong>：光标样式，可选值：<code>block</code> | <code>underline</code> | <code>bar</code> | <code>none</code></li></ul><div class="language-typescript" data-highlighter="prismjs" data-ext="ts" data-title="ts"><pre class="language-typescript"><code><span class="line"><span class="token keyword">type</span> <span class="token class-name">TerminalCursorStyle</span> <span class="token operator">=</span> <span class="token string">&#39;block&#39;</span> <span class="token operator">|</span> <span class="token string">&#39;underline&#39;</span> <span class="token operator">|</span> <span class="token string">&#39;bar&#39;</span> <span class="token operator">|</span> <span class="token string">&#39;none&#39;</span></span>
<span class="line"></span></code></pre></div><h2 id="enable-cursor-blink" tabindex="-1"><a class="header-anchor" href="#enable-cursor-blink"><span>enable-cursor-blink</span></a></h2><ul><li><strong>类型</strong>：<code>boolean</code></li><li><strong>默认值</strong>：true</li><li><strong>说明</strong>：是否打开光标闪烁</li></ul><h2 id="enable-fold" tabindex="-1"><a class="header-anchor" href="#enable-fold"><span>enable-fold</span></a></h2><ul><li><strong>类型</strong>：<code>boolean</code></li><li><strong>默认值</strong>：true</li><li><strong>说明</strong>：是否打开日志折叠功能</li></ul><h2 id="enable-hover-stripe" tabindex="-1"><a class="header-anchor" href="#enable-hover-stripe"><span>enable-hover-stripe</span></a></h2><ul><li><strong>类型</strong>：<code>boolean</code></li><li><strong>默认值</strong>：false</li><li><strong>说明</strong>：同一组的日志在鼠标hover时是否高亮显示</li></ul><h2 id="scroll-mode" tabindex="-1"><a class="header-anchor" href="#scroll-mode"><span>scroll-mode</span></a></h2><ul><li><strong>类型</strong>：<code>string</code></li><li><strong>默认值</strong>：smooth</li><li><strong>说明</strong>：窗口滚动条模式，原生css属性值</li></ul><h2 id="command-formatter" tabindex="-1"><a class="header-anchor" href="#command-formatter"><span>command-formatter</span></a></h2><ul><li><strong>类型</strong>：<code>CommandFormatterFunc</code></li><li><strong>默认值</strong>：null</li><li><strong>说明</strong>：命令显示格式化函数，一般用于输入命令高亮显示，传入当前命令返回新的命令，支持html。如果不设置将使用内部定义的高亮样式</li></ul><div class="language-typescript" data-highlighter="prismjs" data-ext="ts" data-title="ts"><pre class="language-typescript"><code><span class="line"><span class="token keyword">type</span> <span class="token class-name">CommandFormatterFunc</span> <span class="token operator">=</span> <span class="token punctuation">(</span>cmd<span class="token operator">:</span> <span class="token builtin">string</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token builtin">string</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre></div><h2 id="enable-input-tips" tabindex="-1"><a class="header-anchor" href="#enable-input-tips"><span>enable-input-tips</span></a></h2><ul><li><strong>类型</strong>：<code>boolean</code></li><li><strong>默认值</strong>：true</li><li><strong>说明</strong>：是否打开命令输入提示功能</li></ul><h2 id="enable-help-box" tabindex="-1"><a class="header-anchor" href="#enable-help-box"><span>enable-help-box</span></a></h2><ul><li><strong>类型</strong>：<code>boolean</code></li><li><strong>默认值</strong>：true</li><li><strong>说明</strong>：是否打开窗口右上角命令样例提示面板</li></ul><h2 id="input-tips-select-handler" tabindex="-1"><a class="header-anchor" href="#input-tips-select-handler"><span>input-tips-select-handler</span></a></h2><ul><li><strong>类型</strong>：<code>InputTipsSelectHandlerFunc</code></li><li><strong>默认值</strong>：略</li><li><strong>说明</strong>：自定义用户选择某一个输出提示项时的逻辑处理函数</li></ul><div class="language-typescript" data-highlighter="prismjs" data-ext="ts" data-title="ts"><pre class="language-typescript"><code><span class="line"><span class="token doc-comment comment">/**</span>
<span class="line"> * 输入提示选择处理函数</span>
<span class="line"> *</span>
<span class="line"> * <span class="token keyword">@param</span> <span class="token parameter">command</span>       当前用户输入的完整命令行</span>
<span class="line"> * <span class="token keyword">@param</span> <span class="token parameter">cursorIndex</span>   当前光标所处位置</span>
<span class="line"> * <span class="token keyword">@param</span> <span class="token parameter">item</span>          用户选择提示项</span>
<span class="line"> * <span class="token keyword">@param</span> <span class="token parameter">callback</span>      填充结束后需调用此函数返回新的命令行</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">type</span> <span class="token class-name">InputTipsSelectHandlerFunc</span> <span class="token operator">=</span> <span class="token punctuation">(</span>command<span class="token operator">:</span> <span class="token builtin">string</span><span class="token punctuation">,</span> cursorIndex<span class="token operator">:</span> <span class="token builtin">number</span><span class="token punctuation">,</span> item<span class="token operator">:</span> InputTipItem<span class="token punctuation">,</span> <span class="token function-variable function">callback</span><span class="token operator">:</span> <span class="token punctuation">(</span>cmd<span class="token operator">:</span> <span class="token builtin">string</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token keyword">void</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token keyword">void</span></span>
<span class="line"></span></code></pre></div><h2 id="input-tips-search-handler" tabindex="-1"><a class="header-anchor" href="#input-tips-search-handler"><span>input-tips-search-handler</span></a></h2><ul><li><strong>类型</strong>：<code>InputTipsSearchHandlerFunc</code></li><li><strong>默认值</strong>：略</li><li><strong>说明</strong>：自定义用户输入时搜索提示内容的处理函数</li></ul><div class="language-typescript" data-highlighter="prismjs" data-ext="ts" data-title="ts"><pre class="language-typescript"><code><span class="line"><span class="token doc-comment comment">/**</span>
<span class="line"> * 用户自定义命令搜索提示实现</span>
<span class="line"> *</span>
<span class="line"> * <span class="token keyword">@param</span> <span class="token parameter">command</span>       当前用户输入的完整命令行</span>
<span class="line"> * <span class="token keyword">@param</span> <span class="token parameter">cursorIndex</span>   当前光标所处位置</span>
<span class="line"> * <span class="token keyword">@param</span> <span class="token parameter">commandStore</span>  命令集合</span>
<span class="line"> * <span class="token keyword">@param</span> <span class="token parameter">callback</span>      搜索结束回调，回调格式为一个数组</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">type</span> <span class="token class-name">InputTipsSearchHandlerFunc</span> <span class="token operator">=</span> <span class="token punctuation">(</span>command<span class="token operator">:</span> <span class="token builtin">string</span><span class="token punctuation">,</span> cursorIndex<span class="token operator">:</span> <span class="token builtin">number</span><span class="token punctuation">,</span> commandStore<span class="token operator">:</span> Command<span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">,</span> <span class="token function-variable function">callback</span><span class="token operator">:</span> <span class="token punctuation">(</span>tips<span class="token operator">:</span> InputTipItem<span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">,</span> openTips<span class="token operator">?</span><span class="token operator">:</span> <span class="token builtin">boolean</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token keyword">void</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token keyword">void</span></span>
<span class="line"></span></code></pre></div><h2 id="push-message-before" tabindex="-1"><a class="header-anchor" href="#push-message-before"><span>push-message-before</span></a></h2><ul><li><strong>类型</strong>：<code>PushMessageBeforeFunc</code></li><li><strong>默认值</strong>：null</li><li><strong>说明</strong>：在推送消息显示之前触发的钩子函数，在此函数中可以对message对象的属性进行修改</li></ul><div class="language-typescript" data-highlighter="prismjs" data-ext="ts" data-title="ts"><pre class="language-typescript"><code><span class="line"><span class="token keyword">type</span> <span class="token class-name">PushMessageBeforeFunc</span> <span class="token operator">=</span> <span class="token punctuation">(</span>message<span class="token operator">:</span> Message<span class="token punctuation">,</span> name<span class="token operator">:</span> String<span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token keyword">void</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre></div><h2 id="command-sort-handler" tabindex="-1"><a class="header-anchor" href="#command-sort-handler"><span>command-sort-handler</span></a></h2><ul><li><strong>类型</strong>：<code>CommandSortHandlerFunc</code></li><li><strong>默认值</strong>：null</li><li><strong>说明</strong>：命令行库排序，自定义命令库的显示排序规则</li></ul><div class="language-typescript" data-highlighter="prismjs" data-ext="ts" data-title="ts"><pre class="language-typescript"><code><span class="line"><span class="token keyword">type</span> <span class="token class-name">CommandSortHandlerFunc</span> <span class="token operator">=</span> <span class="token punctuation">(</span>a<span class="token operator">:</span> <span class="token builtin">any</span><span class="token punctuation">,</span> b<span class="token operator">:</span> <span class="token builtin">any</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token builtin">number</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre></div><h2 id="input-filter" tabindex="-1"><a class="header-anchor" href="#input-filter"><span>input-filter</span></a></h2><ul><li><strong>类型</strong>：<code>InputFilterFunc</code></li><li><strong>默认值</strong>：null</li><li><strong>说明</strong>：自定义输入过滤，返回值为过滤后的字符串，必须是纯文本，不能带html标签</li></ul><div class="language-typescript" data-highlighter="prismjs" data-ext="ts" data-title="ts"><pre class="language-typescript"><code><span class="line"><span class="token keyword">type</span> <span class="token class-name">InputFilterFunc</span> <span class="token operator">=</span> <span class="token punctuation">(</span>str1<span class="token operator">:</span> <span class="token builtin">string</span><span class="token punctuation">,</span> str2<span class="token operator">:</span> <span class="token builtin">string</span><span class="token punctuation">,</span> event<span class="token operator">:</span> InputEvent<span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token builtin">string</span> <span class="token operator">|</span> <span class="token keyword">null</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre></div>`,35);function w(I,C){const t=l("RouteLink"),r=l("CommentService");return p(),c("div",null,[u,n("ul",null,[h,g,n("li",null,[m,s("：Terminal初始化时显示的日志，是由消息对象 "),a(t,{to:"/zh/others.html#message"},{default:o(()=>[s("Message")]),_:1}),s(" 组成的数组，设为 "),k,s(" 则不显示")])]),b,n("ul",null,[f,v,n("li",null,[x,s("：是否生效默认"),y,s("，如果你需要自定义这些命令的逻辑，可以关闭此开关，默认命令的功能也可通过 "),a(t,{to:"/zh/api.html"},{default:o(()=>[s("API")]),_:1}),s(" 实现")])]),_,a(r)])}const z=i(d,[["render",w],["__file","attributes.html.vue"]]),S=JSON.parse('{"path":"/zh/attributes.html","title":"插件属性","lang":"zh-CN","frontmatter":{},"headers":[{"level":2,"title":"name","slug":"name","link":"#name","children":[]},{"level":2,"title":"context","slug":"context","link":"#context","children":[]},{"level":2,"title":"context-suffix","slug":"context-suffix","link":"#context-suffix","children":[]},{"level":2,"title":"show-header","slug":"show-header","link":"#show-header","children":[]},{"level":2,"title":"title","slug":"title","link":"#title","children":[]},{"level":2,"title":"drag-conf","slug":"drag-conf","link":"#drag-conf","children":[]},{"level":2,"title":"init-log","slug":"init-log","link":"#init-log","children":[]},{"level":2,"title":"command-store","slug":"command-store","link":"#command-store","children":[]},{"level":2,"title":"log-size-limit","slug":"log-size-limit","link":"#log-size-limit","children":[]},{"level":2,"title":"enable-default-command","slug":"enable-default-command","link":"#enable-default-command","children":[]},{"level":2,"title":"line-space","slug":"line-space","link":"#line-space","children":[]},{"level":2,"title":"cursor-style","slug":"cursor-style","link":"#cursor-style","children":[]},{"level":2,"title":"enable-cursor-blink","slug":"enable-cursor-blink","link":"#enable-cursor-blink","children":[]},{"level":2,"title":"enable-fold","slug":"enable-fold","link":"#enable-fold","children":[]},{"level":2,"title":"enable-hover-stripe","slug":"enable-hover-stripe","link":"#enable-hover-stripe","children":[]},{"level":2,"title":"scroll-mode","slug":"scroll-mode","link":"#scroll-mode","children":[]},{"level":2,"title":"command-formatter","slug":"command-formatter","link":"#command-formatter","children":[]},{"level":2,"title":"enable-input-tips","slug":"enable-input-tips","link":"#enable-input-tips","children":[]},{"level":2,"title":"enable-help-box","slug":"enable-help-box","link":"#enable-help-box","children":[]},{"level":2,"title":"input-tips-select-handler","slug":"input-tips-select-handler","link":"#input-tips-select-handler","children":[]},{"level":2,"title":"input-tips-search-handler","slug":"input-tips-search-handler","link":"#input-tips-search-handler","children":[]},{"level":2,"title":"push-message-before","slug":"push-message-before","link":"#push-message-before","children":[]},{"level":2,"title":"command-sort-handler","slug":"command-sort-handler","link":"#command-sort-handler","children":[]},{"level":2,"title":"input-filter","slug":"input-filter","link":"#input-filter","children":[]}],"git":{"updatedTime":1720188474000,"contributors":[{"name":"tzfun","email":"beifengtz@qq.com","commits":7}]},"filePathRelative":"zh/attributes.md"}');export{z as comp,S as data};
