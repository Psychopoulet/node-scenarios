"use strict";

// deps

	const	assert = require("assert"),
			NodeScenarios = require(require("path").join(__dirname, "..", "lib", "main.js"));

// tests

describe("execute", () => {

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

	describe("prepare way", () => {

		it("should create actions", () => {

			let actiontype;

			return container.get("actionstypes").add({ code: "CONSOLE", "name" : "console" }).then((_actiontype) => {
				actiontype = _actiontype;
				return container.get("actions").add({ "name": "console yes", "type": actiontype, "params": "\"yes\"" });
			}).then(() => {
				return container.get("actions").add({ "name": "console no", "type": actiontype, "params": "\"no\"" });
			});

		});

		it("should create conditions", () => {

			return container.get("conditionstypes").add({ code: "BOOLEQUAL", "name" : "equal" }).then((conditiontype) => {
				return container.get("conditions").add({ "name": "true", "type": conditiontype, "value": "true" });
			});

		});

		it("should create scenario", () => {

			return container.get("conditions").last().then(() => {
				return container.get("scenarios").add({ "name": "test", "active": true });
			});

		});

		it("should link scenario to condition", () => {

			let condition;

			return container.get("conditions").last().then((_condition) => {
				condition = _condition;
				return container.get("scenarios").last();
			}).then((scenario) => {
				return container.get("scenarios").linkStartCondition(scenario, condition);
			});

		});

		it("should link condition to actions", () => {

			let condition;

			return container.get("conditions").last().then((_condition) => {
				condition = _condition;
				return container.get("actions").searchOne({ name: "console yes" });
			}).then((onyes) => {
				return container.get("conditions").linkOnYesAction(condition, onyes);
			}).then(() => {
				return container.get("actions").searchOne({ name: "console no" });
			}).then((onno) => {
				return container.get("conditions").linkOnNoAction(condition, onno);
			});

		});

	});

	describe("return way", () => {

		it("should test an inexistant scenario", () => {

			return container.get("scenarios").getWay({ id: 10 }).then(() => {
				return Promise.reject("The scenario was found");
			}).catch((err) => {
				assert.strictEqual("Impossible to find this scenario.", err, "Error returned is not valid");
				return Promise.resolve();
			});

		});


		it("should return a builded way", () => {

			return container.get("conditions").last().then(() => {
				return container.get("scenarios").last();
			}).then((scenario) => {
				return container.get("scenarios").getWay(scenario);
			}).then((scenario) => {

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

		it("should execute a scenario", () => {

			container.get("conditionstypes").searchOne({ code: "BOOLEQUAL" }).then((conditiontype) => {

				if (!conditiontype) {
					return Promise.reject("There is no conditiontype with \"BOOLEQUAL\" code.");
				}
				else {

					return container.get("conditions").bindExecuter(conditiontype, (condition, data) => {

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

			}).then(() => {
				return container.get("actionstypes").searchOne({ code: "CONSOLE" });
			}).then((actiontype) => {

				if (!actiontype) {
					return Promise.reject("There is no actiontype with \"CONSOLE\" code.");
				}
				else {

					let cn = console;

					return container.get("actions").bindExecuter(actiontype, (action) => {

						cn.log(action.params);
						return Promise.resolve();

					});

				}

			}).then(() => {
				return container.get("scenarios").last();
			}).then((scenario) => {

				return container.get("scenarios").execute(scenario, {
					condition: true
				});

			}).then(() => {
				return container.get("scenarios").last();
			}).then((scenario) => {

				return container.get("scenarios").execute(scenario, {
					condition: false
				});

			});

		});

	});

});
