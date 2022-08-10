const webpack = require("webpack");

const path = require("path");

module.exports = {
    mode: "development",
    entry: {
        EpjS: "./src/index.ts",
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "[name].js",
        library: {
            name: "Epjs",
            type: "umd",
            export: "default",
        },
    },
    devtool: "eval-source-map",
    target: "node",
    externals: {
        "babel-types": "babel-types",
    },
    resolveLoader: {
        modules: ["node_modules"],
        extensions: [".ts", ".js"],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    plugins: [],
};
