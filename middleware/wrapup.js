"use strict";

var wrapup = require('wrapup');
var fs = require('fs');

module.exports = function(options){
	return function(req, res, next){
		if (req.method != 'GET' || req.url != '/main.js') return next();
		res.type('js');
		var wrup = wrapup();
		wrup.on('error', function(err){
			next(err);
		});
		wrup.options({output: options.dest});
		wrup.pipe(res);
		wrup.require(options.require);
		wrup.up();
	};
};
