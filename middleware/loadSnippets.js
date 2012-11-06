"use stirct";

var fs    = require('fs');
var async = require('async');

// where we store the result in memory, simple caching.
var snippets;

// a static quick list of the filenames
var names = ['prime', 'elements', 'moofx', 'slick'];
var files = names.map(function(file){
	return __dirname + '/../views/snippets/' + file + '.js';
});

function loadSnippets(callback){
	async.map(files, fs.readFile, function(err, results){
		if (err) return callback(err);
		var result = {};
		results.forEach(function(buffer, i){
			result[names[i]] = buffer.toString();
		});
		callback(null, result);
	});
}

module.exports = function(req, res, next){
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
