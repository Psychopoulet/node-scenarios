
"use strict";

// deps

	const path = require("path");

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

	function _junctionToWay(that, type, junction) {

		return new Promise(function(resolve, reject) {

			if ("action" === type) {

				that.container.get("actions").searchOne({ id: junction.id }).then(function(action) {

					action.nodetype = "scenario";

					if (!action.after) {
						resolve(action);
					}
					else {

						_junctionToWay(that, action.after.nodetype, action.after).then(function(after) {
							action.after = after;
							resolve(action);
						}).catch(reject);

					}

				}).catch(reject);

			}
			else if ("condition" === type) {

				that.container.get("conditions").searchOne({ id: junction.id }).then(function(condition) {

					condition.nodetype = "condition";

					if (!condition.onyes && !condition.onno) {
						resolve(condition);
					}
					else if (condition.onyes) {
					
						_junctionToWay(that, condition.onyes.nodetype, condition.onyes).then(function(onyes) {

							condition.onyes = onyes;

							if (!condition.onno) {
								resolve(condition);
							}
							else {

								_junctionToWay(that, condition.onno.nodetype, condition.onno).then(function(onno) {
									condition.onno = onno;
									resolve(condition);
								}).catch(reject);

							}
							
						}).catch(reject);

					}
					else {
						
						_junctionToWay(that, condition.onno.nodetype, condition.onno).then(function(onno) {
							condition.onno = onno;
							resolve(condition);
						}).catch(reject);

					}

				}).catch(reject);

			}
			else {
				resolve(null);
			}

		});

	}

// module

module.exports = class DBScenarios extends require(path.join(__dirname, "_abstract.js")) {

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

			let that = this;
			return new Promise(function(resolve, reject) {

				that.db.get(_sSelectQuery + " ORDER BY scenarios.id DESC LIMIT 0,1;", [], function(err, row) {
					
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

			let that = this;
			return new Promise(function(resolve, reject) {

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

				that.db.all(query + " ORDER BY scenarios.name ASC;", options, function(err, rows) {

					if (err) {
						reject((err.message) ? err.message : err);
					}
					else {

						rows.forEach(function(row, i) {
							rows[i] = DBScenarios.formate(row);
						});

						resolve(rows);

					}

				});

			});

		}

	// write

		add (scenario) {

			let that = this;
			return new Promise(function(resolve, reject) {

				if (!scenario) {
					reject("There is no data.");
				}
				else if (!scenario.name) {
					reject("There is no name.");
				}
				else {

					that.db.run("INSERT INTO scenarios (name, active) VALUES (:name, :active);", {
						":name": scenario.name,
						":active": ("undefined" !== typeof scenario.active && (true === scenario.active || 1 == scenario.active)) ? "1" : "0"
					}, function(err) {

						if (err) {
							reject((err.message) ? err.message : err);
						}
						else {
							that.last().then(resolve).catch(reject);
						}

					});

				}

			});

		}

		edit (scenario) {

			let that = this;
			return new Promise(function(resolve, reject) {

				if (!scenario) {
					reject("There is no data.");
				}
					else if (!scenario.id) {
						reject("The scenario is incorrect.");
					}
				else if (!scenario.name) {
					reject("There is no name.");
				}
				else {

					that.db.run("UPDATE scenarios SET name = :name, active = :active, id_start = :start WHERE id = :id;", {
						":id": scenario.id,
						":name": scenario.name,
						":active": ("undefined" !== typeof scenario.active && (true === scenario.active || 1 == scenario.active)) ? "1" : "0",
						":start": (scenario.start && scenario.start.junction) ? scenario.start.junction : null
					}, function(err) {

						if (err) {
							reject((err.message) ? err.message : err);
						}
						else {
							resolve(scenario);
						}

					});

				}

			});

		}

		delete (scenario) {
			
			let that = this;
			return new Promise(function(resolve, reject) {

				if (!scenario) {
					reject("There is no data.");
				}
					else if (!scenario.id) {
						reject("The scenario is incorrect.");
					}
				else {

					that.db.run("DELETE FROM scenarios WHERE id = :id;", { ":id" : scenario.id }, function(err) {

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

		// triggers

			linkToTrigger (scenario, trigger) {
				return this.container.get("triggers").linkToScenario(scenario, trigger);
			}

			unlinkToTrigger (scenario, trigger) {
				return this.container.get("triggers").unlinkToScenario(scenario, trigger);
			}

		// start

			linkStartAction (scenario, node) {

				let that = this;
				return new Promise(function(resolve, reject) {

					if (!scenario) {
						reject("There is no data.");
					}
						else if (!scenario.id) {
							reject("The scenario is incorrect.");
						}
					else if (!node) {
						reject("There is no node.");
					}
						else if (!node.id) {
							reject("The node is incorrect.");
						}
					else {

						that.unlinkStart(scenario).then(function() {
							return that.container.get("junctions").createActionJunctionId(node);
						}).then(function(junctionid) {
							scenario.start = { "junction": junctionid };
							return that.edit(scenario);
						}).then(function() {
							return that.searchOne({ id: scenario.id });
						}).then(function(scenario) {
							resolve(scenario);
						}).catch(reject);

					}

				});

			}

			linkStartCondition (scenario, node) {
				
				let that = this;
				return new Promise(function(resolve, reject) {

					if (!scenario) {
						reject("There is no data.");
					}
						else if (!scenario.id) {
							reject("The scenario is incorrect.");
						}
					else if (!node) {
						reject("There is no node.");
					}
						else if (!node.id) {
							reject("The node is incorrect.");
						}
					else {

						that.unlinkStart(scenario).then(function() {
							return that.container.get("junctions").createConditionJunctionId(node);
						}).then(function(junctionid) {
							scenario.start = { "junction": junctionid };
							return that.edit(scenario);
						}).then(function() {
							return that.searchOne({ id: scenario.id });
						}).then(function(scenario) {
							resolve(scenario);
						}).catch(reject);

					}

				});

			}

			unlinkStart (scenario) {
				
				let that = this;
				return new Promise(function(resolve, reject) {

					if (!scenario) {
						reject("There is no data.");
					}
						else if (!scenario.id) {
							reject("The scenario is incorrect.");
						}
					else {

						that.searchOne({ id: scenario.id }).then(function(scenario) {

							if (!scenario.start) {
								resolve(scenario);
							}
							else {

								that.container.get("junctions").deleteById(scenario.start.junction).then(function() {

									scenario.start = null;

									that.edit(scenario).then(function() {
										return that.searchOne({ id: scenario.id });
									}).then(function(scenario) {
										resolve(scenario);
									}).catch(reject);

								}).catch(reject);

							}

						}).catch(reject);

					}

				});
				
			}

	// run

		getWay(scenario) {

			let that = this;
			return new Promise(function(resolve, reject) {

				return that.searchOne({ id: scenario.id }).then(function(scenario) {

					if (!scenario) {
						reject("Impossible to find this scenario.");
					}
					else {

						scenario.nodetype = "scenario";

						if (!scenario.start) {
							resolve(scenario);
						}
						else  {

							_junctionToWay(that, scenario.start.nodetype, scenario.start).then(function(junction) {
								scenario.start = junction;
								resolve(scenario);
							}).catch(reject);

						}

					}

				});

			});

		}

		run(scenario) {

			//let that = this;
			return this.getWay(scenario).then(function() {


			});

		}

};
