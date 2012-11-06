/*global snippets:true CodeMirror:true*/
"use strict";

var $ = require('elements');
require('elements/lib/traversal');
var e = require('elements-util/lib/event');
var string = require('prime/es5/string');

require('elements/lib/domready')(function(){

	var editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
		lineNumbers: true,
		matchBrackets: true,
		theme: 'monokai',
		indentWithTabs: true
	});

	$('.snippets a').on('click', function(event){
		e(event).preventDefault();
		var name = this.getAttribute('href').slice(1);
		var snippet = snippets[name];
		if (!snippet) return console.warn(name + ' does not exist');

		var pos = editor.getCursor();
		editor.replaceRange(snippet, pos);

	});

});
