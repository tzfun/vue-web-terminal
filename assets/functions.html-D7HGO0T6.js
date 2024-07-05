import{_ as c}from"./dragging-DAOKY9U2.js";import{_ as i,r as l,o as u,c as r,d as s,e as n,a,w as p,b as e}from"./app-DQqPtVNh.js";const k={},d=e(`<h1 id="高级功能" tabindex="-1"><a class="header-anchor" href="#高级功能"><span>高级功能</span></a></h1><img src="https://shields.io/github/package-json/v/tzfun/vue-web-terminal/vue2" style="margin-right:8px;"><img src="https://shields.io/github/package-json/v/tzfun/vue-web-terminal/vue3" style="margin-right:8px;"><h2 id="拖拽功能" tabindex="-1"><a class="header-anchor" href="#拖拽功能"><span>拖拽功能</span></a></h2><p>插件提供了拖拽功能，开启后Terminal窗口将是一个 <code>fixed</code> 定位的容器，它的拖拽范围在整个浏览器窗口之内，同时还提供了窗口大小缩放和固定的功能，缩放触控区域在窗口的四个角上。</p><p>开启拖拽功能需要将 <a href="./attributes#show-header">show-header</a> 设置为<code>true</code>并配置 <a href="./attributes#drag-conf">drag-conf</a>， 你可以通过 <a href="./others#dragconfig">DragConfig</a> 的 <code>width</code> 和 <code>height</code> 来配置窗口初始化大小，可以通过 <code>init</code> 控制窗口初始化位置，下面是一个简单的示例。</p><div class="language-vue line-numbers-mode" data-highlighter="prismjs" data-ext="vue" data-title="vue"><pre class="language-vue"><code><span class="line"><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>terminal</span> <span class="token attr-name">name</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>my-terminal<span class="token punctuation">&quot;</span></span></span>
<span class="line">          <span class="token attr-name">show-header</span></span>
<span class="line">          <span class="token attr-name">:drag-conf</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>{width: 700, height: 500, init:{ x: 50, y: 50 }, pinned: false}<span class="token punctuation">&quot;</span></span><span class="token punctuation">&gt;</span></span></span>
<span class="line"><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>terminal</span><span class="token punctuation">&gt;</span></span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><a href="./others#dragconfig">DragConfig</a>的配置说明如下：</p><table><thead><tr><th>参数</th><th>说明</th><th>类型</th></tr></thead><tbody><tr><td>width</td><td>拖拽窗口宽度，可以是数字（单位px）也可以是百分比（相对于浏览器窗口）</td><td>number/string</td></tr><tr><td>height</td><td>拖拽窗口高度，同宽度</td><td>number/string</td></tr><tr><td>zIndex</td><td>窗口层级，此值可以修改并被terminal监听，可用于多窗口层级的控制，默认100</td><td>number</td></tr><tr><td>init</td><td>窗口初始化位置，如果不填则默认位置在浏览器窗口中央，其中x和y的单位为px</td><td><a href="./others#Position">Position</a></td></tr><tr><td>pinned</td><td>固定窗口，固定后将无法拖拽，当点击按钮修改此值时会在<code>on-click</code>事件中触发 pin</td><td>boolean</td></tr></tbody></table><p>除了鼠标控制之外你还可以调用 <a href="./api#dragging">dragging</a> API移动窗口位置</p><p><img src="`+c+'" alt="dragging.gif"></p><h2 id="实时回显" tabindex="-1"><a class="header-anchor" href="#实时回显"><span>实时回显</span></a></h2><p>Terminal默认的消息都是以追加的模式显示，当你只需要显示执行的过程，执行结束后这些内容不想存在于记录中的时候，实时回显是不错的选择。 例如<code>gradle</code>或<code>npm</code>下载依赖包时，下载进度条动画展示的过程。</p>',13),v=s("code",null,"success",-1),m=s("strong",null,"TerminalFlash",-1),b=e(`<p>通过<code>new TerminalFlash()</code>创建一个flash对象，传入success回调中，flash对象提供两个方法：</p><ul><li><code>flush(string)</code>: 更新当前显示的内容</li><li><code>finish()</code>: 结束执行</li></ul><div class="language-javascript line-numbers-mode" data-highlighter="prismjs" data-ext="js" data-title="js"><pre class="language-javascript"><code><span class="line"><span class="token keyword">import</span> <span class="token punctuation">{</span>TerminalFlash<span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">&#39;vue-web-terminal&#39;</span></span>
<span class="line"></span>
<span class="line"><span class="token keyword">const</span> <span class="token function-variable function">onExecCmd</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token parameter">key<span class="token punctuation">,</span> command<span class="token punctuation">,</span> success<span class="token punctuation">,</span> failed</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">let</span> flash <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">TerminalFlash</span><span class="token punctuation">(</span><span class="token punctuation">)</span></span>
<span class="line">    <span class="token function">success</span><span class="token punctuation">(</span>flash<span class="token punctuation">)</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">let</span> count <span class="token operator">=</span> <span class="token number">0</span></span>
<span class="line">    <span class="token keyword">let</span> flashInterval <span class="token operator">=</span> <span class="token function">setInterval</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span></span>
<span class="line">        flash<span class="token punctuation">.</span><span class="token function">flush</span><span class="token punctuation">(</span><span class="token template-string"><span class="token template-punctuation string">\`</span><span class="token string">This is flash content: </span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">\${</span>count<span class="token interpolation-punctuation punctuation">}</span></span><span class="token template-punctuation string">\`</span></span><span class="token punctuation">)</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">++</span>count <span class="token operator">&gt;=</span> <span class="token number">20</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token function">clearInterval</span><span class="token punctuation">(</span>flashInterval<span class="token punctuation">)</span></span>
<span class="line">            flash<span class="token punctuation">.</span><span class="token function">finish</span><span class="token punctuation">(</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span><span class="token punctuation">,</span> <span class="token number">200</span><span class="token punctuation">)</span></span>
<span class="line">    </span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="询问输入" tabindex="-1"><a class="header-anchor" href="#询问输入"><span>询问输入</span></a></h2><p>当需要向用户询问时，使用此功能可以获取到用户输入的内容，例如登录时需要用户输入用户名密码的场景。</p>`,5),g=s("code",null,"success",-1),h=s("strong",null,"TerminalAsk",-1),f=e(`<p>通过 <code>new TerminalAsk()</code> 创建一个ask对象，传入success回调中，ask对象提供两个方法：</p><ul><li><code>ask(options)</code>: 发起一个用户询问输入，options是一个对象，其属性解释如下： <ul><li><code>question</code>: string，询问的问题，或者可以理解为用户输入的前缀字串</li><li><code>callback</code>: function，用户键入回车时的回调，参数值为用户输入的内容</li><li><code>autoReview</code>: boolean，用户键入回车时是否自动追加当前的显示内容</li><li><code>isPassword</code>: boolean，是否是密码输入</li></ul></li><li><code>finish()</code>: 结束执行</li></ul><div class="language-javascript line-numbers-mode" data-highlighter="prismjs" data-ext="js" data-title="js"><pre class="language-javascript"><code><span class="line"><span class="token keyword">import</span> <span class="token punctuation">{</span>TerminalAsk<span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">&#39;vue-web-terminal&#39;</span></span>
<span class="line"></span>
<span class="line"><span class="token keyword">const</span> <span class="token function-variable function">onExecCmd</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token parameter">key<span class="token punctuation">,</span> command<span class="token punctuation">,</span> success<span class="token punctuation">,</span> failed</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">let</span> asker <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">TerminalAsk</span><span class="token punctuation">(</span><span class="token punctuation">)</span></span>
<span class="line">    <span class="token function">success</span><span class="token punctuation">(</span>asker<span class="token punctuation">)</span></span>
<span class="line"></span>
<span class="line">    asker<span class="token punctuation">.</span><span class="token function">ask</span><span class="token punctuation">(</span><span class="token punctuation">{</span></span>
<span class="line">        <span class="token literal-property property">question</span><span class="token operator">:</span> <span class="token string">&#39;Please input github username: &#39;</span><span class="token punctuation">,</span></span>
<span class="line">        <span class="token literal-property property">autoReview</span><span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span></span>
<span class="line">        <span class="token function-variable function">callback</span><span class="token operator">:</span> <span class="token parameter">value</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span></span>
<span class="line">            console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span>value<span class="token punctuation">)</span></span>
<span class="line">            asker<span class="token punctuation">.</span><span class="token function">ask</span><span class="token punctuation">(</span><span class="token punctuation">{</span></span>
<span class="line">                <span class="token literal-property property">question</span><span class="token operator">:</span> <span class="token string">&#39;Please input github password: &#39;</span><span class="token punctuation">,</span></span>
<span class="line">                <span class="token literal-property property">autoReview</span><span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span></span>
<span class="line">                <span class="token literal-property property">isPassword</span><span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span></span>
<span class="line">                <span class="token function-variable function">callback</span><span class="token operator">:</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span></span>
<span class="line">                    <span class="token comment">//    do something</span></span>
<span class="line">                    asker<span class="token punctuation">.</span><span class="token function">finish</span><span class="token punctuation">(</span><span class="token punctuation">)</span></span>
<span class="line">                <span class="token punctuation">}</span></span>
<span class="line">            <span class="token punctuation">}</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span><span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="文本编辑器" tabindex="-1"><a class="header-anchor" href="#文本编辑器"><span>文本编辑器</span></a></h2><h3 id="使用" tabindex="-1"><a class="header-anchor" href="#使用"><span>使用</span></a></h3>`,5),y=e(`<p>一个简单示例：</p><div class="language-javascript line-numbers-mode" data-highlighter="prismjs" data-ext="js" data-title="js"><pre class="language-javascript"><code><span class="line"><span class="token keyword">const</span> <span class="token function-variable function">onExecCmd</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token parameter">key<span class="token punctuation">,</span> command<span class="token punctuation">,</span> success<span class="token punctuation">,</span> failed</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span></span>
<span class="line">    TerminalApi<span class="token punctuation">.</span><span class="token function">textEditorOpen</span><span class="token punctuation">(</span><span class="token string">&#39;my-terminal&#39;</span><span class="token punctuation">,</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token literal-property property">content</span><span class="token operator">:</span> <span class="token string">&#39;Please edit this file&#39;</span><span class="token punctuation">,</span></span>
<span class="line">        <span class="token function-variable function">onClose</span><span class="token operator">:</span> <span class="token punctuation">(</span><span class="token parameter">value<span class="token punctuation">,</span> options</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span></span>
<span class="line">            console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token string">&quot;用户编辑完成，文本结果：&quot;</span><span class="token punctuation">,</span> value<span class="token punctuation">,</span> <span class="token string">&quot;options:&quot;</span><span class="token punctuation">,</span> options<span class="token punctuation">)</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span><span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token keyword">const</span> <span class="token function-variable function">closeEditor</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span></span>
<span class="line">    TerminalApi<span class="token punctuation">.</span><span class="token function">textEditorClose</span><span class="token punctuation">(</span><span class="token string">&#39;my-terminal&#39;</span><span class="token punctuation">,</span> <span class="token punctuation">{</span> <span class="token literal-property property">fromUser</span><span class="token operator">:</span> <span class="token boolean">false</span> <span class="token punctuation">}</span><span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="slot自定义样式" tabindex="-1"><a class="header-anchor" href="#slot自定义样式"><span>Slot自定义样式</span></a></h3>`,3),q=e(`<ul><li><code>value</code>: 编辑的文本内容，你需要在你实现的编辑器中用<code>v-model</code>绑定它</li><li><code>onFocus</code>: 获取焦点事件，你需要在你实现的编辑器中绑定<code>@focus</code>事件</li><li><code>onBlur</code>: 失去焦点事件，你需要在你实现的编辑器中绑定<code>@blur</code>事件</li></ul><h3 id="自定义快捷键" tabindex="-1"><a class="header-anchor" href="#自定义快捷键"><span>自定义快捷键</span></a></h3><p>插件提供了一个 <code>onKeydown</code> 事件，此事件是你控制 <strong>活跃状态</strong> 下Terminal快捷键最好的方法，这里以文本编辑器为例，设定用户按快捷键 <code>Ctrl + S</code> 就表示完成编辑并保存</p><div class="language-vue line-numbers-mode" data-highlighter="prismjs" data-ext="vue" data-title="vue"><pre class="language-vue"><code><span class="line"><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>template</span><span class="token punctuation">&gt;</span></span></span>
<span class="line">  <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>terminal</span> <span class="token attr-name">:name</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>name<span class="token punctuation">&quot;</span></span> <span class="token attr-name">@exec-cmd</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>onExecCmd<span class="token punctuation">&quot;</span></span> <span class="token attr-name">@on-keydown</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>onKeydown<span class="token punctuation">&quot;</span></span><span class="token punctuation">&gt;</span></span></span>
<span class="line">    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>template</span> <span class="token attr-name">#textEditor</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>{ data }<span class="token punctuation">&quot;</span></span><span class="token punctuation">&gt;</span></span></span>
<span class="line">      <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>textarea</span> <span class="token attr-name">name</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>editor<span class="token punctuation">&quot;</span></span></span>
<span class="line">                <span class="token attr-name">class</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>t-text-editor<span class="token punctuation">&quot;</span></span></span>
<span class="line">                <span class="token attr-name">v-model</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>data.value<span class="token punctuation">&quot;</span></span></span>
<span class="line">                <span class="token attr-name">@focus</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>data.onFocus<span class="token punctuation">&quot;</span></span></span>
<span class="line">                <span class="token attr-name">@blur</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>data.onBlur<span class="token punctuation">&quot;</span></span><span class="token punctuation">&gt;</span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>textarea</span><span class="token punctuation">&gt;</span></span></span>
<span class="line"></span>
<span class="line">      <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>div</span> <span class="token attr-name">class</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>t-text-editor-floor<span class="token punctuation">&quot;</span></span> <span class="token attr-name">align</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>center<span class="token punctuation">&quot;</span></span><span class="token punctuation">&gt;</span></span></span>
<span class="line">        <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>button</span> <span class="token attr-name">class</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>t-text-editor-floor-btn<span class="token punctuation">&quot;</span></span> <span class="token attr-name">@click</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>_textEditorClose(false)<span class="token punctuation">&quot;</span></span><span class="token punctuation">&gt;</span></span>Cancel<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>button</span><span class="token punctuation">&gt;</span></span></span>
<span class="line">        <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>button</span> <span class="token attr-name">class</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>t-text-editor-floor-btn<span class="token punctuation">&quot;</span></span> <span class="token attr-name">@click</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>_textEditorClose(true)<span class="token punctuation">&quot;</span></span><span class="token punctuation">&gt;</span></span>Save &amp; Close<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>button</span><span class="token punctuation">&gt;</span></span></span>
<span class="line">      <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>div</span><span class="token punctuation">&gt;</span></span></span>
<span class="line"></span>
<span class="line">    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>template</span><span class="token punctuation">&gt;</span></span></span>
<span class="line">  <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>terminal</span><span class="token punctuation">&gt;</span></span></span>
<span class="line"><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>template</span><span class="token punctuation">&gt;</span></span></span>
<span class="line"></span>
<span class="line"><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>script</span><span class="token punctuation">&gt;</span></span><span class="token script"><span class="token language-javascript"></span>
<span class="line"><span class="token keyword">import</span> <span class="token punctuation">{</span> TerminalApi <span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">&quot;vue-web-terminal&quot;</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token keyword">export</span> <span class="token keyword">default</span> <span class="token punctuation">{</span></span>
<span class="line">  <span class="token literal-property property">name</span><span class="token operator">:</span> <span class="token string">&quot;TerminalDemo&quot;</span><span class="token punctuation">,</span></span>
<span class="line">  <span class="token function">data</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">return</span> <span class="token punctuation">{</span></span>
<span class="line">      <span class="token literal-property property">name</span><span class="token operator">:</span> <span class="token string">&quot;my-terminal&quot;</span><span class="token punctuation">,</span></span>
<span class="line">      <span class="token literal-property property">enableTextEditor</span><span class="token operator">:</span> <span class="token boolean">false</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line">  <span class="token punctuation">}</span><span class="token punctuation">,</span></span>
<span class="line">  <span class="token literal-property property">method</span><span class="token operator">:</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token function">onExecCmd</span><span class="token punctuation">(</span><span class="token parameter">key<span class="token punctuation">,</span> command<span class="token punctuation">,</span> success<span class="token punctuation">,</span> failed<span class="token punctuation">,</span> name</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">      <span class="token keyword">if</span> <span class="token punctuation">(</span>key <span class="token operator">===</span> <span class="token string">&#39;edit&#39;</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        TerminalApi<span class="token punctuation">.</span><span class="token function">textEditorOpen</span><span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">.</span>name<span class="token punctuation">,</span> <span class="token punctuation">{</span></span>
<span class="line">          <span class="token literal-property property">content</span><span class="token operator">:</span> <span class="token string">&#39;Please edit this file&#39;</span><span class="token punctuation">,</span></span>
<span class="line">          <span class="token function-variable function">onClose</span><span class="token operator">:</span> <span class="token punctuation">(</span><span class="token parameter">value</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token keyword">this</span><span class="token punctuation">.</span>enableTextEditor <span class="token operator">=</span> <span class="token boolean">false</span></span>
<span class="line">            <span class="token function">success</span><span class="token punctuation">(</span><span class="token punctuation">{</span></span>
<span class="line">              <span class="token literal-property property">type</span><span class="token operator">:</span> <span class="token string">&quot;code&quot;</span><span class="token punctuation">,</span></span>
<span class="line">              <span class="token literal-property property">content</span><span class="token operator">:</span> value</span>
<span class="line">            <span class="token punctuation">}</span><span class="token punctuation">)</span></span>
<span class="line">          <span class="token punctuation">}</span></span>
<span class="line">        <span class="token punctuation">}</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token keyword">this</span><span class="token punctuation">.</span>enableTextEditor <span class="token operator">=</span> <span class="token boolean">true</span></span>
<span class="line">      <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span><span class="token punctuation">,</span></span>
<span class="line">    <span class="token function">onKeydown</span><span class="token punctuation">(</span><span class="token parameter">event</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">      <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">.</span>enableTextEditor <span class="token operator">&amp;&amp;</span> event<span class="token punctuation">.</span>key <span class="token operator">===</span> <span class="token string">&#39;s&#39;</span> <span class="token operator">&amp;&amp;</span> event<span class="token punctuation">.</span>ctrlKey<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token keyword">this</span><span class="token punctuation">.</span><span class="token function">_textEditorClose</span><span class="token punctuation">(</span><span class="token boolean">true</span><span class="token punctuation">)</span></span>
<span class="line">        event<span class="token punctuation">.</span><span class="token function">preventDefault</span><span class="token punctuation">(</span><span class="token punctuation">)</span></span>
<span class="line">      <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span><span class="token punctuation">,</span></span>
<span class="line">    <span class="token function">_textEditorClose</span><span class="token punctuation">(</span><span class="token parameter">option</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">      TerminalApi<span class="token punctuation">.</span><span class="token function">textEditorClose</span><span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">.</span>name<span class="token punctuation">,</span> option<span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line">  <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>script</span><span class="token punctuation">&gt;</span></span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,4);function x(w,_){const t=l("RouteLink"),o=l("CommentService");return u(),r("div",null,[d,s("p",null,[n("在 "),a(t,{to:"/zh/events.html#exec-cmd"},{default:p(()=>[n("exec-cmd")]),_:1}),n(" 事件回调中，"),v,n("回调函数支持传入实时回显的处理对象 "),m,n("。")]),b,s("p",null,[n("在 "),a(t,{to:"/zh/events.html#exec-cmd"},{default:p(()=>[n("exec-cmd")]),_:1}),n(" 事件回调中，"),g,n("回调函数支持传入用户输入的处理对象 "),h,n("。")]),f,s("p",null,[n("当你需要在 Terminal 内编辑文本时，可以考虑使用内置的文本编辑器，它需要借助到两个 API："),a(t,{to:"/zh/api.html#texteditoropen"},{default:p(()=>[n("textEditorOpen")]),_:1}),n("、"),a(t,{to:"/zh/api.html#texteditorclose"},{default:p(()=>[n("textEditorClose")]),_:1})]),y,s("p",null,[n("如果你对默认样式不太喜欢，可以使用 "),a(t,{to:"/zh/slots.html"},{default:p(()=>[n("Slot")]),_:1}),n(" 自定义编辑器的样式，比如改为 Codemirror或者VS Code等带有高亮功能的编辑器，其中 slot 的data有三个属性时你需要关心的：")]),q,a(o)])}const E=i(k,[["render",x],["__file","functions.html.vue"]]),j=JSON.parse('{"path":"/zh/functions.html","title":"高级功能","lang":"zh-CN","frontmatter":{},"headers":[{"level":2,"title":"拖拽功能","slug":"拖拽功能","link":"#拖拽功能","children":[]},{"level":2,"title":"实时回显","slug":"实时回显","link":"#实时回显","children":[]},{"level":2,"title":"询问输入","slug":"询问输入","link":"#询问输入","children":[]},{"level":2,"title":"文本编辑器","slug":"文本编辑器","link":"#文本编辑器","children":[{"level":3,"title":"使用","slug":"使用","link":"#使用","children":[]},{"level":3,"title":"Slot自定义样式","slug":"slot自定义样式","link":"#slot自定义样式","children":[]},{"level":3,"title":"自定义快捷键","slug":"自定义快捷键","link":"#自定义快捷键","children":[]}]}],"git":{"updatedTime":1718693968000,"contributors":[{"name":"tzfun","email":"beifengtz@qq.com","commits":4}]},"filePathRelative":"zh/functions.md"}');export{E as comp,j as data};
