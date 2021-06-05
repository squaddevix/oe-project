'use strict';

var gulp = require('gulp'),
	handlebars = require('gulp-compile-handlebars'),
	concat = require('gulp-concat'),
	changed = require('gulp-changed'),
	cleanCSS = require('gulp-clean-css'),
	rename = require('gulp-rename'),
	// notify = require('gulp-notify'),
	autoprefixer = require('gulp-autoprefixer'),
	connect = require('gulp-connect'),
	livereload = require('gulp-livereload'),
	sass = require('gulp-sass'),
	ftp = require('gulp-ftp'),
	gulpif = require('gulp-if');

var deploy = false;
var ftp_options = {
	user: 'demo',
	pass: 'qweer',
	host: 'site.com'
};

gulp.task('connect', function() {
	connect.server({
		root: 'dist',
		livereload: true
	});
});

gulp.task('html', function () {
	return gulp.src('src/*.html')
		.pipe(changed('dist/'))
		.pipe(gulp.dest('dist/'))
		.pipe(connect.reload())
		// .pipe(notify('HTML done!'));
});

//start handlebars
var handlebars_options = {
	ignorePartials: true, //ignores the unknown footer2 partial in the handlebars template, defaults to false 
	batch : ['src/layouts/partials'],
	helpers : {
		//тут могут быть хелперы (примеры http://handlebarsjs.com/expressions.html)
		repeat: function(n, block) { //http://stackoverflow.com/questions/11924452/iterating-over-basic-for-loop-using-handlebars-js
			var accum = '';
			for(var i = 0; i < n; ++i) {
				accum += block.fn(i);
			}
			return accum;
		}

	}
}
gulp.task('handlebars_main', function () { //в этом таске компилятся страницы, которые были измененые (исп-я ф-я changed)
	return gulp.src('src/layouts/*.html')
		.pipe(changed('dist/'))
		.pipe(handlebars('', handlebars_options)) //первым параметром можно передать объект (пример на https://www.npmjs.com/package/gulp-compile-handlebars)
		.pipe(gulp.dest('dist/'))
		.pipe(connect.reload())
		// .pipe(notify('Task Handlebars Main Complete!'));
});
gulp.task('handlebars_partials', function () { //после изменения темплейтов (header, footer) запускается этот таск, который компилит все страницы
	return gulp.src('src/layouts/*.html')
		.pipe(handlebars('', handlebars_options))
		.pipe(gulp.dest('dist/'))
		.pipe(connect.reload())
		// .pipe(notify('Task Handlebars Partials Complete!'));
});
//end handlebars

gulp.task('css', function () {
	gulp.src('src/css/**/*.css')
		.pipe(concat('_plugins.scss'))
		.pipe(gulp.dest('src/scss/includes/'))

	gulp.src('src/scss/**/*.scss')
		.pipe(sass({
			outputStyle: 'expanded',
			indentWidth: 1,
			indentType: 'tab'
		}).on('error', sass.logError))
		.pipe(autoprefixer({
			browsers: ['last 2 versions'],
			cascade: true
		}))
		.pipe(gulp.dest('dist/css/'))
		.pipe(connect.reload())
		// .pipe(notify('Task CSS Complete!'));
});
gulp.task('scss', function () {
	// return gulp.src('src/scss/*.scss')
	return gulp.src('src/scss/**/*.scss')
		.pipe(sass({
			outputStyle: 'expanded',
			indentWidth: 1,
			indentType: 'tab'
		}).on('error', sass.logError))
		.pipe(autoprefixer({
			browsers: ['last 2 versions'],
			cascade: true
		}))
		.pipe(gulp.dest('dist/css/'))
		.pipe(connect.reload())
		// .pipe(notify('Task SCSS Complete!'))

		.pipe(gulpif(deploy === true, 
			ftp({
				host: ftp_options.host,
				user: ftp_options.user,
				pass: ftp_options.pass,
				remotePath: 'css/'
			})
		));
});

gulp.task('js_plugins', function() {
	return gulp.src(['src/js/**/*.js', '!' + 'src/js/main.js']) //исключить файл main.js
		.pipe(concat('assets.js'))
		.pipe(gulp.dest('dist/js/'))
		.pipe(connect.reload())
		// .pipe(notify("Task JS Plugins Complete!"))

		.pipe(gulpif(deploy === true, 
			ftp({
				host: ftp_options.host,
				user: ftp_options.user,
				pass: ftp_options.pass,
				remotePath: 'js/'
			})
		));
});
gulp.task('js_main', function() {
	return gulp.src('src/js/main.js')
		.pipe(gulp.dest('dist/js/'))
		.pipe(connect.reload())
		// .pipe(notify("Task JS Main Complete!"))

		.pipe(gulpif(deploy === true, 
			ftp({
				host: ftp_options.host,
				user: ftp_options.user,
				pass: ftp_options.pass,
				remotePath: 'js/'
			})
		));
});


gulp.task('watch', function () {
	gulp.watch('src/css/**/*.css', ['css']);
	gulp.watch('src/scss/**/*.scss', ['scss']);
	gulp.watch('src/*.html', ['html']);
	gulp.watch('src/layouts/*.html', ['handlebars_main']);
	gulp.watch('src/layouts/partials/*.html', ['handlebars_partials']);
	gulp.watch(['src/js/**/*.js', '!' + 'src/js/main.js'], ['js_plugins']); //исключить файл main.js
	gulp.watch('src/js/main.js', ['js_main']);
});

gulp.task('default', ['connect', 'watch']);