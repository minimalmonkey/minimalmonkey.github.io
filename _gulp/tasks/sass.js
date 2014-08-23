'use strict';

var gulp = require('gulp');
var header = require('gulp-header');
var prefix = require('gulp-autoprefixer');
var rename = require('gulp-rename');
var sass = require('gulp-ruby-sass');
var watch = require('gulp-watch');

gulp.task('default', function() {
	gulp.start('sass');
	gulp.start('browserify');
});

gulp.task('sass', function () {
	gulp.src('./_src/scss/style.scss')
		.pipe(sass())
		.pipe(rename({suffix: '.built'}))
		.pipe(header('/* BUILT FILE DO NOT EDIT */\n\n'))
		.pipe(prefix("last 1 version", "> 1%", "ie 8", "ie 7"))
        .pipe(gulp.dest('./css/'));
});

gulp.task('watch-sass', function () {
	watch({
		glob: './_src/scss/**/*.scss'
	}, function (files) {
		gulp.start('sass');
	});
});
