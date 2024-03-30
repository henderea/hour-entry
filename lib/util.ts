import $ from 'jquery';
import { processLines } from './lineProcessing';
import { highlightSyntax, updateColors } from './syntaxHighlighting';

export const storage = {
  load(editor: JQueryable) {
    const $editor: JQuery = $(editor);
    const storedContent: string | null = window.localStorage.getItem('user-content');
    if(storedContent) {
      $editor.val(storedContent);
    }
  },
  save(editor: JQueryable) {
    const $editor: JQuery = $(editor);
    const currentContent: string = $editor.val() as string;
    window.localStorage.setItem('user-content', currentContent);
  }
};

class Colors {
  private _colors: Dictionary<string | null> = {};

  get colors(): Dictionary<string | null> { return this._colors; }
  updateColors(): void { this._colors = updateColors(); }
}

export const colors: Colors = new Colors();

/*------------------------------------------
	Resize textarea based on content
------------------------------------------*/
export function correctTextareaHeight(element: JQueryable): void {
  const $this: JQuery = $(element);
  const outerHeight: number = $this.outerHeight() as number;
  const innerHeight: number = $this.prop('scrollHeight') as number;
  const borderTop: number = parseFloat($this.css('borderTopWidth'));
  const borderBottom: number = parseFloat($this.css('borderBottomWidth'));
  const combinedScrollHeight: number = innerHeight + borderTop + borderBottom;

  if(outerHeight < combinedScrollHeight) {
    $this.height(combinedScrollHeight);
  }
}

export function processSyntax(editor: JQueryable, codeHolder: JQueryable) {
  const $editor: JQuery = $(editor);
  const content: string = $editor.val() as string;
  const $codeHolder: JQuery = $(codeHolder);
  const escaped: string = escapeHtml(content);

  let lines: string[] = escaped.split(/\n/g);
  lines = processLines(lines);
  lines = highlightSyntax(lines, colors.colors);
  $codeHolder.html(lines.join('\n'));
}


function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
