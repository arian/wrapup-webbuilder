"use strict";

var os = require('os');
var express = require('express');
var path = require('path');
var wrapupBuilder = require('./index');

var config = require('./package.json')._wrapupWebbuilderConfig;
config.tmpdir = path.join(os.tmpdir(), 'wrapup-webbuilder');
config.dir = path.join(__dirname, config.dir);
config.snippetsdir = path.join(__dirname, config.snippetsdir);

var builder = wrapupBuilder(config);

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

app.get('/', builder.index, renderIndex);
app.post('/', builder.result);

app.use(express['static'](__dirname + '/public'));

app.listen(3000);
console.log('app on http://localhost:3000');
