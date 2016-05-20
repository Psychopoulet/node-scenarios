"use strict";

// deps

	const 	path = require('path'),
			assert = require('assert'),
			fs = require('fs'),
			
			SimpleScenarios = require('../main.js');

// private

	var _dbFile = path.join(__dirname, '..', 'database', 'database.sqlite3');

	function _databaseExists(callback) {

		fs.stat(_dbFile, function(err, stats) {
			callback(!err && stats && stats.isFile());
		});

	}

// tests

describe('init', function() {

	before(function() {
		return SimpleScenarios.delete();
	});

	it('should create database', function(done) {

		SimpleScenarios.init().then(function (container) {

			_databaseExists(function(exists) {

				assert.strictEqual(true, exists, "Database was not created.");

				assert.strictEqual(true, container.has('scenarios'), "Scenarios is not instancied");
				assert.strictEqual(true, container.get('scenarios') instanceof require(path.join(__dirname, '..', 'database', 'scenarios.js')), "Scenarios is not a correct instance");

				assert.strictEqual(true, container.has('triggers'), "Triggers is not instancied");
				assert.strictEqual(true, container.get('triggers') instanceof require(path.join(__dirname, '..', 'database', 'triggers.js')), "Triggers is not a correct instance");

				assert.strictEqual(true, container.has('actions'), "Actions is not instancied");
				assert.strictEqual(true, container.get('actions') instanceof require(path.join(__dirname, '..', 'database', 'actions.js')), "Actions is not a correct instance");
				assert.strictEqual(true, container.has('actionstypes'), "ActionsTypes is not instancied");
				assert.strictEqual(true, container.get('actionstypes') instanceof require(path.join(__dirname, '..', 'database', 'actionstypes.js')), "ActionsTypes is not a correct instance");

				done();
				
			});

		}).catch(done);

	}).timeout(5000);

});

require(path.join(__dirname, 'testsScenarios.js'));
require(path.join(__dirname, 'testsTriggers.js'));
require(path.join(__dirname, 'testsActionsTypes.js'));
require(path.join(__dirname, 'testsActions.js'));

describe('delete', function() {

	it('should delete database', function() {
		return SimpleScenarios.delete();
	});

});
