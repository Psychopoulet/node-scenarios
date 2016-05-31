
"use strict";

// private

	var _sSelectQuery = "" +
	" SELECT" +

		" conditions.id," +
		" conditions.name," +
		" conditions.datavalue," +

		" conditionstypes.id AS conditiontype_id," +
		" conditionstypes.code AS conditiontype_code," +
		" conditionstypes.name AS conditiontype_name," +

		" actions_onyes.id AS actions_onyes_id," +
		" actions_onyes.name AS actions_onyes_name," +

		" conditions_onyes.id AS conditions_onyes_id," +
		" conditions_onyes.name AS conditions_onyes_name," +

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
			" LEFT JOIN conditions AS conditions_onno ON conditions_onno.id = junctions_onno.id_condition",
	_container;

// module

module.exports = class DBConditions extends require(require("path").join(__dirname, "_abstract.js")) {

	constructor (container) {
		super(container);
		_container = container;
	}

	// formate data

		static formate(condition) {

			condition.value = condition.datavalue;

			delete condition.datavalue;

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
					"name": condition.actions_onyes_name,
					"nodetype": "action"
				};

			}
			else if (condition.conditions_onyes_id) {

				condition.onyes = {
					"id": condition.conditions_onyes_id,
					"name": condition.conditions_onyes_name,
					"nodetype": "condition"
				};

			}
			else {
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

			}
			else if (condition.conditions_onno_id) {

				condition.onno = {
					"id": condition.conditions_onno_id,
					"name": condition.conditions_onno_name,
					"nodetype": "condition"
				};

			}
			else {
				condition.onno = null;
			}

				delete condition.actions_onno_id;
				delete condition.actions_onno_name;

				delete condition.conditions_onno_id;
				delete condition.conditions_onno_name;

			return condition;

		}

	// read

		lastInserted() {

			let that = this;
			return new Promise(function(resolve, reject) {

				that.db.get(_sSelectQuery + " ORDER BY conditions.id DESC LIMIT 0,1;", [], function(err, row) {
					
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

			let that = this;
			return new Promise(function(resolve, reject) {

				let options = {}, query = _sSelectQuery;

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

				that.db.all(query + " ORDER BY conditionstypes.name ASC, conditions.name ASC;", options, function(err, rows) {
					
					if (err) {
						reject((err.message) ? err.message : err);
					}
					else {

						rows.forEach(function(condition, i) {
							rows[i] = DBConditions.formate(condition);
						});

						resolve(rows);

					}

				});

			});

		}

	// write

		add (condition) {

			let that = this;
			return new Promise(function(resolve, reject) {

				if (!condition) {
					reject("There is no data.");
				}
				else if (!condition.type) {
					reject("There is no condition type.");
				}
					else if (!condition.type.id) {
						reject("The condition type is not valid.");
					}
				else if (!condition.name) {
					reject("There is no name.");
				}
				else if (!condition.value) {
					reject("There is no value.");
				}
				else {

					that.db.run("INSERT INTO conditions (id_type, name, datavalue) VALUES (:id_type, :name, :value);", {
						":id_type": condition.type.id,
						":name": condition.name,
						":value": condition.value
					}, function(err) {

						if (err) {
							reject((err.message) ? err.message : err);
						}
						else {
							that.lastInserted().then(resolve).catch(reject);
						}

					});

				}

			});

		}

		edit (condition) {

			let that = this;
			return new Promise(function(resolve, reject) {

				if (!condition) {
					reject("There is no data.");
				}
					else if (!condition.id) {
						reject("The condition is not valid.");
					}
				else if (!condition.type) {
					reject("There is no condition type.");
				}
					else if (!condition.type.id) {
						reject("The condition type is not valid.");
					}
				else if (!condition.name) {
					reject("There is no name.");
				}
				else if (!condition.value) {
					reject("There is no value.");
				}
				else {

					condition.onyes = (condition.onyes) ? condition.onyes : null;
					condition.onno = (condition.onno) ? condition.onno : null;

					that.db.run("UPDATE conditions SET id_type = :id_type, name = :name, datavalue = :value, id_onyes = :id_onyes, id_onno = :id_onno WHERE id = :id;", {
						":id": condition.id,
						":id_type": condition.type.id,
						":id_onyes": condition.onyes,
						":id_onno": condition.onno,
						":name": condition.name,
						":value": condition.value
					}, function(err) {

						if (err) {
							reject((err.message) ? err.message : err);
						}
						else {
							resolve(condition);
						}

					});

				}

			});

		}

		delete (condition) {
			
			let that = this;
			return new Promise(function(resolve, reject) {

				if (!condition) {
					reject("There is no data.");
				}
					else if (!condition.id) {
						reject("The condition is not valid.");
					}
				else {

					that.db.run("DELETE FROM conditions WHERE id = :id;", { ":id" : condition.id }, function(err) {

						if (err) {
							reject((err.message) ? err.message : err);
						}
						else {
							resolve();
						}

					});

				}

			});

		}

		// onyes

			linkOnYesAction (condition, node) {

				let that = this;
				return new Promise(function(resolve, reject) {

					if (!condition) {
						reject("There is no data.");
					}
						else if (!condition.id) {
							reject("The condition is incorrect.");
						}
					else if (!node) {
						reject("There is no node.");
					}
						else if (!node.id) {
							reject("The node is incorrect.");
						}
					else {

						that.unlinkOnYes(condition).then(function() {
							return _container.get("scenarios").createActionJunction(node);
						}).then(function(junctionid) {
							condition.onyes = junctionid;
							return that.edit(condition);
						}).then(function() {
							return that.searchOne({ id: condition.id });
						}).then(function(condition) {
							resolve(condition);
						}).catch(reject);

					}

				});

			}

			linkOnYesCondition (condition, node) {

				let that = this;
				return new Promise(function(resolve, reject) {

					if (!condition) {
						reject("There is no data.");
					}
						else if (!condition.id) {
							reject("The condition is incorrect.");
						}
					else if (!node) {
						reject("There is no condition.");
					}
						else if (!node.id) {
							reject("The condition is incorrect.");
						}
					else {

						that.unlinkOnYes(condition).then(function() {
							return _container.get("scenarios").createConditionJunction(node);
						}).then(function(junctionid) {
							condition.onyes = junctionid;
							return that.edit(condition);
						}).then(function() {
							return that.searchOne({ id: condition.id });
						}).then(function(condition) {
							resolve(condition);
						}).catch(reject);

					}

				});

			}

			unlinkOnYes (condition) {

				let that = this;
				return new Promise(function(resolve, reject) {

					if (!condition) {
						reject("There is no data.");
					}
						else if (!condition.id) {
							reject("The condition is incorrect.");
						}
					else {

						that.searchOne({ id: condition.id }).then(function(condition) {

							if (!condition.onyes) {
								resolve(condition);
							}
							else {

								_container.get("scenarios").deleteJunction(condition.onyes).then(function() {

									condition.onyes = null;

									that.edit(condition).then(function() {
										return that.searchOne({ id: condition.id });
									}).then(function(condition) {
										resolve(condition);
									}).catch(reject);

								}).catch(reject);

							}

						}).catch(reject);

					}

				});
				
			}

		// onno

			linkOnNoAction (condition, node) {

				let that = this;
				return new Promise(function(resolve, reject) {

					if (!condition) {
						reject("There is no data.");
					}
						else if (!condition.id) {
							reject("The condition is incorrect.");
						}
					else if (!node) {
						reject("There is no node.");
					}
						else if (!node.id) {
							reject("The node is incorrect.");
						}
					else {

						that.unlinkOnNo(condition).then(function() {
							return _container.get("scenarios").createActionJunction(node);
						}).then(function(junctionid) {
							condition.onno = junctionid;
							return that.edit(condition);
						}).then(function() {
							return that.searchOne({ id: condition.id });
						}).then(function(condition) {
							resolve(condition);
						}).catch(reject);

					}

				});

			}

			linkOnNoCondition (condition, node) {

				let that = this;
				return new Promise(function(resolve, reject) {

					if (!condition) {
						reject("There is no data.");
					}
						else if (!condition.id) {
							reject("The condition is incorrect.");
						}
					else if (!node) {
						reject("There is no condition.");
					}
						else if (!node.id) {
							reject("The condition is incorrect.");
						}
					else {

						that.unlinkOnNo(condition).then(function() {
							return _container.get("scenarios").createConditionJunction(node);
						}).then(function(junctionid) {
							condition.onno = junctionid;
							return that.edit(condition);
						}).then(function() {
							return that.searchOne({ id: condition.id });
						}).then(function(condition) {
							resolve(condition);
						}).catch(reject);

					}

				});

			}

			unlinkOnNo (condition) {

				let that = this;
				return new Promise(function(resolve, reject) {

					if (!condition) {
						reject("There is no data.");
					}
						else if (!condition.id) {
							reject("The condition is incorrect.");
						}
					else {

						that.searchOne({ id: condition.id }).then(function(condition) {

							if (!condition.onno) {
								resolve(condition);
							}
							else {

								_container.get("scenarios").deleteJunction(condition.onno).then(function() {

									condition.onno = null;

									that.edit(condition).then(function() {
										return that.searchOne({ id: condition.id });
									}).then(function(condition) {
										resolve(condition);
									}).catch(reject);

								}).catch(reject);

							}

						}).catch(reject);

					}

				});
				
			}

};
