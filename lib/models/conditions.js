
"use strict";

// private

	var _tabExecuters = {}, _sSelectQuery = "" +
	" SELECT" +

		" conditions.id," +
		" conditions.name," +
		" conditions.datavalue," +

		" conditionstypes.id AS conditiontype_id," +
		" conditionstypes.code AS conditiontype_code," +
		" conditionstypes.name AS conditiontype_name," +

		" junctions_onyes.id AS junctions_onyes_id," +

			" actions_onyes.id AS actions_onyes_id," +
			" actions_onyes.name AS actions_onyes_name," +

			" conditions_onyes.id AS conditions_onyes_id," +
			" conditions_onyes.name AS conditions_onyes_name," +

		" junctions_onno.id AS junctions_onno_id," +

			" actions_onno.id AS actions_onno_id," +
			" actions_onno.name AS actions_onno_name," +

			" conditions_onno.id AS conditions_onno_id," +
			" conditions_onno.name AS conditions_onno_name" +

	" FROM conditions" +
		" INNER JOIN conditionstypes ON conditionstypes.id = conditions.id_type" +
		" LEFT JOIN junctions AS junctions_onyes ON junctions_onyes.id = conditions.id_onyes" +
			" LEFT JOIN actions AS actions_onyes ON actions_onyes.id = junctions_onyes.id_action" +
			" LEFT JOIN conditions AS conditions_onyes ON conditions_onyes.id = junctions_onyes.id_condition" +
		" LEFT JOIN junctions AS junctions_onno ON junctions_onno.id = conditions.id_onno" +
			" LEFT JOIN actions AS actions_onno ON actions_onno.id = junctions_onno.id_action" +
			" LEFT JOIN conditions AS conditions_onno ON conditions_onno.id = junctions_onno.id_condition";

	// method

		function _valueToDB(data) {

			if (!data) {
				data = "";
			}
			else {

				if ("string" === typeof data) {

					try {
						data = JSON.parse(data);
					}
					catch(e) {
						// nothing to do here
					}

				}

				try {
					data = JSON.stringify(data);
				}
				catch(e) {
					data = "";
				}

			}

			return data;

		}

// module

module.exports = class DBConditions extends require(require("path").join(__dirname, "..", "main.js")).abstract {

	// formate data

		static formate(condition) {

			condition.type = {
				id : condition.conditiontype_id,
				code : condition.conditiontype_code,
				name : condition.conditiontype_name
			};

				delete condition.conditiontype_id;
				delete condition.conditiontype_code;
				delete condition.conditiontype_name;

			if (condition.actions_onyes_id) {

				condition.onyes = {
					"id": condition.actions_onyes_id,
					"junction": condition.junctions_onyes_id,
					"name": condition.actions_onyes_name,
					"nodetype": "action"
				};

			}
			else if (condition.conditions_onyes_id) {

				condition.onyes = {
					"id": condition.conditions_onyes_id,
					"junction": condition.junctions_onyes_id,
					"name": condition.conditions_onyes_name,
					"nodetype": "condition"
				};

			}
			else {
				condition.onyes = null;
			}

				delete condition.junctions_onyes_id;

				delete condition.actions_onyes_id;
				delete condition.actions_onyes_name;

				delete condition.conditions_onyes_id;
				delete condition.conditions_onyes_name;

			if (condition.actions_onno_id) {

				condition.onno = {
					"id": condition.actions_onno_id,
					"junction": condition.junctions_onno_id,
					"name": condition.actions_onno_name,
					"nodetype": "action"
				};

			}
			else if (condition.conditions_onno_id) {

				condition.onno = {
					"id": condition.conditions_onno_id,
					"junction": condition.junctions_onno_id,
					"name": condition.conditions_onno_name,
					"nodetype": "condition"
				};

			}
			else {
				condition.onno = null;
			}

				delete condition.junctions_onno_id;
				
				delete condition.actions_onno_id;
				delete condition.actions_onno_name;

				delete condition.conditions_onno_id;
				delete condition.conditions_onno_name;

			try {
				condition.value = ("string" === typeof condition.datavalue && "" !== condition.datavalue) ? JSON.parse(condition.datavalue) : "";
			}
			catch(e) {
				condition.value = "";
			}
			
			delete condition.datavalue;

			return condition;

		}

	// read

		last() {

			return new Promise((resolve, reject) => {

				this.db.get(_sSelectQuery + " ORDER BY conditions.id DESC LIMIT 0,1;", [], (err, row) => {
					
					if (err) {
						reject((err.message) ? err.message : err);
					}
					else {
						resolve((row) ? DBConditions.formate(row) : null);
					}

				});

			});

		}

		search(data) {

			return new Promise((resolve, reject) => {

				let options = {}, query = _sSelectQuery;

				if ("object" === typeof data && null !== data) {

					query += " WHERE 1 = 1";

					if (data.id) {
						query += " AND conditions.id = :id";
						options[":id"] = data.id;
					}
						else if (data.ids && data.ids instanceof Array) {
							data.ids = JSON.stringify(data.ids)
							query += " AND conditions.id IN(" + data.ids.substring(1, data.ids.length - 1) + ")"
						}
					else {

						if (data.name) {
							query += " AND conditions.name = :name";
							options[":name"] = data.name;
						}

						if ("object" === typeof data.type && null !== data.type) {

							if (data.type.id) {
								query += " AND conditionstypes.id = :conditiontype_id";
								options[":conditiontype_id"] = data.type.id;
							}
							else if (data.type.code) {
								query += " AND conditionstypes.code = :conditiontype_code";
								options[":conditiontype_code"] = data.type.code;
							}
							else {

								if (data.type.name) {
									query += " AND conditionstypes.name = :conditiontype_name";
									options[":conditiontype_name"] = data.type.name;
								}
								
							}
							
						}
					
					}

				}

				this.db.all(query + " ORDER BY conditionstypes.name ASC, conditions.name ASC;", options, (err, rows) => {
					
					if (err) {
						reject(err);
					}
					else {

						rows.forEach((condition, i) => {
							rows[i] = DBConditions.formate(condition);
						});

						resolve(rows);

					}

				});

			}).catch((err) => {
				return Promise.reject((err.message) ? err.message : err);
			});

		}

	// write

		add (condition) {

			if (!condition) {
				return Promise.reject("There is no data.");
			}
			else if (!condition.type) {
				return Promise.reject("There is no condition type.");
			}
				else if (!condition.type.id) {
					return Promise.reject("The condition type is not valid.");
				}
			else if (!condition.name) {
				return Promise.reject("There is no name.");
			}
			else {

				return new Promise((resolve, reject) => {

					this.db.run("INSERT INTO conditions (id_type, name, datavalue) VALUES (:id_type, :name, :value);", {
						":id_type": condition.type.id,
						":name": condition.name,
						":value": _valueToDB((condition.value) ? condition.value : null)
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

		edit (condition) {

			if (!condition) {
				return Promise.reject("There is no data.");
			}
				else if (!condition.id) {
					return Promise.reject("The condition is not valid.");
				}
			else if (!condition.type) {
				return Promise.reject("There is no condition type.");
			}
				else if (!condition.type.id) {
					return Promise.reject("The condition type is not valid.");
				}
			else if (!condition.name) {
				return Promise.reject("There is no name.");
			}
			else {

				return new Promise((resolve, reject) => {

					this.db.run("UPDATE conditions SET id_type = :id_type, name = :name, datavalue = :value, id_onyes = :id_onyes, id_onno = :id_onno WHERE id = :id;", {
						":id": condition.id,
						":id_type": condition.type.id,
						":id_onyes": (condition.onyes && condition.onyes.junction) ? condition.onyes.junction : null,
						":id_onno": (condition.onno && condition.onno.junction) ? condition.onno.junction : null,
						":name": condition.name,
						":value": _valueToDB((condition.value) ? condition.value : null)
					}, (err) => {

						if (err) {
							reject((err.message) ? err.message : err);
						}
						else {
							resolve(condition);
						}

					});

				});

			}

		}

		delete (condition) {
			
			if (!condition) {
				return Promise.reject("There is no data.");
			}
				else if (!condition.id) {
					return Promise.reject("The condition is not valid.");
				}
			else {

				return new Promise((resolve, reject) => {

					this.db.run("DELETE FROM conditions WHERE id = :id;", { ":id" : condition.id }, (err) => {

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

		// onyes

			linkOnYesAction (condition, node) {

				if (!condition) {
					return Promise.reject("There is no data.");
				}
					else if (!condition.id) {
						return Promise.reject("The condition is incorrect.");
					}
				else if (!node) {
					return Promise.reject("There is no node.");
				}
					else if (!node.id) {
						return Promise.reject("The node is incorrect.");
					}
				else {

					return this.unlinkOnYes(condition).then(() => {
						return this.container.get("junctions").createActionJunctionId(node);
					}).then((junctionid) => {
						condition.onyes = { "junction": junctionid };
						return this.edit(condition);
					}).then(() => {
						return this.searchOne({ id: condition.id });
					});

				}

			}

			linkOnYesCondition (condition, node) {

				if (!condition) {
					return Promise.reject("There is no data.");
				}
					else if (!condition.id) {
						return Promise.reject("The condition is incorrect.");
					}
				else if (!node) {
					return Promise.reject("There is no condition.");
				}
					else if (!node.id) {
						return Promise.reject("The condition is incorrect.");
					}
				else {

					return this.unlinkOnYes(condition).then(() => {
						return this.container.get("junctions").createConditionJunctionId(node);
					}).then((junctionid) => {
						condition.onyes = { "junction": junctionid };
						return this.edit(condition);
					}).then(() => {
						return this.searchOne({ id: condition.id });
					});

				}

			}

			unlinkOnYes (condition) {

				if (!condition) {
					return Promise.reject("There is no data.");
				}
					else if (!condition.id) {
						return Promise.reject("The condition is incorrect.");
					}
				else {

					return this.searchOne({ id: condition.id }).then((condition) => {

						if (!condition.onyes) {
							return Promise.resolve(condition);
						}
						else {

							return this.container.get("junctions").deleteById(condition.onyes.junction).then(() => {

								condition.onyes = null;

								return this.edit(condition).then(() => {
									return this.searchOne({ id: condition.id });
								});

							});

						}

					});

				}
				
			}

		// onno

			linkOnNoAction (condition, node) {

				if (!condition) {
					return Promise.reject("There is no data.");
				}
					else if (!condition.id) {
						return Promise.reject("The condition is incorrect.");
					}
				else if (!node) {
					return Promise.reject("There is no node.");
				}
					else if (!node.id) {
						return Promise.reject("The node is incorrect.");
					}
				else {

					return this.unlinkOnNo(condition).then(() => {
						return this.container.get("junctions").createActionJunctionId(node);
					}).then((junctionid) => {
						condition.onno = { "junction": junctionid };
						return this.edit(condition);
					}).then(() => {
						return this.searchOne({ id: condition.id });
					});

				}

			}

			linkOnNoCondition (condition, node) {

				if (!condition) {
					return Promise.reject("There is no data.");
				}
					else if (!condition.id) {
						return Promise.reject("The condition is incorrect.");
					}
				else if (!node) {
					return Promise.reject("There is no condition.");
				}
					else if (!node.id) {
						return Promise.reject("The condition is incorrect.");
					}
				else {

					return this.unlinkOnNo(condition).then(() => {
						return this.container.get("junctions").createConditionJunctionId(node);
					}).then((junctionid) => {
						condition.onno = { "junction": junctionid };
						return this.edit(condition);
					}).then(() => {
						return this.searchOne({ id: condition.id });
					});

				}

			}

			unlinkOnNo (condition) {

				if (!condition) {
					return Promise.reject("There is no data.");
				}
					else if (!condition.id) {
						return Promise.reject("The condition is incorrect.");
					}
				else {

					return this.searchOne({ id: condition.id }).then((condition) => {

						if (!condition.onno) {
							return Promise.resolve(condition);
						}
						else {

							return this.container.get("junctions").deleteById(condition.onno.junction).then(() => {

								condition.onno = null;

								return this.edit(condition).then(() => {
									return this.searchOne({ id: condition.id });
								});

							});

						}

					});

				}

			}

	// execute

		bindExecuter(conditiontype, executer) {

			if (!conditiontype) {
				return Promise.reject("There is no condition type.");
			}
				else if (!conditiontype.id || !conditiontype.code) {
					return Promise.reject("The condition type is incorrect.");
				}
			else if ("function" !== typeof executer) {
				return Promise.reject("The executer is not a function.");
			}
			else {
				_tabExecuters[conditiontype.code] = executer;
				return Promise.resolve();
			}

		}

		execute(condition, data) {

			if (!condition) {
				return Promise.reject("There is no condition.");
			}
			else if (!condition.type) {
				return Promise.reject("There is no condition type.");
			}
				else if (!condition.type.id || !condition.type.code) {
					return Promise.reject("The condition type is not valid.");
				}
			else if (!_tabExecuters[condition.type.code]) {
				return Promise.reject("Missing \"" + condition.type.code + "\" executer.");
			}
			else {

				try {

					let result = _tabExecuters[condition.type.code](condition, data);

					if (!result || !result instanceof Promise) {
						return Promise.reject("\"" + condition.type.code + "\" executer does not return Promise instance.");
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
