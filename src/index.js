import './index.scss';
import $ from 'jquery';
import { storage, correctTextareaHeight, processSyntax, colors } from '../lib/util';

import registerServiceWorker from '@henderea/static-site-builder/registerServiceWorker';
const nodeEnv = process.env.NODE_ENV;
if(nodeEnv !== 'development') {
    registerServiceWorker();
}

$(function() {
    colors.updateColors();
    const $editor = $('#editor');
    storage.load($editor);
    correctTextareaHeight($editor);
    processSyntax('#editor', '#display');
    $editor.focus();

    $editor.on('keyup keydown change', function() {
        storage.save(this);
        correctTextareaHeight(this);
        processSyntax('#editor', '#display');
    });
});