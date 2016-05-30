
"use strict";

// private

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _sSelectQuery = "SELECT triggers.id, triggers.code, triggers.name FROM triggers";

// module

module.exports = (function (_require) {
	_inherits(DBTriggers, _require);

	function DBTriggers() {
		_classCallCheck(this, DBTriggers);

		_get(Object.getPrototypeOf(DBTriggers.prototype), "constructor", this).apply(this, arguments);
	}

	_createClass(DBTriggers, [{
		key: "lastInserted",

		// read

		value: function lastInserted() {

			var that = this;
			return new Promise(function (resolve, reject) {

				that.db.get(_sSelectQuery + " ORDER BY triggers.id DESC LIMIT 0,1;", [], function (err, row) {

					if (err) {
						reject(err.message ? err.message : err);
					} else {
						resolve(row ? DBTriggers.formate(row) : null);
					}
				});
			});
		}
	}, {
		key: "search",
		value: function search(data) {

			var that = this;
			return new Promise(function (resolve, reject) {

				var options = {},
				    query = _sSelectQuery;

				if (data) {

					if (data.scenario && data.scenario.id) {

						query += " INNER JOIN scenariostriggers ON scenariostriggers.id_scenario = :id_scenario";
						options[":id_scenario"] = data.scenario.id;
					}

					query += " WHERE 1 = 1";

					if (data.id) {
						query += " AND triggers.id = :id";
						options[":id"] = data.id;
					}
					if (data.name) {
						query += " AND triggers.name = :name";
						options[":name"] = data.name;
					}

					if (data.scenario && !data.scenario.id) {
						query += " AND 1 = 0";
					}
				}

				that.db.all(query + " ORDER BY triggers.name ASC;", options, function (err, rows) {

					if (err) {
						reject(err.message ? err.message : err);
					} else {

						rows.forEach(function (trigger, i) {
							rows[i] = DBTriggers.formate(trigger);
						});

						resolve(rows);
					}
				});
			});
		}

		// write

	}, {
		key: "add",
		value: function add(trigger) {

			var that = this;
			return new Promise(function (resolve, reject) {

				if (!trigger) {
					reject("There is no data.");
				} else if (!trigger.code) {
					reject("There is no code.");
				} else if (!trigger.name) {
					reject("There is no name.");
				} else {

					that.db.run("INSERT INTO triggers (code, name) VALUES (:code, :name);", {
						":code": trigger.code,
						":name": trigger.name
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
		value: function edit(trigger) {

			var that = this;
			return new Promise(function (resolve, reject) {

				if (!trigger) {
					reject("There is no data.");
				} else if (!trigger.id) {
					reject("The trigger is not valid.");
				} else if (!trigger.code) {
					reject("There is no code.");
				} else if (!trigger.name) {
					reject("There is no name.");
				} else {

					that.db.run("UPDATE triggers SET code = :code, name = :name WHERE id = :id;", {
						":id": trigger.id,
						":code": trigger.code,
						":name": trigger.name
					}, function (err) {

						if (err) {
							reject(err.message ? err.message : err);
						} else {
							resolve(trigger);
						}
					});
				}
			});
		}
	}, {
		key: "delete",
		value: function _delete(trigger) {

			var that = this;
			return new Promise(function (resolve, reject) {

				if (!trigger) {
					reject("There is no data.");
				} else if (!trigger.id) {
					reject("The trigger is not valid.");
				} else {

					that.db.run("DELETE FROM triggers WHERE id = :id;", { ":id": trigger.id }, function (err) {

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
		key: "linkToScenario",
		value: function linkToScenario(scenario, trigger) {

			var that = this;
			return new Promise(function (resolve, reject) {

				if (!scenario) {
					reject("There is no scenario data.");
				} else if (!scenario.id) {
					reject("There is no valid scenario data.");
				} else if (!trigger) {
					reject("There is no trigger data.");
				} else if (!trigger.id) {
					reject("There is no valid trigger data.");
				} else {

					that.db.run("INSERT INTO scenariostriggers (id_scenario, id_trigger) VALUES (:id_scenario, :id_trigger);", {
						":id_scenario": scenario.id,
						":id_trigger": trigger.id
					}, function (err) {

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
		key: "unlinkToScenario",
		value: function unlinkToScenario(scenario, trigger) {

			var that = this;
			return new Promise(function (resolve, reject) {

				if (!scenario) {
					reject("There is no scenario data.");
				} else if (!scenario.id) {
					reject("There is no valid scenario data.");
				} else if (!trigger) {
					reject("There is no trigger data.");
				} else if (!trigger.id) {
					reject("There is no valid trigger data.");
				} else {

					that.db.run("DELETE FROM scenariostriggers WHERE id_scenario = :id_scenario AND id_trigger = :id_trigger;", {
						":id_scenario": scenario.id,
						":id_trigger": trigger.id
					}, function (err) {

						if (err) {
							reject(err.message ? err.message : err);
						} else {
							resolve();
						}
					});
				}
			});
		}
	}]);

	return DBTriggers;
})(require(require("path").join(__dirname, "_abstract.js")));