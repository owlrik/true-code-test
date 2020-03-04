'use strict';

const { src, dest, series, parallel, watch } = require('gulp');

const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const csso = require('gulp-csso');

const posthtml = require('gulp-posthtml');
const include = require('posthtml-include');
const htmlmin = require('gulp-htmlmin');

const terser = require('gulp-terser');
const concat = require('gulp-concat');
const babel = require('gulp-babel');

const imagemin = require('gulp-imagemin');
const svgstore = require('gulp-svgstore');

const plumber = require('gulp-plumber');
const rename = require('gulp-rename');
const gulpIf = require('gulp-if');
const del = require('del');

const ghpages = require('gh-pages');

const server = require('browser-sync').create();

let isDev = !process.env.NODE_ENV || process.env.NODE_ENV === 'dev';

function processSass() {
  return src('source/sass/style.scss', { sourcemaps: true })
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(dest('build/css'))
    .pipe(csso())
    .pipe(rename('style.min.css'))
    .pipe(gulpIf(isDev, dest('build/css', { sourcemaps: '.' }), dest('build/css')))
    .pipe(gulpIf(isDev, server.stream()));
}
exports.processSass = processSass;

function processHtml() {
  return src('source/*.html')
    .pipe(htmlmin({
      collapseWhitespace: true
    }))
    .pipe(dest('build'));
}
exports.processHtml = processHtml;

function buildJs() {
  return src([
    'node_modules/picturefill/dist/picturefill.min.js',
    'node_modules/object-fit-images/dist/ofi.min.js',
    'node_modules/svg4everybody/dist/svg4everybody.min.js'
  ])
    .pipe(src([
      'source/js/lib/**/*.js',
      'source/js/utils/**/*.js',
      'source/js/script.js'], { sourcemaps: true }))
    .pipe(plumber())
    .pipe(babel({
      presets: ['@babel/env'],
      ignore: ['node_modules']
    }))
    .pipe(concat('script.js'))
    .pipe(dest('build/js'))
    .pipe(terser())
    .pipe(rename('script.min.js'))
    .pipe(gulpIf(isDev, dest('build/js', { sourcemaps: '.' }), dest('build/js')));
}
exports.buildJs = buildJs;

function copyFonts() {
  return src('source/fonts/**/*.{woff,woff2}')
    .pipe(dest('build/fonts'));
}
exports.copyFonts = copyFonts;

function copyImg() {
  return src(['source/img/**/*.{jpg,jpeg,png,svg,webp}', '!source/img/sprites/**/*.{jpg,jpeg,png,svg,webp}'])
    .pipe(imagemin([
      imagemin.jpegtran({progressive: true}),
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.svgo()
    ]))
    .pipe(dest('build/img'));
}
exports.copyImg = copyImg;

function generateSvgSprite() {
  return src('source/img/sprites/svg/*.svg')
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename('sprite.svg'))
    .pipe(dest('build/img/sprites'));
}
exports.generateSvgSprite = generateSvgSprite;

function cleanBuildDir() {
  return del('build');
}
exports.cleanBuildDir = cleanBuildDir;

function reload(done) {
  server.reload();
  done();
}

function deploy(cb) {
  ghpages.publish('build/', cb);
}
exports.deploy = deploy;

function serve() {
  server.init({
    server: 'build/',
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  watch('source/sass/**/*.{scss,sass}', series(processSass));
  watch('source/*.html', series(processHtml, reload));
  watch('source/js/**/*.js', series(buildJs, reload));
  watch(['source/img/**/*.{jpg,jpeg,png,svg,webp}', '!source/img/sprites/**/*.svg'], series(copyImg, reload));
  watch('source/img/sprites/svg/*.svg', series(generateSvgSprite, reload));
  watch('source/fonts/**/*.{woff,woff2}', series(copyFonts, reload));
}
exports.serve = serve;

exports.build = series(
  cleanBuildDir,
  parallel(copyFonts, copyImg),
  generateSvgSprite,
  parallel(processHtml, processSass, buildJs)
);

exports.default = series(
  cleanBuildDir,
  parallel(copyFonts, copyImg),
  generateSvgSprite,
  parallel(processHtml, processSass, buildJs),
  serve
);
