const fs = require('fs');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const pagePath =  path.resolve(__dirname, '../src/page/')
// const items = fs.readdirSync(pagePath);
// const dirs = items.filter(item => {
//   return fs.statSync(path.join(pagePath, item)).isDirectory()
// });
//
// let jsFiles = []
// let ejsFiles = []
// dirs.filter(item => {
//   let temp = path.join(pagePath, item)
//   if (fs.statSync(temp).isDirectory()) {
//     let jsFile = path.join(temp, 'index.js');
//     let ejsFile = path.join(temp, 'index.ejs');
//     if (fs.statSync(jsFile).isFile()) {
//       jsFiles.push(jsFile)
//     }
//     if (fs.statSync(ejsFile).isFile()) {
//       ejsFiles.push(ejsFile)
//     }
//   }
// })


function travelSync(dir = pagePath, ejsFiles = [], jsFiles = []) {
  const files = fs.readdirSync(dir);
  for (let i = 0;i < files.length; i++) {
    let pathname = path.join(dir, files[i]);
    if (fs.statSync(pathname).isDirectory()) {
      travelSync(pathname, ejsFiles, jsFiles)
    } else {
      if (files[i].toLowerCase() === 'index.ejs') {
        ejsFiles.push({
          path: path.relative(pagePath, dir),
          fulPath: path.join(dir, files[i]),
          name: files[i]
        })
      }
      if (files[i].toLowerCase() === 'index.js') {
        jsFiles.push({
          path: path.relative(pagePath, dir),
          fulPath: path.join(dir, files[i]),
          name: files[i]
        })
      }
    }
  }
  return {
    ejsFiles,
    jsFiles
  }
}

// 设置html模板生成路径
let plugins = {
  html: [],
  entry: {}
}
let files = travelSync()
files.ejsFiles.forEach(item => {
  plugins.html.push(new HtmlWebpackPlugin({
    /**
     * @type String
     * 用于生成HTML文档的标题
     */
    title: 'dfkjsdlfjsdflkj',
    /**
     * @type String
     * 文件名，在这里可以指定一个目录
     */
    filename: `${item.path}.html`,
    /**
     * @type String
     * webpack模板的相对或绝对路径。默认情况下，src/index.ejs如果它存在，它将使用
     */
    template:  `${item.fulPath}`,
    /**
     * @type String
     * 插入的script插入的位置，四个可选值:
     * true: 默认值，script标签位于html文件的body底部,body: 同true
     * head: script标签位于html文件的head标签内
     * false: 不插入生成的js文件，只是生成的html文件
     */
    inject: 'head',
    /**
     * @type Array
     * 在html文件中引用哪些js文件,用于多入口文件时。不指定chunks时，所有文件都引用
     * entry 入口处
     */
    chunks: ['vendor', 'config', item.path],
    /**
     * @type Array
     * 与chunks相反，html文件不引用哪些js文件
     */
    excludeChunks: [],
    /**
     * @type String
     * 为生成的html文件生成一个favicon，属性值是路径
     */
    favicon: '',
    /**
     * @type Object
     * 允许注入meta-tags
     */
    meta: {
      viewport:'width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no',
      Keywords: '',
      Description: ''
    },
    /**
     * @type { Boolean | Object }
     * 对html文件进行压缩,属性值是false或者压缩选项值。默认false不对html文件进行压缩
     * html-webpack-plugin中集成的html-minifier，生成模板文件压缩配置，有很多配置项，这些配置项就是minify的压缩选项值
     */
    minify: {
      collapseWhitespace: true,
      removeAttributeQuotes: true,
      removeComments: true
    },
    /**
     * @type Boolean
     * 给生成的js文件尾部添加一个hash值。这个hash值是本次webpack编译的hash值。默认false
     */
    hash: true,
    /**
     * @type Boolean
     * 只在文件被修改的时候才生成一个新文件。默认值true
     */
    cache: true,
    /**
     * @type Boolean
     * 错误信息是否写入html文件,默认true
     */
    showErrors: true,
    /**
     * @type {Boolean|Object|Function}
     * 允许覆盖模板中使用的参数
     * 示例：
     * {
     *   title: 'xxxx',
     *   favicon: './favicon/index.ico'
     * }
     */
    templateParameters (compilation, assets, options) {
      return {
        compilation: compilation,
        webpack: compilation.getStats().toJson(),
        webpackConfig: compilation.options,
        htmlWebpackPlugin: {
          files: assets,
          options: options
        },
        process,
      }
    },
    /**
     * @type {String | Function}
     * 控制script标签的引用顺序,默认五个选项
     * none: 无序
     * auto: 默认值, 按插件内置的排序方式
     * dependency: 根据不同文件的依赖关系排序
     * manual: chunks按引入的顺序排序, 即属性chunks的顺序
     * {Function}: 指定具体的排序规则
     */
    chunksSortMode: 'auto'
  }))
})

files.jsFiles.forEach(item => {
  plugins.entry[item.path] = item.fulPath
})

module.exports = plugins
