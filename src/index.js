require('./index.scss');
const $ = require('jquery');
const { storage, correctTextareaHeight, processSyntax } = require('../lib/util');

import registerServiceWorker from '@henderea/static-site-builder/registerServiceWorker';
const nodeEnv = process.env.NODE_ENV;
if(nodeEnv != 'development') {
    registerServiceWorker();
}

$(function() {
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