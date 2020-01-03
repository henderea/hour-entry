require('./index.scss');
const $ = require('jquery');
// require('jquery-ui');
const _ = require('lodash');
// const rand = require('lodash/random');
const moment = require('moment');

import registerServiceWorker from '@henderea/static-site-builder/registerServiceWorker';
registerServiceWorker();

$(function() {
    let storedContent = window.localStorage.getItem('user-content');
    if(storedContent) {
        $('#editor').val(storedContent);
    }
    highlightSyntax();

    $('#editor').on('keyup keydown change', function() {
        correctTextareaHeight(this);
        highlightSyntax();
    });
});


/*------------------------------------------
	Resize textarea based on content  
------------------------------------------*/
function correctTextareaHeight(element) {
    var self = $(element),
        outerHeight = self.outerHeight(),
        innerHeight = self.prop('scrollHeight'),
        borderTop = parseFloat(self.css("borderTopWidth")),
        borderBottom = parseFloat(self.css("borderBottomWidth")),
        combinedScrollHeight = innerHeight + borderTop + borderBottom;

    if(outerHeight < combinedScrollHeight) {
        self.height(combinedScrollHeight);
    }
}

function formatTime(mins) {
    if(mins < 60) {
        return `${mins}m`;
    }
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

/*------------------------------------------
	Run syntax highlighter  
------------------------------------------*/
function highlightSyntax() {
    var me = $('#editor');
    var content = me.val();
    var codeHolder = $('#display');
    var escaped = escapeHtml(content);
    window.localStorage.setItem('user-content', content);

    var lines = _.split(escaped, /\n/g);
    let titleLine = -1;
    let currentTotal = 0;
    _.each(lines, (l, i) => {
        if(/^.*:\s*$/.test(l) && titleLine < 0) {
            titleLine = i;
        } else if(/^\s*$/.test(l)) {
            if(titleLine >= 0) {
                let tl = lines[titleLine];
                if(/\s+$/.test(tl)) {
                    tl = tl + formatTime(currentTotal);
                } else {
                    tl = tl + ' ' + formatTime(currentTotal);
                }
                lines[titleLine] = tl;
                titleLine = -1;
                currentTotal = 0;
            }
        } else {
            let p1 = /^.*:\s*(\d+(?:\.\d+)?|\.\d+)\s*(h|m)?\s*$/;
            let p2 = /^.*:\s*(\d+(?:\.\d+)?|\.\d+)\s*h\s*(\d+(?:\.\d+)?|\.\d+)\s*m?\s*$/;
            let mins;
            if(p1.test(l)) {
                let m = p1.exec(l);
                let v = parseFloat(m[1]);
                let u = m[2] || 'h';
                if(u == 'h') {
                    mins = v * 60;
                } else {
                    mins = v;
                }
            } else if(p2.test(l)) {
                let m = p2.exec(l);
                let hr = parseFloat(m[1]);
                let mn = parseFloat(m[2]);
                mins = hr * 60 + mn;
            }
            mins = Math.round(mins);
            if(!_.isNaN(mins)) {
                currentTotal += mins;
            }
        }
    });
    if(titleLine >= 0) {
        let tl = lines[titleLine];
        if(/\s+$/.test(tl)) {
            tl = tl + formatTime(currentTotal);
        } else {
            tl = tl + ' ' + formatTime(currentTotal);
        }
        lines[titleLine] = tl;
        titleLine = -1;
        currentTotal = 0;
    }
    lines = _.map(lines, l => l.replace(/([^:]+)(:\s*)/g, '<span class="hl hl-label">$1</span><span class="hl hl-colon">$2</span>').replace(/(\d+(?:\.\d+)?|\.\d+)([hm\s]+)(\s*(?:\d+(?:\.\d+)?|\.\d+)[hm\s]*)$/g, '<span class="hl hl-value">$1</span><span class="hl hl-unit">$2</span>$3').replace(/(\d+(?:\.\d+)?|\.\d+)([hm\s]+)?$/g, '<span class="hl hl-value">$1</span><span class="hl hl-unit">$2</span>'));
    codeHolder.html(_.join(lines, '\n'));
}


function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}