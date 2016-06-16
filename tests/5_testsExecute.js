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

		it("should create actions", function() {

			let actiontype;

			return container.get("actionstypes").add({ code: "CONSOLE", "name" : "console" }).then(function(_actiontype) {
				actiontype = _actiontype;
				return container.get("actions").add({ "name": "console yes", "type": actiontype, "params": "\"yes\"" });
			}).then(function() {
				return container.get("actions").add({ "name": "console no", "type": actiontype, "params": "\"no\"" });
			});

		});

		it("should create conditions", function() {

			return container.get("conditionstypes").add({ code: "BOOLEQUAL", "name" : "equal" }).then(function(conditiontype) {
				return container.get("conditions").add({ "name": "true", "type": conditiontype, "value": "true" });
			});

		});

		it("should create scenario", function() {

			return container.get("conditions").last().then(function() {
				return container.get("scenarios").add({ "name": "test", "active": true });
			});

		});

		it("should link scenario to condition", function() {

			let condition;

			return container.get("conditions").last().then(function(_condition) {
				condition = _condition;
				return container.get("scenarios").last();
			}).then(function(scenario) {
				return container.get("scenarios").linkStartCondition(scenario, condition);
			});

		});

		it("should link condition to actions", function() {

			let condition;

			return container.get("conditions").last().then(function(_condition) {
				condition = _condition;
				return container.get("actions").searchOne({ name: "console yes" });
			}).then(function(onyes) {
				return container.get("conditions").linkOnYesAction(condition, onyes);
			}).then(function() {
				return container.get("actions").searchOne({ name: "console no" });
			}).then(function(onno) {
				return container.get("conditions").linkOnNoAction(condition, onno);
			});

		});

	});

	describe("return way", function() {

		it("should test an inexistant scenario", function() {

			return container.get("scenarios").getWay({ id: 10 }).then(function() {
				return Promise.reject("The scenario was found");
			}).catch(function(err) {
				assert.strictEqual("Impossible to find this scenario.", err, "Error returned is not valid");
				return Promise.resolve();
			});

		});


		it("should return a builded way", function() {

			return container.get("conditions").last().then(function() {
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

						assert.strictEqual("BOOLEQUAL", scenario.start.type.code, "Scenario returned is not valid (start type code)");
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

			});

		});

		it("should execute a scenario", function() {

			container.get("conditionstypes").searchOne({ code: "BOOLEQUAL" }).then(function(conditiontype) {

				if (!conditiontype) {
					return Promise.reject("There is no conditiontype with \"BOOLEQUAL\" code.");
				}
				else {

					return container.get("conditions").bindExecuter(conditiontype, function(condition, data) {

						if ("undefined" === typeof data.condition) {
							return Promise.reject("There is no \"condition\" data.");
						}
							else if ("boolean" !== typeof data.condition) {
								return Promise.reject("\"condition\" data is not a boolean.");
							}
						else {
							return Promise.resolve(data.condition);
						}

					});

				}

			}).then(function() {
				return container.get("actionstypes").searchOne({ code: "CONSOLE" });
			}).then(function(actiontype) {

				if (!actiontype) {
					return Promise.reject("There is no actiontype with \"CONSOLE\" code.");
				}
				else {

					let cn = console;

					return container.get("actions").bindExecuter(actiontype, function(action) {

						cn.log(action.params);
						return Promise.resolve();

					});

				}

			}).then(function() {
				return container.get("scenarios").last();
			}).then(function(scenario) {

				return container.get("scenarios").execute(scenario, {
					condition: true
				});

			}).then(function() {
				return container.get("scenarios").last();
			}).then(function(scenario) {

				return container.get("scenarios").execute(scenario, {
					condition: false
				});

			});

		});

	});

});
