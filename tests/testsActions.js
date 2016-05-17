"use strict";

// deps

	const 	path = require('path'),
			assert = require('assert'),
			
			SimpleScenarios = require('../main.js');

// private

	var _dbFile = path.join(__dirname, '..', 'database', 'database.sqlite3');

// tests

describe('actions', function() {

	let container;

	it('should init module', function(done) {

		SimpleScenarios.init().then(function (_container) {
			container = _container;
			done();
		}).catch(done);

	});

	it('should create data', function(done) {

		container.get('actionstypes').add({
			'code': 'code',
			'name': 'test'
		}).then(function(actiontype) {

			return container.get('actions').add({
				'type': actiontype,
				'name': 'test',
				'params': '{"test": "test"}'
			});

		}).then(function(action) {

			assert.strictEqual('test', action.name, "Action added is not valid (name)");
			assert.deepStrictEqual({"test": "test"}, action.params, "Action added is not valid (params)");

			done();

		}).catch(done);

	});

	it('should return the last inserted data', function(done) {

		container.get('actions').lastInserted().then(function(action) {

			assert.strictEqual('test', action.name, "Action added is not valid (name)");
			assert.deepStrictEqual({"test": "test"}, action.params, "Action added is not valid (params)");

			done();

		}).catch(done);

	});

	it("should return all the data with the name 'test'", function(done) {

		container.get('actions').search({ 'name': 'test' }).then(function(actions) {

			assert.strictEqual(1, actions.length, "Actions returned are not valid");
			done();

		}).catch(done);

	});

	it("should return all the data with the action type having the name 'test'", function(done) {

		container.get('actions').search({ 'type': { 'name': 'test' } }).then(function(actions) {

			assert.strictEqual(1, actions.length, "Actions returned are not valid");
			done();

		}).catch(done);

	});

	it("should return all the data with the action type having the code 'code'", function(done) {

		container.get('actions').search({ 'type': { 'code': 'code' } }).then(function(actions) {

			assert.strictEqual(1, actions.length, "Actions returned are not valid");
			done();

		}).catch(done);

	});

	it("should return one data with the name 'test'", function(done) {

		container.get('actions').searchOne({ 'name': 'test' }).then(function(action) {

			assert.notStrictEqual(null, action, "Action returned is not valid");
			done();

		}).catch(done);

	});

	it("should delete last inserted data", function(done) {

		container.get('actions').lastInserted().then(function(action) {
			return container.get('actions').delete(action);
		}).then(function() {
			return container.get('actions').lastInserted();
		}).then(function(action) {

			assert.strictEqual(null, action, "Action returned is not valid");
			done();

		}).catch(done);

	});

});
