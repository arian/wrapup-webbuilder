"use strict";

var fs    = require('fs');
var async = require('async');

// where we store the result in memory, simple caching.
var snippets;

// a static quick list of the filenames
var modules = require('../package.json')._modules;
var names = Object.keys(modules);

function loadSnippets(callback){

	async.map(names, function(name, callback){

		async.map(modules[name], function(version, callback){
			var file = __dirname + '/../views/snippets/' + name + '-' + version + '.js';
			fs.readFile(file, 'utf-8', function(err, data){
				callback(null, err ? null : data);
			});
		}, function(err, res){
			var versions = {}, last;
			modules[name].forEach(function(version, i){
				if (res[i]){
					versions[version] = res[i];
					last = version;
				} else {
					versions[version] = {use: last};
				}
			});
			callback(null, versions);
		});

	}, function(err, results){
		var result = {};
		names.forEach(function(name, i){
			result[name] = results[i];
		});
		callback(err, result);
	});

}

module.exports = function(req, res, next){

	res.locals.modules = modules;

	if (snippets){
		res.locals.snippets = snippets;
		next();
		return;
	}

	loadSnippets(function(err, snip){
		if (err) return next(err);
		snippets = snip;
		res.locals.snippets = snip;
		next();
	});

};
