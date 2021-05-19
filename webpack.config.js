const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");

const commonConfig = {
	output: {
		path: path.resolve(__dirname, "dist"),
		filename: "[name].js",
		assetModuleFilename: '[name][ext]'
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				loader: "ts-loader"
			},
			{
				test: /\.css$/,
				type: "asset/resource"
			}
		]
	},
	resolve: {
		extensions: [".js", ".ts", ".tsx", ".jsx", ".json", ".css"],
		fallback: {
			"fs": false,
			"path": false
		}
	},
	devtool: "source-map"
};

module.exports = [
	Object.assign(
		{
			target: "electron-main",
			entry: {
				app: "./src/main/app.ts"
			}
		},
		commonConfig
	),
	Object.assign(
		{
			target: "electron-renderer",
			entry: {
				renderer: "./src/renderer/renderer.ts"
			},
			plugins: [
				new HtmlWebpackPlugin({
					template: "src/renderer/index.html"
				})
			]
		},
		commonConfig
	),
	Object.assign(
		{
			target: "electron-preload",
			entry: {
				preload: "./src/renderer/preload.ts"
			}
		},
		commonConfig
	)
];
