"use strict";

var fs     = require('fs');
var async  = require('async');
var wrapup = require('wrapup');
var prime  = require('prime');
var path   = require('path');
var exec   = require('child_process').exec;

var modules = require('../package.json').modules;

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
	var dir = __dirname + '/../tmp/' + uid;

	var json = {
		name: "my-package",
		description: "package description",
		version: "0.0.1",
		dependencies: {}
	};

	var versions = json.dependencies;
	var links = {};
	var names = [];

	prime.each(modules, function(vers, name){
		names.push(name);
		var version = versions[name] = req.body['version-' + name] || vers[vers.length - 1];
		var from = __dirname + '/../modules/' + name + '@' + version + '/node_modules/' + name;
		var to   = dir + '/node_modules/' + name;
		links[name] = {from: path.normalize(from), to: path.normalize(to)};
	});

	json = JSON.stringify(json, null, 2);

	async.series([
		// create all files
		async.apply(fs.mkdir, dir),
		async.apply(async.parallel, [
			async.apply(fs.mkdir, dir + '/node_modules'),
			async.apply(fs.writeFile, dir + '/main.js', js),
			async.apply(fs.writeFile, dir + '/package.json', json),
			async.apply(fs.writeFile, dir + '/README.md', readme)
		]),
		// create symlinks to the ../modules packages.
		// Perhaps instead of linking, it could copy the packages and apply
		// an dedupe operation: https://npmjs.org/doc/dedupe.html
		// to remove duplicate packages from the zip download.
		// Duplicate packages don't affect the wrupped output though, so
		// it would only be to reduce he zip download.
		async.apply(async.forEach, names, function(name, callback){
			var link = links[name];
			fs.symlink(link.from, link.to, callback);
		}),
		function(callback){

			var wrup = wrapup();
			wrup.require(dir + '/main.js');

			var out = wrup.up({
				compress: compress,
				output: dir + '/wrupped.js'
			});

			if (zip){
				// create zip file from this folder.
				var proc = exec('zip -r output.zip *', {
					cwd: dir
				}, function(err, stdout, stderr){
					if (err) return callback(err);
					res.download(path.normalize(dir + '/output.zip'));
					callback();
				});
			} else {
				// just download the packaged JS file.
				res.type('js');
				res.attachment('wrupped.js');
				res.send(out);
				callback();
			}

		},
		// remove all files and links again.
		async.apply(async.forEach, names, function(name, callback){
			fs.unlink(links[name].to, callback);
		}),
		async.apply(async.parallel, (function(){
			var actions = [
				async.apply(fs.unlink, dir + '/main.js'),
				async.apply(fs.unlink, dir + '/wrupped.js'),
				async.apply(fs.unlink, dir + '/package.json'),
				async.apply(fs.unlink, dir + '/README.md'),
				async.apply(fs.rmdir, dir + '/node_modules')
			];
			if (zip) actions.push(async.apply(fs.unlink, dir + '/output.zip'));
			return actions;
		})()),
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
}

module.exports = function buildJSResult(req, res, next){
	if (req.body.setup == null) throw new Error("Editor field is not set");
	if (req.body.wrup) wrup(req, res, next);
	else if (req.body.editor) editor(req, res, next);
	else throw new Error("Either the wrup or editor fields must be non-empty");
};
