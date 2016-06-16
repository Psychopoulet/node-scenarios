"use strict";

// deps

	const 	assert = require("assert"),
			SimpleScenarios = require(require("path").join(__dirname, "..", "lib", "main.js"));

// tests

describe("scenarios", function() {

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

	it("should create data", function() {

		return container.get("scenarios").add({
			"name": "test",
			"active": true
		}).then(function(scenario) {

			assert.strictEqual("test", scenario.name, "Scenario added is not valid (name)");
			assert.strictEqual(true, scenario.active, "Scenario added is not valid (active)");

		});

	});

	it("should create data with action", function() {

		let action;

		return container.get("actionstypes").add({
			code: "test",
			name: "test"
		}).then(function(actiontype) {

			return container.get("actions").add({
				code: "test",
				name: "test",
				type: actiontype
			});

		}).then(function(_action) {
			action = _action;
			return container.get("scenarios").last();
		}).then(function(scenario) {
			return container.get("scenarios").linkStartAction(scenario, action);
		}).then(function(scenario) {

			assert.strictEqual("test", scenario.name, "Scenario added is not valid (name)");
			assert.strictEqual(true, scenario.active, "Scenario added is not valid (active)");
			assert.strictEqual("test", scenario.start.name, "Scenario added is not valid (start name)");

		});

	});

	it("should create data with condition", function() {

		let condition;

		return container.get("conditionstypes").add({
			code: "test",
			name: "test"
		}).then(function(conditiontype) {

			return container.get("conditions").add({
				code: "test",
				name: "test",
				value: "test",
				type: conditiontype
			});

		}).then(function(_condition) {
			condition = _condition;
			return container.get("scenarios").last();
		}).then(function(scenario) {
			return container.get("scenarios").linkStartCondition(scenario, condition);
		}).then(function(scenario) {

			assert.strictEqual("test", scenario.name, "Scenario added is not valid (name)");
			assert.strictEqual(true, scenario.active, "Scenario added is not valid (active)");
			assert.strictEqual("test", scenario.start.name, "Scenario added is not valid (start name)");

		});

	});

	it("should unlink start", function() {

		return container.get("scenarios").last().then(function(scenario) {
			return container.get("scenarios").unlinkStart(scenario);
		}).then(function(scenario) {
			assert.strictEqual(null, scenario.start, "Scenario added is not valid (start)");
		});

	});

	it("should return the last inserted data", function() {

		return container.get("scenarios").last().then(function(scenario) {
			assert.strictEqual("test", scenario.name, "Scenario added is not valid (params)");
		});

	});

	it("should return all the data with the name \"test\"", function() {

		return container.get("scenarios").search({ "name": "test" }).then(function(scenarios) {
			assert.strictEqual(1, scenarios.length, "Scenario returned are not valid");
		});

	});

	it("should return one data with the name \"test\"", function() {

		return container.get("scenarios").searchOne({ "name": "test" }).then(function(scenario) {
			assert.notStrictEqual(null, scenario, "Scenario returned is not valid");
		});

	});

	it("should edit last inserted data", function() {

		return container.get("scenarios").last().then(function(scenario) {
			scenario.name = "test2";
			scenario.active = false;
			return container.get("scenarios").edit(scenario);
		}).then(function(scenario) {

			assert.strictEqual("test2", scenario.name, "Scenario edited is not valid (name)");
			assert.strictEqual(false, scenario.active, "Scenario edited is not valid (active)");

		});

	});

	it("should link to trigger", function() {

		return container.get("triggers").add({ name: "test", code: "test" }).then(function(trigger) {

			return container.get("scenarios").last().then(function(scenario) {
				return container.get("scenarios").linkToTrigger(scenario, trigger);
			});

		});
		
	});

	it("should get linked triggers", function() {

		return container.get("scenarios").last().then(function(scenario) {
			return container.get("triggers").search({ scenario: scenario });
		}).then(function(triggers) {

			assert.strictEqual(true, triggers instanceof Array, "Returned value is not an Array");
			assert.strictEqual(1, triggers.length, "There is no linked triggers");

		});

	});

	it("should unlink to trigger", function() {

		return container.get("triggers").last().then(function(trigger) {
			
			return container.get("scenarios").last().then(function(scenario) {
				return container.get("scenarios").unlinkToTrigger(scenario, trigger);
			});

		});
		
	});

	it("should get linked triggers", function() {

		return container.get("scenarios").last().then(function(scenario) {
			return container.get("triggers").search({ scenario: scenario });
		}).then(function(triggers) {

			assert.strictEqual(true, triggers instanceof Array, "Returned value is not an Array");
			assert.strictEqual(0, triggers.length, "There is no linked triggers");

		});

	});

	it("should delete last inserted data", function() {

		return container.get("scenarios").last().then(function(scenario) {
			return container.get("scenarios").delete(scenario);
		}).then(function() {
			return container.get("scenarios").last();
		}).then(function(scenario) {		
			assert.strictEqual(null, scenario, "Scenario returned is not valid");
		});

	});

});
