const $ = require('jquery');
const _split = require('lodash/split');
const _join = require('lodash/join');
const { processLines } = require('./lineProcessing');
const { highlightSyntax } = require('./syntaxHighlighting');

export const storage = {
    load(editor) {
        const $editor = $(editor);
        let storedContent = window.localStorage.getItem('user-content');
        if(storedContent) {
            $editor.val(storedContent);
        }
    },
    save(editor) {
        const $editor = $(editor);
        const currentContent = $editor.val();
        window.localStorage.setItem('user-content', currentContent);
    }
};

/*------------------------------------------
	Resize textarea based on content  
------------------------------------------*/
export function correctTextareaHeight(element) {
    const $this = $(element);
    const outerHeight = $this.outerHeight();
    const innerHeight = $this.prop('scrollHeight');
    const borderTop = parseFloat($this.css("borderTopWidth"));
    const borderBottom = parseFloat($this.css("borderBottomWidth"));
    const combinedScrollHeight = innerHeight + borderTop + borderBottom;

    if(outerHeight < combinedScrollHeight) {
        $this.height(combinedScrollHeight);
    }
}

export function processSyntax(editor, codeHolder) {
    var $editor = $(editor);
    var content = $editor.val();
    var $codeHolder = $(codeHolder);
    var escaped = escapeHtml(content);

    var lines = _split(escaped, /\n/g);
    lines = processLines(lines);
    lines = highlightSyntax(lines);
    $codeHolder.html(_join(lines, '\n'));
}


function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}