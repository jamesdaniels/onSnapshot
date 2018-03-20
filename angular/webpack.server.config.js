// Work around for https://github.com/angular/angular-cli/issues/7200

const path = require('path');
const webpack = require('webpack');
const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

module.exports = {
  entry: {
    // This is our Express server for Dynamic universal
    server: './server.ts',
    firebase: './firebase.ts'
  },
  target: 'node',
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    mainFiles: ['index.node', 'index']
  },
  // Make sure we include all node_modules etc
  externals: [/(node_modules|main\..*\.js)/,],
  output: {
    // Puts the output at the root of the dist folder
    path: path.join(__dirname, 'dist'),
    library: 'app',
    libraryTarget: 'umd',
    filename: '[name].js'
  },
  module: {
    rules: [
      { test: /\.tsx?$/, loader: 'ts-loader' }
    ]
  },
  plugins: [
    new UglifyJsPlugin({
      uglifyOptions: {
        ecma: 6,
        compress: false,
        mangle: false
      }
    }),
    new webpack.ContextReplacementPlugin(
      // fixes WARNING Critical dependency: the request of a dependency is an expression
      /(.+)?angular(\\|\/)core(.+)?/,
      path.join(__dirname, 'src'), // location of your src
      {} // a map of your routes
    ),
    new webpack.ContextReplacementPlugin(
      // fixes WARNING Critical dependency: the request of a dependency is an expression
      /(.+)?express(\\|\/)(.+)?/,
      path.join(__dirname, 'src'),
      {}
    )
  ]
}
  