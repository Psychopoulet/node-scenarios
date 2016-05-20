"use strict";

// deps

	const 	path = require('path'),
			assert = require('assert'),
			
			SimpleScenarios = require('../main.js');

// private

	var _dbFile = path.join(__dirname, '..', 'database', 'database.sqlite3');

// tests

describe('triggers', function() {

	let container;

	before(function() {

		return SimpleScenarios.delete().then(function () {
			return SimpleScenarios.init().then(function (_container) {
				container = _container;
			})
		});

	});

	after(function() {
		return SimpleScenarios.delete();
	});

	it('should create data', function(done) {

		container.get('triggers').add({
			'code': 'test',
			'name': 'test'
		}).then(function(trigger) {
			assert.strictEqual('test', trigger.code, "Trigger added is not valid (code)");
			assert.strictEqual('test', trigger.name, "Trigger added is not valid (name)");
			done();
		}).catch(done);

	});

	it('should return the last inserted data', function(done) {

		container.get('triggers').lastInserted().then(function(trigger) {
			assert.strictEqual('test', trigger.code, "Trigger added is not valid (code)");
			assert.strictEqual('test', trigger.name, "Trigger added is not valid (name)");
			done();
		}).catch(done);

	});

	it("should return all the data with the code 'test'", function(done) {

		container.get('triggers').search({ 'code': 'test' }).then(function(triggers) {
			assert.strictEqual(1, triggers.length, "Triggers returned are not valid");
			done();
		}).catch(done);

	});

	it("should return all the data with the name 'test'", function(done) {

		container.get('triggers').search({ 'name': 'test' }).then(function(triggers) {
			assert.strictEqual(1, triggers.length, "Triggers returned are not valid");
			done();
		}).catch(done);

	});

	it("should return one data with the code 'test'", function(done) {

		container.get('triggers').searchOne({ 'code': 'test' }).then(function(trigger) {
			assert.notStrictEqual(null, trigger, "Trigger returned is not valid");
			done();
		}).catch(done);

	});

	it("should edit last inserted data", function(done) {

		container.get('triggers').lastInserted().then(function(trigger) {
			trigger.name = 'test2';
			return container.get('triggers').edit(trigger);
		}).then(function(trigger) {

			assert.strictEqual('test2', trigger.name, "Trigger returned is not valid");
			done();

		}).catch(done);

	});

	it("should delete last inserted data", function(done) {

		container.get('triggers').lastInserted().then(function(trigger) {
			return container.get('triggers').delete(trigger);
		}).then(function() {
			return container.get('triggers').lastInserted();
		}).then(function(trigger) {

			assert.strictEqual(null, trigger, "Trigger returned is not valid");
			done();

		}).catch(done);

	});

});
