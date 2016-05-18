"use strict";

// deps

	const 	path = require('path'),
			assert = require('assert'),
			
			SimpleScenarios = require('../main.js');

// tests

describe('actionstypes', function() {

	let container;

	it('should init module', function(done) {

		SimpleScenarios.init().then(function (_container) {
			container = _container;
			done();
		}).catch(done);

	});

	it('should create data', function(done) {

		container.get('actionstypes').add({
			'name': 'test'
		}).then(function(actiontype) {
			assert.strictEqual('test', actiontype.name, "ActionType added is not valid");
			done();
		}).catch(done);

	});

	it('should return the last inserted data', function(done) {

		container.get('actionstypes').lastInserted().then(function(actiontype) {
			assert.strictEqual('test', actiontype.name, "ActionType added is not valid");
			done();
		}).catch(done);

	});

	it("should return all the data with the name 'test'", function(done) {

		container.get('actionstypes').search({ 'name': 'test' }).then(function(actionstypes) {
			assert.strictEqual(1, actionstypes.length, "ActionsTypes returned are not valid");
			done();
		}).catch(done);

	});

	it("should return one data with the name 'test'", function(done) {

		container.get('actionstypes').searchOne({ 'name': 'test' }).then(function(actiontype) {
			assert.notStrictEqual(null, actiontype, "ActionType returned is not valid");
			done();
		}).catch(done);

	});

	it("should edit last inserted data", function(done) {

		container.get('actionstypes').lastInserted().then(function(actiontype) {
			actiontype.name = 'test2';
			return container.get('actionstypes').edit(actiontype);
		}).then(function(actiontype) {
			assert.strictEqual('test2', actiontype.name, "ActionType returned is not valid");
			done();
		}).catch(done);

	});

	it("should delete last inserted data", function(done) {

		container.get('actionstypes').lastInserted().then(function(actiontype) {
			return container.get('actionstypes').delete(actiontype);
		}).then(function() {
			return container.get('actionstypes').lastInserted();
		}).then(function(actiontype) {
			assert.strictEqual(null, actiontype, "ActionType returned is not valid");
			done();
		}).catch(done);

	});

});
