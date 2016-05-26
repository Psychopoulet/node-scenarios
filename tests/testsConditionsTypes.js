"use strict";

// deps

	const 	assert = require('assert'),
			SimpleScenarios = require('../main.js');

// tests

describe('conditionstypes', function() {

	let container;

	before(function() {

		return SimpleScenarios.delete().then(function () {
			return SimpleScenarios.init();
		}).then(function (_container) {
			container = _container;
		});

	});

	after(function() {
		return SimpleScenarios.delete();
	});

	it('should create data', function(done) {

		container.get('conditionstypes').add({
			'code': 'test',
			'name': 'test'
		}).then(function(actiontype) {
			assert.strictEqual('test', actiontype.code, "ConditionType added is not valid (code)");
			assert.strictEqual('test', actiontype.name, "ConditionType added is not valid (name)");
			done();
		}).catch(done);

	});

	it('should return the last inserted data', function(done) {

		container.get('conditionstypes').lastInserted().then(function(actiontype) {
			assert.strictEqual('test', actiontype.code, "ConditionType added is not valid (code)");
			assert.strictEqual('test', actiontype.name, "ConditionType added is not valid (name)");
			done();
		}).catch(done);

	});

	it("should return all the data with the code 'test'", function(done) {

		container.get('conditionstypes').search({ 'code': 'test' }).then(function(conditionstypes) {
			assert.strictEqual(1, conditionstypes.length, "ConditionsTypes returned are not valid");
			done();
		}).catch(done);

	});

	it("should return all the data with the name 'test'", function(done) {

		container.get('conditionstypes').search({ 'name': 'test' }).then(function(conditionstypes) {
			assert.strictEqual(1, conditionstypes.length, "ConditionsTypes returned are not valid");
			done();
		}).catch(done);

	});

	it("should return one data with the name 'test'", function(done) {

		container.get('conditionstypes').searchOne({ 'name': 'test' }).then(function(actiontype) {
			assert.notStrictEqual(null, actiontype, "ConditionType returned is not valid");
			done();
		}).catch(done);

	});

	it("should edit last inserted data", function(done) {

		container.get('conditionstypes').lastInserted().then(function(actiontype) {
			actiontype.code = 'test2';
			actiontype.name = 'test2';
			return container.get('conditionstypes').edit(actiontype);
		}).then(function(actiontype) {
			assert.strictEqual('test2', actiontype.code, "ConditionType added is not valid (code)");
			assert.strictEqual('test2', actiontype.name, "ConditionType added is not valid (name)");
			done();
		}).catch(done);

	});

	it("should delete last inserted data", function(done) {

		container.get('conditionstypes').lastInserted().then(function(actiontype) {
			return container.get('conditionstypes').delete(actiontype);
		}).then(function() {
			return container.get('conditionstypes').lastInserted();
		}).then(function(actiontype) {
			assert.strictEqual(null, actiontype, "ConditionType returned is not valid");
			done();
		}).catch(done);

	});

});
