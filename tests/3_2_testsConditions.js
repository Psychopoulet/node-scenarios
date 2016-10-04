"use strict";

// deps

	const 	assert = require("assert"),
			NodeScenarios = require(require("path").join(__dirname, "..", "lib", "main.js"));

// tests

describe("conditions", function() {

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
			"code": "conditiontype",
			"name": "conditiontype"
		}).then(function(conditiontype) {

			return container.get("conditions").add({
				"type": conditiontype,
				"name": "test",
				"value": "test"
			});

		}).then(function(condition) {

			assert.strictEqual("test", condition.name, "Condition added is not valid (name)");
			assert.strictEqual("test", condition.value, "Condition added is not valid (value)");
			assert.strictEqual("conditiontype", condition.type.code, "Condition added is not valid (type code)");

		});

	});

	it("should return the last inserted data", function() {

		return container.get("conditions").last().then(function(condition) {
			assert.strictEqual("test", condition.name, "Condition added is not valid (params)");
		});

	});

	it("should return all the data with the name \"test\"", function() {

		return container.get("conditions").search({ "name": "test" }).then(function(conditions) {
			assert.strictEqual(1, conditions.length, "Condition returned are not valid");
		});

	});

	it("should return one data with the name \"test\"", function() {

		return container.get("conditions").searchOne({ "name": "test" }).then(function(condition) {
			assert.notStrictEqual(null, condition, "Condition returned is not valid");
		});

	});

	it("should edit last inserted data", function() {

		return container.get("conditions").last().then(function(condition) {
			condition.name = "test2";
			condition.active = false;
			return container.get("conditions").edit(condition);
		}).then(function(condition) {

			assert.strictEqual("test2", condition.name, "Condition edited is not valid (name)");
			assert.strictEqual(false, condition.active, "Condition edited is not valid (active)");

		});

	});

	it("should delete last inserted data", function() {

		return container.get("conditions").last().then(function(condition) {
			return container.get("conditions").delete(condition);
		}).then(function() {
			return container.get("conditions").last();
		}).then(function(condition) {
			assert.strictEqual(null, condition, "Condition returned is not valid");
		});

	});

	it("should create data with action", function() {

		let conditionBase;

		return container.get("conditionstypes").last().then(function(conditiontype) {

			return container.get("conditions").add({
				"type": conditiontype,
				"name": "conditionbase",
				"value": "conditionbase"
			});

		}).then(function(condition) {

			conditionBase = condition;

			return container.get("actionstypes").add({
				"code": "actiontype",
				"name": "actiontype"
			});

		}).then(function(actiontype) {

			return container.get("actions").add({
				"type": actiontype,
				"name": "actiononyes"
			});

		}).then(function(actiononyes) {
			return container.get("conditions").linkOnYesAction(conditionBase, actiononyes);
		}).then(function(condition) {

			assert.strictEqual("conditionbase", condition.name, "Condition added is not valid (name)");
			assert.strictEqual("conditionbase", condition.value, "Condition added is not valid (value)");
			assert.strictEqual("conditiontype", condition.type.code, "Condition added is not valid (type code)");
			assert.strictEqual("conditiontype", condition.type.name, "Condition added is not valid (type name)");
			assert.strictEqual("action", condition.onyes.nodetype, "Condition added is not valid (onyes nodetype)");
			assert.strictEqual("actiononyes", condition.onyes.name, "Condition added is not valid (onyes name)");
			assert.strictEqual(null, condition.onno, "Condition added is not valid (onno)");


			return container.get("actionstypes").last();

		}).then(function(actiontype) {

			return container.get("actions").add({
				"type": actiontype,
				"name": "actiononno"
			});

		}).then(function(actiononno) {
			return container.get("conditions").linkOnNoAction(conditionBase, actiononno);
		}).then(function(condition) {

			assert.strictEqual("conditionbase", condition.name, "Condition added is not valid (name)");
			assert.strictEqual("conditionbase", condition.value, "Condition added is not valid (value)");
			assert.strictEqual("conditiontype", condition.type.code, "Condition added is not valid (type code)");
			assert.strictEqual("conditiontype", condition.type.name, "Condition added is not valid (type name)");
			assert.strictEqual("action", condition.onno.nodetype, "Condition added is not valid (onno nodetype)");
			assert.strictEqual("actiononno", condition.onno.name, "Condition added is not valid (onno name)");
			assert.strictEqual("action", condition.onyes.nodetype, "Condition added is not valid (onyes nodetype)");
			assert.strictEqual("actiononyes", condition.onyes.name, "Condition added is not valid (onyes)");

			return container.get("conditions").unlinkOnYes(condition);

		}).then(function(condition) {

			assert.strictEqual("conditionbase", condition.name, "Condition added is not valid (name)");
			assert.strictEqual("conditionbase", condition.value, "Condition added is not valid (value)");
			assert.strictEqual("conditiontype", condition.type.code, "Condition added is not valid (type code)");
			assert.strictEqual("conditiontype", condition.type.name, "Condition added is not valid (type name)");
			assert.strictEqual("action", condition.onno.nodetype, "Condition added is not valid (onno nodetype)");
			assert.strictEqual("actiononno", condition.onno.name, "Condition added is not valid (onno name)");
			assert.strictEqual(null, condition.onyes, "Condition added is not valid (onyes)");

			return container.get("conditions").unlinkOnNo(condition);

		}).then(function(condition) {

			assert.strictEqual("conditionbase", condition.name, "Condition added is not valid (name)");
			assert.strictEqual("conditionbase", condition.value, "Condition added is not valid (value)");
			assert.strictEqual("conditiontype", condition.type.code, "Condition added is not valid (type code)");
			assert.strictEqual("conditiontype", condition.type.name, "Condition added is not valid (type name)");
			assert.strictEqual(null, condition.onno, "Condition added is not valid (onno)");
			assert.strictEqual(null, condition.onyes, "Condition added is not valid (onyes)");

		});

	});

	it("should create data with condition", function() {

		let conditionBase;

		return container.get("conditions").last().then(function(condition) {

			conditionBase = condition;

			return container.get("conditionstypes").last();

		}).then(function(conditiontype) {

			return container.get("conditions").add({
				"type": conditiontype,
				"name": "conditiononyes",
				"value": "yes"
			});

		}).then(function(conditiononyes) {
			return container.get("conditions").linkOnYesCondition(conditionBase, conditiononyes);
		}).then(function(condition) {

			assert.strictEqual("conditionbase", condition.name, "Condition added is not valid (name)");
			assert.strictEqual("conditionbase", condition.value, "Condition added is not valid (value)");
			assert.strictEqual("conditiontype", condition.type.code, "Condition added is not valid (type code)");
			assert.strictEqual("conditiontype", condition.type.name, "Condition added is not valid (type name)");
			assert.strictEqual("condition", condition.onyes.nodetype, "Condition added is not valid (onyes nodetype)");
			assert.strictEqual("conditiononyes", condition.onyes.name, "Condition added is not valid (onyes name)");
			assert.strictEqual(null, condition.onno, "Condition added is not valid (onno)");

			return container.get("conditionstypes").last();

		}).then(function(conditiontype) {

			return container.get("conditions").add({
				"type": conditiontype,
				"name": "conditiononno",
				"value": "no"
			});

		}).then(function(conditiononno) {
			return container.get("conditions").linkOnNoCondition(conditionBase, conditiononno);
		}).then(function(condition) {

			assert.strictEqual("conditionbase", condition.name, "Condition added is not valid (name)");
			assert.strictEqual("conditionbase", condition.value, "Condition added is not valid (value)");
			assert.strictEqual("conditiontype", condition.type.code, "Condition added is not valid (type code)");
			assert.strictEqual("conditiontype", condition.type.name, "Condition added is not valid (type name)");
			assert.strictEqual("condition", condition.onno.nodetype, "Condition added is not valid (onno nodetype)");
			assert.strictEqual("conditiononno", condition.onno.name, "Condition added is not valid (onno name)");
			assert.strictEqual("condition", condition.onyes.nodetype, "Condition added is not valid (onyes nodetype)");
			assert.strictEqual("conditiononyes", condition.onyes.name, "Condition added is not valid (onyes)");

			return container.get("conditions").unlinkOnYes(condition);

		}).then(function(condition) {

			assert.strictEqual("conditionbase", condition.name, "Condition added is not valid (name)");
			assert.strictEqual("conditionbase", condition.value, "Condition added is not valid (value)");
			assert.strictEqual("conditiontype", condition.type.code, "Condition added is not valid (type code)");
			assert.strictEqual("conditiontype", condition.type.name, "Condition added is not valid (type name)");
			assert.strictEqual("condition", condition.onno.nodetype, "Condition added is not valid (onno nodetype)");
			assert.strictEqual("conditiononno", condition.onno.name, "Condition added is not valid (onno name)");
			assert.strictEqual(null, condition.onyes, "Condition added is not valid (onyes)");

			return container.get("conditions").unlinkOnNo(condition);

		}).then(function(condition) {

			assert.strictEqual("conditionbase", condition.name, "Condition added is not valid (name)");
			assert.strictEqual("conditionbase", condition.value, "Condition added is not valid (value)");
			assert.strictEqual("conditiontype", condition.type.code, "Condition added is not valid (type code)");
			assert.strictEqual("conditiontype", condition.type.name, "Condition added is not valid (type name)");
			assert.strictEqual(null, condition.onno, "Condition added is not valid (onno)");
			assert.strictEqual(null, condition.onyes, "Condition added is not valid (onyes)");

		});

	});

});
