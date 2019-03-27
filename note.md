# webpack 配置
## 目标：
1. 源码是按模块分包（html、js、css 等在同一个目录），希望打包后抽出js、css、图片等资源到资源目录。
2. 使用Sass/Less
3. 使用 react 构建用户界面
4. 希望引入 eslint
5. 要能提取大文件
6. 有一个开发服务器跑着
7. 能打出可直接加载的开发包
8. 能打出可直接发布的生产包

OK 就是这样。



## 配置指南
### 1. 配置入口(entry)

#### context
使用 `context` 字段指定入口文件所处的目录的绝对路径。换句话说就是指定一个绝对路径作为基础目录，后面解析入口、loaders 都是相对这个目录进行的。

举个栗子：

project
```
webpack-demo
|-src
  |-index.js
```
config
```js
// __dirname: /Users/Frank/webpack-demo/
context: __dirname,
entry: {
  index: './src/index.js'
}
```
上面是webpack的默认配置，意思是在当前目录查找 './src/index.js'。

下面尝试改一下 context
```js
context: '/Users/Frank/webpack-demo/src',
entry: {
  index: './src/index.js'
}
```
很显然这次 webpack 不会构建成功，错误信息是：`ERROR in Entry module not found: Error: Can't resolve './src/view.js' in '/Users/ylfe/Frank/webpack-demo/src'`

不难看出，webpack 是到 context 指定的路径查找 entry。

#### entry
在web项目中，入口通常是在 html 中通过 script 标签引入的 js 脚本。
一般一个html只引入一个 js 脚本，其他资源都在这个js脚本里面通过import、require等引用，这可以充分发挥 webpack 的依赖分析、自动转换、打包等功能的优势。

`entry` 的值可以是一个字符串、数组、对象或是函数。
#### >字符串
```js
entry: 'index.js'
// 等价于
entry: {
  main: 'index.js'
}
```
`chunk` 被命名为 `main`

看一下打包结果：
```js
...webpackBootstrap

({/***/ "./index.js":
/*!******************!*\
  !*** ./index.js ***!
  \******************/
/*! no static exports found */
/***/ (function(module, exports) {
eval("\n\n//# sourceURL=webpack:///./index.js?");
/***/ })
/******/ });
```
#### >数组
```js
entry: ['index.js']

```
webpack 针对数组中的每一项进行依赖分析、打包，只生成一个 bundle 文件。
`chunk` 被命名为 `main`

虽然只有一项，bundle内容也不同于上例：
```js
({
/***/ "./index.js":
/*!******************!*\
  !*** ./index.js ***!
  \******************/
/*! no static exports found */
/***/ (function(module, exports) {
eval("\n\n//# sourceURL=webpack:///./index.js?");
/***/ }),
/***/ 0:
/*!************************!*\
  !*** multi ./index.js ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {
eval("module.exports = __webpack_require__(/*! ./index.js */\"./index.js\");\n\n\n//# sourceURL=webpack:///multi_./index.js?");
/***/ })
/******/ });
```
#### >对象
```js
entry: {
  index: 'index.js'
},
```
每个键（key）会是 chunk 的名称，值描述了 chunk 的入口文件（在output中通过[name]取得）

#### >函数
```js
entry: () => new Promise(resolve => {
  setTimeout(()=>{
    resolve({
      index: './index.js'
    })
  })
})
```
通过promise设置 字符串、数组、对象等。

### 2. 配置输出（output）
顶层的 `output` 字段用一系列的配置项来告诉 webpack 将它处理的资源输出到哪里。
因为 webpack4 把分包的活也揽了过来，所以这个配置就比较复杂了。

#### filename
```js
filename: '[name].js' // 默认值，name 是 chunk 的名称，默认为 main
```
这个选项指定输出 bundle 的名称，对于单个 入口项目， filename可以使用占位符也可以使用静态名称，
对于多入口项目则必须使用占位符以生成不同名称的 bundle。否则可以看到这样的错误信息：
```
ERROR in chunk view [entry] 
./js/bundle.js
Conflict: Multiple chunks emit assets to the same filename ./js/bundle.js (chunks index and view)
```
虽然名字叫 filename ，其实也可以指定路径的（相对于path字段设置的路径）。如：`js/[chunkhash].js`

ps: 常用占位符有
* [name]        模块名称
* [id]          模块标识符
* [hash]        模块标识符的 hash
* [chunkhash]   chunk 内容的 hash
* [contenthash] 使用`ExtractTextWebpackPlugin`提取出的资源的 hash

可以指定 hash 长度： [hash:16]、[chunkhash:10]、[contenthash:10] （默认20）
也可以通过字段 'output.hashDigestLength' 全局设置。

### module
指定如何处理项目中不同的模块

#### noParse: 正则、正则数组、函数、字符串
指定不处理哪些模块。举个栗子：
```js
module: {
  noParse: /jquery/
}
```
其它写法：
```js
noParse: [/jquery/]
noParse: 'jquery'
noParse: content => /jquery/.test(content)
```
这意味着即使在 `.src/index.js` 里面 'import' 了 jquery ，webpack 也不会把 jquery 打进 bundle，其实根本就没有去处理 jquery。
> 既然忽略了 jquery，就不要再使用 import 等引用它了。测试发现如果 import 的目标模块被 noParse 匹配，webpack 不会转译这个文件的所有 import 语句。。。

忽略一些比较大的没采用模块化的库可以大大提升编译速度。

---

#### rules 规则数组
这些规则能够修改模块的创建方式，如指定加载相关模块时应用的loader、修改解析器等。

一个规则包括三个部分：条件、结果、嵌套规则。
* 条件：用于判断是否对资源使用此规则
* 结果：输出要对资源应用的 loaders、解析选项。
* 嵌套规则：嵌套属性写在 `rules` 和 `onOf` 下

资源有两个相关值供执行条件匹配测试：

1. resource: 被请求资源的模块文件的绝对路径。
2. issuer: 请求当前资源的模块（`import` 语句所在模块文件）的绝对路径。

* 条件设置字段（匹配目标是上文的 `resource` ）
  * test: 正则表达式|正则表达式数组，匹配特定条件
  * include: 字符串|字符串数组，匹配特定条件
  * exclude: 字符串|字符串数组，排除特定条件
  * and: 条件数组，必须匹配数组中的所有条件
  * or: 条件数组，匹配数组中任何一个条件
  * not: 条件数组，必须不匹配数组中的所有条件
  > 条件可以是这些之一：
  >* 字符串：输入必须以提供的字符串开始
  >* 正则表达式: test用
  >* 函数: 返回一个真值
  >* 条件数组: 至少一个条件匹配
  >* 对象: 每个属性定义的条件都要匹配

* `Rule.issuer`（匹配目标是上文的 `resource` ）: 类似 'Rule.test'，只不过issuer的匹配对象是issuer
* `Rule.test` : `Rule.resource.test` 的简写，提供此选项就不能再提供 `Rule.resource`
* `Rule.exclude` : `Rule.resource.exclude` 的简写，提供此选项就不能再提供 `Rule.resource`
* `Rule.include` : `Rule.resource.include` 的简写，提供此选项就不能再提供 `Rule.resource`

* `Rule.use` : 字符串、字符串数组、对象数组、函数
  字符串/数组
  ```js
  module: {
    rules: [
      //这俩是 use:[{loader: 'css-loader'}] 的简写形式
      {test: /\.css$/, use: ['css-loader']}
      {test: /\.css$/, use: 'css-loader'}
    ]
  }
  ```
  对象数组
  ```js
  module: {
    rules: [
      {
        test: /\.css$/,
        use: {
          loader: String,  // 必须
          options: {},     // 可选，传递给 loader 的参数
          query: {}        // 废弃，使用 `options` 替代
        } 
      }
    ]
  }
  ```
  函数写法
  ```js
  /**
  info: {
    compiler: 当前webpack的compiler,
    issuer: 发起当前引用的模块的路径,
    realResource: 当前正在加载的模块的路径
    resource: 一般和 realResource 一致，除非在引用语句中使用 `!=!` 指定了资源名称？
  }
  */
  use: info => [
    {loader: 'style-loader'}, {loader: 'css-loader'}
  ]
  ```
  
  \# `options.ident`

  webpack 根据模块的资源、loaders 和 loaders 的 配置项（options）来为模块生成一个全局唯一的**模块标识符**。webpack并不能保证这个标识符百分百全局唯一，所以你也可以使用 `options.ident` 字段指定一个唯一标识符。
  > options 对象是经过 `JSON.stringifi()` 字符化后参与生成标识符的。所以存在这种情况，你将两个相同的 loader 应用了不同的配置（options），然后将这两个loader应用于某个资源。此时如果两个 options 经过 `JSON.stringifi()` 生成的字符串是相同的，那么 webpack 为此模块生成的 标识符（module identifier）就不能保证唯一了。

* `Rule.rules` : 嵌套规则数组，在当前规则匹配时使用
* `Rule.onOf` : 嵌套规则数组，在当前规则匹配时使用, 但是只应用匹配到的第一个规则
* `Rule.resource` : 配置匹配条件，一般都用上述的简单方法
* `Rule.resourceQuery` : 当前规则条件匹配成功是再进一步匹配参数。🌰
  ```js
  import Foo from './foo.css?inline'
  // 匹配成功，使用url-loader 处理 foo.css
  rules: [
      {
        test: /.css$/,
        resourceQuery: /inline/,
        use: 'url-loader'
      }
    ]
  ```
* `Rule.type` : 'javascript/auto' | 'javascript/dynamic' | 'javascript/esm' | 'json' | 'webassembly/experimental'
  设置匹配到的模块的类型，能够阻止 webpack 默认的规则和加载行为。比如json文件的加载，如果我们需要使用自定义的 json 加载器，需要如下设置：
  ```js
  {
    test: /.json$/,
    type: 'javascript/auto',
    loader: 'custom-json-loader'
  }
  ```
* `Rule.loader` : `Rule.use: [{ loader }]` 的简写, 字符串、字符串数组
* `Rule.loaders` : `Rule.use` 的别名，已废弃
* `Rule.parse` : 配置解析器
  ```js
  parser: {
    amd: false, // disable AMD
    commonjs: false, // disable CommonJS
    system: false, // disable SystemJS
    harmony: false, // disable ES2015 Harmony import/export
    requireInclude: false, // disable require.include
    requireEnsure: false, // disable require.ensure
    requireContext: false, // disable require.context
    browserify: false, // disable special handling of Browserify bundles
    requireJs: false, // disable requirejs.*
    node: false, // disable dirname, filename, module, require.extensions, require.main, etc.
    node: {...} // reconfigure node layer on module level
  }
  ```
* `Rule.enforce` : 指定 loader 的种类。 "pre" | "post" ，没有值代表 normal loader。
  ```js
  // 内联 loaders 和 ！ 前缀都是不推荐使用的。
  // 禁用 rules 中配置的 normal loaders 
  import { a } from '!./file1.js';

  // 禁用 rules 中配置的 normal loaders 和 preloaders
  import { b } from  '-!./file2.js';

  // 禁用 rules 中配置的所有 loaders
  import { c } from  '!!./file3.js';
  ```

  还有一种loader：内联loader：`import Styles from 'style-loader!css-loader?modules!./styles.css';` 
  > 使用`!`将资源中的 loader 分开；使用`!`为整个规则添加前缀可以覆盖配置中的所有loader定义。

### sourcemap
```js
devtool: 'inline-source-map'
```
### 文件监听
```js
npx webpack --watch
// 或加入npm script
{
  "watch": "webpack --watch"
}
```

### webpack-dev-server
安装
```
npm install -D webpack-dev-server
```
配置
```js
devServer: {
  contentBase: './dist'
}
```
启动脚本
```json
"start": "webpack-dev-server --open"
```
> devServer 编译结束后会将 bundle 保持在内存中，不会写到任何输出文件。
> 更改任何源文件并保存，devServer会自动编译后重新加载。