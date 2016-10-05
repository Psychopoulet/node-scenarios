"use strict";

// deps

	const 	assert = require("assert"),
			NodeScenarios = require(require("path").join(__dirname, "..", "lib", "main.js"));

// tests

describe("conditions", () => {

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
			"code": "conditiontype",
			"name": "conditiontype"
		}).then((conditiontype) => {

			return container.get("conditions").add({
				"type": conditiontype,
				"name": "test1",
				"value": "test1"
			}).then((conditiontype) => {

				return container.get("conditions").add({
					"type": conditiontype,
					"name": "test",
					"value": "test"
				});

			});

		}).then((condition) => {

			assert.strictEqual("test", condition.name, "Condition added is not valid (name)");
			assert.strictEqual("test", condition.value, "Condition added is not valid (value)");
			assert.strictEqual("conditiontype", condition.type.code, "Condition added is not valid (type code)");

		});

	});

	it("should return the last inserted data", () => {

		return container.get("conditions").last().then((condition) => {
			assert.strictEqual("test", condition.name, "Condition added is not valid (params)");
		});

	});

	it("should return all the data with the name \"test\"", () => {

		return container.get("conditions").search({ "name": "test" }).then((conditions) => {
			assert.strictEqual(1, conditions.length, "Condition returned are not valid");
		});

	});

	it("should return one data with the name \"test\"", () => {

		return container.get("conditions").searchOne({ "name": "test" }).then((condition) => {
			assert.notStrictEqual(null, condition, "Condition returned is not valid");
		});

	});

	it("should return all the data with the condition type having the code \"conditiontype\"", () => {

		return container.get("conditions").search({ "type": { "code": "conditiontype" } }).then((conditions) => {
			assert.strictEqual(2, conditions.length, "Conditions returned are not valid");
		});

	});

	it("should return all the data with the condition type having the name \"conditiontype\"", () => {

		return container.get("conditions").search({ "type": { "name": "conditiontype" } }).then((conditions) => {
			assert.strictEqual(2, conditions.length, "Conditions returned are not valid");
		});

	});

	it("should return multiples ids", () => {

		return container.get("conditions").search().then((conditions) => {

			let ids = [];
			conditions.forEach((condition) => {
				ids.push(condition.id);
			});

			return container.get("conditions").search({ ids: ids }).then((conditions) => {

				assert.notStrictEqual(null, conditions, "Conditions returned are not valid");
				assert.strictEqual(2, conditions.length, "Conditions returned are not valid");

			});
			
		});

	});

	it("should edit last inserted data", () => {

		return container.get("conditions").last().then((condition) => {
			condition.name = "test2";
			condition.active = false;
			return container.get("conditions").edit(condition);
		}).then((condition) => {

			assert.strictEqual("test2", condition.name, "Condition edited is not valid (name)");
			assert.strictEqual(false, condition.active, "Condition edited is not valid (active)");

		});

	});

	it("should delete last inserted data", () => {

		return container.get("conditions").last().then((condition) => {
			return container.get("conditions").delete(condition);
		}).then(() => {
			return container.get("conditions").last();
		}).then((condition) => {

			assert.notStrictEqual(null, condition, "Condition returned is not valid");
			return container.get("conditions").delete(condition);

		}).then(() => {
			return container.get("conditions").last();
		}).then((condition) => {
			assert.strictEqual(null, condition, "Condition returned is not valid");
		});

	});

	it("should create data with action", () => {

		let conditionBase;

		return container.get("conditionstypes").last().then((conditiontype) => {

			return container.get("conditions").add({
				"type": conditiontype,
				"name": "conditionbase",
				"value": "conditionbase"
			});

		}).then((condition) => {

			conditionBase = condition;

			return container.get("actionstypes").add({
				"code": "actiontype",
				"name": "actiontype"
			});

		}).then((actiontype) => {

			return container.get("actions").add({
				"type": actiontype,
				"name": "actiononyes"
			});

		}).then((actiononyes) => {
			return container.get("conditions").linkOnYesAction(conditionBase, actiononyes);
		}).then((condition) => {

			assert.strictEqual("conditionbase", condition.name, "Condition added is not valid (name)");
			assert.strictEqual("conditionbase", condition.value, "Condition added is not valid (value)");
			assert.strictEqual("conditiontype", condition.type.code, "Condition added is not valid (type code)");
			assert.strictEqual("conditiontype", condition.type.name, "Condition added is not valid (type name)");
			assert.strictEqual("action", condition.onyes.nodetype, "Condition added is not valid (onyes nodetype)");
			assert.strictEqual("actiononyes", condition.onyes.name, "Condition added is not valid (onyes name)");
			assert.strictEqual(null, condition.onno, "Condition added is not valid (onno)");


			return container.get("actionstypes").last();

		}).then((actiontype) => {

			return container.get("actions").add({
				"type": actiontype,
				"name": "actiononno"
			});

		}).then((actiononno) => {
			return container.get("conditions").linkOnNoAction(conditionBase, actiononno);
		}).then((condition) => {

			assert.strictEqual("conditionbase", condition.name, "Condition added is not valid (name)");
			assert.strictEqual("conditionbase", condition.value, "Condition added is not valid (value)");
			assert.strictEqual("conditiontype", condition.type.code, "Condition added is not valid (type code)");
			assert.strictEqual("conditiontype", condition.type.name, "Condition added is not valid (type name)");
			assert.strictEqual("action", condition.onno.nodetype, "Condition added is not valid (onno nodetype)");
			assert.strictEqual("actiononno", condition.onno.name, "Condition added is not valid (onno name)");
			assert.strictEqual("action", condition.onyes.nodetype, "Condition added is not valid (onyes nodetype)");
			assert.strictEqual("actiononyes", condition.onyes.name, "Condition added is not valid (onyes)");

			return container.get("conditions").unlinkOnYes(condition);

		}).then((condition) => {

			assert.strictEqual("conditionbase", condition.name, "Condition added is not valid (name)");
			assert.strictEqual("conditionbase", condition.value, "Condition added is not valid (value)");
			assert.strictEqual("conditiontype", condition.type.code, "Condition added is not valid (type code)");
			assert.strictEqual("conditiontype", condition.type.name, "Condition added is not valid (type name)");
			assert.strictEqual("action", condition.onno.nodetype, "Condition added is not valid (onno nodetype)");
			assert.strictEqual("actiononno", condition.onno.name, "Condition added is not valid (onno name)");
			assert.strictEqual(null, condition.onyes, "Condition added is not valid (onyes)");

			return container.get("conditions").unlinkOnNo(condition);

		}).then((condition) => {

			assert.strictEqual("conditionbase", condition.name, "Condition added is not valid (name)");
			assert.strictEqual("conditionbase", condition.value, "Condition added is not valid (value)");
			assert.strictEqual("conditiontype", condition.type.code, "Condition added is not valid (type code)");
			assert.strictEqual("conditiontype", condition.type.name, "Condition added is not valid (type name)");
			assert.strictEqual(null, condition.onno, "Condition added is not valid (onno)");
			assert.strictEqual(null, condition.onyes, "Condition added is not valid (onyes)");

		});

	});

	it("should create data with condition", () => {

		let conditionBase;

		return container.get("conditions").last().then((condition) => {

			conditionBase = condition;

			return container.get("conditionstypes").last();

		}).then((conditiontype) => {

			return container.get("conditions").add({
				"type": conditiontype,
				"name": "conditiononyes",
				"value": "yes"
			});

		}).then((conditiononyes) => {
			return container.get("conditions").linkOnYesCondition(conditionBase, conditiononyes);
		}).then((condition) => {

			assert.strictEqual("conditionbase", condition.name, "Condition added is not valid (name)");
			assert.strictEqual("conditionbase", condition.value, "Condition added is not valid (value)");
			assert.strictEqual("conditiontype", condition.type.code, "Condition added is not valid (type code)");
			assert.strictEqual("conditiontype", condition.type.name, "Condition added is not valid (type name)");
			assert.strictEqual("condition", condition.onyes.nodetype, "Condition added is not valid (onyes nodetype)");
			assert.strictEqual("conditiononyes", condition.onyes.name, "Condition added is not valid (onyes name)");
			assert.strictEqual(null, condition.onno, "Condition added is not valid (onno)");

			return container.get("conditionstypes").last();

		}).then((conditiontype) => {

			return container.get("conditions").add({
				"type": conditiontype,
				"name": "conditiononno",
				"value": "no"
			});

		}).then((conditiononno) => {
			return container.get("conditions").linkOnNoCondition(conditionBase, conditiononno);
		}).then((condition) => {

			assert.strictEqual("conditionbase", condition.name, "Condition added is not valid (name)");
			assert.strictEqual("conditionbase", condition.value, "Condition added is not valid (value)");
			assert.strictEqual("conditiontype", condition.type.code, "Condition added is not valid (type code)");
			assert.strictEqual("conditiontype", condition.type.name, "Condition added is not valid (type name)");
			assert.strictEqual("condition", condition.onno.nodetype, "Condition added is not valid (onno nodetype)");
			assert.strictEqual("conditiononno", condition.onno.name, "Condition added is not valid (onno name)");
			assert.strictEqual("condition", condition.onyes.nodetype, "Condition added is not valid (onyes nodetype)");
			assert.strictEqual("conditiononyes", condition.onyes.name, "Condition added is not valid (onyes)");

			return container.get("conditions").unlinkOnYes(condition);

		}).then((condition) => {

			assert.strictEqual("conditionbase", condition.name, "Condition added is not valid (name)");
			assert.strictEqual("conditionbase", condition.value, "Condition added is not valid (value)");
			assert.strictEqual("conditiontype", condition.type.code, "Condition added is not valid (type code)");
			assert.strictEqual("conditiontype", condition.type.name, "Condition added is not valid (type name)");
			assert.strictEqual("condition", condition.onno.nodetype, "Condition added is not valid (onno nodetype)");
			assert.strictEqual("conditiononno", condition.onno.name, "Condition added is not valid (onno name)");
			assert.strictEqual(null, condition.onyes, "Condition added is not valid (onyes)");

			return container.get("conditions").unlinkOnNo(condition);

		}).then((condition) => {

			assert.strictEqual("conditionbase", condition.name, "Condition added is not valid (name)");
			assert.strictEqual("conditionbase", condition.value, "Condition added is not valid (value)");
			assert.strictEqual("conditiontype", condition.type.code, "Condition added is not valid (type code)");
			assert.strictEqual("conditiontype", condition.type.name, "Condition added is not valid (type name)");
			assert.strictEqual(null, condition.onno, "Condition added is not valid (onno)");
			assert.strictEqual(null, condition.onyes, "Condition added is not valid (onyes)");

		});

	});

});
