
var fs = require('fs');
var wrapup = require('wrapup');
var async = require('async');

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
	app.use(require('./lib/wrapupMiddleware.js')({
		require: __dirname + '/public/js/main.js',
		dest: __dirname + '/public/main.js'
	}));

	// pretty print our HTML
	app.locals.pretty = true;

});

app.get('/', function(req, res, next){
	res.render('index');
});

var UID = new Date();

app.post('/', function(req, res, next){

	var js = req.body.setup;
	var compress = !!req.body.compress;

	var uid = (UID++).toString(36);
	var dir = __dirname + '/tmp/' + uid;
	var file = dir + '/main.js';

	async.series([
		async.apply(fs.mkdir, dir),
		async.apply(fs.writeFile, file, js),
		function(callback){
			var wrup = wrapup();
			wrup.require(file);

			var out = wrup.up({
				compress: compress
			});

			res.type('js');
			res.attachment('main.js');
			res.send(out);

			callback();
		},
		async.apply(fs.unlink, file),
		async.apply(fs.rmdir, dir)
	], function(err){
		if (err) next(err);
	});

});

app.use(express['static'](__dirname + '/public'));

app.listen(3000);
console.log('app on http://localhost:3000');
