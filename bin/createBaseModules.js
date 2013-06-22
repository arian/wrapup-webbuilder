#!/usr/bin/env node
"use strict";

var fs    = require('fs-extra');
var path  = require('path');
var async = require('async');
var prime = require('prime');
var spawn = require('child_process').spawn;

function pkgNotExists(pkg, callback){
	fs.exists(pkg.dir, function(exists){
		callback(!exists);
	});
}

function npmInstall(dir, callback){
	spawn('npm', ['install'], {
		cwd: dir,
		stdio: 'inherit'
	}).on('close', callback);
}

function install(pkg, callback){
	async.series([
		async.apply(fs.mkdirs, pkg.dir),
		async.apply(fs.writeFile, pkg.dir + '/README.md', '# ' + pkg.name + '@' + pkg.version),
		async.apply(fs.writeFile, pkg.dir + '/package.json', pkg.json),
		async.apply(npmInstall, pkg.dir)
	], callback);
}

function installAll(pkgs, callback){
	async.map(pkgs, install, callback);
}

function pkgsToInstall(pkgs, callback){
	async.filter(pkgs, pkgNotExists, callback.bind(null, null));
}

var installAllNonExisting = async.compose(installAll, pkgsToInstall);


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

var pkgs = [];

prime.each(modules, function(versions, name){

	versions.forEach(function(version, callback){
		var pkg = name + '@' + version;
		var json = {
			name: name,
			version: version,
			description: pkg,
			dependencies: {},
			repository: {}
		};
		json.dependencies[name] = version;

		pkgs.push({
			name: name,
			version: version,
			pkg: pkg,
			dir: dir + '/' + pkg,
			json: JSON.stringify(json, null, 2)
		});

	});

});

installAllNonExisting(pkgs, function(err, installed){
	if (err) throw err;
	if (installed.length){
		installed.forEach(function(res){
			console.log('installed "' + res[0] + '"');
		});
	} else {
		console.log("didn't need to install any modules");
	}
});
