var gulp = require('gulp');
var prefix = require('gulp-autoprefixer');
var sass = require('gulp-sass');
var watch = require('gulp-watch');

gulp.task('default', function() {
	gulp.start('sass');
});

gulp.task('sass', function () {
	gulp.src('./_src/scss/*.scss')
		.pipe(sass())
		.pipe(gulp.dest('./css'))
		.pipe(prefix("last 1 version", "> 1%", "ie 8", "ie 7"))
		.pipe(gulp.dest('./css/'));
});

gulp.task('watch-sass', function () {
    watch({glob: './_src/scss/**/*.scss'}, function (files) {
        gulp.start('sass');
    });
});
