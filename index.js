"use strict";

var fs = require('fs');
var wrapup = require('wrapup');

var express = require('express');
var app = express();

app.use(express.bodyParser());

app.set('view engine', 'jade');

app.configure('development', function(){

	// stylus middleware
	var stylus = require('stylus');
	app.use(stylus.middleware({
		src: __dirname + '/views/styl/',
		dest: __dirname + '/public/'
	}));

	// wrapup middleware
	app.use(require('./middleware/wrapup.js')({
		require: __dirname + '/views/js/main.js',
		dest: __dirname + '/public/main.js'
	}));

	// pretty print our HTML
	app.locals.pretty = true;

});

var renderIndex   = require('./middleware/renderIndex');
var loadSnippets  = require('./middleware/loadSnippets');
var buildJSResult = require('./middleware/buildJSResult');

app.get('/', loadSnippets, renderIndex);
app.post('/', buildJSResult);

app.use(express['static'](__dirname + '/public'));

app.listen(3000);
console.log('app on http://localhost:3000');
