"use stirct";

var wrapup = require('wrapup');
var fs = require('fs');

module.exports = function(options){
	return function(req, res, next){
		if (req.method != 'GET' || req.url != '/main.js') return next();
		var wrup = wrapup();
		wrup.log();
		wrup.require(options.require);
		var js = wrup.up();
		fs.writeFileSync(options.dest, js);
		res.type('js');
		res.send(js);
	};
};

