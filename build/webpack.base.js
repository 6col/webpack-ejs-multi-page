const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
// const HtmlWebpackPlugin = require('html-webpack-plugin');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
// 把样式通过link方式引入
const MiniCssExtractPlugin = require('mini-css-extract-plugin');


const commonsChunkPlugin = new webpack.optimize.CommonsChunkPlugin({
  name: 'commons', // 这公共代码的chunk名为'commons'
  filename: '[name].bundle.js', // 生成后的文件名，虽说用了[name]，但实际上就是'commons.bundle.js'了
  minChunks: 4, // 设定要有4个chunk（即4个页面）加载的js模块才会被纳入公共代码。这数目自己考虑吧，我认为3-5比较合适。
});

const plugins =  require('./plugins')


module.exports = {
  entry: Object.assign({
    vendor: ['jquery', '@src/lib/login.js'],
    config: path.resolve(__dirname, '../src/lib/config.js')
  }, plugins.entry),
  plugins: [

    // 自动清空dist目录
    new CleanWebpackPlugin(),
    // new webpack.optimize.CommonsChunkPlugin({
    //   name: "jquery", // <== should be entry key which contains the lazy imports
    //   async: true,
    //   minChunks: 2
    // }),
    ...plugins.html,
    new MiniCssExtractPlugin({
      filename: 'css/[name].css'
    }),
    // 将src/static直接copy到dist，并重命名为static
    new CopyWebpackPlugin([
      {
        from: './src/static', to: 'static'
      }
    ]),
  ],
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: '/jquery/',
          name: 'jquery',
          chunks: 'all'
        },
        styles: {
          test: /[\\/]common[\\/].+\.css$/,
          name: 'styles',
          chunks: 'all',
          enforce: true
        }
      }
    }
  },
  output: {
    // js生成到dist/js，[name]表示保留原js文件名
    filename: 'js/[name].js',
    // 输出路径为dist
    path: path.resolve(__dirname, '../dist')
  },
  module: {
    rules: [
      {
        test: /\.ejs/,
        use: ['ejs-loader']
      },
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: ['@babel/plugin-transform-runtime', '@babel/plugin-transform-modules-commonjs']
          }
        }
      },
      {
        test: /\.(c|le)ss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              // css中的图片路径增加前缀
              publicPath: '../'
            }
          },
          'css-loader',
          {
            loader: "postcss-loader",
            options: {
              plugins: [
                require("autoprefixer")
              ]
            }
          },
          'less-loader'
        ]
      },
      {
        test: /\.styl$/,
        use: [
          {
          loader: MiniCssExtractPlugin.loader,
          options: {
            // css中的图片路径增加前缀
            publicPath: '../'
          }
        },
          'css-loader',
          'stylus-loader'
        ]
      },
      {
        // css加载图片
        test: /\.(png|svg|jpg|gif|webp)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              // 最终生成的css代码中,图片url前缀
              // publicPath: '../images',
              // 图片输出的实际路径(相对于dist)
              outputPath: 'images',
              // 当小于某KB时转为base64
              limit: 0
            }
          }
        ]
      },
      {
        // html中的图片提取并打包
        test: /\.(html)$/,
        use: {
          loader: 'html-loader',
          options: {
            attrs: ['img:src', 'img:data-src', 'audio:src'],
            minimize: true
          }
        }
      },
      {
        test: /\.(woff|woff2|eot|ttf|svg)$/,
        loader: 'file-loader',
        options: {
          // 保留原文件名和后缀名
          name: '[name].[ext]',
          // 输出到dist/fonts/目录
          outputPath: 'fonts'
        }
      },
      {
        test: require.resolve('jquery'),
        use: [
          {
            loader: 'expose-loader',
            // 暴露出去的全局变量的名称 随便你自定义
            options: 'jQuery'
          },
          {
            loader: 'expose-loader',
            options: '$'
          }
        ]
      }
    ]
  },
  resolve: {
    alias: {
      '@': path.join(__dirname, '..'),
      '@src': path.join(__dirname, '..', 'src')
    }
  }
}
