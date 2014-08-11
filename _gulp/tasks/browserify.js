'use strict';

var gulp = require('gulp');
var watch = require('gulp-watch');
var browserify = require('browserify');
var source = require('vinyl-source-stream');

gulp.task('browserify', function() {
	return browserify('./_src/js/app.js')
		.bundle()
		.pipe(source('app.js'))
		.pipe(gulp.dest('./js/'));
});

gulp.task('watch-browserify', function () {
	watch({
		glob: './_src/js/**/*.js'
	}, function (files) {
		gulp.start('browserify');
    });
});
