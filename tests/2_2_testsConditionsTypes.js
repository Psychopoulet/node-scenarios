"use strict";

// deps

	const 	assert = require("assert"),
			NodeScenarios = require(require("path").join(__dirname, "..", "lib", "main.js"));

// tests

describe("conditionstypes", () => {

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

		return container.get("conditionstypes").add({
			"code": "test1",
			"name": "test1"
		}).then((conditiontype) => {

			assert.strictEqual("test1", conditiontype.code, "ConditionType added is not valid (code)");
			assert.strictEqual("test1", conditiontype.name, "ConditionType added is not valid (name)");

			return container.get("conditionstypes").add({
				"code": "test",
				"name": "test"
			});

		}).then((conditiontype) => {

			assert.strictEqual("test", conditiontype.code, "ConditionType added is not valid (code)");
			assert.strictEqual("test", conditiontype.name, "ConditionType added is not valid (name)");

		});
		
	});

	it("should return the last inserted data", () => {

		return container.get("conditionstypes").last().then((conditiontype) => {

			assert.strictEqual("test", conditiontype.code, "ConditionType added is not valid (code)");
			assert.strictEqual("test", conditiontype.name, "ConditionType added is not valid (name)");

		});

	});

	it("should return all the data with the code \"test\"", () => {

		return container.get("conditionstypes").search({ "code": "test" }).then((conditionstypes) => {
			assert.strictEqual(1, conditionstypes.length, "ConditionsTypes returned are not valid");
		});

	});

	it("should return all the data with the name \"test\"", () => {

		return container.get("conditionstypes").search({ "name": "test" }).then((conditionstypes) => {
			assert.strictEqual(1, conditionstypes.length, "ConditionsTypes returned are not valid");
		});

	});

	it("should return one data with the name \"test\"", () => {

		return container.get("conditionstypes").searchOne({ "name": "test" }).then((conditiontype) => {
			assert.notStrictEqual(null, conditiontype, "ConditionType returned is not valid");
		});

	});

	it("should return multiples ids", () => {

		return container.get("conditionstypes").search().then((conditionstypes) => {

			let ids = [];
			conditionstypes.forEach((conditiontype) => {
				ids.push(conditiontype.id);
			});

			return container.get("conditionstypes").search({ ids: ids }).then((conditionstypes) => {

				assert.notStrictEqual(null, conditionstypes, "ConditionType returned are not valid");
				assert.strictEqual(2, conditionstypes.length, "ConditionType returned are not valid");

			});
			
		});

	});

	it("should return multiples codes", () => {

		return container.get("conditionstypes").search().then((conditionstypes) => {

			let codes = [];
			conditionstypes.forEach((conditiontype) => {
				codes.push(conditiontype.code);
			});

			return container.get("conditionstypes").search({ codes: codes }).then((conditionstypes) => {

				assert.notStrictEqual(null, conditionstypes, "ConditionType returned are not valid");
				assert.strictEqual(2, conditionstypes.length, "ConditionType returned are not valid");

			});
			
		});

	});

	it("should edit last inserted data", () => {

		return container.get("conditionstypes").last().then((conditiontype) => {
			conditiontype.code = "test2";
			conditiontype.name = "test2";
			return container.get("conditionstypes").edit(conditiontype);
		}).then((conditiontype) => {

			assert.strictEqual("test2", conditiontype.code, "ConditionType added is not valid (code)");
			assert.strictEqual("test2", conditiontype.name, "ConditionType added is not valid (name)");

		});

	});

	it("should delete last inserted data", () => {

		return container.get("conditionstypes").last().then((conditiontype) => {
			return container.get("conditionstypes").delete(conditiontype);
		}).then(() => {
			return container.get("conditionstypes").last();
		}).then((conditiontype) => {

			assert.notStrictEqual(null, conditiontype, "ConditionType returned is not valid");
			return container.get("conditionstypes").delete(conditiontype);

		}).then(() => {
			return container.get("conditionstypes").last();
		}).then((conditiontype) => {
			assert.strictEqual(null, conditiontype, "ConditionType returned is not valid");
		});

	});

});
