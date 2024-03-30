import $ from 'jquery';
import { processLines } from './lineProcessing';
import { highlightSyntax, updateColors } from './syntaxHighlighting';

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

class Colors {
    constructor() {
        this._colors = {};
    }

    get colors() { return this._colors; }
    updateColors() { this._colors = updateColors(); }
}

export const colors = new Colors();

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
    const $editor = $(editor);
    const content = $editor.val();
    const $codeHolder = $(codeHolder);
    const escaped = escapeHtml(content);

    let lines = escaped.split(/\n/g);
    lines = processLines(lines);
    lines = highlightSyntax(lines, colors.colors);
    $codeHolder.html(lines.join('\n'));
}


function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}