'use strict';

var gulp = require('gulp'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify'),
	rename = require('gulp-rename'),
	sass = require('gulp-ruby-sass'),
	plumber = require('gulp-plumber'),
	livereload = require('gulp-livereload'),
	inject = require('gulp-inject'),
	bowerFiles = require('main-bower-files'),
	es = require('event-stream'),
	nodemon = require('gulp-nodemon'),
	notify = require('gulp-notify'),
	jshint = require('gulp-jshint');

function handleError(error) {
	console.error.bind(error);
	this.emit('end');
}

gulp.task('script', function() {
	gulp.src('public/**/*.js')
		.pipe(plumber()) //handle error with plumber
		.pipe(concat('main.js'))
		.pipe(rename({suffix: '.min'}))
        .pipe(uglify())
        .pipe(gulp.dest('build/js'));
});

gulp.task('styles', function() {
	return sass('public/sass/**/*.scss', {style: 'compressed'})
		.on('error', handleError) //handle error function
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest('build/css/'));
});


//Watch
gulp.task('watch', function () {

	// livereload.listen();

	gulp.watch('public/**/*.js', ['script']);
	gulp.watch('public/sass/**/*.scss', ['styles']);
});

gulp.task('index', function() {
	var target = './public/index.html',
		jsrc = ['./public/**/*.js', '!./public/bower_components/**/*'],
		bowersrc = bowerFiles();

	gulp.src(target)
		.pipe(inject(gulp.src(jsrc, {read:false}), {ignorePath: 'public/', addRootSlash: false}))
		.pipe(gulp.dest('public'))
		.pipe(inject(gulp.src(bowersrc, {read: false}), {name: 'bower', ignorePath: 'public/', addRootSlash: false}))
		.pipe(gulp.dest('public'));

});

gulp.task('lint', function () {
  gulp.src(['./public/**/*.js', '!./node_modules/**/*','!./public/bower_components/**/*'])
    .pipe(jshint())
    .pipe(jshint.reporter('default', { verbose: true }))
});

gulp.task('serve', function () {
	livereload.listen();
  	nodemon({
    	script: 'server.js'
  		, ext: 'js html'
  		, env: { 'NODE_ENV': 'development' }
 	}).on('restart', function() {
 		gulp.src('server.js')
 			.pipe(livereload())
 			.pipe(notify('Reload Page...'))
 	});
});

gulp.task('default', ['index', 'serve']);