
var $ = require('nodes');
$.use(require('slick'));
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
	var lines = editor.lineCount();
	for (var i = 0; i < lines; i++) editor.indentLine(i);

	$('input.package').handle(function(){

		var name = this.getAttribute('name');
		var snippet = $('#' + name + '-snippet')[0].innerHTML;
		snippet = string.trim(snippet);

		var mark;

		this.on('change', function(){

			var checked = this.checked();

			if (checked && !mark){
				var lines = editor.lineCount();
				editor.replaceRange("\n" + snippet, {line: lines});
				var from = lines, to = editor.lineCount();
				mark = editor.markText({line: from, ch: 0}, {line: to});
				for (var i = from; i < to; i++) editor.indentLine(i);
			} else if (!checked && mark){
				var pos = mark.find();
				editor.replaceRange('', pos.from, pos.to);
				mark = null;
			}

		});
	});

});
