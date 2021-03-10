const gulp = require('gulp'),
	uglify = require('gulp-uglify-es').default,
	browserSync = require('browser-sync').create(),
	del = require('del'),
	gulpLoadPlugins = require('gulp-load-plugins'),
	connect = require('gulp-connect-php'),
	chalk = require('chalk'),
	path = require('path');
const $ = gulpLoadPlugins();
const reload = browserSync.reload;

// Handle fonts
function fonts() {
	return gulp.src('src/fonts/**/*')
		.pipe(gulp.dest('assets/fonts'));
}

// Handle SCSS
function scss() {
	return gulp.src([
		'vendor/*.css',
		'src/scss/**/*.scss'
	])
		.pipe($.plumber())
		.pipe($.stylelint({
			failAfterError: true,
			reporters: [
				{formatter: 'string', console: true}
			]
		}))
		.pipe($.sourcemaps.init())
		.pipe($.sass.sync({
			outputStyle: 'expanded',
			precision: 10,
			includePaths: ['.', './vendor']
		}).on('error', $.sass.logError))
		.pipe($.autoprefixer())
		.pipe($.concat('style.css'))
		.pipe($.sourcemaps.write('.'))
		.pipe(gulp.dest('.'))
		.pipe(reload({ stream: true }));
}

// Minify CSS
function cssMinify() {
	return gulp.src(['*.css'])
		.pipe($.csso())
		.pipe(gulp.dest('.'));
}

// Compile JS
function jsBabel() {
	return gulp.src([
		'src/js/**/*.js'
	])
		.pipe($.plumber())
		.pipe($.eslint())
		.pipe($.eslint.format())
		.pipe($.eslint.results(results => {
			// Called once for all ESLint results.
			console.log(`Total Results: ${results.length}`);
			console.log(`Total Warnings: ${results.warningCount}`);
			console.log(`Total Errors: ${results.errorCount}`);
		}))
		.pipe($.babel({presets: ['@babel/env', {'sourceType': "script"}]}))
		.on('error', function (err) {
			console.log(chalk.red('[Error]'), err.toString());
		})
		.pipe(gulp.dest('assets/js'));
}


// Compile and uglify JS
function jsUglify() {
	return gulp.src([
		'src/js/**/*.js'
	])
		.pipe($.plumber())
		.pipe($.babel({presets: ['@babel/env']}))
		.pipe(uglify())
		.on('error', function (err) {
			console.log(chalk.red('[Error]'), err.toString());
		})
		.pipe(gulp.dest('assets/js'));
}

// Concat JS
function jsConcat() {
	return gulp.src([
		'vendor/*.js',
		'node_modules/bootstrap/dist/js/bootstrap.bundle.min.js',
		// 'node_modules/bootstrap-select/dist/js/bootstrap-select.min.js',
		// 'node_modules/jquery-match-height/dist/jquery.matchHeight-min.js',
		'assets/js/main.js',
	])
		.pipe($.plumber()) 
		.pipe($.concat('main.js'))
		.pipe(gulp.dest('assets/js'));
}

// Optimize images
function images() {
	return gulp.src(['src/img/**/*', '!src/img/svg-sprite/**/*'])
		.pipe($.cache($.imagemin([
			$.imagemin.mozjpeg({quality: 75, progressive: true}),
			$.imagemin.optipng({optimizationLevel: 5}),
			$.imagemin.svgo({
				plugins: [
					{removeViewBox: false}
				]
			})
		])
			.on('error', function (err) {
				console.log(chalk.red('[Error]'), err.toString());
				this.end();
			})))
		.pipe(gulp.dest('assets/img'));
}

// Generate SVG sprite
function svgSprite() {
	return gulp.src('src/img/svg-sprite/**/*.svg')
		.pipe($.rename(function (file) {
			var name = file.dirname.split(path.sep);
			name.push(file.basename);
			file.basename = 'svg-' + name.join('-');
		}))
		.pipe($.svgstore({ inlineSvg: true }))
		.pipe($.cheerio({
			run: function ($) {
				$('svg').attr('style', 'display:none');
			},
			parserOptions: { xmlMode: true }
		}))
		.on('error', function (err) {
			console.log(chalk.red('[Error]'), err.toString());
			this.end();
		})
		.pipe($.concat('svg-sprite.svg'))
		.pipe(gulp.dest('assets/img'));
}

function clearCache(done) {
	$.cache.clearAll();
	done();
}

function clean() {
	return del(['assets']);
}

function php(done) {
	connect.server({ port: 8010, keepalive: true, stdio: 'ignore'});
	done();
}

function watchFiles() {
	gulp.watch('src/scss/**/*.scss', scss);
	gulp.watch('src/js/**/*.js', gulp.series(jsBabel, jsConcat));
	gulp.watch('src/img/**/*', gulp.series(images, svgSprite));
}

function browse() {
	browserSync.init({
		notify: false,
		open: true,
		proxy: 'localhost:8010',
		port: 8080
	});

	gulp.watch([
		'src/scss/**/*.scss',
		'src/js/**/*.js',
		'src/img/**/*',
		'**/*.php'
	]).on('change', reload);
}

const server = gulp.parallel([watchFiles, php, browse]);

function build() {
	return gulp.src('assets/**/*').pipe($.size({ title: 'build', gzip: true }));
}

// clear image cache
exports.clearCache = clearCache;

// delete assets folder
exports.clean = clean;

// generate SVG sprite
exports.svgSprite = gulp.series(images, svgSprite);

// watch and process files without creating server
exports.watch = gulp.series(clean, images, svgSprite, fonts, scss, jsBabel, jsConcat, watchFiles);

// watch and process files, and create a server to preview php files
exports.serve = gulp.series(clean, images, svgSprite, fonts, scss, jsBabel, jsConcat, server);

// delete assets folder and build everything for prod
exports.default = exports.build = gulp.series(clearCache, clean, images, svgSprite, fonts, scss, cssMinify, jsUglify, jsConcat, build);
