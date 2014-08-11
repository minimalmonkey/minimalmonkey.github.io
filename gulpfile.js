'use strict';

var gulp =       require('gulp');
var sass =       require('gulp-ruby-sass');
var prefix =     require('gulp-autoprefixer');
var watch =      require('gulp-watch');
var browserify = require('browserify');
var source =     require('vinyl-source-stream');

gulp.task('default', function() {
	gulp.start('sass');
	gulp.start('browserify');
});

gulp.task('sass', function () {
	gulp.src('./_src/scss/*.scss')
		.pipe(sass({
			style: 'compressed'
		}))
		.pipe(gulp.dest('./css'))
		.pipe(prefix("last 1 version", "> 1%", "ie 8", "ie 7"))
		.pipe(gulp.dest('./css/'));
});

gulp.task('watch-sass', function () {
    watch({glob: './_src/scss/**/*.scss'}, function (files) {
        gulp.start('sass');
    });
});

gulp.task('browserify', function() {
	return browserify('./_src/js/app.js')
		.bundle()
		.pipe(source('app.js'))
		.pipe(gulp.dest('./js/'));
});

gulp.task('watch-browserify', function () {
    watch({glob: './_src/js/**/*.js'}, function (files) {
        gulp.start('browserify');
    });
});
