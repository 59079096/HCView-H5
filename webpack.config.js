//为了使用插件，需要将require()其添加到plugins阵列中。使用new运算符调用插件来创建插件的实例。
const htmlwebpackplugin = require("html-webpack-plugin");
const copywebpackplugin = require("copy-webpack-plugin");
const webpack = require("webpack");
const path = require("path");
module.exports = {
  entry: {
    index: "./HCViewDemo.js"
  },
  output: {
    filename: "app.bundle.[hash:5].js",
    path: __dirname + "/dist"
  },
  module: {
    rules: [
      {
        test: /(\.js)$/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              [
                "@babel/preset-env",
                {
                  targets: {
                    browsers: ["> 1%", "last 2 versions"]
                  }
                }
              ]
            ]
          }
        }
      }
    ]
  },
  plugins: [
    new htmlwebpackplugin({ template: "./html-templates/index.html" }),
    new copywebpackplugin([
      {
        from: __dirname + "/image",
        to: __dirname + "/dist/image"
      },
      {
        from: __dirname + "/favicon.ico",
        to: __dirname + "/dist/favicon.ico"
      }
    ])
  ]
};
