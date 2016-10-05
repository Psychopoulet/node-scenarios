"use strict";

// deps

	const 	assert = require("assert"),
			NodeScenarios = require(require("path").join(__dirname, "..", "lib", "main.js"));

// tests

describe("scenarios", () => {

	let container;

	before(() => {

		return NodeScenarios.delete().then(() => {
			return NodeScenarios.init();
		}).then((_container) => {
			container = _container;
		});

	});

	after(() => {
		return NodeScenarios.delete();
	});

	it("should create data", () => {

		return container.get("scenarios").add({
			"name": "test1",
			"active": true
		}).then(() => {

			return container.get("scenarios").add({
				"name": "test",
				"active": true
			});

		}).then((scenario) => {

			assert.strictEqual("test", scenario.name, "Scenario added is not valid (name)");
			assert.strictEqual(true, scenario.active, "Scenario added is not valid (active)");

		});

	});

	it("should create data with action", () => {

		let action;

		return container.get("actionstypes").add({
			code: "test",
			name: "test"
		}).then((actiontype) => {

			return container.get("actions").add({
				code: "test1",
				name: "test1",
				type: actiontype
			}).then((actiontype) => {

				return container.get("actions").add({
					code: "test",
					name: "test",
					type: actiontype
				});

			});

		}).then((_action) => {
			action = _action;
			return container.get("scenarios").last();
		}).then((scenario) => {
			return container.get("scenarios").linkStartAction(scenario, action);
		}).then((scenario) => {

			assert.strictEqual("test", scenario.name, "Scenario added is not valid (name)");
			assert.strictEqual(true, scenario.active, "Scenario added is not valid (active)");
			assert.strictEqual("test", scenario.start.name, "Scenario added is not valid (start name)");

		});

	});

	it("should create data with condition", () => {

		let condition;

		return container.get("conditionstypes").add({
			code: "test",
			name: "test"
		}).then((conditiontype) => {

			return container.get("conditions").add({
				code: "test",
				name: "test",
				value: "test",
				type: conditiontype
			});

		}).then((_condition) => {
			condition = _condition;
			return container.get("scenarios").last();
		}).then((scenario) => {
			return container.get("scenarios").linkStartCondition(scenario, condition);
		}).then((scenario) => {

			assert.strictEqual("test", scenario.name, "Scenario added is not valid (name)");
			assert.strictEqual(true, scenario.active, "Scenario added is not valid (active)");
			assert.strictEqual("test", scenario.start.name, "Scenario added is not valid (start name)");

		});

	});

	it("should unlink start", () => {

		return container.get("scenarios").last().then((scenario) => {
			return container.get("scenarios").unlinkStart(scenario);
		}).then((scenario) => {
			assert.strictEqual(null, scenario.start, "Scenario added is not valid (start)");
		});

	});

	it("should return the last inserted data", () => {

		return container.get("scenarios").last().then((scenario) => {
			assert.strictEqual("test", scenario.name, "Scenario added is not valid (params)");
		});

	});

	it("should return all the data with the name \"test\"", () => {

		return container.get("scenarios").search({ "name": "test" }).then((scenarios) => {
			assert.strictEqual(1, scenarios.length, "Scenario returned are not valid");
		});

	});

	it("should return one data with the name \"test\"", () => {

		return container.get("scenarios").searchOne({ "name": "test" }).then((scenario) => {
			assert.notStrictEqual(null, scenario, "Scenario returned is not valid");
		});

	});

	it("should edit last inserted data", () => {

		return container.get("scenarios").last().then((scenario) => {
			scenario.name = "test2";
			scenario.active = false;
			return container.get("scenarios").edit(scenario);
		}).then((scenario) => {

			assert.strictEqual("test2", scenario.name, "Scenario edited is not valid (name)");
			assert.strictEqual(false, scenario.active, "Scenario edited is not valid (active)");

		});

	});

	it("should link to trigger", () => {

		return container.get("triggers").add({ name: "test", code: "test" }).then((trigger) => {

			return container.get("scenarios").last().then((scenario) => {
				return container.get("scenarios").linkToTrigger(scenario, trigger);
			});

		});
		
	});

	it("should get linked triggers", () => {

		return container.get("scenarios").last().then((scenario) => {
			return container.get("triggers").search({ scenario: scenario });
		}).then((triggers) => {

			assert.strictEqual(true, triggers instanceof Array, "Returned value is not an Array");
			assert.strictEqual(1, triggers.length, "There is no linked triggers");

		});

	});

	it("should unlink to trigger", () => {

		return container.get("triggers").last().then((trigger) => {
			
			return container.get("scenarios").last().then((scenario) => {
				return container.get("scenarios").unlinkToTrigger(scenario, trigger);
			});

		});
		
	});

	it("should get linked triggers", () => {

		return container.get("scenarios").last().then((scenario) => {
			return container.get("triggers").search({ scenario: scenario });
		}).then((triggers) => {

			assert.strictEqual(true, triggers instanceof Array, "Returned value is not an Array");
			assert.strictEqual(0, triggers.length, "There is no linked triggers");

		});

	});

	it("should delete last inserted data", () => {

		return container.get("scenarios").last().then((scenario) => {
			return container.get("scenarios").delete(scenario);
		}).then(() => {
			return container.get("scenarios").last();
		}).then((scenario) => {
			return container.get("scenarios").delete(scenario);
		}).then(() => {
			return container.get("scenarios").last();
		}).then((scenario) => {
			assert.strictEqual(null, scenario, "Scenario returned is not valid");
		});

	});

});
