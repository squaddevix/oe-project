const { watch, src, dest } = require('gulp'),
handlebars = require('gulp-compile-handlebars'),
concat = require('gulp-concat'),
changed = require('gulp-changed'),
cleanCSS = require('gulp-clean-css'),
rename = require('gulp-rename'),
autoprefixer = require('gulp-autoprefixer'),
connect = require('gulp-connect'),
livereload = require('gulp-livereload'),
sass = require('gulp-sass'),
gulpif = require('gulp-if');


connect.server({
	root: 'dist',
	livereload: true
});

function html() {
	return src('src/*.html')
		.pipe(changed('dist/'))
		.pipe(dest('dist/'))
		.pipe(connect.reload());
};

//start handlebars
let handlebars_options = {
	ignorePartials: true, //ignores the unknown footer2 partial in the handlebars template, defaults to false 
	batch : ['src/layouts/partials'],
	helpers : {
		//тут могут быть хелперы (примеры http://handlebarsjs.com/expressions.html)
		repeat: function(n, block) { //http://stackoverflow.com/questions/11924452/iterating-over-basic-for-loop-using-handlebars-js
			let accum = '';
			for(var i = 0; i < n; ++i) {
				accum += block.fn(i);
			}
			return accum;
		}
	}
}

function handlebars_main() { //в этом таске компилятся страницы, которые были измененые (исп-я ф-я changed)
	return src('src/layouts/*.html')
		.pipe(changed('dist/'))
		.pipe(handlebars('', handlebars_options)) //первым параметром можно передать объект (пример на https://www.npmjs.com/package/gulp-compile-handlebars)
		.pipe(dest('dist/'))
		.pipe(connect.reload());
};

function handlebars_partials() { //после изменения темплейтов (header, footer) запускается этот таск, который компилит все страницы
	return src('src/layouts/*.html')
		.pipe(handlebars('', handlebars_options))
		.pipe(dest('dist/'))
		.pipe(connect.reload());
};
//end handlebars

function css() {
	return src('src/css/**/*.css')
		.pipe(concat('_plugins.scss'))
		.pipe(dest('src/scss/includes/'))
		
};

function scss() {
	return src('src/scss/**/*.scss')
		.pipe(sass({
			outputStyle: 'expanded',
			indentWidth: 1,
			indentType: 'tab'
		}).on('error', sass.logError))
		.pipe(autoprefixer({
			Browserslist: ['last 2 versions'],
			cascade: true
		}))
		.pipe(dest('dist/css/'))
		.pipe(connect.reload());
};

function js_plugins() {
	return src(['src/js/**/*.js', '!' + 'src/js/main.js']) //исключить файл main.js
		.pipe(concat('assets.js'))
		.pipe(dest('dist/js/'))
		.pipe(connect.reload());
};

function js_main() {
	return src('src/js/main.js')
		.pipe(dest('dist/js/'))
		.pipe(connect.reload());
};

async function asyncAwaitTask() {
	watch('src/css/**/*.css', css);
	watch('src/scss/**/*.scss', scss);
	watch('src/*.html', html);
	watch('src/layouts/*.html', handlebars_main);
	watch('src/layouts/partials/*.html', handlebars_partials);
	watch(['src/js/**/*.js', '!' + 'src/js/main.js'], js_plugins); //исключить файл main.js
	watch('src/js/main.js', js_main);
}


exports.default = asyncAwaitTask;