var webpack = require("webpack");
var path = require("path");

var ExtractTextPlugin = require("extract-text-webpack-plugin");
var nib = require("nib");
var jeet = require("jeet");

module.exports = function (isServer, isDev) {
	var plugins = isServer?[]:[
		new webpack.DefinePlugin({__CLIENT__: !isServer, __SERVER__: isServer}),
		new webpack.DefinePlugin({"process.env": {NODE_ENV: isDev?'"production"':'"development"'}}),
		(!isDev?new webpack.optimize.DedupePlugin():null),
		(!isDev?new webpack.optimize.OccurenceOrderPlugin():null),
		(!isDev?new webpack.optimize.UglifyJsPlugin():null),
		(isDev?new webpack.HotModuleReplacementPlugin():null),
		(isDev?new webpack.NoErrorsPlugin():null),
	];
	plugins = plugins.filter(function(plugin){return !!plugin;});
	// console.log(plugins);
	var separateStylesheet = true || !isDev;


	var cssLoader = "css-loader?localIdentName=[path][name]---[local]---[hash:base64:5]";
	var babelLoader = "babel-loader?stage=0&optional=runtime&plugins=typecheck";
	var jsLoaders = isDev?["react-hot", babelLoader]:[babelLoader];

	var processStyle = function(loaders) { return loaders.join('!') };

	if (separateStylesheet) {
		if (!isServer) {
			plugins.push(new ExtractTextPlugin("[name].css?[contenthash]"));
		}
		processStyle = function(loaders) {
			var joined_loaders = loaders.join('!');
			if (!isServer) {
				return ExtractTextPlugin.extract('style-loader', joined_loaders);
			}
			joined_loaders = joined_loaders.replace(/^css-loader/, "css-loader/locals");
			return joined_loaders;
		};
	}

	return {
		target:  "web",
		cache:   false,
		context: __dirname,
		devtool: false,
		entry:   [isServer?"./src/views/Routes":"./src/client"],
		output:  {
			path:          path.join(__dirname, isServer?"src/compiled":"static/dist"),
			filename:      isServer?"routes.js":"client.js",
			chunkFilename: "[name].[id].js",
			publicPath:    "dist/",
			libraryTarget: isServer?"commonjs":"var"
		},
		target: isServer?"node":"web",
		plugins: plugins,
		module:  {
			loaders: [
				{include: /\.json$/, loaders: ["json-loader"]},
				{include: /\.js$/, loaders: jsLoaders, exclude: /node_modules/},

				{include: /\.ttf|eot$/, loaders: ["file-loader"]},
				{include: /\.woff|woff2$/, loaders: ["url-loader?limit=100000"]},

				/* Images */
				{include: /\.png|jpg|jpeg|gif$/, loaders: ["url-loader?limit=10000"]},
				{include: /\.svg$/, loaders: ["raw-loader?limit=10000", "svgo-loader"]},

				/* Styles */
				{include: /\.css$/, loader: processStyle([cssLoader])},
				{include: /\.styl$/, loader: processStyle([cssLoader, "stylus-loader?paths=node_modules/stylus-loader/"])},

			]
		},
		stylus: {
			use: [nib(), jeet()],
			define: {
				'production': !isDev
			}
		},
		resolve: {
			modulesDirectories: [
				"src",
				"node_modules",
				"web_modules"
			],
			extensions: ["", ".json", ".js"]
		},
		node:    {
			__dirname: true,
			fs:        'empty'
		}
	};
};
