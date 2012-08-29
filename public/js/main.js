
var $ = require('nodes');
var string = require('prime/es5/string');

var CodeMirror = window.CodeMirror;

$.ready(function(){

	var textarea = document.getElementById('editor');
	var value = string.trim(textarea.value);
	textarea.value = '';

	var editor = CodeMirror.fromTextArea(textarea, {
		mode: 'javascript',
		indentWithTabs: true,
		lineNumbers: true,
		matchBrackets: true,
		indentUnit: 4
	});

	editor.setValue(value);

	// indent lines correctly, might have some indention from the HTML
	var line, i = 0;
	while ((line = editor.getLine(i)) !== undefined){
		editor.indentLine(i++);
	}

});
