const project_folder = 'dist';
const source_folder = 'src';

const path = {
  build: {
    html: project_folder + '/',
    css: project_folder + '/css/',
    js: project_folder + '/js/',
    img: project_folder + '/img/',
    fonts: project_folder + '/fonts/',
  },

  src: {
    html: source_folder + '/*.html',
    pug: source_folder + '/*.pug',
    css: source_folder + '/scss/*.{scss,css}',
    js: source_folder + '/js/*.{js,json,csv}',
    img: source_folder + '/img/**/*.{jpg,jpeg,png,gif,ico,svg,webp}',
    fonts: source_folder + '/fonts/*.{woff,woff2,ttf,otf}',
    svg: source_folder + '/img/svg/*.svg',
  },

  watch: {
    html: source_folder + '/**/*.html',
    pug: source_folder + '/**/*.pug',
    css: source_folder + '/scss/**/*.scss',
    js: source_folder + '/js/**/*.{js,json}',
    img: source_folder + '/img',
    svg: source_folder + '/img/svg/*.svg',
  },

  clean: './' + project_folder + '/',
};

const { src, dest } = require('gulp'),
  gulp = require('gulp'),
  scss = require('gulp-sass'),
  autoprefixer = require('gulp-autoprefixer'),
  del = require('del'),
  gulpPug = require('gulp-pug'),
  groupMedia = require('gulp-group-css-media-queries'),
  browsersync = require('browser-sync').create(),
  cleanCss = require('gulp-clean-css'),
  beml = require('gulp-beml'),
  svgSprite = require('gulp-svg-sprite'),
  imgmin = require('gulp-imagemin'),
  imageminPngquant = require('imagemin-pngquant'),
  imageminMozjpeg = require('imagemin-mozjpeg'),
  webpack = require('webpack'),
  webpackStream = require('webpack-stream'),
  wait = require('gulp-wait'),
  plumber = require('gulp-plumber'),
  webpackConfig = require('./webpack.config.js'),
  minify = require('gulp-minify');

function browserSync() {
  browsersync.init({
    server: {
      baseDir: './' + project_folder + '/',
    },
    notify: false,
    port: 3000,
    browser: 'chrome',
  });
}

function html() {
  return src(path.src.html)
    .pipe(dest(path.build.html))
    .pipe(browsersync.stream());
}

function pug() {
  return src(path.src.pug)
    .pipe(gulpPug({ pretty: true }))
    .pipe(
      beml({
        elemPrefix: '__',
        modPrefix: '_',
        modDlmtr: '_',
      })
    )
    .pipe(dest(path.build.html))
    .pipe(browsersync.stream());
}

function js() {
  return src(path.src.js)
    .pipe(plumber())
    .pipe(webpackStream(webpackConfig), webpack)
    .pipe(minify({ noSource: true }))
    .pipe(dest(path.build.js))
    .pipe(browsersync.stream());
}

function images() {
  return src(path.src.img)
    .pipe(dest(path.build.img))
    .pipe(browsersync.stream());
}

function optImages() {
  return src(path.src.img)
    .pipe(
      imgmin(
        [
          imageminPngquant(),
          imageminMozjpeg({
            progressive: true,
          }),
        ],
        {
          verbose: true,
        }
      )
    )
    .pipe(dest(path.build.img));
}

function css() {
  return src(path.src.css)
    .pipe(wait(200))
    .pipe(
      scss({
        outputStyle: 'expanded',
      })
    )
    .pipe(groupMedia())
    .pipe(
      autoprefixer({
        overrideBrowserslist: ['last 2 versions'],
        cascade: true,
      })
    )

    .pipe(dest(path.build.css))

    .pipe(browsersync.stream());
}

function minifyCss() {
  return gulp
    .src('dist/css/*.css')

    .pipe(cleanCss())

    .pipe(gulp.dest(path.build.css));
}

async function fonts() {
  return src(path.src.fonts)
    .pipe(dest(path.build.fonts))
    .pipe(browsersync.stream());
}

function svg() {
  return gulp
    .src(path.src.svg)
    .pipe(
      svgSprite({
        shape: {
          dimension: {
            maxWidth: 32,
            maxHeight: 32,
          },
          spacing: {
            padding: 0,
          },
          id: {
            generator: 'icon-',
          },
        },
        mode: {
          symbol: {
            sprite: '../svg/sprites.svg',
          },
        },
      })
    )
    .pipe(gulp.dest(path.build.img));
}

function watchFiles() {
  gulp.watch([path.watch.html], html);
  gulp.watch([path.watch.pug], pug);
  gulp.watch([path.watch.css], css);
  gulp.watch([path.watch.img], images);
  gulp.watch([path.watch.js], js);
  gulp.watch([path.watch.svg], svg);
}

function clean() {
  return del(path.clean);
}

const serve = gulp.series(
  gulp.parallel(js, css, html, pug, images, fonts, svg)
);
const build = gulp.series(
  clean,
	js,
  css,
  html,
  pug,
  minifyCss,
  images,
  optImages,
  fonts,
  svg
);
const watch = gulp.parallel(serve, watchFiles, browserSync);

exports.js = js;
exports.images = images;
exports.fonts = fonts;
exports.css = css;
exports.html = html;
exports.pug = pug;
exports.svg = svg;
exports.build = build;
exports.watch = watch;
exports.default = watch;
