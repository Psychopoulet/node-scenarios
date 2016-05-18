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

	function _deleteDatabase(callback) {

		_databaseExists(function(exists) {

			if (!exists) {
				callback();
			}
			else {

				SimpleScenarios.release().then(function() {
					fs.unlink(_dbFile, callback);
				}).catch(callback);

			}
			
		});

	}

// tests

describe('init', function() {

	before(function(done) {
		_deleteDatabase(done);
	});

	it('should create database', function(done) {

		SimpleScenarios.init().then(function (container) {

			_databaseExists(function(exists) {

				assert.strictEqual(true, exists, "Database was not created.");
				
				assert.strictEqual(true, container.has('actions'), "Action is not instancied");
				assert.strictEqual(true, container.get('actions') instanceof require(path.join(__dirname, '..', 'database', 'actions.js')), "Action is not a correct instance");

				assert.strictEqual(true, container.has('actionstypes'), "ActionType is not instancied");
				assert.strictEqual(true, container.get('actionstypes') instanceof require(path.join(__dirname, '..', 'database', 'actionstypes.js')), "ActionType is not a correct instance");

				done();
				
			});

		}).catch(done);

	});

});

require(path.join(__dirname, 'testsTriggersTypes.js'));
require(path.join(__dirname, 'testsTriggers.js'));

require(path.join(__dirname, 'testsActionsTypes.js'));
require(path.join(__dirname, 'testsActions.js'));

describe('delete', function() {

	it('should delete database', function(done) {
		_deleteDatabase(done);
	});

});
