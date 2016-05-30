
"use strict";

// private

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _sSelectQuery = "" + " SELECT" + " actions.id," + " actions.name," + " actions.params," + " actionstypes.id AS actiontype_id," + " actionstypes.code AS actiontype_code," + " actionstypes.name AS actiontype_name" + " FROM actions" + " INNER JOIN actionstypes ON actionstypes.id = actions.id_type";

var _tabExecuters = {};

// module

module.exports = (function (_require) {
	_inherits(DBActions, _require);

	function DBActions() {
		_classCallCheck(this, DBActions);

		_get(Object.getPrototypeOf(DBActions.prototype), "constructor", this).apply(this, arguments);
	}

	_createClass(DBActions, [{
		key: "lastInserted",

		// read

		value: function lastInserted() {

			var that = this;
			return new Promise(function (resolve, reject) {

				that.db.get(_sSelectQuery + " ORDER BY actions.id DESC LIMIT 0,1;", [], function (err, row) {

					if (err) {
						reject(err.message ? err.message : err);
					} else {
						resolve(row ? DBActions.formate(row) : null);
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

					query += " WHERE 1 = 1";

					if (data.id) {
						query += " AND actions.id = :id";
						options[":id"] = data.id;
					}
					if (data.name) {
						query += " AND actions.name = :name";
						options[":name"] = data.name;
					}

					if (data.type) {

						if (data.type.id) {
							query += " AND actionstypes.id = :actiontype_id";
							options[":actiontype_id"] = data.type.id;
						}
						if (data.type.code) {
							query += " AND actionstypes.code = :actiontype_code";
							options[":actiontype_code"] = data.type.code;
						}
						if (data.type.name) {
							query += " AND actionstypes.name = :actiontype_name";
							options[":actiontype_name"] = data.type.name;
						}
					}
				}

				that.db.all(query + " ORDER BY actionstypes.name ASC, actions.name ASC;", options, function (err, rows) {

					if (err) {
						reject(err.message ? err.message : err);
					} else {

						rows.forEach(function (action, i) {
							rows[i] = DBActions.formate(action);
						});

						resolve(rows);
					}
				});
			});
		}

		// write

	}, {
		key: "add",
		value: function add(action) {

			var that = this;
			return new Promise(function (resolve, reject) {

				if (!action) {
					reject("There is no data.");
				} else if (!action.type) {
					reject("There is no action type.");
				} else if (!action.type.id) {
					reject("The action type is not valid.");
				} else if (!action.name) {
					reject("There is no name.");
				} else {

					if (!action.params) {
						action.params = "";
					} else if ("object" === typeof action.params) {

						try {
							action.params = JSON.stringify(action.params);
						} catch (e) {
							action.params = "";
						}
					}

					that.db.run("INSERT INTO actions (id_type, name, params) VALUES (:id_type, :name, :params);", {
						":id_type": action.type.id,
						":name": action.name,
						":params": action.params
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
		value: function edit(action) {

			var that = this;
			return new Promise(function (resolve, reject) {

				if (!action) {
					reject("There is no data.");
				} else if (!action.id) {
					reject("The action is not valid.");
				} else if (!action.type) {
					reject("There is no action type.");
				} else if (!action.type.id) {
					reject("The action type is not valid.");
				} else if (!action.name) {
					reject("There is no name.");
				} else {

					if (!action.params) {
						action.params = "";
					} else if ("object" === typeof action.params) {

						try {
							action.params = JSON.stringify(action.params);
						} catch (e) {
							action.params = "";
						}
					}

					that.db.run("UPDATE actions SET id_type = :id_type, name = :name, params = :params WHERE id = :id;", {
						":id": action.id,
						":id_type": action.type.id,
						":name": action.name,
						":params": action.params
					}, function (err) {

						if (err) {
							reject(err.message ? err.message : err);
						} else {
							resolve(action);
						}
					});
				}
			});
		}
	}, {
		key: "delete",
		value: function _delete(action) {

			var that = this;
			return new Promise(function (resolve, reject) {

				if (!action) {
					reject("There is no data.");
				} else if (!action.id) {
					reject("The action is not valid.");
				} else {

					that.db.run("DELETE FROM actions WHERE id = :id;", { ":id": action.id }, function (err) {

						if (err) {
							reject(err.message ? err.message : err);
						} else {
							resolve();
						}
					});
				}
			});
		}

		// execute

	}, {
		key: "bindExecuter",
		value: function bindExecuter(actiontype, executer) {

			return new Promise(function (resolve, reject) {

				if (!actiontype) {
					reject("There is no action type.");
				} else if (!actiontype.id || !actiontype.code) {
					reject("The action type is incorrect.");
				} else if ("function" !== typeof executer) {
					reject("The executer is not a function.");
				} else {
					_tabExecuters[actiontype.code] = executer;
					resolve();
				}
			});
		}
	}, {
		key: "execute",
		value: function execute(action) {

			return new Promise(function (resolve, reject) {

				if (!action) {
					reject("There is no data.");
				} else if (!action.type) {
					reject("There is no action type.");
				} else if (!action.type.id || !action.type.code) {
					reject("The action type is not valid.");
				} else {

					if (!_tabExecuters[action.type.code]) {
						resolve();
					} else {

						try {
							_tabExecuters[action.type.code](action);
							resolve();
						} catch (e) {
							reject(e.message ? e.message : e);
						}
					}
				}
			});
		}
	}], [{
		key: "formate",

		// formate data

		value: function formate(action) {

			action.type = {
				id: action.actiontype_id,
				code: action.actiontype_code,
				name: action.actiontype_name
			};

			delete action.actiontype_id;
			delete action.actiontype_code;
			delete action.actiontype_name;

			if (action.actions_after_id) {

				action.after = {
					"id": action.actions_after_id,
					"name": action.actions_after_name,
					"nodetype": "action"
				};
			} else if (action.conditions_after_id) {

				action.after = {
					"id": action.conditions_after_id,
					"name": action.conditions_after_name,
					"nodetype": "condition"
				};
			} else {
				action.after = null;
			}

			delete action.actions_after_id;
			delete action.actions_after_name;

			delete action.conditions_after_id;
			delete action.conditions_after_name;

			try {
				action.params = "string" === typeof action.params && "" !== action.params ? JSON.parse(action.params) : null;
			} catch (e) {
				action.params = null;
			}

			return action;
		}
	}]);

	return DBActions;
})(require(require("path").join(__dirname, "_abstract.js")));