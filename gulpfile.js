
"use strict";

const	path = require("path"),
		gulp = require("gulp"),
		jshint = require('gulp-jshint');

gulp.task("lint-root", function() {
	return gulp.src(path.join(__dirname, '*.js')).pipe(jshint());
}).task("lint-database", function() {
	return gulp.src(path.join(__dirname, 'database', '*.js')).pipe(jshint());
}).task("lint-tests", function() {
	return gulp.src(path.join(__dirname, 'tests', '*.js')).pipe(jshint());
}).task("lint", ["lint-root", "lint-database", "lint-tests"], function() {});

gulp.task("default", ["lint"], function() {
	
});
