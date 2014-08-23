'use strict';

var browserify = require('browserify');
var gulp = require('gulp');
var header = require('gulp-header');
var rename = require('gulp-rename');
var transform = require('vinyl-transform');
var uglify = require('gulp-uglify');
var watch = require('gulp-watch');

gulp.task('browserify', function() {

	var browserified = transform(function(filename) {
		var b = browserify(filename);
		return b.bundle();
	});

	return gulp.src(['./_src/js/main.js'])
		.pipe(browserified)
		.pipe(rename({suffix: '.built'}))
		// .pipe(uglify())
		.pipe(header('/* BUILT FILE DO NOT EDIT */\n\n'))
		.pipe(gulp.dest('./js/'));
});

gulp.task('watch-browserify', function () {
	watch({
		glob: './_src/js/**/*.js'
	}, function (files) {
		gulp.start('browserify');
    });
});
