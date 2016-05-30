
"use strict";

// deps

	const path = require("path"),

		del = require("del"),
		isparta = require("isparta"),
		gulp = require("gulp"),
		babel = require("gulp-babel"),
		eslint = require("gulp-eslint"),
		excludeGitignore = require("gulp-exclude-gitignore"),
		istanbul = require("gulp-istanbul"),
		mocha = require("gulp-mocha"),
		nsp = require("gulp-nsp"),
		plumber = require("gulp-plumber");

	require("babel-core/register");

// private

	var _libFiles = path.join(__dirname, "lib", "**", "*.js"),
		_testsFiles = path.join(__dirname, "test", "**", "*.js");

// tasks

	// tests

		// eslint

		gulp.task("eslint", function () {

			return gulp.src(path.join(__dirname, "**", "*.js"))
				.pipe(excludeGitignore())
				.pipe(eslint({
					"rules": {
						"indent": 0
					},
					"env": {
						"node": true, "es6": true, "mocha": true
					},
					"extends": "eslint:recommended"
				}))
				.pipe(eslint.format())
				.pipe(eslint.failAfterError());

		});

	gulp.task("pre-test", function () {

		return gulp.src(_libFiles)
			.pipe(excludeGitignore())
			.pipe(istanbul({
				includeUntested: true,
				instrumenter: isparta.Instrumenter
			}))
			.pipe(istanbul.hookRequire());

	});

	gulp.task("test", ["pre-test"], function (cb) {

		let mochaErr;

		gulp.src(_testsFiles)
			.pipe(plumber())
			.pipe(mocha({reporter: "spec"}))
			.on("error", function (err) { mochaErr = err; })
			.pipe(istanbul.writeReports())
			.on("end", function () { cb(mochaErr); });

	});

	// compile

		gulp.task("nsp", function (cb) {
			nsp({ package: path.resolve("package.json") }, cb);
		});

		gulp.task("clean", function () {
			return del("dist");
		});

		gulp.task("babel", ["clean"], function () {

			return gulp.src(_libFiles)
				.pipe(babel({ sourceMap: false }))
				.pipe(gulp.dest("dist"));

		});

		gulp.task("prepublish", ["nsp", "babel"]);

// watcher

	gulp.task("watch", function () {
		gulp.watch([_libFiles, _testsFiles], ["test"]);
	});

// default

	gulp.task("default", ["eslint", "test"]);
