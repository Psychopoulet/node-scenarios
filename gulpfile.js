
"use strict";

// deps

	const	path = require("path"),
			gulp = require("gulp"),
			gulpsync = require('gulp-sync')(gulp),
			jshint = require('gulp-jshint'),
			mocha = require('gulp-mocha');

// private

	var _jshintOptions = {
		"strict": "global",
		"esversion": 6,
		"globals": {'require': false, 'module': false, '__dirname': false, 'describe': false, 'before': false, 'after': false, 'it': false}
	};

// run

	// jshint

	gulp.task("lint-root", function() {

		return gulp .src(path.join(__dirname, '*.js'))
					.pipe(jshint(_jshintOptions))
					.pipe(jshint.reporter('default', { verbose: true }));

	}).task("lint-database", function() {

		return gulp .src(path.join(__dirname, 'database', '*.js'))
					.pipe(jshint(_jshintOptions))
					.pipe(jshint.reporter('default', { verbose: true }));

	}).task("lint-tests", function() {

		return gulp .src(path.join(__dirname, 'tests', '*.js'))
					.pipe(jshint(_jshintOptions))
					.pipe(jshint.reporter('default', { verbose: true }));

	}).task("lint", gulpsync.sync([
		"lint-root", "lint-database", "lint-tests"
	]));

	// mocha

	gulp.task("mocha-main", function() {

		return gulp .src(path.join(__dirname, 'tests', 'testsMain.js'), { read: false })
					.pipe(mocha());

	}).task("mocha-triggers", function() {

		return gulp .src(path.join(__dirname, 'tests', 'testsTriggers.js'), { read: false })
					.pipe(mocha());

	}).task("mocha-scenarios", function() {

		return gulp .src(path.join(__dirname, 'tests', 'testsScenarios.js'), { read: false })
					.pipe(mocha());

	}).task("mocha-actionstypes", function() {

		return gulp .src(path.join(__dirname, 'tests', 'testsActionsTypes.js'), { read: false })
					.pipe(mocha());

	}).task("mocha-actions", function() {

		return gulp .src(path.join(__dirname, 'tests', 'testsActions.js'), { read: false })
					.pipe(mocha());

	}).task("mocha-conditionstypes", function() {

		return gulp .src(path.join(__dirname, 'tests', 'testsConditionsTypes.js'), { read: false })
					.pipe(mocha());

	}).task("mocha-conditions", function() {

		return gulp .src(path.join(__dirname, 'tests', 'testsConditions.js'), { read: false })
					.pipe(mocha());

	}).task("mocha-execute", function() {

		return gulp .src(path.join(__dirname, 'tests', 'testsExecute.js'), { read: false })
					.pipe(mocha());

	}).task("mocha", gulpsync.sync([
		"mocha-main", "mocha-triggers", "mocha-scenarios", "mocha-actionstypes", "mocha-actions", "mocha-conditionstypes", "mocha-conditions", "mocha-execute"
	]));

	// default

	gulp.task("default", gulpsync.sync(["lint", "mocha"]));
