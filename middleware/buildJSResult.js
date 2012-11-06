"use strict";

var fs     = require('fs');
var async  = require('async');
var wrapup = require('wrapup');

var UID = new Date();

// function which uses wrapup to download a wrup'd file
function wrup(req, res, next){

	var js = req.body.setup;
	var compress = !!req.body.compress;

	var uid = (UID++).toString(36);
	var dir = __dirname + '/../tmp/' + uid;
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
			res.attachment('wrupped.js');
			res.send(out);

			callback();
		},
		async.apply(fs.unlink, file),
		async.apply(fs.rmdir, dir)
	], function(err){
		if (err) next(err);
	});
}

// just download the code from the editor
function editor(req, res, next){
	res.type('js');
	res.attachment('main.js');
	res.send(req.body.setup);
	next();
}

module.exports =  function buildJSResult(req, res, next){
	if (req.body.setup == null) throw new Error("Editor field is not set");
	if (req.body.wrup) wrup(req, res, next);
	else if (req.body.editor) editor(req, res, next);
	else throw new Error("Either the wrup or editor fields must be non-empty");
};
