
var $ = require('nodes');
$.use(require('slick'));
var string = require('prime/es5/string');

var CodeMirror = window.CodeMirror;

$.ready(function(){

	var snippets = {};

	var onChange = function(editor, change){
		// probably a remove action
		if (change.text.join() === '') for (var name in snippets){
			var snippet = snippets[name],
				mark = snippet.mark;
			if (!mark) continue;
			var pos = mark.find(),
				mf = pos.from, mt = pos.to,
				cf = change.from, ct = change.to;
			if (cf.line <= mf.line && cf.ch <= mf.ch && ct.line >= mt.line && ct.ch >= mt.ch){
				snippet.checkbox.checked(false);
				delete snippets[name];
			}
		}
	};

	var textarea = document.getElementById('editor');
	var value = string.trim(textarea.value);
	textarea.value = '';

	var editor = CodeMirror.fromTextArea(textarea, {
		mode: 'javascript',
		indentWithTabs: true,
		lineNumbers: true,
		matchBrackets: true,
		indentUnit: 4,
		theme: 'monokai',
		onChange: onChange
	});

	// TODO global editor variable for debugging
	window.editor = editor;

	editor.setValue(value);

	// indent lines correctly, might have some indention from the HTML
	var lines = editor.lineCount();
	for (var i = 0; i < lines; i++) editor.indentLine(i);

	$('input.package').handle(function(){

		var name = this.getAttribute('name');
		var snippet = $('#' + name + '-snippet')[0].innerHTML;
		snippet = "\n" + string.trim(snippet) + "\n";
		var lines = snippet.split("\n").length - 1;

		var mark;

		var object = snippets[name] = {
			name: name,
			snippet: snippet,
			mark: mark,
			lines: lines,
			checkbox: this
		};

		this.on('change', function(){

			var checked = this.checked();
			var pos;

			if (checked && !mark){
				pos = editor.getCursor();
				editor.replaceRange(snippet, pos);
				var to = {line: pos.line + lines, ch: 0};
				object.mark = mark = editor.markText(pos, to);
				for (var i = pos.line; i < to.line; i++) editor.indentLine(i);
			} else if (!checked && mark){
				pos = mark.find();
				editor.replaceRange('', pos.from, pos.to);
				mark = object.mark = null;
			}

		});
	});

});
