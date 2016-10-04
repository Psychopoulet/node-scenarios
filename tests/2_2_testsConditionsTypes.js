"use strict";

// deps

	const 	assert = require("assert"),
			NodeScenarios = require(require("path").join(__dirname, "..", "lib", "main.js"));

// tests

describe("conditionstypes", function() {

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

		return container.get("conditionstypes").add({
			"code": "test1",
			"name": "test1"
		}).then(function(conditiontype) {

			assert.strictEqual("test1", conditiontype.code, "ConditionType added is not valid (code)");
			assert.strictEqual("test1", conditiontype.name, "ConditionType added is not valid (name)");

			return container.get("conditionstypes").add({
				"code": "test",
				"name": "test"
			});

		}).then(function(conditiontype) {

			assert.strictEqual("test", conditiontype.code, "ConditionType added is not valid (code)");
			assert.strictEqual("test", conditiontype.name, "ConditionType added is not valid (name)");

		});
		
	});

	it("should return the last inserted data", function() {

		return container.get("conditionstypes").last().then(function(conditiontype) {

			assert.strictEqual("test", conditiontype.code, "ConditionType added is not valid (code)");
			assert.strictEqual("test", conditiontype.name, "ConditionType added is not valid (name)");

		});

	});

	it("should return all the data with the code \"test\"", function() {

		return container.get("conditionstypes").search({ "code": "test" }).then(function(conditionstypes) {
			assert.strictEqual(1, conditionstypes.length, "ConditionsTypes returned are not valid");
		});

	});

	it("should return all the data with the name \"test\"", function() {

		return container.get("conditionstypes").search({ "name": "test" }).then(function(conditionstypes) {
			assert.strictEqual(1, conditionstypes.length, "ConditionsTypes returned are not valid");
		});

	});

	it("should return one data with the name \"test\"", function() {

		return container.get("conditionstypes").searchOne({ "name": "test" }).then(function(conditiontype) {
			assert.notStrictEqual(null, conditiontype, "ConditionType returned is not valid");
		});

	});

	it("should searche multiples ids", function() {

		return container.get("conditionstypes").search().then(function(conditionstypes) {

			let ids = [];
			conditionstypes.forEach((conditiontype) => {
				ids.push(conditiontype.id);
			});

			return container.get("conditionstypes").search({ ids: ids }).then(function(conditionstypes) {

				assert.notStrictEqual(null, conditionstypes, "ConditionType returned are not valid");
				assert.strictEqual(2, conditionstypes.length, "ConditionType returned are not valid");

			});
			
		});

	});

	it("should searche multiples codes", function() {

		return container.get("conditionstypes").search().then(function(conditionstypes) {

			let codes = [];
			conditionstypes.forEach((conditiontype) => {
				codes.push(conditiontype.code);
			});

			return container.get("conditionstypes").search({ codes: codes }).then(function(conditionstypes) {

				assert.notStrictEqual(null, conditionstypes, "ConditionType returned are not valid");
				assert.strictEqual(2, conditionstypes.length, "ConditionType returned are not valid");

			});
			
		});

	});

	it("should edit last inserted data", function() {

		return container.get("conditionstypes").last().then(function(conditiontype) {
			conditiontype.code = "test2";
			conditiontype.name = "test2";
			return container.get("conditionstypes").edit(conditiontype);
		}).then(function(conditiontype) {

			assert.strictEqual("test2", conditiontype.code, "ConditionType added is not valid (code)");
			assert.strictEqual("test2", conditiontype.name, "ConditionType added is not valid (name)");

		});

	});

	it("should delete last inserted data", function() {

		return container.get("conditionstypes").last().then(function(conditiontype) {
			return container.get("conditionstypes").delete(conditiontype);
		}).then(function() {
			return container.get("conditionstypes").last();
		}).then(function(conditiontype) {

			assert.notStrictEqual(null, conditiontype, "ConditionType returned is not valid");
			return container.get("conditionstypes").delete(conditiontype);

		}).then(function() {
			return container.get("conditionstypes").last();
		}).then(function(conditiontype) {
			assert.strictEqual(null, conditiontype, "ConditionType returned is not valid");
		});

	});

});
