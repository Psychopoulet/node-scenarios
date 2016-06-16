"use strict";

// deps

	const 	assert = require("assert"),
			SimpleScenarios = require(require("path").join(__dirname, "..", "lib", "main.js"));

// tests

describe("junctions", function() {

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

	it("should create action junction", function() {

		return container.get("actionstypes").add({
			"code": "actiontype",
			"name": "actiontype"
		}).then(function(actiontype) {

			return container.get("actions").add({
				"type": actiontype,
				"name": "action"
			});

		}).then(function(action) {

			return container.get("junctions").createActionJunctionId(action);

		}).then(function(junctionid) {

			assert.strictEqual(1, junctionid, "ActionJunction added is not valid");

		});

	});

	it("should create condition junction", function() {

		return container.get("conditionstypes").add({
			"code": "conditiontype",
			"name": "conditiontype"
		}).then(function(conditiontype) {

			return container.get("conditions").add({
				"type": conditiontype,
				"name": "condition",
				"value": "condition"
			});

		}).then(function(condition) {

			return container.get("junctions").createConditionJunctionId(condition);

		}).then(function(junctionid) {

			assert.strictEqual(2, junctionid, "ConditionJunction added is not valid");

		});

	});

});
