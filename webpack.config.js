const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");

const commonConfig = {
	output: {
		path: path.resolve(__dirname, "dist"),
		filename: "[name].js"
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				loader: "ts-loader"
			},
			{
				test: /\.css$/,
				loader: "css-loader"
			}
		]
	},
	resolve: {
		extensions: [".js", ".ts", ".tsx", ".jsx", ".json"],
		fallback: {
			"fs": false,
			"path": false
		}
	}
};

module.exports = [
	Object.assign(
		{
			target: "electron-main",
			entry: {
				app: path.resolve(__dirname, "src", "app.ts")
			}
		},
		commonConfig
	),
	Object.assign(
		{
			target: "electron-renderer",
			entry: {
				renderer: path.resolve(__dirname, "src", "renderer.ts")
			},
			plugins: [
				new HtmlWebpackPlugin({
					template: "src/index.html"
				})
			]
		},
		commonConfig
	),
	Object.assign(
		{
			target: "electron-preload",
			entry: {
				preload: path.resolve(__dirname, "src", "preload.ts")
			}
		},
		commonConfig
	)
];
