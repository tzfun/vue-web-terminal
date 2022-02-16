import Hljs from 'highlight.js';
import 'highlight.js/styles/tomorrow-night.css';

let Highlight = {};
Highlight.install = function (Vue) {
    Vue.directive('highlight', {
        inserted: function (el) {
            let blocks = el.querySelectorAll('pre code');
            blocks.forEach(block => {
                let ul = document.createElement("ul");
                let rowCount = block.outerHTML.split('\n').length;
                for (let i = 1; i <= rowCount; i++) {
                    let li = document.createElement("li")
                    let text = document.createTextNode(i)
                    li.appendChild(text)
                    ul.appendChild(li)
                }
                ul.className = 'pre-numbering'
                block.parentNode.appendChild(ul)
                Hljs.highlightBlock(block)
            })
        },
        componentUpdated: function (el) {
            let blocks = el.querySelectorAll('pre code');
            for (let i = 0; i < blocks.length; i++) {
                Hljs.highlightBlock(blocks[i]);
            }
        }
    })
};

export default Highlight;