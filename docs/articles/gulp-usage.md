# Gulp 使用指南

## 1. Gulp 简介

Gulp 是一个基于流的自动化构建工具，主要用于：
- 文件处理（复制、合并、压缩）
- 资源优化（图片、字体等）
- 自动化任务执行
- 开发服务器热更新

## 2. 基础安装

```bash
# 全局安装（可选）
npm install -g gulp-cli

# 项目本地安装
npm install --save-dev gulp
```

## 3. 基础配置文件

创建 `gulpfile.js` 文件：

```js
const { src, dest, series, parallel, watch } = require('gulp')

// 默认任务
function defaultTask(cb) {
  console.log('Gulp is running!')
  cb()
}

exports.default = defaultTask
```

运行测试：
```bash
gulp
```

## 4. 常用插件安装

```bash
# 文件处理
npm install --save-dev gulp-rename gulp-concat gulp-sourcemaps

# CSS 处理
npm install --save-dev gulp-sass gulp-postcss autoprefixer cssnano

# JS 处理
npm install --save-dev gulp-babel @babel/core @babel/preset-env gulp-uglify

# 图片处理
npm install --save-dev gulp-imagemin

# 开发服务器
npm install --save-dev browser-sync
```

## 5. 核心 API 使用

### 5.1 文件处理示例

```js
const rename = require('gulp-rename')
const concat = require('gulp-concat')

function processCSS() {
  return src('src/css/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(concat('all.min.css'))
    .pipe(dest('dist/css'))
}

exports.css = processCSS
```

### 5.2 JavaScript 处理

```js
const babel = require('gulp-babel')
const uglify = require('gulp-uglify')

function processJS() {
  return src('src/js/*.js')
    .pipe(sourcemaps.init())
    .pipe(babel({ presets: ['@babel/preset-env'] }))
    .pipe(uglify())
    .pipe(concat('app.min.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(dest('dist/js'))
}

exports.js = processJS
```

### 5.3 图片优化

```js
const imagemin = require('gulp-imagemin')

function optimizeImages() {
  return src('src/images/*')
    .pipe(imagemin([
      imagemin.mozjpeg({ quality: 75, progressive: true }),
      imagemin.optipng({ optimizationLevel: 5 })
    ]))
    .pipe(dest('dist/images'))
}

exports.images = optimizeImages
```

## 6. 开发服务器配置

```js
const browserSync = require('browser-sync').create()

function serve() {
  browserSync.init({
    server: './dist'
  })

  watch('src/css/*.scss', processCSS)
  watch('src/js/*.js', processJS)
  watch('src/images/*', optimizeImages)
  watch('dist/*.html').on('change', browserSync.reload)
}

exports.serve = serve
```

## 7. 任务组合

```js
// 单独任务
exports.css = processCSS
exports.js = processJS
exports.images = optimizeImages

// 组合任务
const build = parallel(processCSS, processJS, optimizeImages)
const dev = series(build, serve)

exports.build = build
exports.dev = dev
exports.default = dev
```

## 8. 常用命令

```bash
# 运行开发服务器
gulp dev

# 只执行构建
gulp build

# 单独处理 CSS
gulp css

# 生产环境构建（通常添加到 package.json）
gulp build --env production
```

## 9. 高级技巧

### 9.1 环境变量判断

```js
const minimist = require('minimist')

const args = minimist(process.argv.slice(2))
const isProduction = args.env === 'production'

function processCSS() {
  return src('src/css/*.scss')
    .pipe(sass())
    .pipe(postcss([
      autoprefixer(),
      isProduction ? cssnano() : false
    ].filter(Boolean)))
    .pipe(dest('dist/css'))
}
```

### 9.2 错误处理

```js
const plumber = require('gulp-plumber')
const notify = require('gulp-notify')

function processJS() {
  return src('src/js/*.js')
    .pipe(plumber({
      errorHandler: notify.onError("Error: <%= error.message %>")
    }))
    .pipe(babel())
    .pipe(dest('dist/js'))
}
```

### 9.3 增量构建

```js
const newer = require('gulp-newer')

function processImages() {
  return src('src/images/*')
    .pipe(newer('dist/images'))
    .pipe(imagemin())
    .pipe(dest('dist/images'))
}
```

## 10. 完整配置示例

```js
const { src, dest, parallel, series, watch } = require('gulp')
const sass = require('gulp-sass')(require('sass'))
const postcss = require('gulp-postcss')
const autoprefixer = require('autoprefixer')
const cssnano = require('cssnano')
const babel = require('gulp-babel')
const uglify = require('gulp-uglify')
const imagemin = require('gulp-imagemin')
const browserSync = require('browser-sync').create()
const concat = require('gulp-concat')
const rename = require('gulp-rename')
const sourcemaps = require('gulp-sourcemaps')
const plumber = require('gulp-plumber')
const notify = require('gulp-notify')

// CSS 处理
function css() {
  return src('src/scss/**/*.scss')
    .pipe(plumber({ errorHandler: notify.onError("CSS Error: <%= error.message %>") }))
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(concat('main.min.css'))
    .pipe(sourcemaps.write('.'))
    .pipe(dest('dist/css'))
    .pipe(browserSync.stream())
}

// JavaScript 处理
function js() {
  return src('src/js/**/*.js')
    .pipe(plumber({ errorHandler: notify.onError("JS Error: <%= error.message %>") }))
    .pipe(sourcemaps.init())
    .pipe(babel({ presets: ['@babel/preset-env'] }))
    .pipe(uglify())
    .pipe(concat('app.min.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(dest('dist/js'))
    .pipe(browserSync.stream())
}

// 图片优化
function images() {
  return src('src/images/**/*')
    .pipe(imagemin([
      imagemin.mozjpeg({ quality: 80, progressive: true }),
      imagemin.optipng({ optimizationLevel: 5 })
    ]))
    .pipe(dest('dist/images'))
}

// 开发服务器
function serve() {
  browserSync.init({
    server: './dist',
    port: 3000
  })

  watch('src/scss/**/*.scss', css)
  watch('src/js/**/*.js', js)
  watch('src/images/**/*', images)
  watch('dist/*.html').on('change', browserSync.reload)
}

// 构建任务
const build = parallel(css, js, images)
const dev = series(build, serve)

exports.css = css
exports.js = js
exports.images = images
exports.build = build
exports.dev = dev
exports.default = dev
```

## 11. 与现代工具链结合

### 11.1 结合 Webpack

```js
const webpack = require('webpack-stream')

function webpackTask() {
  return src('src/js/entry.js')
    .pipe(webpack(require('./webpack.config.js')))
    .pipe(dest('dist/js'))
}
```

### 11.2 结合 TypeScript

```bash
npm install --save-dev gulp-typescript typescript
```

```js
const ts = require('gulp-typescript')

function typescript() {
  return src('src/ts/**/*.ts')
    .pipe(ts({
      noImplicitAny: true,
      outFile: 'output.js'
    }))
    .pipe(dest('dist/js'))
}
```

## 12. 性能优化建议

1. **并行任务**：使用 `parallel()` 并行执行独立任务
2. **增量构建**：使用 `gulp-newer` 只处理修改过的文件
3. **缓存处理**：对 Babel/TypeScript 等配置缓存
4. **任务拆分**：将大型构建拆分为多个小任务
5. **避免同步操作**：确保所有任务都正确返回流或 Promise

## 13. 常见问题解决

**问题1：任务未完成但显示完成**
- 原因：未正确返回流或调用 callback
- 解决：确保每个任务都 `return stream` 或调用 `cb()`

**问题2：文件更改后未触发监视**
- 原因：文件路径配置错误
- 解决：检查 `watch()` 路径是否匹配实际文件结构

**问题3：插件报错中断任务**
- 解决：使用 `gulp-plumber` 捕获错误并继续执行

**问题4：构建速度慢**
- 优化：使用增量构建、并行任务、减少不必要的操作

---

这份指南涵盖了 Gulp 从基础到进阶的使用方法，可根据项目需求选择适合的配置方案。