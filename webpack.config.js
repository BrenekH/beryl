const CopyWebpackPlugin = require("copy-webpack-plugin");
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
				app: "./src/app.ts"
			}
		},
		commonConfig
	),
	Object.assign(
		{
			target: "electron-renderer",
			entry: {
				renderer: "./src/renderer.ts"
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
				preload: "./src/preload.ts"
			}
		},
		commonConfig
	),
	{
		plugins: [
			new CopyWebpackPlugin({
				patterns: [
					{ from: "main.css" }
				]
			})
		],
		resolve: {
			extensions: [".css"],
		}
	}
];
