/*global snippets:true CodeMirror:true*/
"use strict";

var editor = require('./editor');

require('elements/domready')(function(){
	editor({theme: 'monokai'});
});
