
"use strict";

// private

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _sSelectQuery = "SELECT id, code, name FROM conditionstypes";

// module

module.exports = (function (_require) {
	_inherits(DBActionsTypes, _require);

	function DBActionsTypes() {
		_classCallCheck(this, DBActionsTypes);

		_get(Object.getPrototypeOf(DBActionsTypes.prototype), "constructor", this).apply(this, arguments);
	}

	_createClass(DBActionsTypes, [{
		key: "lastInserted",

		// read

		value: function lastInserted() {

			var that = this;
			return new Promise(function (resolve, reject) {

				that.db.get(_sSelectQuery + " ORDER BY conditionstypes.id DESC LIMIT 0,1;", [], function (err, row) {

					if (err) {
						reject(err.message ? err.message : err);
					} else {
						resolve(row ? DBActionsTypes.formate(row) : null);
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
						query += " AND conditionstypes.id = :id";
						options[":id"] = data.id;
					}
					if (data.code) {
						query += " AND conditionstypes.code = :code";
						options[":code"] = data.code;
					}
					if (data.name) {
						query += " AND conditionstypes.name = :name";
						options[":name"] = data.name;
					}
				}

				that.db.all(query + " ORDER BY conditionstypes.name ASC;", options, function (err, rows) {

					if (err) {
						reject(err.message ? err.message : err);
					} else {
						resolve(rows);
					}
				});
			});
		}

		// write

	}, {
		key: "add",
		value: function add(conditiontype) {

			var that = this;
			return new Promise(function (resolve, reject) {

				if (!conditiontype) {
					reject("There is no data.");
				} else if (!conditiontype.code) {
					reject("There is no code.");
				} else if (!conditiontype.name) {
					reject("There is no name.");
				} else {

					that.db.run("INSERT INTO conditionstypes (code, name) VALUES (:code, :name);", {
						":code": conditiontype.code,
						":name": conditiontype.name
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
		value: function edit(conditiontype) {

			var that = this;
			return new Promise(function (resolve, reject) {

				if (!conditiontype) {
					reject("There is no data.");
				} else if (!conditiontype.id) {
					reject("The action type is incorrect.");
				} else if (!conditiontype.code) {
					reject("There is no code.");
				} else if (!conditiontype.name) {
					reject("There is no name.");
				} else {

					that.db.run("UPDATE conditionstypes SET code = :code, name = :name WHERE id = :id;", {
						":id": conditiontype.id,
						":code": conditiontype.code,
						":name": conditiontype.name
					}, function (err) {

						if (err) {
							reject(err.message ? err.message : err);
						} else {
							resolve(conditiontype);
						}
					});
				}
			});
		}
	}, {
		key: "delete",
		value: function _delete(conditiontype) {

			var that = this;
			return new Promise(function (resolve, reject) {

				if (!conditiontype) {
					reject("There is no data.");
				} else if (!conditiontype.id) {
					reject("The action type is incorrect.");
				} else {

					that.db.run("DELETE FROM conditionstypes WHERE id = :id;", { ":id": conditiontype.id }, function (err) {

						if (err) {
							reject(err.message ? err.message : err);
						} else {
							resolve();
						}
					});
				}
			});
		}
	}], [{
		key: "formate",

		// formate data

		value: function formate(conditiontype) {
			return conditiontype;
		}
	}]);

	return DBActionsTypes;
})(require(require("path").join(__dirname, "_abstract.js")));