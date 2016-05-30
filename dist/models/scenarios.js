
"use strict";

// deps

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var path = require("path");

// private

var _sSelectQuery = "" + "SELECT" + " scenarios.id," + " scenarios.name," + " scenarios.active," + " actions.id AS action_id," + " actions.name AS action_name," + " conditions.id AS condition_id," + " conditions.name AS condition_name" + " FROM scenarios" + " LEFT JOIN junctions ON junctions.id = scenarios.id_start" + " LEFT JOIN actions ON actions.id = junctions.id_action" + " LEFT JOIN conditions ON conditions.id = junctions.id_condition",
    _container;

function _junctionToWay(that, type, junction) {

	return new Promise(function (resolve, reject) {

		if ("action" === type) {

			_container.get("actions").searchOne({ id: junction.id }).then(function (action) {

				action.nodetype = "scenario";

				if (!action.after) {
					resolve(action);
				} else {

					_junctionToWay(that, action.after.nodetype, action.after).then(function (after) {
						action.after = after;
						resolve(action);
					})["catch"](reject);
				}
			})["catch"](reject);
		} else if ("condition" === type) {

			_container.get("conditions").searchOne({ id: junction.id }).then(function (condition) {

				condition.nodetype = "condition";

				if (!condition.onyes && !condition.onno) {
					resolve(condition);
				} else if (condition.onyes) {

					_junctionToWay(that, condition.onyes.nodetype, condition.onyes).then(function (onyes) {

						condition.onyes = onyes;

						if (!condition.onno) {
							resolve(condition);
						} else {

							_junctionToWay(that, condition.onno.nodetype, condition.onno).then(function (onno) {
								condition.onno = onno;
								resolve(condition);
							})["catch"](reject);
						}
					})["catch"](reject);
				} else {

					_junctionToWay(that, condition.onno.nodetype, condition.onno).then(function (onno) {
						condition.onno = onno;
						resolve(condition);
					})["catch"](reject);
				}
			})["catch"](reject);
		} else {
			resolve(null);
		}
	});
}

// module

module.exports = (function (_require) {
	_inherits(DBScenarios, _require);

	function DBScenarios(container) {
		_classCallCheck(this, DBScenarios);

		_get(Object.getPrototypeOf(DBScenarios.prototype), "constructor", this).call(this, container);
		_container = container;
	}

	// formate data

	_createClass(DBScenarios, [{
		key: "lastInserted",

		// read

		value: function lastInserted() {

			var that = this;
			return new Promise(function (resolve, reject) {

				that.db.get(_sSelectQuery + " ORDER BY scenarios.id DESC LIMIT 0,1;", [], function (err, row) {

					if (err) {
						reject(err.message ? err.message : err);
					} else {
						resolve(row ? DBScenarios.formate(row) : null);
					}
				});
			});
		}
	}, {
		key: "search",
		value: function search(scenario) {

			var that = this;
			return new Promise(function (resolve, reject) {

				var options = {},
				    query = _sSelectQuery;

				if (scenario) {

					if (scenario.trigger && scenario.trigger.id) {

						query += " INNER JOIN scenariostriggers ON scenariostriggers.id_trigger = :id_trigger";
						options[":id_trigger"] = scenario.trigger.id;
					}

					query += " WHERE 1 = 1";

					if (scenario.id) {
						query += " AND scenarios.id = :id";
						options[":id"] = scenario.id;
					}
					if (scenario.name) {
						query += " AND scenarios.name = :name";
						options[":name"] = scenario.name;
					}
					if ("undefined" !== typeof scenario.active) {
						query += " AND scenarios.active = :active";
						options[":active"] = scenario.active ? "1" : "0";
					}

					if (scenario.trigger && !scenario.trigger.id) {
						query += " AND 1 = 0";
					}
				}

				that.db.all(query + " ORDER BY scenarios.name ASC;", options, function (err, rows) {

					if (err) {
						reject(err.message ? err.message : err);
					} else {

						rows.forEach(function (row, i) {
							rows[i] = DBScenarios.formate(row);
						});

						resolve(rows);
					}
				});
			});
		}

		// write

	}, {
		key: "add",
		value: function add(scenario) {

			var that = this;
			return new Promise(function (resolve, reject) {

				if (!scenario) {
					reject("There is no data.");
				} else if (!scenario.name) {
					reject("There is no name.");
				} else {

					that.db.run("INSERT INTO scenarios (name, active) VALUES (:name, :active);", {
						":name": scenario.name,
						":active": "undefined" !== typeof scenario.active && (true === scenario.active || 1 == scenario.active) ? "1" : "0"
					}, function (err) {

						if (err) {
							reject(err.message ? err.message : err);
						} else {
							that.lastInserted().then(resolve)["catch"](reject);
						}
					});
				}
			});
		}
	}, {
		key: "edit",
		value: function edit(scenario) {

			var that = this;
			return new Promise(function (resolve, reject) {

				if (!scenario) {
					reject("There is no data.");
				} else if (!scenario.id) {
					reject("The scenario is incorrect.");
				} else if (!scenario.name) {
					reject("There is no name.");
				} else {

					scenario.start = scenario.start ? scenario.start : null;

					that.db.run("UPDATE scenarios SET name = :name, active = :active, id_start = :start WHERE id = :id;", {
						":id": scenario.id,
						":name": scenario.name,
						":active": "undefined" !== typeof scenario.active && (true === scenario.active || 1 == scenario.active) ? "1" : "0",
						":start": scenario.start
					}, function (err) {

						if (err) {
							reject(err.message ? err.message : err);
						} else {
							resolve(scenario);
						}
					});
				}
			});
		}
	}, {
		key: "delete",
		value: function _delete(scenario) {

			var that = this;
			return new Promise(function (resolve, reject) {

				if (!scenario) {
					reject("There is no data.");
				} else if (!scenario.id) {
					reject("The scenario is incorrect.");
				} else {

					that.db.run("DELETE FROM scenarios WHERE id = :id;", { ":id": scenario.id }, function (err) {

						if (err) {
							reject(err.message ? err.message : err);
						} else {
							resolve();
						}
					});
				}
			});
		}

		// triggers

	}, {
		key: "linkToTrigger",
		value: function linkToTrigger(scenario, trigger) {
			return _container.get("triggers").linkToScenario(scenario, trigger);
		}
	}, {
		key: "unlinkToTrigger",
		value: function unlinkToTrigger(scenario, trigger) {
			return _container.get("triggers").unlinkToScenario(scenario, trigger);
		}

		// junctions

	}, {
		key: "deleteJunction",
		value: function deleteJunction(junction) {

			var that = this;
			return new Promise(function (resolve, reject) {

				if (!junction) {
					reject("There is no junction.");
				} else if (!junction.id) {
					reject("The junction is incorrect.");
				} else {

					that.db.run("DELETE FROM junctions WHERE id = :id;", { ":id": junction.id }, function (err) {

						if (err) {
							reject(err.message ? err.message : err);
						} else {
							resolve();
						}
					});
				}
			});
		}
	}, {
		key: "createActionJunction",
		value: function createActionJunction(action) {

			var that = this;
			return new Promise(function (resolve, reject) {

				if (!action) {
					reject("There is no action.");
				} else if (!action.id) {
					reject("The action is incorrect.");
				} else {

					that.db.run("INSERT INTO junctions (id_action) VALUES (:id_action);", { ":id_action": action.id }, function (err) {

						if (err) {
							reject(err.message ? err.message : err);
						} else {

							that.db.get("SELECT junctions.id FROM junctions ORDER BY junctions.id DESC LIMIT 0,1;", [], function (err, row) {

								if (err) {
									reject(err.message ? err.message : err);
								} else if (!row) {
									reject("Impossible to create this action junction.");
								} else {
									resolve(row.id);
								}
							});
						}
					});
				}
			});
		}
	}, {
		key: "createConditionJunction",
		value: function createConditionJunction(condition) {

			var that = this;
			return new Promise(function (resolve, reject) {

				if (!condition) {
					reject("There is no condition.");
				} else if (!condition.id) {
					reject("The condition is incorrect.");
				} else {

					that.db.run("INSERT INTO junctions (id_condition) VALUES (:id_condition);", { ":id_condition": condition.id }, function (err) {

						if (err) {
							reject(err.message ? err.message : err);
						} else {

							that.db.get("SELECT junctions.id FROM junctions ORDER BY junctions.id DESC LIMIT 0,1;", [], function (err, row) {

								if (err) {
									reject(err.message ? err.message : err);
								} else if (!row) {
									reject("Impossible to create this condition junction.");
								} else {
									resolve(row.id);
								}
							});
						}
					});
				}
			});
		}

		// start

	}, {
		key: "linkStartAction",
		value: function linkStartAction(scenario, node) {

			var that = this;
			return new Promise(function (resolve, reject) {

				if (!scenario) {
					reject("There is no data.");
				} else if (!scenario.id) {
					reject("The scenario is incorrect.");
				} else if (!node) {
					reject("There is no node.");
				} else if (!node.id) {
					reject("The node is incorrect.");
				} else {

					that.unlinkStart(scenario).then(function (scenario) {
						return that.createActionJunction(node);
					}).then(function (junctionid) {
						scenario.start = junctionid;
						return that.edit(scenario);
					}).then(function () {
						return that.searchOne({ id: scenario.id });
					}).then(function (scenario) {
						resolve(scenario);
					})["catch"](reject);
				}
			});
		}
	}, {
		key: "linkStartCondition",
		value: function linkStartCondition(scenario, node) {

			var that = this;
			return new Promise(function (resolve, reject) {

				if (!scenario) {
					reject("There is no data.");
				} else if (!scenario.id) {
					reject("The scenario is incorrect.");
				} else if (!node) {
					reject("There is no node.");
				} else if (!node.id) {
					reject("The node is incorrect.");
				} else {

					that.unlinkStart(scenario).then(function (scenario) {
						return that.createConditionJunction(node);
					}).then(function (junctionid) {
						scenario.start = junctionid;
						return that.edit(scenario);
					}).then(function () {
						return that.searchOne({ id: scenario.id });
					}).then(function (scenario) {
						resolve(scenario);
					})["catch"](reject);
				}
			});
		}
	}, {
		key: "unlinkStart",
		value: function unlinkStart(scenario) {

			var that = this;
			return new Promise(function (resolve, reject) {

				if (!scenario) {
					reject("There is no data.");
				} else if (!scenario.id) {
					reject("The scenario is incorrect.");
				} else {

					that.searchOne({ id: scenario.id }).then(function (scenario) {

						if (!scenario.start) {
							resolve(scenario);
						} else {

							that.deleteJunction(scenario.start).then(function () {

								scenario.start = null;

								that.edit(scenario).then(function () {
									return that.searchOne({ id: scenario.id });
								}).then(function (scenario) {
									resolve(scenario);
								})["catch"](reject);
							})["catch"](reject);
						}
					})["catch"](reject);
				}
			});
		}

		// run

	}, {
		key: "getWay",
		value: function getWay(scenario) {

			var that = this;
			return new Promise(function (resolve, reject) {

				return that.searchOne({ id: scenario.id }).then(function (scenario) {

					if (!scenario) {
						reject("Impossible to find this scenario.");
					} else {

						scenario.nodetype = "scenario";

						if (!scenario.start) {
							resolve(scenario);
						} else {

							_junctionToWay(that, scenario.start.nodetype, scenario.start).then(function (junction) {
								scenario.start = junction;
								resolve(scenario);
							})["catch"](reject);
						}
					}
				});
			});
		}
	}, {
		key: "run",
		value: function run(scenario) {

			//let that = this;
			return this.getWay(scenario).then(function () {});
		}
	}], [{
		key: "formate",
		value: function formate(scenario) {

			scenario.active = 1 === scenario.active ? true : false;

			if (scenario.action_id) {

				scenario.start = {
					"id": scenario.action_id,
					"name": scenario.action_name,
					"nodetype": "action"
				};
			} else if (scenario.condition_id) {

				scenario.start = {
					"id": scenario.condition_id,
					"name": scenario.condition_name,
					"nodetype": "condition"
				};
			} else {
				scenario.start = null;
			}

			delete scenario.action_id;
			delete scenario.action_name;

			delete scenario.condition_id;
			delete scenario.condition_name;

			return scenario;
		}
	}]);

	return DBScenarios;
})(require(path.join(__dirname, "_abstract.js")));