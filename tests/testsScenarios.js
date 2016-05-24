"use strict";

// deps

	const 	path = require('path'),
			assert = require('assert'),
			
			SimpleScenarios = require('../main.js');

// tests

describe('scenarios', function() {

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

		container.get('scenarios').add({
			'name': 'test',
			'active': true
		}).then(function(scenario) {

			assert.strictEqual("test", scenario.name, "Scenario added is not valid (name)");
			assert.strictEqual(true, scenario.active, "Scenario added is not valid (active)");

			done();

		}).catch(done);

	});

	it.skip('should create data with action', function() { });
	it.skip('should create data with condition', function() { });

	it('should return the last inserted data', function(done) {

		container.get('scenarios').lastInserted().then(function(scenario) {
			assert.strictEqual("test", scenario.name, "Scenario added is not valid (params)");
			done();
		}).catch(done);

	});

	it("should return all the data with the name 'test'", function(done) {

		container.get('scenarios').search({ 'name': 'test' }).then(function(scenarios) {
			assert.strictEqual(1, scenarios.length, "Scenario returned are not valid");
			done();
		}).catch(done);

	});

	it("should return one data with the name 'test'", function(done) {

		container.get('scenarios').searchOne({ 'name': 'test' }).then(function(scenario) {
			assert.notStrictEqual(null, scenario, "Scenario returned is not valid");
			done();
		}).catch(done);

	});

	it("should edit last inserted data", function(done) {

		container.get('scenarios').lastInserted().then(function(scenario) {
			scenario.name = 'test2';
			scenario.active = false;
			return container.get('scenarios').edit(scenario);
		}).then(function(scenario) {

			assert.strictEqual('test2', scenario.name, "Scenario edited is not valid (name)");
			assert.strictEqual(false, scenario.active, "Scenario edited is not valid (active)");
			done();

		}).catch(done);

	});

	it("should link to trigger", function(done) {

		container.get('triggers').add({ name: 'test', code: 'test' }).then(function(trigger) {

			container.get('scenarios').lastInserted().then(function(scenario) {
				return container.get('scenarios').linkToTrigger(scenario, trigger);
			}).then(function() {
				done();
			}).catch(done);

		}).catch(done);
		
	});

	it("should get linked triggers", function(done) {

		container.get('scenarios').lastInserted().then(function(scenario) {
			return container.get('triggers').search({ scenario: scenario });
		}).then(function(triggers) {

			assert.strictEqual(true, triggers instanceof Array, "Returned value is not an Array");
			assert.strictEqual(1, triggers.length, "There is no linked triggers");
			done();

		}).catch(done);

	});

	it("should unlink to trigger", function(done) {

		container.get('triggers').lastInserted().then(function(trigger) {

			container.get('scenarios').lastInserted().then(function(scenario) {
				return container.get('scenarios').unlinkToTrigger(scenario, trigger);
			}).then(function() {
				done();
			}).catch(done);

		}).catch(done);
		
	});

	it("should get linked triggers", function(done) {

		container.get('scenarios').lastInserted().then(function(scenario) {
			return container.get('triggers').search({ scenario: scenario });
		}).then(function(triggers) {

			assert.strictEqual(true, triggers instanceof Array, "Returned value is not an Array");
			assert.strictEqual(0, triggers.length, "There is no linked triggers");
			done();

		}).catch(done);

	});

	it("should delete last inserted data", function(done) {

		container.get('scenarios').lastInserted().then(function(scenario) {
			return container.get('scenarios').delete(scenario);
		}).then(function() {
			return container.get('scenarios').lastInserted();
		}).then(function(scenario) {
			
			assert.strictEqual(null, scenario, "Scenario returned is not valid");
			done();

		}).catch(done);

	});

});
