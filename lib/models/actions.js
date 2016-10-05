
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

module.exports = class DBActions extends require(require("path").join(__dirname, "..", "main.js")).abstract {

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
				action.params = ("string" === typeof action.params && "" !== action.params) ? JSON.parse(action.params) : "";
			}
			catch(e) {
				action.params = "";
			}
			
			return action;

		}

	// read

		last() {

			return new Promise((resolve, reject) => {

				this.db.get(_sSelectQuery + " ORDER BY actions.id DESC LIMIT 0,1;", [], (err, row) => {
					
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

			return new Promise((resolve, reject) => {

				let options = {}, query = _sSelectQuery;

				if ("object" === typeof data && null !== data) {

					if (data.trigger && data.trigger.id) {

						query += " INNER JOIN actionstriggers ON actionstriggers.id_trigger = :id_trigger";
						options[":id_trigger"] = data.trigger.id;

					}

					query += " WHERE 1 = 1";

					if (data.id) {
						query += " AND actions.id = :id";
						options[":id"] = data.id;
					}
						else if (data.ids && data.ids instanceof Array) {
							data.ids = JSON.stringify(data.ids)
							query += " AND actions.id IN(" + data.ids.substring(1, data.ids.length - 1) + ")"
						}
					else {

						if (data.name) {
							query += " AND actions.name = :name";
							options[":name"] = data.name;
						}

						if ("object" === typeof data.type && null !== data.type) {

							if (data.type.id) {
								query += " AND actionstypes.id = :actiontype_id";
								options[":actiontype_id"] = data.type.id;
							}
							else if (data.type.code) {
								query += " AND actionstypes.code = :actiontype_code";
								options[":actiontype_code"] = data.type.code;
							}
							else {
								
								if (data.type.name) {
									query += " AND actionstypes.name = :actiontype_name";
									options[":actiontype_name"] = data.type.name;
								}

							}
							
						}

					}
					
				}

				this.db.all(query + " ORDER BY actionstypes.name ASC, actions.name ASC;", options, (err, rows) => {
					
					if (err) {
						reject(err);
					}
					else {

						rows.forEach((action, i) => {
							rows[i] = DBActions.formate(action);
						});

						resolve(rows);

					}

				});

			}).catch((err) => {
				return Promise.reject((err.message) ? err.message : err);
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

				try {
					action.params = ("object" === typeof action.params) ? JSON.stringify(action.params) : (!action.params) ? "" : action.params;
				}
				catch(e) {
					action.params = "";
				}
				
				return new Promise((resolve, reject) => {

					this.db.run("INSERT INTO actions (id_type, name, params) VALUES (:id_type, :name, :params);", {
						":id_type": action.type.id,
						":name": action.name,
						":params": action.params
					}, (err) => {

						if (err) {
							reject((err.message) ? err.message : err);
						}
						else {
							this.last().then(resolve).catch(reject);
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

				try {
					action.params = ("object" === typeof action.params) ? JSON.stringify(action.params) : (!action.params) ? "" : action.params;
				}
				catch(e) {
					action.params = "";
				}
				
				return new Promise((resolve, reject) => {

					this.db.run("UPDATE actions SET id_type = :id_type, id_after = :id_after, name = :name, params = :params WHERE id = :id;", {
						":id": action.id,
						":id_type": action.type.id,
						":id_after": (action.after && action.after.junction) ? action.after.junction : null,
						":name": action.name,
						":params": action.params
					}, (err) => {

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

				return new Promise((resolve, reject) => {

					this.db.run("DELETE FROM actions WHERE id = :id;", { ":id" : action.id }, (err) => {

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

		// triggers

			linkToTrigger (action, trigger) {
				return this.container.get("triggers").linkToAction(action, trigger);
			}

			unlinkToTrigger (action, trigger) {
				return this.container.get("triggers").unlinkToAction(action, trigger);
			}

		// after

			linkAfterAction (action, linkedaction) {

				if (!action) {
					return Promise.reject("There is no data.");
				}
					else if (!action.id) {
						return Promise.reject("The action is incorrect.");
					}
				else if (!linkedaction) {
					return Promise.reject("There is no linked action.");
				}
					else if (!linkedaction.id) {
						return Promise.reject("The linked action is incorrect.");
					}
				else {

					return this.unlinkAfter(action).then(() => {
						return this.container.get("junctions").createActionJunctionId(linkedaction);
					}).then((junctionid) => {
						action.after = { "junction": junctionid };
						return this.edit(action);
					}).then(() => {
						return this.searchOne({ id: action.id });
					});

				}

			}

			linkAfterCondition (action, linkedcondition) {

				if (!action) {
					return Promise.reject("There is no data.");
				}
					else if (!action.id) {
						return Promise.reject("The action is incorrect.");
					}
				else if (!linkedcondition) {
					return Promise.reject("There is no linked condition.");
				}
					else if (!linkedcondition.id) {
						return Promise.reject("The linked condition is incorrect.");
					}
				else {

					return this.unlinkAfter(action).then(() => {
						return this.container.get("junctions").createConditionJunctionId(linkedcondition);
					}).then((junctionid) => {
						action.after = { "junction": junctionid };
						return this.edit(action);
					}).then(() => {
						return this.searchOne({ id: action.id });
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

					return this.searchOne({ id: action.id }).then((action) => {

						if (!action.after) {
							return Promise.resolve(action);
						}
						else {

							return this.container.get("junctions").deleteById(action.after.junction).then(() => {

								action.after = null;

								return this.edit(action).then(() => {
									return this.searchOne({ id: action.id });
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
				return Promise.reject("There is no action.");
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
