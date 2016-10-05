"use strict";

// deps

	const 	assert = require("assert"),
			NodeScenarios = require(require("path").join(__dirname, "..", "lib", "main.js"));

// tests

describe("junctions", () => {

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

	it("should create action junction", () => {

		return container.get("actionstypes").add({
			"code": "actiontype",
			"name": "actiontype"
		}).then((actiontype) => {

			return container.get("actions").add({
				"type": actiontype,
				"name": "action"
			});

		}).then((action) => {

			return container.get("junctions").createActionJunctionId(action);

		}).then((junctionid) => {

			assert.strictEqual(1, junctionid, "ActionJunction added is not valid");

		});

	});

	it("should create condition junction", () => {

		return container.get("conditionstypes").add({
			"code": "conditiontype",
			"name": "conditiontype"
		}).then((conditiontype) => {

			return container.get("conditions").add({
				"type": conditiontype,
				"name": "condition",
				"value": "condition"
			});

		}).then((condition) => {

			return container.get("junctions").createConditionJunctionId(condition);

		}).then((junctionid) => {

			assert.strictEqual(2, junctionid, "ConditionJunction added is not valid");

		});

	});

});
