// Work around for https://github.com/angular/angular-cli/issues/7200

const path = require('path');
const webpack = require('webpack');
const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin');

module.exports = {
  entry: {
    // This is our Express server for Dynamic universal
    server: './server.ts',
    firebase: './firebase.ts'
  },
  target: 'node',
  resolve: { extensions: ['.tsx', '.ts', '.js'] },
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
    new SWPrecacheWebpackPlugin(
      {
        cacheId: 'onSnapshot',
        dontCacheBustUrlsMatching: /\.\w{8}\./,
        filename: 'browser/sw.js',
        staticFileGlobs: [
          'dist/browser/index.html',
          'dist/browser/**.chunk.js',
          'dist/browser/**.bundle.*',
          'dist/browser/assets/**/*'
        ],
        stripPrefix: 'dist/browser/',
        minify: true,
        navigateFallback: 'https://onsnapshot.com/index.html',
        staticFileGlobsIgnorePatterns: [/\.map$/, /asset-manifest\.json$/],
      }
    ),
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
  