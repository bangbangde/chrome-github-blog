const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// 入口处理
let entries = ['newTab', 'popup', 'options', 'background'];
let entry = {}, htmlWebpackPlugins = entries.map(name => {
	entry[name] = path.join(__dirname, 'src', 'pages', name, 'index.js');
	return new HtmlWebpackPlugin({
		template: path.join(__dirname, 'src', 'pages', name, 'index.html'),
		filename: path.join(__dirname, 'dist', name + '.html'),
		chunks: [name],
	})
});

module.exports = {
	mode: process.env.NODE_ENV || 'development',
	entry,
	output: {
		filename: '[name].bundle.js',
		path: path.resolve(__dirname, 'dist', 'js')
	},
	plugins: [
		new CleanWebpackPlugin(),
		...htmlWebpackPlugins
	]
};
