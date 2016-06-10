"use strict";

// deps

	const 	assert = require("assert"),
			SimpleScenarios = require(require("path").join(__dirname, "..", "lib", "main.js"));

// tests

describe("conditions", function() {

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

	it("should create data", function(done) {

		container.get("conditionstypes").add({
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

			done();

		}).catch(done);

	});

	it("should return the last inserted data", function(done) {

		container.get("conditions").lastInserted().then(function(condition) {
			assert.strictEqual("test", condition.name, "Condition added is not valid (params)");
			done();
		}).catch(done);

	});

	it("should return all the data with the name \"test\"", function(done) {

		container.get("conditions").search({ "name": "test" }).then(function(conditions) {
			assert.strictEqual(1, conditions.length, "Condition returned are not valid");
			done();
		}).catch(done);

	});

	it("should return one data with the name \"test\"", function(done) {

		container.get("conditions").searchOne({ "name": "test" }).then(function(condition) {
			assert.notStrictEqual(null, condition, "Condition returned is not valid");
			done();
		}).catch(done);

	});

	it("should edit last inserted data", function(done) {

		container.get("conditions").lastInserted().then(function(condition) {
			condition.name = "test2";
			condition.active = false;
			return container.get("conditions").edit(condition);
		}).then(function(condition) {

			assert.strictEqual("test2", condition.name, "Condition edited is not valid (name)");
			assert.strictEqual(false, condition.active, "Condition edited is not valid (active)");
			done();

		}).catch(done);

	});

	it("should delete last inserted data", function(done) {

		container.get("conditions").lastInserted().then(function(condition) {
			return container.get("conditions").delete(condition);
		}).then(function() {
			return container.get("conditions").lastInserted();
		}).then(function(condition) {
			
			assert.strictEqual(null, condition, "Condition returned is not valid");
			done();

		}).catch(done);

	});

	it("should create data with action", function(done) {

		let conditionBase;

		container.get("conditionstypes").lastInserted().then(function(conditiontype) {

			return container.get("conditions").add({
				"type": conditiontype,
				"code": "conditionbase",
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
				"name": "actionon*"
			});

		}).then(function(actiononyes) {
			return container.get("conditions").linkOnYesAction(conditionBase, actiononyes);
		}).then(function(condition) {

			assert.strictEqual("conditionbase", condition.name, "Condition added is not valid (name)");
			assert.strictEqual("conditionbase", condition.value, "Condition added is not valid (value)");
			assert.strictEqual("conditiontype", condition.type.code, "Condition added is not valid (type code)");
			assert.strictEqual("conditiontype", condition.type.name, "Condition added is not valid (type name)");
			assert.strictEqual("action", condition.onyes.nodetype, "Condition added is not valid (onyes nodetype)");
			assert.strictEqual("actionon*", condition.onyes.name, "Condition added is not valid (onyes name)");
			assert.strictEqual(null, condition.onno, "Condition added is not valid (onno name)");


			return container.get("actions").lastInserted();

		}).then(function(actiononno) {
			return container.get("conditions").linkOnNoAction(conditionBase, actiononno);
		}).then(function(condition) {

			assert.strictEqual("conditionbase", condition.name, "Condition added is not valid (name)");
			assert.strictEqual("conditionbase", condition.value, "Condition added is not valid (value)");
			assert.strictEqual("conditiontype", condition.type.code, "Condition added is not valid (type code)");
			assert.strictEqual("conditiontype", condition.type.name, "Condition added is not valid (type name)");
			assert.strictEqual("action", condition.onno.nodetype, "Condition added is not valid (onno nodetype)");
			assert.strictEqual("actionon*", condition.onno.name, "Condition added is not valid (onno name)");
			assert.strictEqual("action", condition.onyes.nodetype, "Condition added is not valid (onyes nodetype)");
			assert.strictEqual("actionon*", condition.onyes.name, "Condition added is not valid (onyes name)");

			done();

		}).catch(done);


	});

	it.skip("should create data with condition", function(done) {

		let conditionBase;

		container.get("conditions").search().then(function(conditions) {

			conditionBase = conditions[1];

			return container.get("conditionstypes").add({
				"code": "conditiontype",
				"name": "conditiontype"
			});

		}).then(function(conditiontype) {

			return container.get("conditions").add({
				type: conditiontype,
				name: "conditionafter",
				value: "test"
			});

		}).then(function(conditionafter) {
			return container.get("conditions").linkAfterCondition(conditionBase, conditionafter);
		}).then(function(action) {

			assert.strictEqual("actionbase", action.name, "Condition added is not valid (name)");
			assert.strictEqual("conditiontype", action.type.code, "Condition added is not valid (type code)");
			assert.strictEqual("conditiontype", action.type.name, "Condition added is not valid (type name)");
			assert.deepStrictEqual({"test": "test"}, action.params, "Condition added is not valid (params)");
			assert.strictEqual("conditionafter", action.after.name, "Condition added is not valid (after name)");

			done();

		}).catch(done);


	});

});
