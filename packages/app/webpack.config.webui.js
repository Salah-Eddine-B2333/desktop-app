/**
 * webui compoments can't be build through electron-webpack yet because it doesn't support `target: 'web'`.
 * So we have to build it manually.
 */
require('./webpack.monkeypatch-crypto');
const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const WriteFilePlugin = require('write-file-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const baseConfig = require('./webpack.config.base');

module.exports = (env, argv) => merge.smart(baseConfig(env, argv), {
  target: 'web',

  node: {
    global: true,
    __dirname: 'mock',
  },

  plugins: [
    new HtmlWebpackPlugin({
      chunks: ['multiInstanceConfiguration'],
      filename: 'multi-instance-configuration.html',
      template: './src/app-sub.html',
    }),
    new webpack.NamedModulesPlugin(),
    new WriteFilePlugin(),
  ],

  entry: {
    multiInstanceConfiguration: './src/applications/multi-instance-configuration/webui/index.tsx',
  },

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json', '.graphql', '.svg']
  },

  externals: [
    {
      fs: '{ join: () => {} }',
    },
  ],


  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist', 'renderer'),
    chunkFilename: '[name].bundle.js',
  },

  performance: {
    // This is an internal Electron web UI page; the bundle is still small enough for desktop use.
    maxAssetSize: 1024 * 1024,
    maxEntrypointSize: 1024 * 1024,
    hints: 'warning',
  },

  optimization: {
    splitChunks: {
      chunks: 'all',
      minSize: 20000,
      maxSize: 244000,
      cacheGroups: {
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          reuseExistingChunk: true,
          enforce: true,
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    },
    runtimeChunk: 'single',
  },
});
