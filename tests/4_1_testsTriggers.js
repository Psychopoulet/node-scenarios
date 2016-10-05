"use strict";

// deps

	const 	assert = require("assert"),
			NodeScenarios = require(require("path").join(__dirname, "..", "lib", "main.js"));

// tests

describe("triggers", () => {

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

		return container.get("triggers").add({
			"code": "test",
			"name": "test"
		}).then((trigger) => {
			assert.strictEqual("test", trigger.code, "Trigger added is not valid (code)");
			assert.strictEqual("test", trigger.name, "Trigger added is not valid (name)");
		});

	});

	it("should return the last inserted data", () => {

		return container.get("triggers").last().then((trigger) => {
			assert.strictEqual("test", trigger.code, "Trigger added is not valid (code)");
			assert.strictEqual("test", trigger.name, "Trigger added is not valid (name)");
		});

	});

	it("should return all the data with the code \"test\"", () => {

		return container.get("triggers").search({ "code": "test" }).then((triggers) => {
			assert.strictEqual(1, triggers.length, "Triggers returned are not valid");
		});

	});

	it("should return all the data with the name \"test\"", () => {

		return container.get("triggers").search({ "name": "test" }).then((triggers) => {
			assert.strictEqual(1, triggers.length, "Triggers returned are not valid");
		});

	});

	it("should return one data with the code \"test\"", () => {

		return container.get("triggers").searchOne({ "code": "test" }).then((trigger) => {
			assert.notStrictEqual(null, trigger, "Trigger returned is not valid");
		});

	});

	it("should edit last inserted data", () => {

		return container.get("triggers").last().then((trigger) => {
			trigger.name = "test2";
			return container.get("triggers").edit(trigger);
		}).then((trigger) => {
			assert.strictEqual("test2", trigger.name, "Trigger returned is not valid");
		});

	});

	it("should link to scenario", () => {

		return container.get("scenarios").add({ name: "test", code: "test" }).then((scenario) => {

			return container.get("triggers").last().then((trigger) => {
				return container.get("triggers").linkToScenario(scenario, trigger);
			});

		});
		
	});

	it("should get linked scenarios", () => {

		return container.get("triggers").last().then((trigger) => {
			return container.get("scenarios").search({ trigger: trigger });
		}).then((scenarios) => {

			assert.strictEqual(true, scenarios instanceof Array, "Returned value is not an Array");
			assert.strictEqual(1, scenarios.length, "There is no linked scenarios");

		});

	});

	it("should unlink to scenario", () => {

		return container.get("scenarios").last().then((scenario) => {

			return container.get("triggers").last().then((trigger) => {
				return container.get("triggers").unlinkToScenario(scenario, trigger);
			});
			
		});
		
	});

	it("should get linked scenarios", () => {

		return container.get("triggers").last().then((trigger) => {
			return container.get("scenarios").search({ trigger: trigger });
		}).then((scenarios) => {

			assert.strictEqual(true, scenarios instanceof Array, "Returned value is not an Array");
			assert.strictEqual(0, scenarios.length, "There is no linked scenarios");

		});

	});

	it("should execute linked scenarios", () => {

		return container.get("triggers").last().then((trigger) => {
			return container.get("triggers").execute(trigger, {});
		});

	});

	it("should delete last inserted data", () => {

		return container.get("triggers").last().then((trigger) => {
			return container.get("triggers").delete(trigger);
		}).then(() => {
			return container.get("triggers").last();
		}).then((trigger) => {
			assert.strictEqual(null, trigger, "Trigger returned is not valid");
		});

	});

});
