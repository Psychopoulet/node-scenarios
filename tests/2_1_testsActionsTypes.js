"use strict";

// deps

	const 	assert = require("assert"),
			NodeScenarios = require(require("path").join(__dirname, "..", "lib", "main.js"));

// tests

describe("actionstypes", function() {

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

		return container.get("actionstypes").add({
			"code": "test1",
			"name": "test1"
		}).then(function(actiontype) {

			assert.strictEqual("test1", actiontype.code, "ActionType added is not valid (code)");
			assert.strictEqual("test1", actiontype.name, "ActionType added is not valid (name)");

			return container.get("actionstypes").add({
				"code": "test",
				"name": "test"
			});

		}).then(function(actiontype) {

			assert.strictEqual("test", actiontype.code, "ActionType added is not valid (code)");
			assert.strictEqual("test", actiontype.name, "ActionType added is not valid (name)");

		});

	});

	it("should return the last inserted data", function() {

		return container.get("actionstypes").last().then(function(actiontype) {

			assert.strictEqual("test", actiontype.code, "ActionType added is not valid (code)");
			assert.strictEqual("test", actiontype.name, "ActionType added is not valid (name)");

		});

	});

	it("should return all the data with the code \"test\"", function() {

		return container.get("actionstypes").search({ "code": "test" }).then(function(actionstypes) {
			assert.strictEqual(1, actionstypes.length, "ActionsTypes returned are not valid");
		});

	});

	it("should return all the data with the name \"test\"", function() {

		return container.get("actionstypes").search({ "name": "test" }).then(function(actionstypes) {
			assert.strictEqual(1, actionstypes.length, "ActionsTypes returned are not valid");
		});

	});

	it("should return one data with the name \"test\"", function() {

		return container.get("actionstypes").searchOne({ "name": "test" }).then(function(actiontype) {
			assert.notStrictEqual(null, actiontype, "ActionType returned is not valid");
		});

	});

	it("should searche multiples ids", function() {

		return container.get("actionstypes").search().then(function(actionstypes) {

			let ids = [];
			actionstypes.forEach((actiontype) => {
				ids.push(actiontype.id);
			});

			return container.get("actionstypes").search({ ids: ids }).then(function(actionstypes) {

				assert.notStrictEqual(null, actionstypes, "ActionsTypes returned are not valid");
				assert.strictEqual(2, actionstypes.length, "ActionsTypes returned are not valid");

			});
			
		});

	});

	it("should searche multiples codes", function() {

		return container.get("actionstypes").search().then(function(actionstypes) {

			let codes = [];
			actionstypes.forEach((actiontype) => {
				codes.push(actiontype.code);
			});

			return container.get("actionstypes").search({ codes: codes }).then(function(actionstypes) {

				assert.notStrictEqual(null, actionstypes, "ActionsTypes returned are not valid");
				assert.strictEqual(2, actionstypes.length, "ActionsTypes returned are not valid");

			});
			
		});

	});

	it("should edit last inserted data", function() {

		return container.get("actionstypes").last().then(function(actiontype) {
			actiontype.code = "test2";
			actiontype.name = "test2";
			return container.get("actionstypes").edit(actiontype);
		}).then(function(actiontype) {

			assert.strictEqual("test2", actiontype.code, "ActionType added is not valid (code)");
			assert.strictEqual("test2", actiontype.name, "ActionType added is not valid (name)");

		});

	});

	it("should delete last inserted data", function() {

		return container.get("actionstypes").last().then(function(actiontype) {
			return container.get("actionstypes").delete(actiontype);
		}).then(function() {
			return container.get("actionstypes").last();
		}).then(function(actiontype) {

			assert.notStrictEqual(null, actiontype, "ActionType returned is not valid");
			return container.get("actionstypes").delete(actiontype);

		}).then(function() {
			return container.get("actionstypes").last();
		}).then(function(actiontype) {
			assert.strictEqual(null, actiontype, "ActionType returned is not valid");
		});

	});

});
