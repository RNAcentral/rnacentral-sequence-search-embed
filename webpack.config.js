const path = require('path');
const webpack = require('webpack');
const dotenv = require('dotenv');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');


module.exports = function(env) {
  // set variables, modifying the config for dev and prod
  // see: https://github.com/webpack/webpack/issues/2254
  let environment;
  if (env && env.prod) environment = 'production';
  else environment = 'development';

  // call dotenv and it will return an Object with a parsed key
  const branch = dotenv.config().parsed;

  // reduce it to a nice object
  const envKeys = Object.keys(branch).reduce((prev, next) => {
    prev[`process.env.${next}`] = JSON.stringify(branch[next]);
    return prev;
  }, {});

  return {
    target: 'web',
    entry: path.join(__dirname, 'src', 'app.jsx'),
    output: {
      path: path.join(__dirname, 'dist'),
      publicPath: environment === 'production' ? '/rnacentral-sequence-search-embed/dist/' : '/',
      filename: 'RNAcentral-sequence-search.js'
    },
    resolve: {
      modules: [path.join(__dirname, 'src'), path.join(__dirname, 'node_modules')]
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new ExtractTextPlugin('RNAcentral-sequence-search.css'),
      new HtmlWebpackPlugin({
        inject: "body",
        template: "src/index.html",
        filename: environment === 'production' ? path.join(__dirname, "index.html") : "index.html"
      }),
      new webpack.ProvidePlugin({ $: 'jquery', jQuery: 'jquery', jquery: 'jquery' }),
      new webpack.DefinePlugin(envKeys)
    ],
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          loader: 'babel-loader',
          exclude: /node_modules/,
          query: {
            presets: ['es2015', 'react'],
            plugins: ['transform-es2015-destructuring', 'transform-object-rest-spread', 'transform-custom-element-classes']
          }
        },
        {
          test: /\.(s?css|sass)$/,
          use: [
            { loader: 'css-to-string-loader' },
            { loader: 'css-loader', options: {sourceMap: true} },
            { loader: 'sass-loader', options: {sourceMap: true} }
          ]
        },
        {
          test: /\.(png|jpe?g|gif)(\?v=\d+\.\d+\.\d+)?$/,
          loader: 'url-loader',
          options: {
            limit: 10000,
            name: '[name].[ext]',
            fallback: require.resolve('file-loader'),
          },
        },
        {
          test: /\.(eot|com|json|ttf|woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
          loader: 'url-loader?mimetype=application/octet-stream' // 'file-loader' // 'url-loader?limit=10000&mimetype=application/octet-stream'
        },
        {
          test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
          loader: 'url-loader?mimetype=image/svg+xml' // 'file-loader' // 'url-loader?limit=10000&mimetype=image/svg+xml'
        }
      ]
    },
    // A good explanation of how contentBase and publicPath work:
    // https://github.com/webpack/docs/wiki/webpack-dev-server

    // Another great post about debugging webpack-dev-server:
    // https://www.codementor.io/narthur157/webpack-dev-server-3-6-0-what-i-wish-i-knew-cl9sop7ak

    // Don't forget that you can look up your files here:
    // localhost:8080/webpack-dev-server
    devServer: {
      publicPath: '/', // suffix of bundle url in index.html that makes it localhost:8080<publicPath>app.4d9882a.js
      contentBase: '../', // location of index.html that webpack-dev-server creates in memory-fs
      hot: true,
      proxy: { // requests to these urls are proxied to the real backend server
        '/api': {
            target: 'http://localhost:8002',
            secure: false
        }
      }
    },
    devtool: "source-map"
  };
};
