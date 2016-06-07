"use strict";

// deps

	const SimpleScenarios = require(require("path").join(__dirname, "..", "lib", "main.js"));

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

			container.get("conditions").lastInserted().then(function() {
				return container.get("scenarios").add({ "name": "test", "active": true });
			}).then(function() { done(); }).catch(done);

		});

		it("should link scenario to condition", function(done) {

			let condition;

			container.get("conditions").lastInserted().then(function(_condition) {
				condition = _condition;
				return container.get("scenarios").lastInserted();
			}).then(function(scenario) {
				return container.get("scenarios").linkStartCondition(scenario, condition);
			}).then(function() { done(); }).catch(done);

		});

		it("should link condition to actions", function(done) {

			let condition;

			container.get("conditions").lastInserted().then(function(_condition) {
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

			container.get("conditions").lastInserted().then(function() {
				return container.get("scenarios").lastInserted();
			}).then(function(scenario) {
				return container.get("scenarios").getWay(scenario);
			}).then(function(way) {

				console.log(way);
				done();

			}).catch(done);

		});

	});

});
