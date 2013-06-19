/*global snippets, CodeMirror */
"use strict";

var $ = require('elements');
require('elements/traversal');
require('elements/attributes');
var e = require('elements-util/lib/event');
var string = require('prime/es5/string');

module.exports = function(config){

	if (!config) config = {};

	// editor with options
	var editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
		lineNumbers: true,
		matchBrackets: true,
		theme: config.theme || 'monokai',
		indentWithTabs: true
	});

	// simple editor features we need
	function append(text){
		var pos = editor.getCursor();
		editor.replaceRange(text, pos);
	}

	function set(text){
		editor.setValue(text);
	}

	var versions = $('.snippets select');
	var injectSnippets = $('.snippets a');

	injectSnippets.forEach(function(inject, index){
		// appending new snippets to the editor
		$(inject).on('click', function(event){
			e(event).preventDefault();
			var name = this[0].getAttribute('href').slice(1);
			var version = $(versions[index]).value();
			var snippet = snippets[name][version];
			if (typeof snippet == 'object'){
				snippet = snippets[name][snippet.use];
			}
			if (!snippet) console.warn(name + ' does not exist');
			else append(snippet);
		});
	});

	// load from the file input
	(function(file){
		if (!file || !file[0]) return;

		// FileReader not supported, hide the input field
		if (typeof FileReader == 'undefined'){
			file.parent('.load').addClass('hidden');
		}

		// when reading the file is ready
		var reader = new FileReader();
		reader.onload = function(event){
			set(event.target.result);
		};

		// after a file was chosen
		file.on('change', function(){
			reader.readAsText(file[0].files[0]);
		});

	})($('.load input'));

};
