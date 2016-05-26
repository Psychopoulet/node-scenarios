"use strict";

// deps

	const 	assert = require('assert'),
			SimpleScenarios = require('../main.js');

// tests

describe('conditions', function() {

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
		}).then(function(conditiontype) {

			return container.get('conditions').add({
				'type': conditiontype,
				'name': 'test',
				'value': 'test'
			});

		}).then(function(condition) {

			assert.strictEqual("test", condition.name, "Condition added is not valid (name)");
			assert.strictEqual('test', condition.value, "Condition added is not valid (value)");
			assert.strictEqual('test', condition.type.code, "Condition added is not valid (type code)");

			done();

		}).catch(done);

	});

	it.skip('should create data with action', function() { });
	it.skip('should create data with condition', function() { });

	it('should return the last inserted data', function(done) {

		container.get('conditions').lastInserted().then(function(condition) {
			assert.strictEqual("test", condition.name, "Condition added is not valid (params)");
			done();
		}).catch(done);

	});

	it("should return all the data with the name 'test'", function(done) {

		container.get('conditions').search({ 'name': 'test' }).then(function(conditions) {
			assert.strictEqual(1, conditions.length, "Condition returned are not valid");
			done();
		}).catch(done);

	});

	it("should return one data with the name 'test'", function(done) {

		container.get('conditions').searchOne({ 'name': 'test' }).then(function(condition) {
			assert.notStrictEqual(null, condition, "Condition returned is not valid");
			done();
		}).catch(done);

	});

	it("should edit last inserted data", function(done) {

		container.get('conditions').lastInserted().then(function(condition) {
			condition.name = 'test2';
			condition.active = false;
			return container.get('conditions').edit(condition);
		}).then(function(condition) {

			assert.strictEqual('test2', condition.name, "Condition edited is not valid (name)");
			assert.strictEqual(false, condition.active, "Condition edited is not valid (active)");
			done();

		}).catch(done);

	});

	it("should link to trigger", function(done) {

		container.get('triggers').add({ name: 'test', code: 'test' }).then(function(trigger) {

			container.get('conditions').lastInserted().then(function(condition) {
				return container.get('conditions').linkToTrigger(condition, trigger);
			}).then(function() {
				done();
			}).catch(done);

		}).catch(done);
		
	});

	it("should get linked triggers", function(done) {

		container.get('conditions').lastInserted().then(function(condition) {
			return container.get('triggers').search({ condition: condition });
		}).then(function(triggers) {

			assert.strictEqual(true, triggers instanceof Array, "Returned value is not an Array");
			assert.strictEqual(1, triggers.length, "There is no linked triggers");
			done();

		}).catch(done);

	});

	it("should unlink to trigger", function(done) {

		container.get('triggers').lastInserted().then(function(trigger) {

			container.get('conditions').lastInserted().then(function(condition) {
				return container.get('conditions').unlinkToTrigger(condition, trigger);
			}).then(function() {
				done();
			}).catch(done);

		}).catch(done);
		
	});

	it("should get linked triggers", function(done) {

		container.get('conditions').lastInserted().then(function(condition) {
			return container.get('triggers').search({ condition: condition });
		}).then(function(triggers) {

			assert.strictEqual(true, triggers instanceof Array, "Returned value is not an Array");
			assert.strictEqual(0, triggers.length, "There is no linked triggers");
			done();

		}).catch(done);

	});

	it("should delete last inserted data", function(done) {

		container.get('conditions').lastInserted().then(function(condition) {
			return container.get('conditions').delete(condition);
		}).then(function() {
			return container.get('conditions').lastInserted();
		}).then(function(condition) {
			
			assert.strictEqual(null, condition, "Condition returned is not valid");
			done();

		}).catch(done);

	});

});
