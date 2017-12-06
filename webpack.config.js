const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    devtool: 'source-map',
    entry: ['./index.ts'],
    output: {
        filename: "./index.min.js",
        libraryTarget:"commonjs2"
    },
    resolve: {
       extensions: ['.ts', '.js']
    },
    module: {
        rules: [{
          test: /\.ts$/,
          use: 'ts-loader'
        }]
    },
    plugins: [
      new UglifyJSPlugin({minimize: true, sourceMap: true })
    ]
};
