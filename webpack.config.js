const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
	mode: process.env.NODE_ENV || 'development',
	entry: {
		newTab: path.join(__dirname, 'src', 'pages', 'newTab', 'index.js'),
		popup: path.join(__dirname, 'src', 'pages', 'popup', 'index.js'),
		options: path.join(__dirname, 'src', 'pages', 'options', 'index.js'),
		background: path.join(__dirname, 'src', 'background.js'),
	},
	output: {
		filename: 'js/[name].js',
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
		...['newTab', 'popup', 'options'].map(name =>
			new HtmlWebpackPlugin({
				template: path.join(__dirname, 'src', 'pages', name, 'index.html'),
				filename: path.join(__dirname, 'dist', name + '.html'),
				chunks: [name],
			})
		),
		new CopyWebpackPlugin([
			'manifest.json',
			{from: 'assets', to: 'assets'}
		],{copyUnmodified: true})// 因为每次都会清理dist，所以要强制复制所有文件
	]
};