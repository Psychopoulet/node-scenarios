"use strict";

// deps

	const 	assert = require("assert"),
			NodeScenarios = require(require("path").join(__dirname, "..", "lib", "main.js"));

// tests

describe("triggers", function() {

	let container;

	before(function() {

		return NodeScenarios.delete().then(function () {
			return NodeScenarios.init();
		}).then(function (_container) {
			container = _container;
		});

	});

	after(function() {
		return NodeScenarios.delete();
	});

	it("should create data", function() {

		return container.get("triggers").add({
			"code": "test",
			"name": "test"
		}).then(function(trigger) {
			assert.strictEqual("test", trigger.code, "Trigger added is not valid (code)");
			assert.strictEqual("test", trigger.name, "Trigger added is not valid (name)");
		});

	});

	it("should return the last inserted data", function() {

		return container.get("triggers").last().then(function(trigger) {
			assert.strictEqual("test", trigger.code, "Trigger added is not valid (code)");
			assert.strictEqual("test", trigger.name, "Trigger added is not valid (name)");
		});

	});

	it("should return all the data with the code \"test\"", function() {

		return container.get("triggers").search({ "code": "test" }).then(function(triggers) {
			assert.strictEqual(1, triggers.length, "Triggers returned are not valid");
		});

	});

	it("should return all the data with the name \"test\"", function() {

		return container.get("triggers").search({ "name": "test" }).then(function(triggers) {
			assert.strictEqual(1, triggers.length, "Triggers returned are not valid");
		});

	});

	it("should return one data with the code \"test\"", function() {

		return container.get("triggers").searchOne({ "code": "test" }).then(function(trigger) {
			assert.notStrictEqual(null, trigger, "Trigger returned is not valid");
		});

	});

	it("should edit last inserted data", function() {

		return container.get("triggers").last().then(function(trigger) {
			trigger.name = "test2";
			return container.get("triggers").edit(trigger);
		}).then(function(trigger) {
			assert.strictEqual("test2", trigger.name, "Trigger returned is not valid");
		});

	});

	it("should link to scenario", function() {

		return container.get("scenarios").add({ name: "test", code: "test" }).then(function(scenario) {

			return container.get("triggers").last().then(function(trigger) {
				return container.get("triggers").linkToScenario(scenario, trigger);
			});

		});
		
	});

	it("should get linked scenarios", function() {

		return container.get("triggers").last().then(function(trigger) {
			return container.get("scenarios").search({ trigger: trigger });
		}).then(function(scenarios) {

			assert.strictEqual(true, scenarios instanceof Array, "Returned value is not an Array");
			assert.strictEqual(1, scenarios.length, "There is no linked scenarios");

		});

	});

	it("should unlink to scenario", function() {

		return container.get("scenarios").last().then(function(scenario) {

			return container.get("triggers").last().then(function(trigger) {
				return container.get("triggers").unlinkToScenario(scenario, trigger);
			});
			
		});
		
	});

	it("should get linked scenarios", function() {

		return container.get("triggers").last().then(function(trigger) {
			return container.get("scenarios").search({ trigger: trigger });
		}).then(function(scenarios) {

			assert.strictEqual(true, scenarios instanceof Array, "Returned value is not an Array");
			assert.strictEqual(0, scenarios.length, "There is no linked scenarios");

		});

	});

	it("should execute linked scenarios", function() {

		return container.get("triggers").last().then(function(trigger) {
			return container.get("triggers").execute(trigger, {});
		});

	});

	it("should delete last inserted data", function() {

		return container.get("triggers").last().then(function(trigger) {
			return container.get("triggers").delete(trigger);
		}).then(function() {
			return container.get("triggers").last();
		}).then(function(trigger) {
			assert.strictEqual(null, trigger, "Trigger returned is not valid");
		});

	});

});
