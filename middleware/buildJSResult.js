"use strict";

var fs     = require('fs-extra');
var async  = require('async');
var wrapup = require('wrapup');
var prime  = require('prime');
var path   = require('path');
var exec   = require('child_process').exec;

var modules = require('../package.json')._modules;

var readme = "The wrupped.js is the file you should use, for example\n" +
	"include it in your HTML page with:\n\n" +
	'    <script src="wrupped.js"></script>\n\n' +
	"Building the output again afther changing the main.js is possible.\n" +
	"This is done with a tool called 'wrapup'.\n" +
	"To install wrapup, enter:\n\n" +
	"    npm install wrapup -g\n\n" +
	"To build your file again, enter:\n\n" +
	"    wrup --require ./main.js --output wrupped.js\n\n" +
	"Or for minified:\n\n" +
	"    wrup --require ./main.js --output wrupped.js --compress\n\n";

var UID = new Date();

// function which uses wrapup to download a wrup'd file
function wrup(req, res, next){

	var js = req.body.setup;
	var compress = !!req.body.compress;
	var zip = !!req.body.zip;

	var uid = (UID++).toString(36);
	if (UID > 1e6) UID = 0; // time to start over
	var dir = __dirname + '/../tmp/' + uid;

	var json = {
		name: "my-package",
		description: "package description",
		version: "0.0.1",
		dependencies: {}
	};

	var versions = json.dependencies;
	var cp = {};
	var names = [];

	prime.each(modules, function(vers, name){
		names.push(name);
		var version = versions[name] = req.body['version-' + name] || vers[vers.length - 1];
		var from = __dirname + '/../modules/' + name + '@' + version + '/node_modules/' + name;
		var to   = dir + '/node_modules/' + name;
		cp[name] = {from: path.normalize(from), to: path.normalize(to)};
	});

	json = JSON.stringify(json, null, 2);

	// wrapup output
	var out;

	async.series([
		// create all files
		async.apply(fs.mkdir, dir),
		async.apply(async.parallel, [
			async.apply(fs.mkdir, dir + '/node_modules'),
			async.apply(fs.writeFile, dir + '/main.js', js),
			async.apply(fs.writeFile, dir + '/package.json', json),
			async.apply(fs.writeFile, dir + '/README.md', readme)
		]),
		async.apply(async.forEach, names, function(name, callback){
			var copy = cp[name];
			fs.copy(copy.from, copy.to, callback);
		}),
		async.apply(exec, "npm dedupe", {cwd: dir}),
		function(callback){

			var wrup = wrapup();
			wrup.require(dir + '/main.js');

			wrup.options({
				compress: compress,
				output: zip ? (dir + '/wrupped.js') : undefined
			});

			wrup.up(function(err, o){
				out = o;
				callback(err);
			});
		},
		zip ? function(callback){
			// create zip file from this folder.
			var proc = exec('zip -r output.zip *', {
				cwd: dir
			}, function(err, stdout, stderr){
				if (err) return callback(err);
				res.download(path.normalize(dir + '/output.zip'));
				callback();
			});
		} : function(callback){
			// just download the packaged JS file.
			res.type('js');
			res.attachment('wrupped.js');
			res.send(out);
			callback();
		},
		async.apply(fs.remove, dir)
	], function(err){
		if (err) next(err);
	});
}

// just download the code from the editor
function editor(req, res, next){
	res.type('js');
	res.attachment('main.js');
	res.send(req.body.setup);
}

module.exports = function buildJSResult(req, res, next){
	if (req.body.setup == null) throw new Error("Editor field is not set");
	if (req.body.wrup) wrup(req, res, next);
	else if (req.body.editor) editor(req, res, next);
	else throw new Error("Either the wrup or editor fields must be non-empty");
};
