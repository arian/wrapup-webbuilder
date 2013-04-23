"use strict";

var fs = require('fs');

var express = require('express');
var app = express();

app.use(express.bodyParser());

app.set('view engine', 'jade');
app.set('views', __dirname + '/views');

app.use(function(req, res, next){
	app.locals.path = app.path();
	next();
});

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

if (process.mainModule == module){
	app.listen(3000);
	console.log('app on http://localhost:3000');
} else {
	module.exports = app;
}

