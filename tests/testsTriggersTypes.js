"use strict";

// deps

	const 	path = require('path'),
			assert = require('assert'),
			
			SimpleScenarios = require('../main.js');

// tests

describe('triggerstypes', function() {

	let container;

	it('should init module', function(done) {

		SimpleScenarios.init().then(function (_container) {
			container = _container;
			done();
		}).catch(done);

	});

	it('should create data', function(done) {

		container.get('triggerstypes').add({
			'code': 'test',
			'name': 'test'
		}).then(function(triggertype) {
			assert.strictEqual('test', triggertype.code, "TriggerType added is not valid (code)");
			assert.strictEqual('test', triggertype.name, "TriggerType added is not valid (name)");
			done();
		}).catch(done);

	});

	it('should return the last inserted data', function(done) {

		container.get('triggerstypes').lastInserted().then(function(triggertype) {
			assert.strictEqual('test', triggertype.code, "TriggerType added is not valid (code)");
			assert.strictEqual('test', triggertype.name, "TriggerType added is not valid (name)");
			done();
		}).catch(done);

	});

	it("should return all the data with the code 'test'", function(done) {

		container.get('triggerstypes').search({ 'code': 'test' }).then(function(triggerstypes) {
			assert.strictEqual(1, triggerstypes.length, "TriggersTypes returned are not valid");
			done();
		}).catch(done);

	});

	it("should return all the data with the name 'test'", function(done) {

		container.get('triggerstypes').search({ 'name': 'test' }).then(function(triggerstypes) {
			assert.strictEqual(1, triggerstypes.length, "TriggersTypes returned are not valid");
			done();
		}).catch(done);

	});

	it("should return one data with the name 'test'", function(done) {

		container.get('triggerstypes').searchOne({ 'name': 'test' }).then(function(triggertype) {
			assert.notStrictEqual(null, triggertype, "TriggerType returned is not valid");
			done();
		}).catch(done);

	});

	it("should edit last inserted data", function(done) {

		container.get('triggerstypes').lastInserted().then(function(triggertype) {
			triggertype.code = 'test2';
			triggertype.name = 'test2';
			return container.get('triggerstypes').edit(triggertype);
		}).then(function(triggertype) {
			assert.strictEqual('test2', triggertype.code, "TriggerType added is not valid (code)");
			assert.strictEqual('test2', triggertype.name, "TriggerType added is not valid (name)");
			done();
		}).catch(done);

	});

	it("should delete last inserted data", function(done) {

		container.get('triggerstypes').lastInserted().then(function(triggertype) {
			return container.get('triggerstypes').delete(triggertype);
		}).then(function() {
			return container.get('triggerstypes').lastInserted();
		}).then(function(triggertype) {
			assert.strictEqual(null, triggertype, "TriggerType returned is not valid");
			done();
		}).catch(done);

	});

});
