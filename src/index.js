require('./index.scss');
const $ = require('jquery');
const { storage, correctTextareaHeight, processSyntax } = require('../lib/util');

import registerServiceWorker from '@henderea/static-site-builder/registerServiceWorker';
const nodeEnv = process.env.NODE_ENV;
if(nodeEnv != 'development') {
    registerServiceWorker();
}

$(function() {
    storage.load('#editor');
    processSyntax('#editor', '#display');

    $('#editor').on('keyup keydown change', function() {
        storage.save('#editor');
        correctTextareaHeight(this);
        processSyntax('#editor', '#display');
    });
});