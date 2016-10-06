"use strict";

// deps

	const 	assert = require("assert"),
			NodeScenarios = require(require("path").join(__dirname, "..", "lib", "main.js"));

// tests

describe("actions", () => {

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
			"code": "actiontype",
			"name": "actiontype"
		}).then((actiontype) => {

			return container.get("actions").add({
				"type": actiontype,
				"name": "actionbase1"
			}).then((actiontype) => {

				return container.get("actions").add({
					"type": actiontype,
					"name": "actionbase"
				});

			});

		}).then((action) => {

			assert.strictEqual("actionbase", action.name, "Action added is not valid (name)");
			assert.strictEqual("actiontype", action.type.code, "Action added is not valid (type code)");
			assert.strictEqual("actiontype", action.type.name, "Action added is not valid (type name)");
			assert.deepStrictEqual("", action.params, "Action added is not valid (params)");

		});

	});

	it("should create data with pure string params", () => {

		return container.get("actionstypes").searchOne({ "code": "actiontype" }).then((actiontype) => {

			return container.get("actions").add({
				"type": actiontype,
				"name": "actionbasewithspuretringparams",
				"params": "test"
			});

		}).then((action) => {

			assert.strictEqual("actionbasewithspuretringparams", action.name, "Action added is not valid (name)");
			assert.strictEqual("actiontype", action.type.code, "Action added is not valid (type code)");
			assert.strictEqual("actiontype", action.type.name, "Action added is not valid (type name)");
			assert.deepStrictEqual("test", action.params, "Action added is not valid (params)");

		});

	});

	it("should create data with string params", () => {

		return container.get("actionstypes").searchOne({ "code": "actiontype" }).then((actiontype) => {

			return container.get("actions").add({
				"type": actiontype,
				"name": "actionbasewithstringparams",
				"params": "{\"test\": \"test\"}"
			});

		}).then((action) => {

			assert.strictEqual("actionbasewithstringparams", action.name, "Action added is not valid (name)");
			assert.strictEqual("actiontype", action.type.code, "Action added is not valid (type code)");
			assert.strictEqual("actiontype", action.type.name, "Action added is not valid (type name)");
			assert.deepStrictEqual({"test": "test"}, action.params, "Action added is not valid (params)");

		});

	});

	it("should create data with object params", () => {

		return container.get("actionstypes").searchOne({ "code": "actiontype" }).then((actiontype) => {

			return container.get("actions").add({
				"type": actiontype,
				"name": "actionbasewithobjectparams",
				"params": {"test": "test"}
			});

		}).then((action) => {

			assert.strictEqual("actionbasewithobjectparams", action.name, "Action added is not valid (name)");
			assert.strictEqual("actiontype", action.type.code, "Action added is not valid (type code)");
			assert.strictEqual("actiontype", action.type.name, "Action added is not valid (type name)");
			assert.deepStrictEqual({"test": "test"}, action.params, "Action added is not valid (params)");

		});

	});

	it("should return the last inserted data", () => {

		return container.get("actions").last().then((action) => {

			assert.strictEqual("actionbasewithobjectparams", action.name, "Action added is not valid (name)");
			assert.strictEqual("actiontype", action.type.code, "Action added is not valid (type code)");
			assert.strictEqual("actiontype", action.type.name, "Action added is not valid (type name)");
			assert.deepStrictEqual({"test": "test"}, action.params, "Action added is not valid (params)");

		});

	});

	it("should return all the data with the name \"actionbase\"", () => {

		return container.get("actions").search({ "name": "actionbase" }).then((actions) => {
			assert.strictEqual(1, actions.length, "Actions returned are not valid");
		});

	});

	it("should return one data with the name \"actionbase\"", () => {

		return container.get("actions").searchOne({ "name": "actionbase" }).then((action) => {
			assert.notStrictEqual(null, action, "Action returned is not valid");
		});

	});

	it("should return all the data with the action type having the code \"actiontype\"", () => {

		return container.get("actions").search({ "type": { "code": "actiontype" } }).then((actions) => {
			assert.strictEqual(5, actions.length, "Actions returned are not valid");
		});

	});

	it("should return all the data with the action type having the name \"actiontype\"", () => {

		return container.get("actions").search({ "type": { "name": "actiontype" } }).then((actions) => {
			assert.strictEqual(5, actions.length, "Actions returned are not valid");
		});

	});

	it("should return multiples ids", () => {

		return container.get("actions").search().then((actions) => {

			let ids = [];
			actions.forEach((action) => {
				ids.push(action.id);
			});

			return container.get("actions").search({ ids: ids }).then((actions) => {

				assert.notStrictEqual(null, actions, "Actions returned are not valid");
				assert.strictEqual(5, actions.length, "Actions returned are not valid");

			});
			
		});

	});

	it("should edit last inserted data", () => {

		return container.get("actions").last().then((action) => {
			action.name = "test2";
			return container.get("actions").edit(action);
		}).then((action) => {
			assert.strictEqual("test2", action.name, "Action returned is not valid");
		});

	});

	it("should bind wrong executer", () => {

		return container.get("actionstypes").last().then((actiontype) => {
			return container.get("actions").bindExecuter(actiontype);
		}).then(() => {
			assert.ok(false, "Wrong executer does not generate error");
		}).catch((err) => {
			assert.strictEqual("string", typeof err, "Wrong executer generate incorrect error");
			return Promise.resolve();
		});

	});

	it("should bind executer with wrong actiontype", () => {

		return container.get("actions").bindExecuter({}).then(() => {
			assert.ok(false, "Wrong executer does not generate error");
		}).catch((err) => {
			assert.strictEqual("string", typeof err, "Wrong executer generate incorrect error");
			return Promise.resolve();
		});

	});

	it("should bind executer", () => {

		return container.get("actionstypes").last().then((actiontype) => {

			return container.get("actions").bindExecuter(actiontype, (action) => {
				assert.strictEqual("test2", action.name, "Action returned is not valid");
				return Promise.resolve();
			});

		}).then(() => {
			return container.get("actions").last();
		}).then((action) => {
			return container.get("actions").execute(action);
		});

	});

	it("should link to trigger", () => {

		return container.get("triggers").add({ name: "test", code: "test" }).then((trigger) => {
			
			return container.get("actions").last().then((action) => {
				return container.get("actions").linkToTrigger(action, trigger);
			});

		});
		
	});

	it("should return linked triggers", () => {

		return container.get("actions").last().then((action) => {
			return container.get("triggers").search({ action: action });
		}).then((triggers) => {

			assert.strictEqual(true, triggers instanceof Array, "Returned value is not an Array");
			assert.strictEqual(1, triggers.length, "There is no linked triggers");

		});

	});

	it("should unlink to trigger", () => {

		return container.get("triggers").last().then((trigger) => {
			
			return container.get("actions").last().then((action) => {
				return container.get("actions").unlinkToTrigger(action, trigger);
			});

		});
		
	});

	it("should return linked triggers", () => {

		return container.get("actions").last().then((action) => {
			return container.get("triggers").search({ action: action });
		}).then((triggers) => {

			assert.strictEqual(true, triggers instanceof Array, "Returned value is not an Array");
			assert.strictEqual(0, triggers.length, "There is no linked triggers");

		});

	});

	it("should delete last inserted data", () => {

		return container.get("actions").last().then((action) => {
			return container.get("actions").delete(action);
		}).then(() => {
			return container.get("actions").last();
		}).then((action) => {

			assert.strictEqual("actionbasewithstringparams", action.name, "Action returned is not valid (name)");
			assert.strictEqual("actiontype", action.type.code, "Action returned is not valid (type code)");
			assert.strictEqual("actiontype", action.type.name, "Action returned is not valid (type name)");
			assert.deepStrictEqual({"test": "test"}, action.params, "Action returned is not valid (params)");

		});

	});

	it("should create data with action", () => {

		let actionBase;

		return container.get("actionstypes").last().then((actiontype) => {

			return container.get("actions").add({
				"type": actiontype,
				"name": "actionbase"
			});

		}).then((action) => {
			actionBase = action;
			return container.get("actionstypes").last();
		}).then((actiontype) => {

			return container.get("actions").add({
				type: actiontype,
				name: "actionafter"
			});

		}).then((actionafter) => {
			return container.get("actions").linkAfterAction(actionBase, actionafter);
		}).then((action) => {

			assert.strictEqual("actionbase", action.name, "Action added is not valid (name)");
			assert.strictEqual("actiontype", action.type.code, "Action added is not valid (type code)");
			assert.strictEqual("actiontype", action.type.name, "Action added is not valid (type name)");
			assert.strictEqual("actionafter", action.after.name, "Action added is not valid (after name)");
			assert.strictEqual("action", action.after.nodetype, "Action added is not valid (after nodetype)");

			return container.get("actions").unlinkAfter(actionBase);

		}).then((action) => {

			assert.strictEqual("actionbase", action.name, "Action added is not valid (name)");
			assert.strictEqual("actiontype", action.type.code, "Action added is not valid (type code)");
			assert.strictEqual("actiontype", action.type.name, "Action added is not valid (type name)");
			assert.strictEqual(null, action.after, "Action added is not valid (after)");

		});


	});

	it("should create data with condition", () => {

		let actionBase;

		return container.get("actions").search().then((actions) => {

			actionBase = actions[1];

			return container.get("conditionstypes").add({
				"code": "conditiontype",
				"name": "conditiontype"
			});

		}).then((conditiontype) => {

			return container.get("conditions").add({
				type: conditiontype,
				name: "conditionafter",
				value: "test"
			});

		}).then((conditionafter) => {
			return container.get("actions").linkAfterCondition(actionBase, conditionafter);
		}).then((action) => {

			assert.strictEqual("actionbase", action.name, "Action added is not valid (name)");
			assert.strictEqual("actiontype", action.type.code, "Action added is not valid (type code)");
			assert.strictEqual("actiontype", action.type.name, "Action added is not valid (type name)");
			assert.strictEqual("conditionafter", action.after.name, "Action added is not valid (after name)");
			assert.strictEqual("condition", action.after.nodetype, "Action added is not valid (after nodetype)");

			return container.get("actions").unlinkAfter(actionBase);

		}).then((action) => {

			assert.strictEqual("actionbase", action.name, "Action added is not valid (name)");
			assert.strictEqual("actiontype", action.type.code, "Action added is not valid (type code)");
			assert.strictEqual("actiontype", action.type.name, "Action added is not valid (type name)");
			assert.strictEqual(null, action.after, "Action added is not valid (after)");

		});


	});

});
