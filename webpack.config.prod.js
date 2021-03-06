const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ScriptExtHtmlWebpackPlugin = require("script-ext-html-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const StyleExtHtmlWebpackPlugin = require("style-ext-html-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const srcPath = path.join(__dirname, "src");
const buildPath = path.join(__dirname, "public");

module.exports = () => {
  return {
    devtool: "cheap-module-source-map",
    entry: ["@babel/polyfill", path.join(srcPath, "index.js")],
    output: {
      path: buildPath,
      filename: "[name].[chunkhash].js"
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: [{ loader: "babel-loader" }]
        },
        {
          test: /\.css$/,
          exclude: /node_modules/,
          use: ExtractTextPlugin.extract({
            fallback: "style-loader",
            use: [{ loader: "css-loader" }, "postcss-loader"]
          })
        }
      ]
    },
    plugins: [
      new webpack.DefinePlugin({
        "process.env.NODE_ENV": JSON.stringify("production")
      }),
      new webpack.optimize.ModuleConcatenationPlugin(),
      new webpack.optimize.CommonsChunkPlugin({
        name: "vendor",
        filename: "vendor.[chunkhash].js",
        minChunks(module) {
          return module.context && module.context.indexOf("node_modules") >= 0;
        }
      }),
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false,
          screw_ie8: true,
          conditionals: true,
          unused: true,
          comparisons: true,
          sequences: true,
          dead_code: true,
          evaluate: true,
          if_return: true,
          join_vars: true
        },
        output: {
          comments: false
        }
      }),
      new webpack.HashedModuleIdsPlugin(),
      new HtmlWebpackPlugin({
        template: path.join(__dirname, "index.ejs"),
        path: buildPath,
        excludeChunks: ["base"],
        filename: "index.html",
        minify: {
          collapseWhitespace: true,
          collapseInlineTagWhitespace: true,
          removeComments: true,
          removeRedundantAttributes: true
        }
      }),
      new ScriptExtHtmlWebpackPlugin({
        defaultAttribute: "defer"
      }),
      new ExtractTextPlugin({
        filename: "[name].[contenthash].css",
        allChunks: true
      }),
      new OptimizeCssAssetsPlugin({
        cssProcessor: require("cssnano"),
        cssProcessorPluginOptions: {
          preset: ["default", { discardComments: { removeAll: true } }]
        },
        canPrint: true
      }),
      new StyleExtHtmlWebpackPlugin({
        minify: true
      }),
      new CompressionPlugin({
        asset: "[path].gz[query]",
        algorithm: "gzip",
        test: /\.js$|\.css$|\.html$|\.eot?.+$|\.ttf?.+$|\.woff?.+$|\.svg?.+$/,
        threshold: 10240,
        minRatio: 0.8
      }),
      new CopyPlugin([
        { from: path.join(srcPath, "pwa"), to: buildPath },
        { from: path.join(__dirname, "ads.txt"), to: buildPath }
      ])
    ]
  };
};
