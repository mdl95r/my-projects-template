module.exports = {
	mode: 'production',
	entry: {
		main: './src/js/main.js',
	},
	output: {
		filename: '[name].js',
	},
	module: {
		rules: [
			{
				test: /\.js?$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: [['@babel/preset-env', { targets: 'defaults' }]],
					},
				},
			},
		],
	},
};
