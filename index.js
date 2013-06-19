"use strict";

var loadSnippets  = require('./middleware/loadSnippets');
var buildJSResult = require('./middleware/buildJSResult');

var wrapupBuilder = function(config){

	if (!config.modules) throw new Error("config should contain the 'modules' property");
	if (!config.tmpdir) throw new Error("config should contain a 'tmpdir' property");
	if (!config.dir) throw new Error("config should contain a 'dir' property");
	if (!config.snippetsdir) throw new Error("config should contain a 'snippetsdir' property");

	return {
		index: loadSnippets(config),
		result: buildJSResult(config)
	};

};

module.exports = wrapupBuilder;
