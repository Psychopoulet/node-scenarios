
"use strict";

// private

	var _tabExecuters = {}, _sSelectQuery = "" +
	" SELECT" +

		" actions.id," +
		" actions.name," +
		" actions.params," +

		" actionstypes.id AS actiontype_id," +
		" actionstypes.code AS actiontype_code," +
		" actionstypes.name AS actiontype_name," +

		" junctions_after.id AS junctions_after_id," +

			" actions_after.id AS actions_after_id," +
			" actions_after.name AS actions_after_name," +

			" conditions_after.id AS conditions_after_id," +
			" conditions_after.name AS conditions_after_name" +

	" FROM actions" +
		" INNER JOIN actionstypes ON actionstypes.id = actions.id_type" +
		" LEFT JOIN junctions AS junctions_after ON junctions_after.id = actions.id_after" +
			" LEFT JOIN actions AS actions_after ON actions_after.id = junctions_after.id_action" +
			" LEFT JOIN conditions AS conditions_after ON conditions_after.id = junctions_after.id_condition";

// module

module.exports = class DBActions extends require(require("path").join(__dirname, "_abstract.js")) {

	// formate data

		static formate(action) {

			action.type = {
				id : action.actiontype_id,
				code : action.actiontype_code,
				name : action.actiontype_name
			};

				delete action.actiontype_id;
				delete action.actiontype_code;
				delete action.actiontype_name;

			if (action.actions_after_id) {

				action.after = {
					"id": action.actions_after_id,
					"junction": action.junctions_after_id,
					"name": action.actions_after_name,
					"nodetype": "action"
				};

			}
			else if (action.conditions_after_id) {

				action.after = {
					"id": action.conditions_after_id,
					"junction": action.junctions_after_id,
					"name": action.conditions_after_name,
					"nodetype": "condition"
				};

			}
			else {
				action.after = null;
			}

				delete action.junctions_after_id;
				
				delete action.actions_after_id;
				delete action.actions_after_name;

				delete action.conditions_after_id;
				delete action.conditions_after_name;

			try {
				action.params = ("string" === typeof action.params && "" !== action.params) ? JSON.parse(action.params) : null;
			}
			catch(e) {
				action.params = null;
			}
			
			return action;

		}

	// read

		last() {

			let that = this;
			return new Promise(function(resolve, reject) {

				that.db.get(_sSelectQuery + " ORDER BY actions.id DESC LIMIT 0,1;", [], function(err, row) {
					
					if (err) {
						reject((err.message) ? err.message : err);
					}
					else {
						resolve((row) ? DBActions.formate(row) : null);
					}

				});

			});

		}

		search(data) {

			let options = {}, query = _sSelectQuery;

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

			let that = this;
			return new Promise(function(resolve, reject) {

				that.db.all(query + " ORDER BY actionstypes.name ASC, actions.name ASC;", options, function(err, rows) {
					
					if (err) {
						reject((err.message) ? err.message : err);
					}
					else {

						rows.forEach(function(action, i) {
							rows[i] = DBActions.formate(action);
						});

						resolve(rows);

					}

				});

			});

		}

	// write

		add (action) {

			if (!action) {
				return Promise.reject("There is no data.");
			}
			else if (!action.type) {
				return Promise.reject("There is no action type.");
			}
				else if (!action.type.id) {
					return Promise.reject("The action type is not valid.");
				}
			else if (!action.name) {
				return Promise.reject("There is no name.");
			}
			else {

				if (!action.params) {
					action.params = "";
				}
				else if ("object" === typeof action.params) {

					try {
						action.params = JSON.stringify(action.params);
					}
					catch(e) {
						action.params = "";
					}

				}

				let that = this;
				return new Promise(function(resolve, reject) {

					that.db.run("INSERT INTO actions (id_type, name, params) VALUES (:id_type, :name, :params);", {
						":id_type": action.type.id,
						":name": action.name,
						":params": action.params
					}, function(err) {

						if (err) {
							reject((err.message) ? err.message : err);
						}
						else {
							that.last().then(resolve).catch(reject);
						}

					});

				});

			}

		}

		edit (action) {

			if (!action) {
				return Promise.reject("There is no data.");
			}
				else if (!action.id) {
					return Promise.reject("The action is not valid.");
				}
			else if (!action.type) {
				return Promise.reject("There is no action type.");
			}
				else if (!action.type.id) {
					return Promise.reject("The action type is not valid.");
				}
			else if (!action.name) {
				return Promise.reject("There is no name.");
			}
			else {

				if (!action.params) {
					action.params = "";
				}
				else if ("object" === typeof action.params) {

					try {
						action.params = JSON.stringify(action.params);
					}
					catch(e) {
						action.params = "";
					}

				}

				let that = this;
				return new Promise(function(resolve, reject) {

					that.db.run("UPDATE actions SET id_type = :id_type, id_after = :id_after, name = :name, params = :params WHERE id = :id;", {
						":id": action.id,
						":id_type": action.type.id,
						":id_after": (action.after && action.after.junction) ? action.after.junction : null,
						":name": action.name,
						":params": action.params
					}, function(err) {

						if (err) {
							reject((err.message) ? err.message : err);
						}
						else {
							resolve(action);
						}

					});

				});

			}

		}

		delete (action) {
			
			if (!action) {
				return Promise.reject("There is no data.");
			}
				else if (!action.id) {
					return Promise.reject("The action is not valid.");
				}
			else {

				let that = this;
				return new Promise(function(resolve, reject) {

					that.db.run("DELETE FROM actions WHERE id = :id;", { ":id" : action.id }, function(err) {

						if (err) {
							reject((err.message) ? err.message : err);
						}
						else {
							resolve();
						}

					});
					
				});

			}

		}

		// after

			linkAfterAction (action, node) {

				if (!action) {
					return Promise.reject("There is no data.");
				}
					else if (!action.id) {
						return Promise.reject("The action is incorrect.");
					}
				else if (!node) {
					return Promise.reject("There is no node.");
				}
					else if (!node.id) {
						return Promise.reject("The node is incorrect.");
					}
				else {

					let that = this;
					return this.unlinkAfter(action).then(function() {
						return that.container.get("junctions").createActionJunctionId(node);
					}).then(function(junctionid) {
						action.after = { "junction": junctionid };
						return that.edit(action);
					}).then(function() {
						return that.searchOne({ id: action.id });
					});

				}

			}

			linkAfterCondition (action, node) {

				if (!action) {
					return Promise.reject("There is no data.");
				}
					else if (!action.id) {
						return Promise.reject("The action is incorrect.");
					}
				else if (!node) {
					return Promise.reject("There is no action.");
				}
					else if (!node.id) {
						return Promise.reject("The action is incorrect.");
					}
				else {

					let that = this;
					return this.unlinkAfter(action).then(function() {
						return that.container.get("junctions").createConditionJunctionId(node);
					}).then(function(junctionid) {
						action.after = { "junction": junctionid };
						return that.edit(action);
					}).then(function() {
						return that.searchOne({ id: action.id });
					});

				}

			}

			unlinkAfter (action) {

				if (!action) {
					return Promise.reject("There is no data.");
				}
					else if (!action.id) {
						return Promise.reject("The action is incorrect.");
					}
				else {

					let that = this;
					return this.searchOne({ id: action.id }).then(function(action) {

						if (!action.after) {
							return Promise.resolve(action);
						}
						else {

							return that.container.get("junctions").deleteById(action.after.junction).then(function() {

								action.after = null;

								return that.edit(action).then(function() {
									return that.searchOne({ id: action.id });
								});

							});

						}

					});

				}

			}

	// execute

		bindExecuter(actiontype, executer) {

			if (!actiontype) {
				return Promise.reject("There is no action type.");
			}
				else if (!actiontype.id || !actiontype.code) {
					return Promise.reject("The action type is incorrect.");
				}
			else if ("function" !== typeof executer) {
				return Promise.reject("The executer is not a function.");
			}
			else {
				_tabExecuters[actiontype.code] = executer;
				return Promise.resolve();
			}

		}

		execute(action, data) {

			if (!action) {
				return Promise.reject("There is no data.");
			}
			else if (!action.type) {
				return Promise.reject("There is no action type.");
			}
				else if (!action.type.id || !action.type.code) {
					return Promise.reject("The action type is not valid.");
				}
			else if (!_tabExecuters[action.type.code]) {
				return Promise.reject("Missing \"" + action.type.code + "\" executer.");
			}
			else {

				try {

					let result = _tabExecuters[action.type.code](action, data);

					if (!result || !result instanceof Promise) {
						return Promise.reject("\"" + action.type.code + "\" executer does not return Promise instance.");
					}
					else {
						return result;
					}

				}
				catch(e) {
					return Promise.reject((e.message) ? e.message : e);
				}

			}

		}

};
