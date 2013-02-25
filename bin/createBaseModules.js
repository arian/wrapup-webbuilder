#!/usr/bin/env node
"use strict";

var fs    = require('fs');
var async = require('async');
var prime = require('prime');
var exec  = require('child_process').exec;

var dir = __dirname + '/../modules';

var modules = require('../package.json')._modules;

function mkdirIfNotExists(path, callback){
	fs.mkdir(path, function(err){
		if (err && err.code != 'EEXIST') callback(err);
		else callback();
	});
}

prime.each(modules, function(versions, name){

	async.forEach(versions, function(version, callback){
		var pkg = name + '@' + version;
		var pkgDir = dir + '/' + pkg;
		var json = {
			name: name,
			version: version,
			description: pkg,
			dependencies: {}
		};
		json.dependencies[name] = version;
		json = JSON.stringify(json, null, 2);

		async.series([
			async.apply(mkdirIfNotExists, pkgDir),
			async.apply(fs.writeFile, pkgDir + '/README.md', '# ' + name + '@' + version),
			async.apply(fs.writeFile, pkgDir + '/package.json', json),
			async.apply(exec, 'npm install', {
				cwd: pkgDir
			})
		], function(err, results){
			if (err) throw err;
			else {
				console.log("All modules were created with the correct versions");
				console.log(results[3][0]);
				console.log(results[3][1]);
			}
		});
	});

});
