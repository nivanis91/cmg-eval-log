const path = require('path');
const config = require('./package.json');

const webpack = require('webpack');

module.exports = {
  entry: path.resolve(__dirname, config.main),
  devtool: 'source-map',
  mode: 'production',
  output: {
    path: __dirname,
    filename: 'build/cmg_func.js',
    library: 'cmg_func',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  module: {
    rules: [
      {test: /\.es6?$/, exclude: /node_modules/, loader: 'babel-loader'}
    ]
  }
};