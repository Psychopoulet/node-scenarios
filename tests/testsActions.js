"use strict";

// deps

	const 	assert = require("assert"),
			SimpleScenarios = require(require("path").join(__dirname, "..", "lib", "main.js"));

// tests

describe("actions", function() {

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

		container.get("actionstypes").add({
			"code": "test",
			"name": "test"
		}).then(function(actiontype) {

			return container.get("actions").add({
				"type": actiontype,
				"name": "test",
				"params": "{\"test\": \"test\"}"
			});

		}).then(function(action) {

			assert.strictEqual("test", action.name, "Action added is not valid (name)");
			assert.strictEqual("test", action.type.code, "Action added is not valid (type code)");
			assert.deepStrictEqual({"test": "test"}, action.params, "Action added is not valid (params)");

			done();

		}).catch(done);

	});

	it("should create data with action", function(done) {

		let action;

		container.get("actionstypes").lastInserted().then(function(actiontype) {

			return container.get("actions").add({
				code: "test",
				name: "test",
				type: actiontype
			});

		}).then(function(_action) {
			action = _action;
			return container.get("scenarios").lastInserted();
		}).then(function(scenario) {
			return container.get("scenarios").linkStartAction(scenario, action);
		}).then(function(scenario) {

			assert.strictEqual("test", scenario.name, "Scenario added is not valid (name)");
			assert.strictEqual(true, scenario.active, "Scenario added is not valid (active)");
			assert.strictEqual("test", scenario.start.name, "Scenario added is not valid (start name)");

			done();

		}).catch(done);


	});

	it("should return the last inserted data", function(done) {

		container.get("actions").lastInserted().then(function(action) {

			assert.strictEqual("test", action.name, "Action added is not valid (name)");
			assert.deepStrictEqual({"test": "test"}, action.params, "Action added is not valid (params)");

			done();

		}).catch(done);

	});

	it("should return all the data with the name \"test\"", function(done) {

		container.get("actions").search({ "name": "test" }).then(function(actions) {

			assert.strictEqual(1, actions.length, "Actions returned are not valid");
			done();

		}).catch(done);

	});

	it("should return all the data with the action type having the code \"test\"", function(done) {

		container.get("actions").search({ "type": { "code": "test" } }).then(function(actions) {

			assert.strictEqual(1, actions.length, "Actions returned are not valid");
			done();

		}).catch(done);

	});

	it("should return all the data with the action type having the name \"test\"", function(done) {

		container.get("actions").search({ "type": { "name": "test" } }).then(function(actions) {

			assert.strictEqual(1, actions.length, "Actions returned are not valid");
			done();

		}).catch(done);

	});

	it("should return one data with the name \"test\"", function(done) {

		container.get("actions").searchOne({ "name": "test" }).then(function(action) {

			assert.notStrictEqual(null, action, "Action returned is not valid");
			done();

		}).catch(done);

	});

	it("should edit last inserted data", function(done) {

		container.get("actions").lastInserted().then(function(action) {
			action.name = "test2";
			return container.get("actions").edit(action);
		}).then(function(action) {

			assert.strictEqual("test2", action.name, "Action returned is not valid");
			done();

		}).catch(done);

	});

	it("should bind wrong executer", function(done) {

		container.get("actionstypes").lastInserted().then(function(actiontype) {
			
			container.get("actions").bindExecuter(actiontype).then(function() {
				assert.ok(false, "Wrong executer does not generate error");
				done();
			}).catch(function(err) {
				assert.strictEqual("string", typeof err, "Wrong executer generate incorrect error");
				done();
			});

		}).catch(done);

	});

	it("should bind executer with wrong actiontype", function(done) {

		container.get("actions").bindExecuter({}).then(function() {
			assert.ok(false, "Wrong executer does not generate error");
			done();
		}).catch(function(err) {
			assert.strictEqual("string", typeof err, "Wrong executer generate incorrect error");
			done();
		});

	});

	it("should bind executer", function(done) {

		container.get("actionstypes").lastInserted().then(function(actiontype) {

			return container.get("actions").bindExecuter(actiontype, function(action) {
				assert.strictEqual("test2", action.name, "Action returned is not valid");
			});

		}).then(function() {
			return container.get("actions").lastInserted();
		}).then(function(action) {

			container.get("actions").execute(action);
			done();

		}).catch(done);

	});

	it("should delete last inserted data", function(done) {

		container.get("actions").lastInserted().then(function(action) {
			return container.get("actions").delete(action);
		}).then(function() {
			return container.get("actions").lastInserted();
		}).then(function(action) {

			assert.strictEqual(null, action, "Action returned is not valid");
			done();

		}).catch(done);

	});

});
