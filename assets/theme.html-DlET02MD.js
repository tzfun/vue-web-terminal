import{_ as s,a}from"./light-CTB9w0Bq.js";import{_ as t,r as e,o as p,c as o,a as c,b as l}from"./app-DQqPtVNh.js";const i={},u=l(`<h1 id="theme" tabindex="-1"><a class="header-anchor" href="#theme"><span>Theme</span></a></h1><img src="https://shields.io/github/package-json/v/tzfun/vue-web-terminal/vue2" style="margin-right:8px;"><img src="https://shields.io/github/package-json/v/tzfun/vue-web-terminal/vue3" style="margin-right:8px;"><p>Starting from <code>2.1.13</code> and <code>3.2.0</code> versions, the plugin has two built-in themes: <code>dark</code> and <code>light</code>, and extracts some css variables to provide the ability to customize the theme.</p><div class="hint-container warning"><p class="hint-container-title">Warning</p><p>Before <code>2.1.13</code> and <code>3.2.0</code> versions, the theme function is not supported, and there is no need to introduce the corresponding css files.</p></div><h2 id="dark-theme" tabindex="-1"><a class="header-anchor" href="#dark-theme"><span>Dark Theme</span></a></h2><p>The dark theme is the default theme of the plugin, which is more in line with the usage habits of most users. To use it, just introduce the corresponding css style at the entrance of <code>main.js</code>.</p><div class="language-javascript" data-highlighter="prismjs" data-ext="js" data-title="main.js"><pre class="language-javascript"><code><span class="line"><span class="token keyword">import</span> <span class="token string">&#39;vue-web-terminal/lib/theme/dark.css&#39;</span></span>
<span class="line"></span></code></pre></div><p>Example: <img src="`+s+`" alt="dark"></p><h2 id="light-theme" tabindex="-1"><a class="header-anchor" href="#light-theme"><span>Light Theme</span></a></h2><p>The plugin has a built-in light theme. To use it, just import the light css style.</p><div class="language-javascript" data-highlighter="prismjs" data-ext="js" data-title="main.js"><pre class="language-javascript"><code><span class="line"><span class="token keyword">import</span> <span class="token string">&#39;vue-web-terminal/lib/theme/light.css&#39;</span></span>
<span class="line"></span></code></pre></div><p>Example: <img src="`+a+`" alt="dark"></p><h2 id="customize-theme" tabindex="-1"><a class="header-anchor" href="#customize-theme"><span>Customize Theme</span></a></h2><p>The plugin implements themes by modifying the colors of different elements or modules. These colors are specified through css variables, so you only need to define the corresponding css variables. The following is the color definition of the dark theme.</p><div class="language-css line-numbers-mode" data-highlighter="prismjs" data-ext="css" data-title="css"><pre class="language-css"><code><span class="line"><span class="token selector">:root</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token property">--t-main-background-color</span><span class="token punctuation">:</span> #191b24<span class="token punctuation">;</span></span>
<span class="line">    <span class="token property">--t-main-font-color</span><span class="token punctuation">:</span> #fff<span class="token punctuation">;</span></span>
<span class="line">    <span class="token property">--t-window-box-shadow</span><span class="token punctuation">:</span> 0 0 40px 1px <span class="token function">rgb</span><span class="token punctuation">(</span>0 0 0 / 20%<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token property">--t-header-background-color</span><span class="token punctuation">:</span> #959598<span class="token punctuation">;</span></span>
<span class="line">    <span class="token property">--t-header-font-color</span><span class="token punctuation">:</span> white<span class="token punctuation">;</span></span>
<span class="line">    <span class="token property">--t-tag-font-color</span><span class="token punctuation">:</span> #fff<span class="token punctuation">;</span></span>
<span class="line">    <span class="token property">--t-cursor-color</span><span class="token punctuation">:</span> #fff<span class="token punctuation">;</span></span>
<span class="line">    <span class="token property">--t-cmd-key-color</span><span class="token punctuation">:</span> yellow<span class="token punctuation">;</span></span>
<span class="line">    <span class="token property">--t-cmd-arg-color</span><span class="token punctuation">:</span> #c0c0ff<span class="token punctuation">;</span></span>
<span class="line">    <span class="token property">--t-cmd-splitter-color</span><span class="token punctuation">:</span> #808085<span class="token punctuation">;</span></span>
<span class="line">    <span class="token property">--t-link-color</span><span class="token punctuation">:</span> antiquewhite<span class="token punctuation">;</span></span>
<span class="line">    <span class="token property">--t-link-hover-color</span><span class="token punctuation">:</span> white<span class="token punctuation">;</span></span>
<span class="line">    <span class="token property">--t-table-border</span><span class="token punctuation">:</span> 1px dashed #fff<span class="token punctuation">;</span></span>
<span class="line">    <span class="token property">--t-selection-font-color</span><span class="token punctuation">:</span> black<span class="token punctuation">;</span></span>
<span class="line">    <span class="token property">--t-selection-background-color</span><span class="token punctuation">:</span> white<span class="token punctuation">;</span></span>
<span class="line">    <span class="token property">--t-code-inline-font-color</span><span class="token punctuation">:</span> #00b10e<span class="token punctuation">;</span></span>
<span class="line">    <span class="token property">--t-cmd-help-background-color</span><span class="token punctuation">:</span> black<span class="token punctuation">;</span></span>
<span class="line">    <span class="token property">--t-cmd-help-code-background-color</span><span class="token punctuation">:</span> <span class="token function">rgba</span><span class="token punctuation">(</span>0<span class="token punctuation">,</span> 0<span class="token punctuation">,</span> 0<span class="token punctuation">,</span> 0<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token property">--t-cmd-help-box-shadow</span><span class="token punctuation">:</span> 0px 0px 0px 4px <span class="token function">rgb</span><span class="token punctuation">(</span>255 255 255 / 20%<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token property">--t-text-editor-floor-background-color</span><span class="token punctuation">:</span> <span class="token function">rgb</span><span class="token punctuation">(</span>72 69 69<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token property">--t-text-editor-floor-close-btn-color</span><span class="token punctuation">:</span> #bba9a9<span class="token punctuation">;</span></span>
<span class="line">    <span class="token property">--t-text-editor-floor-save-btn-color</span><span class="token punctuation">:</span> #00b10e<span class="token punctuation">;</span></span>
<span class="line">    <span class="token property">--t-text-editor-floor-btn-hover-color</span><span class="token punctuation">:</span> #befcff<span class="token punctuation">;</span></span>
<span class="line">    <span class="token property">--t-json-background-color</span><span class="token punctuation">:</span> <span class="token function">rgba</span><span class="token punctuation">(</span>0<span class="token punctuation">,</span> 0<span class="token punctuation">,</span> 0<span class="token punctuation">,</span> 0<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token property">--t-json-value-obj-color</span><span class="token punctuation">:</span> #bdadad<span class="token punctuation">;</span></span>
<span class="line">    <span class="token property">--t-json-value-bool-color</span><span class="token punctuation">:</span> #cdc83c<span class="token punctuation">;</span></span>
<span class="line">    <span class="token property">--t-json-value-number-color</span><span class="token punctuation">:</span> #f3c7fb<span class="token punctuation">;</span></span>
<span class="line">    <span class="token property">--t-json-ellipsis-background-color</span><span class="token punctuation">:</span> #674848<span class="token punctuation">;</span></span>
<span class="line">    <span class="token property">--t-json-more-background-webkit</span><span class="token punctuation">:</span> <span class="token function">-webkit-linear-gradient</span><span class="token punctuation">(</span>top<span class="token punctuation">,</span> <span class="token function">rgba</span><span class="token punctuation">(</span>0<span class="token punctuation">,</span> 0<span class="token punctuation">,</span> 0<span class="token punctuation">,</span> 0<span class="token punctuation">)</span> 20%<span class="token punctuation">,</span> <span class="token function">rgb</span><span class="token punctuation">(</span>255 255 255 / 10%<span class="token punctuation">)</span> 100%<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token property">--t-json-more-background</span><span class="token punctuation">:</span> <span class="token function">linear-gradient</span><span class="token punctuation">(</span>to bottom<span class="token punctuation">,</span> <span class="token function">rgba</span><span class="token punctuation">(</span>0<span class="token punctuation">,</span> 0<span class="token punctuation">,</span> 0<span class="token punctuation">,</span> 0<span class="token punctuation">)</span> 20%<span class="token punctuation">,</span> <span class="token function">rgb</span><span class="token punctuation">(</span>255 255 255 / 10%<span class="token punctuation">)</span> 100%<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token property">--t-json-deep-selector-border-color</span><span class="token punctuation">:</span> <span class="token function">rgb</span><span class="token punctuation">(</span>249 249 249 / 52%<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token property">--t-code-default-background-color</span><span class="token punctuation">:</span> <span class="token function">rgb</span><span class="token punctuation">(</span>39 50 58<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token property">--t-log-box-hover-script-background-color</span><span class="token punctuation">:</span> #2a2c34<span class="token punctuation">;</span></span>
<span class="line">    <span class="token property">--t-log-box-folded-background-color</span><span class="token punctuation">:</span> #042f36<span class="token punctuation">;</span></span>
<span class="line">    <span class="token property">--t-log-box-folded-hover-background-color</span><span class="token punctuation">:</span> #515157<span class="token punctuation">;</span></span>
<span class="line">    <span class="token property">--t-log-fold-icon-color</span><span class="token punctuation">:</span> #4ca5c1<span class="token punctuation">;</span></span>
<span class="line">    <span class="token property">--t-log-fold-icon-background-color</span><span class="token punctuation">:</span> #191b24<span class="token punctuation">;</span></span>
<span class="line">    <span class="token property">--t-log-fold-icon-border-color</span><span class="token punctuation">:</span> #4ca5c1<span class="token punctuation">;</span></span>
<span class="line">    <span class="token property">--t-log-fold-icon-active-color</span><span class="token punctuation">:</span> #191b24<span class="token punctuation">;</span></span>
<span class="line">    <span class="token property">--t-log-fold-icon-active-background-color</span><span class="token punctuation">:</span> #4ca5c1<span class="token punctuation">;</span></span>
<span class="line">    <span class="token property">--t-log-fold-line-color</span><span class="token punctuation">:</span> #4ca5c1<span class="token punctuation">;</span></span>
<span class="line">    <span class="token property">--t-cmd-tips-background-color</span><span class="token punctuation">:</span> #544a4a<span class="token punctuation">;</span></span>
<span class="line">    <span class="token property">--t-cmd-tips-font-color</span><span class="token punctuation">:</span> #fff<span class="token punctuation">;</span></span>
<span class="line">    <span class="token property">--t-cmd-tips-active-background-color</span><span class="token punctuation">:</span> #5c6ec9<span class="token punctuation">;</span></span>
<span class="line">    <span class="token property">--t-cmd-tips-content-font-color</span><span class="token punctuation">:</span> #fff<span class="token punctuation">;</span></span>
<span class="line">    <span class="token property">--t-cmd-tips-des-font-color</span><span class="token punctuation">:</span> #cbb0b0<span class="token punctuation">;</span></span>
<span class="line">    <span class="token property">--t-cmd-tips-footer-font-color</span><span class="token punctuation">:</span> #e3c2c2<span class="token punctuation">;</span></span>
<span class="line">    <span class="token property">--t-cmd-tips-footer-background-color</span><span class="token punctuation">:</span> #546456<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>If you need to implement your own theme style, you don&#39;t need to import any of the above css files. Create a new css file in your project, such as <code>terminal-custom-theme.css</code>, and then rewrite the above css variables in this file, and finally import it in the project.</p><div class="language-javascript" data-highlighter="prismjs" data-ext="js" data-title="main.js"><pre class="language-javascript"><code><span class="line"><span class="token keyword">import</span> <span class="token string">&#39;~/your-style-dir/terminal-custom-theme.css&#39;</span></span>
<span class="line"></span></code></pre></div><h2 id="welcome-to-co-create-the-theme" tabindex="-1"><a class="header-anchor" href="#welcome-to-co-create-the-theme"><span>Welcome to co-create the theme</span></a></h2><p>The default themes provided by the plugin are relatively general and may not suit your preferences. If you have a better theme design and are willing to share it, you are welcome to share your theme design with the author or submit a <a href="https://github.com/tzfun/vue-web-terminal/pulls" target="_blank" rel="noopener noreferrer">Pull Request</a>. Your design is likely to be selected as the default theme of the plugin and used by many developers~</p>`,20);function r(d,k){const n=e("CommentService");return p(),o("div",null,[u,c(n)])}const v=t(i,[["render",r],["__file","theme.html.vue"]]),b=JSON.parse('{"path":"/theme.html","title":"Theme","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"Dark Theme","slug":"dark-theme","link":"#dark-theme","children":[]},{"level":2,"title":"Light Theme","slug":"light-theme","link":"#light-theme","children":[]},{"level":2,"title":"Customize Theme","slug":"customize-theme","link":"#customize-theme","children":[]},{"level":2,"title":"Welcome to co-create the theme","slug":"welcome-to-co-create-the-theme","link":"#welcome-to-co-create-the-theme","children":[]}],"git":{"updatedTime":1720188474000,"contributors":[{"name":"tzfun","email":"beifengtz@qq.com","commits":4}]},"filePathRelative":"theme.md"}');export{v as comp,b as data};
