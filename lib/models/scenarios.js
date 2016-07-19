
"use strict";

// private

	var _sSelectQuery = "" +
	"SELECT" +

		" scenarios.id," +
		" scenarios.name," +
		" scenarios.active," +

		" junctions.id AS junctions_start_id," +

			" actions.id AS action_start_id," +
			" actions.name AS action_start_name," +

			" conditions.id AS condition_start_id," +
			" conditions.name AS condition_start_name" +

	" FROM scenarios" +
		" LEFT JOIN junctions ON junctions.id = scenarios.id_start" +
			" LEFT JOIN actions ON actions.id = junctions.id_action" +
			" LEFT JOIN conditions ON conditions.id = junctions.id_condition";

	function _junctionToWay(that, junction) {

		if ("action" === junction.nodetype) {

			return that.container.get("actions").searchOne({ id: junction.id }).then((action) => {

				action.nodetype = junction.nodetype;

				if (!action.after) {
					return Promise.resolve(action);
				}
				else {

					return _junctionToWay(that, action.after).then((after) => {
						action.after = after;
						return Promise.resolve(action);
					});

				}

			});

		}
		else if ("condition" === junction.nodetype) {

			return that.container.get("conditions").searchOne({ id: junction.id }).then((condition) => {

				condition.nodetype = junction.nodetype;

				if (!condition.onyes && !condition.onno) {
					return Promise.resolve(condition);
				}
				else if (condition.onyes) {
				
					return _junctionToWay(that, condition.onyes).then((onyes) => {

						condition.onyes = onyes;

						if (!condition.onno) {
							return Promise.resolve(condition);
						}
						else {

							return _junctionToWay(that, condition.onno).then((onno) => {
								condition.onno = onno;
								return Promise.resolve(condition);
							});

						}
						
					});

				}
				else {
					
					return _junctionToWay(that, condition.onno).then((onno) => {
						condition.onno = onno;
						return Promise.resolve(condition);
					});

				}

			});

		}
		else {
			return Promise.resolve(null);
		}

	}

	function _executeJunction(that, junction, data) {

		if ("action" === junction.nodetype) {

			return that.container.get("actions").execute(junction, data).then(() => {

				if (!junction.after) {
					return Promise.resolve();
				}
				else {
					return _executeJunction(that, junction.after, data);
				}

			});

		}
		else if ("condition" === junction.nodetype) {

			if (!junction.onyes && !junction.onno) {
				return Promise.resolve();
			}
			else {

				return that.container.get("conditions").execute(junction, data).then((conditionresult) => {

					if (junction.onyes && conditionresult) {
						return _executeJunction(that, junction.onyes, data);
					}
					else if (junction.onno && !conditionresult) {
						return _executeJunction(that, junction.onno, data);
					}
					else {
						return Promise.resolve();
					}

				});
				
			}

		}
		else {
			return Promise.resolve();
		}

	}

// module

module.exports = class DBScenarios extends require(require("path").join(__dirname, "..", "main.js")).abstract {

	// formate data

		static formate(scenario) {

			scenario.active = (1 === scenario.active) ? true : false;

			if (scenario.action_start_id) {

				scenario.start = {
					"id": scenario.action_start_id,
					"junction": scenario.junctions_start_id,
					"name": scenario.action_start_name,
					"nodetype": "action"
				};

			}
			else if (scenario.condition_start_id) {

				scenario.start = {
					"id": scenario.condition_start_id,
					"junction": scenario.junctions_start_id,
					"name": scenario.condition_start_name,
					"nodetype": "condition"
				};

			}
			else {
				scenario.start = null;
			}

				delete scenario.junctions_start_id;
				
				delete scenario.action_start_id;
				delete scenario.action_start_name;

				delete scenario.condition_start_id;
				delete scenario.condition_start_name;

			return scenario;

		}

	// read

		last() {

			return new Promise((resolve, reject) => {

				this.db.get(_sSelectQuery + " ORDER BY scenarios.id DESC LIMIT 0,1;", [], (err, row) => {
					
					if (err) {
						reject((err.message) ? err.message : err);
					}
					else {
						resolve((row) ? DBScenarios.formate(row) : null);
					}

				});

			});

		}

		search(scenario) {

			let options = {}, query = _sSelectQuery;

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
					options[":active"] = (scenario.active) ? "1" : "0";
				}

				if (scenario.trigger && !scenario.trigger.id) {
					query += " AND 1 = 0";
				}
				
			}

			return new Promise((resolve, reject) => {

				this.db.all(query + " ORDER BY scenarios.name ASC;", options, (err, rows) => {

					if (err) {
						reject((err.message) ? err.message : err);
					}
					else {

						rows.forEach((row, i) => {
							rows[i] = DBScenarios.formate(row);
						});

						resolve(rows);

					}

				});

			});

		}

	// write

		add (scenario) {

			if (!scenario) {
				return Promise.reject("There is no data.");
			}
			else if (!scenario.name) {
				return Promise.reject("There is no name.");
			}
			else {

				return new Promise((resolve, reject) => {

					this.db.run("INSERT INTO scenarios (name, active) VALUES (:name, :active);", {
						":name": scenario.name,
						":active": ("undefined" !== typeof scenario.active && (true === scenario.active || 1 == scenario.active)) ? "1" : "0"
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

		edit (scenario) {

			if (!scenario) {
				return Promise.reject("There is no data.");
			}
				else if (!scenario.id) {
					return Promise.reject("The scenario is incorrect.");
				}
			else if (!scenario.name) {
				return Promise.reject("There is no name.");
			}
			else {

				return new Promise((resolve, reject) => {

					this.db.run("UPDATE scenarios SET name = :name, active = :active, id_start = :start WHERE id = :id;", {
						":id": scenario.id,
						":name": scenario.name,
						":active": ("undefined" !== typeof scenario.active && (true === scenario.active || 1 == scenario.active)) ? "1" : "0",
						":start": (scenario.start && scenario.start.junction) ? scenario.start.junction : null
					}, (err) => {

						if (err) {
							reject((err.message) ? err.message : err);
						}
						else {
							resolve(scenario);
						}

					});

				});

			}

		}

		delete (scenario) {
			
			if (!scenario) {
				return Promise.reject("There is no data.");
			}
				else if (!scenario.id) {
					return Promise.reject("The scenario is incorrect.");
				}
			else {

				return new Promise((resolve, reject) => {

					this.db.run("DELETE FROM scenarios WHERE id = :id;", { ":id" : scenario.id }, (err) => {

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

			linkToTrigger (scenario, trigger) {
				return this.container.get("triggers").linkToScenario(scenario, trigger);
			}

			unlinkToTrigger (scenario, trigger) {
				return this.container.get("triggers").unlinkToScenario(scenario, trigger);
			}

		// start

			linkStartAction (scenario, linkedaction) {

				if (!scenario) {
					return Promise.reject("There is no scenario.");
				}
					else if (!scenario.id) {
						return Promise.reject("The scenario is incorrect.");
					}
				else if (!linkedaction) {
					return Promise.reject("There is no linked action.");
				}
					else if (!linkedaction.id) {
						return Promise.reject("The linked action is incorrect.");
					}
				else {

					return this.unlinkStart(scenario).then(() => {
						return this.container.get("junctions").createActionJunctionId(linkedaction);
					}).then((junctionid) => {
						scenario.start = { "junction": junctionid };
						return this.edit(scenario);
					}).then(() => {
						return this.searchOne({ id: scenario.id });
					});

				}

			}

			linkStartCondition (scenario, linkedcondition) {
				
				if (!scenario) {
					return Promise.reject("There is no scenario.");
				}
					else if (!scenario.id) {
						return Promise.reject("The scenario is incorrect.");
					}
				else if (!linkedcondition) {
					return Promise.reject("There is no linked condition.");
				}
					else if (!linkedcondition.id) {
						return Promise.reject("The linked condition is incorrect.");
					}
				else {

					return this.unlinkStart(scenario).then(() => {
						return this.container.get("junctions").createConditionJunctionId(linkedcondition);
					}).then((junctionid) => {
						scenario.start = { "junction": junctionid };
						return this.edit(scenario);
					}).then(() => {
						return this.searchOne({ id: scenario.id });
					});

				}

			}

			unlinkStart (scenario) {
				
				if (!scenario) {
					return Promise.reject("There is no scenario.");
				}
					else if (!scenario.id) {
						return Promise.reject("The scenario is incorrect.");
					}
				else {

					return this.searchOne({ id: scenario.id }).then((scenario) => {

						if (!scenario.start) {
							return Promise.resolve(scenario);
						}
						else {

							return this.container.get("junctions").deleteById(scenario.start.junction).then(() => {

								scenario.start = null;

								return this.edit(scenario).then(() => {
									return this.searchOne({ id: scenario.id });
								});

							});

						}

					});

				}

			}

	// execute

		getWay(scenario) {

			if (!scenario) {
				return Promise.reject("There is no scenario.");
			}
				else if (!scenario.id) {
					return Promise.reject("The scenario is incorrect.");
				}
			else {

				return this.searchOne({ id: scenario.id }).then((scenario) => {

					if (!scenario) {
						return Promise.reject("Impossible to find this scenario.");
					}
					else {

						scenario.nodetype = "scenario";

						if (!scenario.start) {
							return Promise.resolve(scenario);
						}
						else  {

							return _junctionToWay(this, scenario.start).then((junction) => {
								scenario.start = junction;
								return Promise.resolve(scenario);
							});

						}

					}

				});

			}

		}

		execute(scenario, data) {

			return this.getWay(scenario).then((scenario) => {

				if (!scenario.start) {
					return Promise.resolve();
				}
				else {
					return _executeJunction(this, scenario.start, data);
				}

			});

		}

};
