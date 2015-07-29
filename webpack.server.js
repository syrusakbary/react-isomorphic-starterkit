var make_config = require("./make-webpack-config");

var config = make_config(true, process.env.NODE_ENV !== "production");
config.externals = {
	'hapi': true,
	'url': true,
	'react': true,
	'react-router': true,
	'react-transmit': true,
	'isomorphic-fetch': true,
	'react-inline-css': true
};

module.exports = config;