#!/usr/bin/env node
"use strict";

var fs    = require('fs');
var path  = require('path');
var async = require('async');
var prime = require('prime');
var exec  = require('child_process').exec;

var modules, config, dir;
try {
	config = require(process.cwd() + '/package.json')._wrapupWebbuilderConfig;
	modules = config.modules;
	dir = path.join(process.cwd(), config.dir);
} catch (e){
	console.error('Could not read package.json with correct' +
		'"_wrapupWebbuilderConfig" configuration');
	process.exit(1);
}

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
			dependencies: {},
			repository: {}
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
				var stdout = results[3][0];
				var stderr = results[3][1];
				if (stdout) console.log(stdout);
				if (stderr) console.error(stderr);
			}
		});
	});

});
