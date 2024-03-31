import './index.scss';
import $ from 'jquery';
import { storage, correctTextareaHeight, processSyntax, colors } from '../lib/util';

// @ts-ignore
import registerServiceWorker from '@henderea/static-site-builder/registerServiceWorker';
const nodeEnv = process.env.NODE_ENV;
if(nodeEnv !== 'development') {
  registerServiceWorker();
}

$(function() {
  colors.updateColors();
  const $editor: JQuery = $('#editor');
  storage.load($editor);
  correctTextareaHeight($editor);
  processSyntax('#editor', '#display');
  ($editor.get(0) as HTMLTextAreaElement).focus();

  $editor.on('keyup keydown change', function() {
    storage.save(this);
    correctTextareaHeight(this);
    processSyntax('#editor', '#display');
  });
});
