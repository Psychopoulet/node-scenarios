"use strict";

// deps

	const 	assert = require("assert"),
			NodeScenarios = require(require("path").join(__dirname, "..", "lib", "main.js"));

// tests

describe("actionstypes", () => {

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

		return container.get("actionstypes").add({
			"code": "test1",
			"name": "test1"
		}).then((actiontype) => {

			assert.strictEqual("test1", actiontype.code, "ActionType added is not valid (code)");
			assert.strictEqual("test1", actiontype.name, "ActionType added is not valid (name)");

			return container.get("actionstypes").add({
				"code": "test",
				"name": "test"
			});

		}).then((actiontype) => {

			assert.strictEqual("test", actiontype.code, "ActionType added is not valid (code)");
			assert.strictEqual("test", actiontype.name, "ActionType added is not valid (name)");

		});

	});

	it("should return the last inserted data", () => {

		return container.get("actionstypes").last().then((actiontype) => {

			assert.strictEqual("test", actiontype.code, "ActionType added is not valid (code)");
			assert.strictEqual("test", actiontype.name, "ActionType added is not valid (name)");

		});

	});

	it("should return all the data with the code \"test\"", () => {

		return container.get("actionstypes").search({ "code": "test" }).then((actionstypes) => {
			assert.strictEqual(1, actionstypes.length, "ActionsTypes returned are not valid");
		});

	});

	it("should return all the data with the name \"test\"", () => {

		return container.get("actionstypes").search({ "name": "test" }).then((actionstypes) => {
			assert.strictEqual(1, actionstypes.length, "ActionsTypes returned are not valid");
		});

	});

	it("should return one data with the name \"test\"", () => {

		return container.get("actionstypes").searchOne({ "name": "test" }).then((actiontype) => {
			assert.notStrictEqual(null, actiontype, "ActionType returned is not valid");
		});

	});

	it("should return multiples ids", () => {

		return container.get("actionstypes").search().then((actionstypes) => {

			let ids = [];
			actionstypes.forEach((actiontype) => {
				ids.push(actiontype.id);
			});

			return container.get("actionstypes").search({ ids: ids }).then((actionstypes) => {

				assert.notStrictEqual(null, actionstypes, "ActionsTypes returned are not valid");
				assert.strictEqual(2, actionstypes.length, "ActionsTypes returned are not valid");

			});
			
		});

	});

	it("should return multiples codes", () => {

		return container.get("actionstypes").search().then((actionstypes) => {

			let codes = [];
			actionstypes.forEach((actiontype) => {
				codes.push(actiontype.code);
			});

			return container.get("actionstypes").search({ codes: codes }).then((actionstypes) => {

				assert.notStrictEqual(null, actionstypes, "ActionsTypes returned are not valid");
				assert.strictEqual(2, actionstypes.length, "ActionsTypes returned are not valid");

			});
			
		});

	});

	it("should edit last inserted data", () => {

		return container.get("actionstypes").last().then((actiontype) => {
			actiontype.code = "test2";
			actiontype.name = "test2";
			return container.get("actionstypes").edit(actiontype);
		}).then((actiontype) => {

			assert.strictEqual("test2", actiontype.code, "ActionType added is not valid (code)");
			assert.strictEqual("test2", actiontype.name, "ActionType added is not valid (name)");

		});

	});

	it("should delete last inserted data", () => {

		return container.get("actionstypes").last().then((actiontype) => {
			return container.get("actionstypes").delete(actiontype);
		}).then(() => {
			return container.get("actionstypes").last();
		}).then((actiontype) => {

			assert.notStrictEqual(null, actiontype, "ActionType returned is not valid");
			return container.get("actionstypes").delete(actiontype);

		}).then(() => {
			return container.get("actionstypes").last();
		}).then((actiontype) => {
			assert.strictEqual(null, actiontype, "ActionType returned is not valid");
		});

	});

});
