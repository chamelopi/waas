const path = require("path");
const ShellPlugin = require("webpack-shell-plugin-next");

module.exports = {
    entry: "./src/index.js",
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.glsl|\.png|\.glb|\.json/,
                type: 'asset/resource',
            }
        ],
    },
    resolve: {
        alias: {
            three: path.resolve('./node_modules/three')
        },
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist/'),
    },
    experiments: {
        topLevelAwait: true,
    },
    // Rebuild asset list automatically
    plugins: [
        new ShellPlugin({
            onBuildStart: {
                scripts: ['node build-asset-list.js'],
                blocking: true,
                parallel: false,
            }
        })
    ],

    // DEV mode
    devtool: "eval-source-map",
    mode: "development",
    devServer: {
        static: {
            directory: path.join(__dirname, "dist/"),
        },
        hot: true,
    },
}