
"use strict";

// private

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _sSelectQuery = "" + " SELECT" + " conditions.id," + " conditions.name," + " conditions.datavalue," + " conditionstypes.id AS conditiontype_id," + " conditionstypes.code AS conditiontype_code," + " conditionstypes.name AS conditiontype_name," + " actions_onyes.id AS actions_onyes_id," + " actions_onyes.name AS actions_onyes_name," + " conditions_onyes.id AS conditions_onyes_id," + " conditions_onyes.name AS conditions_onyes_name," + " actions_onno.id AS actions_onno_id," + " actions_onno.name AS actions_onno_name," + " conditions_onno.id AS conditions_onno_id," + " conditions_onno.name AS conditions_onno_name" + " FROM conditions" + " INNER JOIN conditionstypes ON conditionstypes.id = conditions.id_type" + " LEFT JOIN junctions AS junctions_onyes ON junctions_onyes.id = conditions.id_onyes" + " LEFT JOIN actions AS actions_onyes ON actions_onyes.id = junctions_onyes.id_action" + " LEFT JOIN conditions AS conditions_onyes ON conditions_onyes.id = junctions_onyes.id_condition" + " LEFT JOIN junctions AS junctions_onno ON junctions_onno.id = conditions.id_onno" + " LEFT JOIN actions AS actions_onno ON actions_onno.id = junctions_onno.id_action" + " LEFT JOIN conditions AS conditions_onno ON conditions_onno.id = junctions_onno.id_condition",
    _container;

// module

module.exports = (function (_require) {
	_inherits(DBConditions, _require);

	function DBConditions(container) {
		_classCallCheck(this, DBConditions);

		_get(Object.getPrototypeOf(DBConditions.prototype), "constructor", this).call(this, container);
		_container = container;
	}

	// formate data

	_createClass(DBConditions, [{
		key: "lastInserted",

		// read

		value: function lastInserted() {

			var that = this;
			return new Promise(function (resolve, reject) {

				that.db.get(_sSelectQuery + " ORDER BY conditions.id DESC LIMIT 0,1;", [], function (err, row) {

					if (err) {
						reject(err.message ? err.message : err);
					} else {
						resolve(row ? DBConditions.formate(row) : null);
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
						query += " AND conditions.id = :id";
						options[":id"] = data.id;
					}
					if (data.name) {
						query += " AND conditions.name = :name";
						options[":name"] = data.name;
					}
					if (data.value) {
						query += " AND conditions.datavalue = :value";
						options[":value"] = data.value;
					}

					if (data.type) {

						if (data.type.id) {
							query += " AND conditionstypes.id = :conditiontype_id";
							options[":conditiontype_id"] = data.type.id;
						}
						if (data.type.code) {
							query += " AND conditionstypes.code = :conditiontype_code";
							options[":conditiontype_code"] = data.type.code;
						}
						if (data.type.name) {
							query += " AND conditionstypes.name = :conditiontype_name";
							options[":conditiontype_name"] = data.type.name;
						}
					}
				}

				that.db.all(query + " ORDER BY conditionstypes.name ASC, conditions.name ASC;", options, function (err, rows) {

					if (err) {
						reject(err.message ? err.message : err);
					} else {

						rows.forEach(function (condition, i) {
							rows[i] = DBConditions.formate(condition);
						});

						resolve(rows);
					}
				});
			});
		}

		// write

	}, {
		key: "add",
		value: function add(condition) {

			var that = this;
			return new Promise(function (resolve, reject) {

				if (!condition) {
					reject("There is no data.");
				} else if (!condition.type) {
					reject("There is no condition type.");
				} else if (!condition.type.id) {
					reject("The condition type is not valid.");
				} else if (!condition.name) {
					reject("There is no name.");
				} else if (!condition.value) {
					reject("There is no value.");
				} else {

					that.db.run("INSERT INTO conditions (id_type, name, datavalue) VALUES (:id_type, :name, :value);", {
						":id_type": condition.type.id,
						":name": condition.name,
						":value": condition.value
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
		value: function edit(condition) {

			var that = this;
			return new Promise(function (resolve, reject) {

				if (!condition) {
					reject("There is no data.");
				} else if (!condition.id) {
					reject("The condition is not valid.");
				} else if (!condition.type) {
					reject("There is no condition type.");
				} else if (!condition.type.id) {
					reject("The condition type is not valid.");
				} else if (!condition.name) {
					reject("There is no name.");
				} else if (!condition.value) {
					reject("There is no value.");
				} else {

					condition.onyes = condition.onyes ? condition.onyes : null;
					condition.onno = condition.onno ? condition.onno : null;

					that.db.run("UPDATE conditions SET id_type = :id_type, name = :name, datavalue = :value, id_onyes = :id_onyes, id_onno = :id_onno WHERE id = :id;", {
						":id": condition.id,
						":id_type": condition.type.id,
						":id_onyes": condition.onyes,
						":id_onno": condition.onno,
						":name": condition.name,
						":value": condition.value
					}, function (err) {

						if (err) {
							reject(err.message ? err.message : err);
						} else {
							resolve(condition);
						}
					});
				}
			});
		}
	}, {
		key: "delete",
		value: function _delete(condition) {

			var that = this;
			return new Promise(function (resolve, reject) {

				if (!condition) {
					reject("There is no data.");
				} else if (!condition.id) {
					reject("The condition is not valid.");
				} else {

					that.db.run("DELETE FROM conditions WHERE id = :id;", { ":id": condition.id }, function (err) {

						if (err) {
							reject(err.message ? err.message : err);
						} else {
							resolve();
						}
					});
				}
			});
		}

		// onyes

	}, {
		key: "linkOnYesAction",
		value: function linkOnYesAction(condition, node) {

			var that = this;
			return new Promise(function (resolve, reject) {

				if (!condition) {
					reject("There is no data.");
				} else if (!condition.id) {
					reject("The condition is incorrect.");
				} else if (!node) {
					reject("There is no node.");
				} else if (!node.id) {
					reject("The node is incorrect.");
				} else {

					that.unlinkOnYes(condition).then(function (condition) {
						return _container.get("scenarios").createActionJunction(node);
					}).then(function (junctionid) {
						condition.onyes = junctionid;
						return that.edit(condition);
					}).then(function () {
						return that.searchOne({ id: condition.id });
					}).then(function (condition) {
						resolve(condition);
					})["catch"](reject);
				}
			});
		}
	}, {
		key: "linkOnYesCondition",
		value: function linkOnYesCondition(condition, node) {

			var that = this;
			return new Promise(function (resolve, reject) {

				if (!condition) {
					reject("There is no data.");
				} else if (!condition.id) {
					reject("The condition is incorrect.");
				} else if (!node) {
					reject("There is no condition.");
				} else if (!node.id) {
					reject("The condition is incorrect.");
				} else {

					that.unlinkOnYes(condition).then(function (condition) {
						return _container.get("scenarios").createConditionJunction(node);
					}).then(function (junctionid) {
						condition.onyes = junctionid;
						return that.edit(condition);
					}).then(function () {
						return that.searchOne({ id: condition.id });
					}).then(function (condition) {
						resolve(condition);
					})["catch"](reject);
				}
			});
		}
	}, {
		key: "unlinkOnYes",
		value: function unlinkOnYes(condition) {

			var that = this;
			return new Promise(function (resolve, reject) {

				if (!condition) {
					reject("There is no data.");
				} else if (!condition.id) {
					reject("The condition is incorrect.");
				} else {

					that.searchOne({ id: condition.id }).then(function (condition) {

						if (!condition.onyes) {
							resolve(condition);
						} else {

							_container.get("scenarios").deleteJunction(condition.onyes).then(function () {

								condition.onyes = null;

								that.edit(condition).then(function () {
									return that.searchOne({ id: condition.id });
								}).then(function (condition) {
									resolve(condition);
								})["catch"](reject);
							})["catch"](reject);
						}
					})["catch"](reject);
				}
			});
		}

		// onno

	}, {
		key: "linkOnNoAction",
		value: function linkOnNoAction(condition, node) {

			var that = this;
			return new Promise(function (resolve, reject) {

				if (!condition) {
					reject("There is no data.");
				} else if (!condition.id) {
					reject("The condition is incorrect.");
				} else if (!node) {
					reject("There is no node.");
				} else if (!node.id) {
					reject("The node is incorrect.");
				} else {

					that.unlinkOnNo(condition).then(function (condition) {
						return _container.get("scenarios").createActionJunction(node);
					}).then(function (junctionid) {
						condition.onno = junctionid;
						return that.edit(condition);
					}).then(function () {
						return that.searchOne({ id: condition.id });
					}).then(function (condition) {
						resolve(condition);
					})["catch"](reject);
				}
			});
		}
	}, {
		key: "linkOnNoCondition",
		value: function linkOnNoCondition(condition, node) {

			var that = this;
			return new Promise(function (resolve, reject) {

				if (!condition) {
					reject("There is no data.");
				} else if (!condition.id) {
					reject("The condition is incorrect.");
				} else if (!node) {
					reject("There is no condition.");
				} else if (!node.id) {
					reject("The condition is incorrect.");
				} else {

					that.unlinkOnNo(condition).then(function (condition) {
						return _container.get("scenarios").createConditionJunction(node);
					}).then(function (junctionid) {
						condition.onno = junctionid;
						return that.edit(condition);
					}).then(function () {
						return that.searchOne({ id: condition.id });
					}).then(function (condition) {
						resolve(condition);
					})["catch"](reject);
				}
			});
		}
	}, {
		key: "unlinkOnNo",
		value: function unlinkOnNo(condition) {

			var that = this;
			return new Promise(function (resolve, reject) {

				if (!condition) {
					reject("There is no data.");
				} else if (!condition.id) {
					reject("The condition is incorrect.");
				} else {

					that.searchOne({ id: condition.id }).then(function (condition) {

						if (!condition.onno) {
							resolve(condition);
						} else {

							_container.get("scenarios").deleteJunction(condition.onno).then(function () {

								condition.onno = null;

								that.edit(condition).then(function () {
									return that.searchOne({ id: condition.id });
								}).then(function (condition) {
									resolve(condition);
								})["catch"](reject);
							})["catch"](reject);
						}
					})["catch"](reject);
				}
			});
		}
	}], [{
		key: "formate",
		value: function formate(condition) {

			condition.value = condition.datavalue;

			delete condition.datavalue;

			condition.type = {
				id: condition.conditiontype_id,
				code: condition.conditiontype_code,
				name: condition.conditiontype_name
			};

			delete condition.conditiontype_id;
			delete condition.conditiontype_code;
			delete condition.conditiontype_name;

			if (condition.actions_onyes_id) {

				condition.onyes = {
					"id": condition.actions_onyes_id,
					"name": condition.actions_onyes_name,
					"nodetype": "action"
				};
			} else if (condition.conditions_onyes_id) {

				condition.onyes = {
					"id": condition.conditions_onyes_id,
					"name": condition.conditions_onyes_name,
					"nodetype": "condition"
				};
			} else {
				condition.onyes = null;
			}

			delete condition.actions_onyes_id;
			delete condition.actions_onyes_name;

			delete condition.conditions_onyes_id;
			delete condition.conditions_onyes_name;

			if (condition.actions_onno_id) {

				condition.onno = {
					"id": condition.actions_onno_id,
					"name": condition.actions_onno_name,
					"nodetype": "action"
				};
			} else if (condition.conditions_onno_id) {

				condition.onno = {
					"id": condition.conditions_onno_id,
					"name": condition.conditions_onno_name,
					"nodetype": "condition"
				};
			} else {
				condition.onno = null;
			}

			delete condition.actions_onno_id;
			delete condition.actions_onno_name;

			delete condition.conditions_onno_id;
			delete condition.conditions_onno_name;

			return condition;
		}
	}]);

	return DBConditions;
})(require(require("path").join(__dirname, "_abstract.js")));