const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

/////////////////////////////入口处理///////////////////////////////////////
// chrome 扩展四件套
let entries = ['newTab', 'popup', 'options', 'background'];

let entry = {}, 
		htmlWebpackPlugins = entries.map(name => {
			// js
			entry[name] = path.join(__dirname, 'src', 'pages', name, 'index.js');
			// html
			return new HtmlWebpackPlugin({
				template: path.join(__dirname, 'src', 'pages', name, 'index.html'),
				filename: path.join(__dirname, 'dist', name + '.html'),
				chunks: [name],
			})
		});
//////////////////////////////////////////////////////////////////////////

module.exports = {
	mode: process.env.NODE_ENV || 'development',
	entry,
	output: {
		filename: 'js/[name].[chunkhash].js',
		path: path.resolve(__dirname, 'dist')
	},
	module: {
		rules: [
			{
				test: /\.css$/,
				use: ["style-loader", "css-loader"]
			},
			{
				test: /\.(js|jsx)$/,
				exclude: /(node_modules|bower_components)/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['@babel/preset-env', "@babel/preset-react"]
					}
				}
			}
		]
	},
	devtool: 'inline-source-map',
	devServer: {
		contentBase: path.resolve(__dirname, 'dist')
	},
	plugins: [
		new CleanWebpackPlugin(),
		...htmlWebpackPlugins,
		new HtmlWebpackPlugin({
			template: path.join(__dirname, 'src', 'index.html'),
			chunks: null
		})
	]
};