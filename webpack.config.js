const path = require("path");

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
