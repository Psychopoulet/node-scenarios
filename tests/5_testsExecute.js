"use strict";

// deps

	const	assert = require("assert"),
			SimpleScenarios = require(require("path").join(__dirname, "..", "lib", "main.js"));

// tests

describe("execute", function() {

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

	describe("prepare way", function() {

		it("should create actions", function(done) {

			let actiontype;

			container.get("actionstypes").add({ code: "CONSOLE", "name" : "console" }).then(function(_actiontype) {
				actiontype = _actiontype;
				return container.get("actions").add({ "name": "console yes", "type": actiontype, "params": "\"yes\"" });
			}).then(function() {
				return container.get("actions").add({ "name": "console no", "type": actiontype, "params": "\"no\"" });
			}).then(function() { done(); }).catch(done);

		});

		it("should create conditions", function(done) {

			container.get("conditionstypes").add({ code: "EQUAL", "name" : "equal" }).then(function(conditiontype) {
				return container.get("conditions").add({ "name": "true", "type": conditiontype, "value": "true" });
			}).then(function() { done(); }).catch(done);

		});

		it("should create scenario", function(done) {

			container.get("conditions").last().then(function() {
				return container.get("scenarios").add({ "name": "test", "active": true });
			}).then(function() { done(); }).catch(done);

		});

		it("should link scenario to condition", function(done) {

			let condition;

			container.get("conditions").last().then(function(_condition) {
				condition = _condition;
				return container.get("scenarios").last();
			}).then(function(scenario) {
				return container.get("scenarios").linkStartCondition(scenario, condition);
			}).then(function() { done(); }).catch(done);

		});

		it("should link condition to actions", function(done) {

			let condition;

			container.get("conditions").last().then(function(_condition) {
				condition = _condition;
				return container.get("actions").searchOne({ name: "console yes" });
			}).then(function(onyes) {
				return container.get("conditions").linkOnYesAction(condition, onyes);
			}).then(function() {
				return container.get("actions").searchOne({ name: "console no" });
			}).then(function(onno) {
				return container.get("conditions").linkOnNoAction(condition, onno);
			}).then(function() { done(); }).catch(done);

		});

	});

	describe("return way", function() {

		it("should return a builded way", function(done) {

			container.get("conditions").last().then(function() {
				return container.get("scenarios").last();
			}).then(function(scenario) {
				return container.get("scenarios").getWay(scenario);
			}).then(function(scenario) {

				assert.strictEqual("scenario", scenario.nodetype, "Scenario returned is not valid (nodetype)");
				assert.strictEqual("test", scenario.name, "Scenario returned is not valid (name)");
				assert.strictEqual(true, scenario.active, "Scenario returned is not valid (active)");

				assert.strictEqual("object", typeof scenario.start, "Scenario returned is not valid (start)");

					assert.strictEqual("condition", scenario.start.nodetype, "Scenario returned is not valid (start nodetype)");
					assert.strictEqual("true", scenario.start.name, "Scenario returned is not valid (start name)");
					assert.strictEqual("true", scenario.start.value, "Scenario returned is not valid (start name)");
					
					assert.strictEqual("object", typeof scenario.start.type, "Scenario returned is not valid (start type)");

						assert.strictEqual("EQUAL", scenario.start.type.code, "Scenario returned is not valid (start type code)");
						assert.strictEqual("equal", scenario.start.type.name, "Scenario returned is not valid (start type name)");

					assert.strictEqual("object", typeof scenario.start.onyes, "Scenario returned is not valid (start onyes)");

						assert.strictEqual("action", scenario.start.onyes.nodetype, "Scenario returned is not valid (start onyes nodetype)");
						assert.strictEqual("console yes", scenario.start.onyes.name, "Scenario returned is not valid (start onyes name)");
						assert.strictEqual("yes", scenario.start.onyes.params, "Scenario returned is not valid (start onyes params)");
						assert.strictEqual(null, scenario.start.onyes.after, "Scenario returned is not valid (start onyes after)");

						assert.strictEqual("object", typeof scenario.start.onyes.type, "Scenario returned is not valid (start onyes type)");

							assert.strictEqual("CONSOLE", scenario.start.onyes.type.code, "Scenario returned is not valid (start onyes type code)");
							assert.strictEqual("console", scenario.start.onyes.type.name, "Scenario returned is not valid (start onyes type name)");

					assert.strictEqual("object", typeof scenario.start.onno, "Scenario returned is not valid (start onno)");

						assert.strictEqual("action", scenario.start.onno.nodetype, "Scenario returned is not valid (start onno nodetype)");
						assert.strictEqual("console no", scenario.start.onno.name, "Scenario returned is not valid (start onno name)");
						assert.strictEqual("no", scenario.start.onno.params, "Scenario returned is not valid (start onno params)");
						assert.strictEqual(null, scenario.start.onno.after, "Scenario returned is not valid (start onno after)");

						assert.strictEqual("object", typeof scenario.start.onno.type, "Scenario returned is not valid (start onno type)");

							assert.strictEqual("CONSOLE", scenario.start.onno.type.code, "Scenario returned is not valid (start onno type code)");
							assert.strictEqual("console", scenario.start.onno.type.name, "Scenario returned is not valid (start onno type name)");

				done();

			}).catch(done);

		});

	});

});
